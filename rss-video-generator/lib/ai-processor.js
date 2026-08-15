import axios from 'axios';
import Sentiment from 'sentiment';
import natural from 'natural';
import compromise from 'compromise';
import { db } from './database.js';
import { logger } from './logger.js';

const sentiment = new Sentiment();
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export class AIProcessor {
    constructor(apiKey = null, provider = 'openai') {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY;
        this.provider = provider;
        this.geminiKey = process.env.GEMINI_API_KEY;
    }

    /**
     * Generate summary using AI or extractive methods
     */
    async generateSummary(itemId, text, method = 'hybrid') {
        try {
            let summaryText, modelUsed, tokensUsed = 0;

            if (this.apiKey && (method === 'ai' || method === 'hybrid')) {
                // Use AI for summarization
                const aiSummary = await this.aiSummarize(text);
                summaryText = aiSummary.summary;
                modelUsed = aiSummary.model;
                tokensUsed = aiSummary.tokens;
            } else {
                // Fallback to extractive summarization
                summaryText = this.extractiveSummarize(text);
                modelUsed = 'extractive';
            }

            // Extract key points
            const keyPoints = this.extractKeyPoints(text);

            // Calculate confidence score
            const confidence = this.calculateConfidence(text, summaryText);

            // Save to database
            const summaryId = await this.saveSummary({
                itemId,
                summaryText,
                summaryType: method,
                modelUsed,
                tokensUsed,
                confidenceScore: confidence,
                keyPoints: JSON.stringify(keyPoints)
            });

            logger.info(`Generated summary for item ${itemId} using ${modelUsed}`);
            return { id: summaryId, summaryText, keyPoints, confidence };
        } catch (error) {
            logger.error(`Error generating summary for item ${itemId}:`, error);
            throw error;
        }
    }

    /**
     * AI-powered summarization using OpenAI or Gemini
     */
    async aiSummarize(text) {
        try {
            if (this.provider === 'openai' && this.apiKey) {
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional news summarizer. Create concise, engaging summaries that capture the key points.'
                            },
                            {
                                role: 'user',
                                content: `Summarize this article in 2-3 sentences:\n\n${text.substring(0, 4000)}`
                            }
                        ],
                        max_tokens: 150,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                return {
                    summary: response.data.choices[0].message.content.trim(),
                    model: response.data.model,
                    tokens: response.data.usage.total_tokens
                };
            } else if (this.provider === 'gemini' && this.geminiKey) {
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.geminiKey}`,
                    {
                        contents: [{
                            parts: [{
                                text: `Summarize this article in 2-3 sentences:\n\n${text.substring(0, 4000)}`
                            }]
                        }]
                    }
                );

                return {
                    summary: response.data.candidates[0].content.parts[0].text.trim(),
                    model: 'gemini-pro',
                    tokens: 0
                };
            }
        } catch (error) {
            logger.warn('AI summarization failed, falling back to extractive:', error.message);
        }

        // Fallback
        return {
            summary: this.extractiveSummarize(text),
            model: 'extractive-fallback',
            tokens: 0
        };
    }

    /**
     * Extractive summarization using TF-IDF
     */
    extractiveSummarize(text, sentenceCount = 3) {
        const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

        if (sentences.length <= sentenceCount) {
            return text;
        }

        const tfidf = new TfIdf();
        sentences.forEach(sentence => tfidf.addDocument(sentence));

        const scores = sentences.map((sentence, index) => {
            let score = 0;
            tfidf.listTerms(index).forEach(term => {
                score += term.tfidf;
            });
            return { sentence, score, index };
        });

        scores.sort((a, b) => b.score - a.score);
        const topSentences = scores.slice(0, sentenceCount);
        topSentences.sort((a, b) => a.index - b.index);

        return topSentences.map(s => s.sentence.trim()).join(' ');
    }

    /**
     * Extract key points from text
     */
    extractKeyPoints(text, maxPoints = 5) {
        const doc = compromise(text);
        const points = [];

        // Extract important sentences with numbers or statistics
        const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
        sentences.forEach(sentence => {
            if (/\d+/.test(sentence) || /important|significant|key|major|critical/i.test(sentence)) {
                points.push(sentence.trim());
            }
        });

        // Extract named entities
        const people = doc.people().out('array');
        const places = doc.places().out('array');
        const organizations = doc.organizations().out('array');

        if (people.length > 0) points.push(`Key people: ${people.slice(0, 3).join(', ')}`);
        if (places.length > 0) points.push(`Locations: ${places.slice(0, 3).join(', ')}`);
        if (organizations.length > 0) points.push(`Organizations: ${organizations.slice(0, 3).join(', ')}`);

        return points.slice(0, maxPoints);
    }

    /**
     * Calculate confidence score for summary
     */
    calculateConfidence(originalText, summary) {
        const originalWords = new Set(tokenizer.tokenize(originalText.toLowerCase()));
        const summaryWords = new Set(tokenizer.tokenize(summary.toLowerCase()));

        let overlap = 0;
        summaryWords.forEach(word => {
            if (originalWords.has(word)) overlap++;
        });

        return Math.min(overlap / summaryWords.size, 1.0);
    }

    /**
     * Perform sentiment analysis
     */
    async analyzeSentiment(itemId, text) {
        try {
            const result = sentiment.analyze(text);

            // Normalize scores
            const totalWords = text.split(/\s+/).length;
            const normalizedScore = result.score / Math.max(totalWords, 1);

            // Determine label
            let label = 'neutral';
            if (normalizedScore > 0.1) label = 'positive';
            else if (normalizedScore < -0.1) label = 'negative';

            // Calculate individual scores
            const positiveScore = result.positive.length / totalWords;
            const negativeScore = result.negative.length / totalWords;
            const neutralScore = 1 - (positiveScore + negativeScore);

            // Detect emotions
            const emotions = this.detectEmotions(text);

            // Save to database
            await this.saveSentiment({
                itemId,
                sentimentScore: normalizedScore,
                sentimentLabel: label,
                positiveScore,
                negativeScore,
                neutralScore,
                emotions: JSON.stringify(emotions),
                subjectivityScore: this.calculateSubjectivity(text)
            });

            logger.info(`Analyzed sentiment for item ${itemId}: ${label} (${normalizedScore.toFixed(2)})`);
            return { label, score: normalizedScore, emotions };
        } catch (error) {
            logger.error(`Error analyzing sentiment for item ${itemId}:`, error);
            throw error;
        }
    }

    /**
     * Detect emotions in text
     */
    detectEmotions(text) {
        const emotions = {
            joy: 0,
            anger: 0,
            fear: 0,
            sadness: 0,
            surprise: 0
        };

        const emotionKeywords = {
            joy: ['happy', 'joy', 'excited', 'wonderful', 'great', 'excellent', 'amazing'],
            anger: ['angry', 'furious', 'outraged', 'mad', 'annoyed', 'frustrated'],
            fear: ['afraid', 'scared', 'worried', 'anxious', 'concerned', 'fearful'],
            sadness: ['sad', 'depressed', 'unhappy', 'disappointed', 'tragic', 'unfortunate'],
            surprise: ['surprised', 'shocked', 'unexpected', 'astonished', 'amazed']
        };

        const lowerText = text.toLowerCase();

        Object.keys(emotionKeywords).forEach(emotion => {
            emotionKeywords[emotion].forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const matches = lowerText.match(regex);
                if (matches) emotions[emotion] += matches.length;
            });
        });

        return emotions;
    }

    /**
     * Calculate subjectivity score
     */
    calculateSubjectivity(text) {
        const subjectiveWords = ['i think', 'i believe', 'in my opinion', 'seems', 'appears', 'probably', 'might', 'could'];
        const objectiveWords = ['according to', 'research shows', 'study finds', 'data indicates', 'statistics show'];

        const lowerText = text.toLowerCase();
        let subjectiveCount = 0;
        let objectiveCount = 0;

        subjectiveWords.forEach(word => {
            if (lowerText.includes(word)) subjectiveCount++;
        });

        objectiveWords.forEach(word => {
            if (lowerText.includes(word)) objectiveCount++;
        });

        const total = subjectiveCount + objectiveCount;
        return total > 0 ? subjectiveCount / total : 0.5;
    }

    /**
     * Extract keywords using TF-IDF
     */
    async extractKeywords(itemId, text, maxKeywords = 10) {
        try {
            const tfidf = new TfIdf();
            tfidf.addDocument(text);

            const keywords = [];
            tfidf.listTerms(0).slice(0, maxKeywords).forEach(term => {
                keywords.push({
                    keyword: term.term,
                    relevance: term.tfidf,
                    type: 'tfidf'
                });
            });

            // Also extract named entities
            const doc = compromise(text);
            const entities = [
                ...doc.people().out('array').map(e => ({ keyword: e, type: 'person', relevance: 0.8 })),
                ...doc.places().out('array').map(e => ({ keyword: e, type: 'place', relevance: 0.8 })),
                ...doc.organizations().out('array').map(e => ({ keyword: e, type: 'organization', relevance: 0.8 }))
            ];

            // Save to database
            for (const kw of [...keywords, ...entities].slice(0, maxKeywords)) {
                await this.saveKeyword({
                    itemId,
                    keyword: kw.keyword,
                    relevanceScore: kw.relevance,
                    keywordType: kw.type,
                    frequency: 1
                });
            }

            logger.info(`Extracted ${keywords.length + entities.length} keywords for item ${itemId}`);
            return [...keywords, ...entities];
        } catch (error) {
            logger.error(`Error extracting keywords for item ${itemId}:`, error);
            throw error;
        }
    }

    /**
     * Save summary to database
     */
    async saveSummary(data) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO summaries (item_id, summary_text, summary_type, model_used, tokens_used, confidence_score, key_points)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [data.itemId, data.summaryText, data.summaryType, data.modelUsed, data.tokensUsed, data.confidenceScore, data.keyPoints],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    /**
     * Save sentiment analysis to database
     */
    async saveSentiment(data) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO sentiment_analysis (item_id, sentiment_score, sentiment_label, positive_score, negative_score, neutral_score, emotions, subjectivity_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [data.itemId, data.sentimentScore, data.sentimentLabel, data.positiveScore, data.negativeScore, data.neutralScore, data.emotions, data.subjectivityScore],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    /**
     * Save keyword to database
     */
    async saveKeyword(data) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO keywords (item_id, keyword, relevance_score, keyword_type, frequency)
         VALUES (?, ?, ?, ?, ?)`,
                [data.itemId, data.keyword, data.relevanceScore, data.keywordType, data.frequency],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
}

export const aiProcessor = new AIProcessor();
