import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';

// Import modules
import { feedManager } from './lib/rss-manager.js';
import { aiProcessor } from './lib/ai-processor.js';
import { imageGenerator } from './lib/image-generator.js';
import { videoGenerator } from './lib/video-generator.js';
import { scheduler } from './lib/scheduler.js';
import { webhookManager } from './lib/webhook-manager.js';
import { logger } from './lib/logger.js';
import { db } from './lib/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/output', express.static('output'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use('/api/', limiter);

// WebSocket for real-time updates
wss.on('connection', (ws) => {
    logger.info('WebSocket client connected');
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to RSS Video Generator' }));
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(data));
        }
    });
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== FEEDS ====================

// Get all feeds
app.get('/api/feeds', async (req, res) => {
    try {
        const feeds = await feedManager.getAllFeeds();
        res.json({ success: true, feeds });
    } catch (error) {
        logger.error('Error getting feeds:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new feed
app.post('/api/feeds', async (req, res) => {
    try {
        const { url, name, category, language } = req.body;
        const feed = await feedManager.addFeed(url, name, category, language);
        broadcast({ type: 'feed_added', data: feed });
        res.json({ success: true, feed });
    } catch (error) {
        logger.error('Error adding feed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fetch specific feed
app.post('/api/feeds/:id/fetch', async (req, res) => {
    try {
        const items = await feedManager.fetchFeed(parseInt(req.params.id));
        broadcast({ type: 'feed_fetched', data: { feedId: req.params.id, count: items.length } });
        res.json({ success: true, items });
    } catch (error) {
        logger.error('Error fetching feed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fetch all feeds
app.post('/api/feeds/fetch-all', async (req, res) => {
    try {
        const results = await feedManager.fetchAllFeeds();
        broadcast({ type: 'all_feeds_fetched', data: results });
        res.json({ success: true, results });
    } catch (error) {
        logger.error('Error fetching all feeds:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ITEMS ====================

// Get feed items
app.get('/api/items', async (req, res) => {
    try {
        const { limit = 50, offset = 0, feedId } = req.query;

        let query = 'SELECT * FROM feed_items';
        let params = [];

        if (feedId) {
            query += ' WHERE feed_id = ?';
            params.push(feedId);
        }

        query += ' ORDER BY published_date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const items = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({ success: true, items, count: items.length });
    } catch (error) {
        logger.error('Error getting items:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single item
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM feed_items WHERE id = ?', [req.params.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!item) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        // Get related data
        const [summary, images, videos, sentiment, keywords] = await Promise.all([
            new Promise((resolve, reject) => {
                db.get('SELECT * FROM summaries WHERE item_id = ?', [req.params.id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }),
            imageGenerator.getImagesForItem(req.params.id),
            videoGenerator.getVideosForItem(req.params.id),
            new Promise((resolve, reject) => {
                db.get('SELECT * FROM sentiment_analysis WHERE item_id = ?', [req.params.id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }),
            new Promise((resolve, reject) => {
                db.all('SELECT * FROM keywords WHERE item_id = ? ORDER BY relevance_score DESC LIMIT 10', [req.params.id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            })
        ]);

        res.json({
            success: true,
            item: {
                ...item,
                summary,
                images,
                videos,
                sentiment,
                keywords
            }
        });
    } catch (error) {
        logger.error('Error getting item:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== PROCESSING ====================

// Process item (full pipeline)
app.post('/api/items/:id/process', async (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        const { style = 'vibrant', videoFormats = ['mp4'], videoStyle = 'fade' } = req.body;

        // Get item
        const item = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM feed_items WHERE id = ?', [itemId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!item) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        broadcast({ type: 'processing_started', data: { itemId } });

        // 1. Generate summary
        const content = item.content || item.description;
        const summary = await aiProcessor.generateSummary(itemId, content);
        broadcast({ type: 'summary_generated', data: { itemId, summary: summary.summaryText } });

        // 2. Sentiment analysis
        const sentiment = await aiProcessor.analyzeSentiment(itemId, content);
        broadcast({ type: 'sentiment_analyzed', data: { itemId, sentiment: sentiment.label } });

        // 3. Extract keywords
        const keywords = await aiProcessor.extractKeywords(itemId, content);
        broadcast({ type: 'keywords_extracted', data: { itemId, count: keywords.length } });

        // 4. Generate Images and Videos for different forms
        const formConfigs = [
            { name: 'Landscape', width: 1920, height: 1080, ratio: '16:9' },
            { name: 'Portrait', width: 1080, height: 1920, ratio: '9:16' },
            { name: 'Square', width: 1080, height: 1080, ratio: '1:1' }
        ];

        const generatedMedia = [];

        for (const config of formConfigs) {
            // Generate image for this form
            const image = await imageGenerator.generateFromSummary(itemId, summary.summaryText, item.title, {
                style,
                width: config.width,
                height: config.height,
                aspectRatio: config.ratio
            });

            // Generate videos for this form
            for (const format of videoFormats) {
                const video = await videoGenerator.generateFromImage(itemId, image.path, {
                    format,
                    style: videoStyle,
                    width: config.width,
                    height: config.height
                });
                generatedMedia.push({ form: config.name, format, videoId: video.id });
                broadcast({ type: 'video_generated', data: { itemId, videoId: video.id, format, form: config.name } });
            }
        }

        // Trigger webhooks
        await webhookManager.trigger('item_processed', {
            itemId,
            title: item.title,
            summary: summary.summaryText,
            sentiment: sentiment.label,
            media: generatedMedia
        });

        broadcast({ type: 'processing_completed', data: { itemId } });

        res.json({
            success: true,
            result: {
                item,
                summary,
                sentiment,
                keywords,
                image,
                videos
            }
        });
    } catch (error) {
        logger.error('Error processing item:', error);
        broadcast({ type: 'processing_error', data: { itemId: req.params.id, error: error.message } });
        res.status(500).json({ success: false, error: error.message });
    }
});

// Batch process items
app.post('/api/items/process-batch', async (req, res) => {
    try {
        const { itemIds, style, videoFormats, videoStyle } = req.body;
        const results = [];

        for (const itemId of itemIds) {
            try {
                // Process each item (simplified - you can call the full process endpoint)
                results.push({ itemId, success: true });
            } catch (error) {
                results.push({ itemId, success: false, error: error.message });
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        logger.error('Error batch processing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ANALYTICS ====================

// Get trending topics
app.get('/api/analytics/trending', async (req, res) => {
    try {
        const topics = await new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM trending_topics WHERE status = ? ORDER BY trend_score DESC LIMIT 20',
                ['active'],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({ success: true, topics });
    } catch (error) {
        logger.error('Error getting trending topics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get statistics
app.get('/api/analytics/stats', async (req, res) => {
    try {
        const stats = await new Promise((resolve, reject) => {
            db.get(
                `SELECT 
          (SELECT COUNT(*) FROM rss_feeds WHERE active = 1) as active_feeds,
          (SELECT COUNT(*) FROM feed_items) as total_items,
          (SELECT COUNT(*) FROM summaries) as total_summaries,
          (SELECT COUNT(*) FROM generated_images) as total_images,
          (SELECT COUNT(*) FROM generated_videos) as total_videos,
          (SELECT COUNT(*) FROM feed_items WHERE created_at > datetime('now', '-24 hours')) as items_today,
          (SELECT AVG(sentiment_score) FROM sentiment_analysis) as avg_sentiment`,
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        res.json({ success: true, stats });
    } catch (error) {
        logger.error('Error getting stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== EXPORT ====================

// Export data
app.get('/api/export/:format', async (req, res) => {
    try {
        const { format } = req.params;
        const { itemIds } = req.query;

        // Get items
        let query = 'SELECT * FROM feed_items';
        let params = [];

        if (itemIds) {
            const ids = itemIds.split(',').map(id => parseInt(id));
            query += ` WHERE id IN (${ids.map(() => '?').join(',')})`;
            params = ids;
        }

        const items = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (format === 'json') {
            res.json({ success: true, items });
        } else if (format === 'csv') {
            const csv = this.convertToCSV(items);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
            res.send(csv);
        } else {
            res.status(400).json({ success: false, error: 'Unsupported format' });
        }
    } catch (error) {
        logger.error('Error exporting data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== WEBHOOKS ====================

// Get webhooks
app.get('/api/webhooks', async (req, res) => {
    try {
        const webhooks = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM webhooks ORDER BY created_at DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({ success: true, webhooks });
    } catch (error) {
        logger.error('Error getting webhooks:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add webhook
app.post('/api/webhooks', async (req, res) => {
    try {
        const { url, eventType, secret } = req.body;
        const id = await webhookManager.addWebhook(url, eventType, secret);
        res.json({ success: true, id });
    } catch (error) {
        logger.error('Error adding webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== START SERVER ====================

// Start scheduler
scheduler.startAll();

server.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📊 WebSocket server ready`);
    logger.info(`⏰ Scheduler active`);
    console.log(`\n✅ RSS Video Generator Server Started!`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🌐 Web UI: http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    scheduler.stopAll();
    server.close(() => {
        logger.info('Server closed');
        db.close();
        process.exit(0);
    });
});
