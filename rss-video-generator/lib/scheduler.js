import cron from 'node-cron';
import { feedManager } from './rss-manager.js';
import { logger } from './logger.js';
import { db } from './database.js';

export class Scheduler {
    constructor() {
        this.jobs = new Map();
    }

    /**
     * Start automatic feed fetching
     */
    startAutoFetch() {
        const interval = parseInt(process.env.FETCH_INTERVAL_MINUTES) || 30;
        const enabled = process.env.AUTO_FETCH_ENABLED === 'true';

        if (!enabled) {
            logger.info('Auto-fetch is disabled');
            return;
        }

        // Schedule feed fetching
        const cronExpression = `*/${interval} * * * *`;
        const job = cron.schedule(cronExpression, async () => {
            logger.info('Starting scheduled feed fetch...');
            try {
                const results = await feedManager.fetchAllFeeds();
                logger.info(`Scheduled fetch completed: ${JSON.stringify(results)}`);
            } catch (error) {
                logger.error('Scheduled fetch error:', error);
            }
        });

        this.jobs.set('auto-fetch', job);
        logger.info(`Auto-fetch scheduled: every ${interval} minutes`);
    }

    /**
     * Start automatic cleanup
     */
    startAutoCleanup() {
        const days = parseInt(process.env.AUTO_CLEANUP_DAYS) || 7;

        // Run cleanup daily at 2 AM
        const job = cron.schedule('0 2 * * *', async () => {
            logger.info('Starting scheduled cleanup...');
            try {
                await this.cleanupOldData(days);
                logger.info('Scheduled cleanup completed');
            } catch (error) {
                logger.error('Scheduled cleanup error:', error);
            }
        });

        this.jobs.set('auto-cleanup', job);
        logger.info(`Auto-cleanup scheduled: daily at 2 AM (${days} days retention)`);
    }

    /**
     * Clean up old data
     */
    async cleanupOldData(days) {
        return new Promise((resolve, reject) => {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            db.run(
                `DELETE FROM feed_items WHERE created_at < ?`,
                [cutoffDate.toISOString()],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        logger.info(`Cleaned up ${this.changes} old feed items`);
                        resolve(this.changes);
                    }
                }
            );
        });
    }

    /**
     * Start trending analysis
     */
    startTrendingAnalysis() {
        // Run trending analysis every hour
        const job = cron.schedule('0 * * * *', async () => {
            logger.info('Starting trending analysis...');
            try {
                await this.analyzeTrends();
                logger.info('Trending analysis completed');
            } catch (error) {
                logger.error('Trending analysis error:', error);
            }
        });

        this.jobs.set('trending-analysis', job);
        logger.info('Trending analysis scheduled: hourly');
    }

    /**
     * Analyze trending topics
     */
    async analyzeTrends() {
        return new Promise((resolve, reject) => {
            // Get keywords from last 24 hours
            db.all(
                `SELECT keyword, COUNT(*) as count, AVG(relevance_score) as avg_relevance
         FROM keywords
         WHERE created_at > datetime('now', '-24 hours')
         GROUP BY keyword
         HAVING count >= 3
         ORDER BY count DESC, avg_relevance DESC
         LIMIT 20`,
                async (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    for (const row of rows) {
                        const trendScore = row.count * row.avg_relevance;

                        await new Promise((res, rej) => {
                            db.run(
                                `INSERT OR REPLACE INTO trending_topics (topic, mention_count, trend_score, last_seen)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                                [row.keyword, row.count, trendScore],
                                (err) => err ? rej(err) : res()
                            );
                        });
                    }

                    resolve(rows.length);
                }
            );
        });
    }

    /**
     * Stop all scheduled jobs
     */
    stopAll() {
        this.jobs.forEach((job, name) => {
            job.stop();
            logger.info(`Stopped job: ${name}`);
        });
        this.jobs.clear();
    }

    /**
     * Start all scheduled jobs
     */
    startAll() {
        this.startAutoFetch();
        this.startAutoCleanup();
        this.startTrendingAnalysis();
        logger.info('All scheduled jobs started');
    }
}

export const scheduler = new Scheduler();
