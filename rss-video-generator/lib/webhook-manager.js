import axios from 'axios';
import { logger } from './logger.js';
import { db } from './database.js';

export class WebhookManager {
    constructor() {
        this.maxRetries = 3;
    }

    /**
     * Trigger webhooks for an event
     */
    async trigger(eventType, data) {
        try {
            const webhooks = await this.getActiveWebhooks(eventType);

            for (const webhook of webhooks) {
                await this.sendWebhook(webhook, data);
            }
        } catch (error) {
            logger.error('Error triggering webhooks:', error);
        }
    }

    /**
     * Send webhook request
     */
    async sendWebhook(webhook, data, attempt = 1) {
        try {
            const payload = {
                event: webhook.event_type,
                timestamp: new Date().toISOString(),
                data
            };

            const response = await axios.post(webhook.url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': webhook.secret || '',
                    'User-Agent': 'RSS-Video-Generator/1.0'
                },
                timeout: 10000
            });

            await this.updateWebhookSuccess(webhook.id);
            logger.info(`Webhook sent successfully: ${webhook.url}`);
        } catch (error) {
            logger.error(`Webhook failed (attempt ${attempt}): ${webhook.url}`, error.message);

            if (attempt < this.maxRetries) {
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.sendWebhook(webhook, data, attempt + 1);
            } else {
                await this.updateWebhookFailure(webhook.id);
            }
        }
    }

    /**
     * Get active webhooks for event type
     */
    async getActiveWebhooks(eventType) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM webhooks WHERE event_type = ? AND active = 1`,
                [eventType],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });
    }

    /**
     * Update webhook success count
     */
    async updateWebhookSuccess(webhookId) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE webhooks 
         SET success_count = success_count + 1,
             last_triggered = CURRENT_TIMESTAMP
         WHERE id = ?`,
                [webhookId],
                (err) => err ? reject(err) : resolve()
            );
        });
    }

    /**
     * Update webhook failure count
     */
    async updateWebhookFailure(webhookId) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE webhooks 
         SET failure_count = failure_count + 1
         WHERE id = ?`,
                [webhookId],
                (err) => err ? reject(err) : resolve()
            );
        });
    }

    /**
     * Add new webhook
     */
    async addWebhook(url, eventType, secret = null) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO webhooks (url, event_type, secret) VALUES (?, ?, ?)`,
                [url, eventType, secret],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
}

export const webhookManager = new WebhookManager();
