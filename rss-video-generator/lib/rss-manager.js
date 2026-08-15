import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from './database.js';
import { logger } from './logger.js';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
            ['content:encoded', 'contentEncoded'],
            ['dc:creator', 'creator']
        ]
    }
});

export class RSSFeedManager {
    constructor() {
        this.activeFetches = new Map();
    }

    /**
     * Add a new RSS feed to the database
     */
    async addFeed(url, name, category = null, language = 'en') {
        try {
            // Validate feed first
            await parser.parseURL(url);

            return new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO rss_feeds (url, name, category, language) VALUES (?, ?, ?, ?)`,
                    [url, name, category, language],
                    function (err) {
                        if (err) reject(err);
                        else resolve({ id: this.lastID, url, name, category });
                    }
                );
            });
        } catch (error) {
            logger.error(`Failed to add feed ${url}:`, error);
            throw error;
        }
    }

    /**
     * Fetch and parse RSS feed with enhanced content extraction
     */
    async fetchFeed(feedId) {
        try {
            const feed = await this.getFeedById(feedId);
            if (!feed || !feed.active) {
                throw new Error(`Feed ${feedId} not found or inactive`);
            }

            logger.info(`Fetching feed: ${feed.name} (${feed.url})`);

            const parsedFeed = await parser.parseURL(feed.url);
            const newItems = [];

            for (const item of parsedFeed.items) {
                // Check if item already exists
                const exists = await this.itemExists(item.guid || item.link);
                if (exists) continue;

                // Extract full content if available
                const fullContent = await this.extractFullContent(item);

                // Calculate reading time
                const wordCount = this.countWords(fullContent || item.contentSnippet || '');
                const readingTime = Math.ceil(wordCount / 200); // Average reading speed

                const itemData = {
                    feedId,
                    guid: item.guid || item.link,
                    title: item.title,
                    link: item.link,
                    description: item.contentSnippet || item.description,
                    content: fullContent,
                    author: item.creator || item.author,
                    publishedDate: item.pubDate ? new Date(item.pubDate).toISOString() : null,
                    categories: item.categories ? JSON.stringify(item.categories) : null,
                    imageUrl: this.extractImageUrl(item),
                    wordCount,
                    readingTimeMinutes: readingTime,
                    language: feed.language
                };

                const itemId = await this.saveItem(itemData);
                newItems.push({ id: itemId, ...itemData });
            }

            // Update feed metadata
            await this.updateFeedMetadata(feedId, newItems.length);

            logger.info(`Fetched ${newItems.length} new items from ${feed.name}`);
            return newItems;
        } catch (error) {
            logger.error(`Error fetching feed ${feedId}:`, error);
            await this.logFeedError(feedId, error.message);
            throw error;
        }
    }

    /**
     * Extract full article content from URL
     */
    async extractFullContent(item) {
        try {
            if (item.contentEncoded) {
                return this.cleanHTML(item.contentEncoded);
            }

            if (!item.link) return null;

            const response = await axios.get(item.link, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Remove unwanted elements
            $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();

            // Try common article selectors
            const selectors = [
                'article',
                '[role="main"]',
                '.article-content',
                '.post-content',
                '.entry-content',
                'main'
            ];

            for (const selector of selectors) {
                const content = $(selector).text();
                if (content && content.length > 200) {
                    return content.trim();
                }
            }

            // Fallback to body
            return $('body').text().trim();
        } catch (error) {
            logger.warn(`Could not extract full content from ${item.link}:`, error.message);
            return null;
        }
    }

    /**
     * Extract image URL from feed item
     */
    extractImageUrl(item) {
        if (item.mediaThumbnail?.$ && item.mediaThumbnail.$.url) {
            return item.mediaThumbnail.$.url;
        }
        if (item.mediaContent?.$ && item.mediaContent.$.url) {
            return item.mediaContent.$.url;
        }
        if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
            return item.enclosure.url;
        }
        return null;
    }

    /**
     * Clean HTML content
     */
    cleanHTML(html) {
        const $ = cheerio.load(html);
        $('script, style').remove();
        return $.text().trim();
    }

    /**
     * Count words in text
     */
    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Check if item exists in database
     */
    async itemExists(guid) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT id FROM feed_items WHERE guid = ?`,
                [guid],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(!!row);
                }
            );
        });
    }

    /**
     * Save feed item to database
     */
    async saveItem(itemData) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO feed_items (
          feed_id, guid, title, link, description, content, author,
          published_date, categories, image_url, word_count, 
          reading_time_minutes, language
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    itemData.feedId, itemData.guid, itemData.title, itemData.link,
                    itemData.description, itemData.content, itemData.author,
                    itemData.publishedDate, itemData.categories, itemData.imageUrl,
                    itemData.wordCount, itemData.readingTimeMinutes, itemData.language
                ],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    /**
     * Get feed by ID
     */
    async getFeedById(feedId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM rss_feeds WHERE id = ?`,
                [feedId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    /**
     * Get all active feeds
     */
    async getAllFeeds() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM rss_feeds WHERE active = 1 ORDER BY name`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    /**
     * Update feed metadata after fetch
     */
    async updateFeedMetadata(feedId, newItemsCount) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE rss_feeds 
         SET last_fetched = CURRENT_TIMESTAMP,
             total_items_fetched = total_items_fetched + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
                [newItemsCount, feedId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Log feed error
     */
    async logFeedError(feedId, errorMessage) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE rss_feeds 
         SET error_count = error_count + 1,
             last_error = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
                [errorMessage, feedId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Fetch all active feeds
     */
    async fetchAllFeeds() {
        const feeds = await this.getAllFeeds();
        const results = [];

        for (const feed of feeds) {
            try {
                const items = await this.fetchFeed(feed.id);
                results.push({ feedId: feed.id, success: true, itemsCount: items.length });
            } catch (error) {
                results.push({ feedId: feed.id, success: false, error: error.message });
            }
        }

        return results;
    }
}

export const feedManager = new RSSFeedManager();
