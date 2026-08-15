import { createCanvas, loadImage, registerFont } from 'canvas';
import Jimp from 'jimp';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';
import { logger } from './logger.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ImageGenerator {
    constructor() {
        this.outputDir = process.env.OUTPUT_PATH || './output';
        this.styles = {
            modern: { bg: '#1a1a2e', accent: '#16213e', text: '#eee', gradient: ['#0f3460', '#16213e'] },
            minimalist: { bg: '#f5f5f5', accent: '#333', text: '#000', gradient: ['#ffffff', '#f0f0f0'] },
            vibrant: { bg: '#ff6b6b', accent: '#4ecdc4', text: '#fff', gradient: ['#ff6b6b', '#4ecdc4'] },
            dark: { bg: '#0a0a0a', accent: '#1e1e1e', text: '#fff', gradient: ['#0a0a0a', '#2d2d2d'] },
            professional: { bg: '#2c3e50', accent: '#34495e', text: '#ecf0f1', gradient: ['#2c3e50', '#34495e'] }
        };
        this.ensureDirectories();
    }

    ensureDirectories() {
        const dirs = [this.outputDir, `${this.outputDir}/images`, `${this.outputDir}/temp`];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Generate image from summary text
     */
    async generateFromSummary(itemId, summaryText, title, options = {}) {
        const {
            style = 'vibrant',
            width = 1920,
            height = 1080,
            aspectRatio = '16:9'
        } = options;

        try {
            const styleConfig = this.styles[style] || this.styles.vibrant;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, styleConfig.gradient[0]);
            gradient.addColorStop(1, styleConfig.gradient[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Add decorative elements
            this.addDecorativeElements(ctx, width, height, styleConfig);

            // Add title
            ctx.fillStyle = styleConfig.text;
            ctx.font = 'bold 72px Arial';
            ctx.textAlign = 'center';
            const titleLines = this.wrapText(ctx, title, width - 200);
            titleLines.forEach((line, i) => {
                ctx.fillText(line, width / 2, 200 + i * 90);
            });

            // Add summary
            ctx.font = '36px Arial';
            const summaryLines = this.wrapText(ctx, summaryText, width - 300);
            summaryLines.forEach((line, i) => {
                ctx.fillText(line, width / 2, 450 + i * 50);
            });

            // Add timestamp
            ctx.font = '24px Arial';
            ctx.fillStyle = styleConfig.text + '99';
            ctx.fillText(new Date().toLocaleDateString(), width / 2, height - 50);

            // Save image
            const filename = `image_${itemId}_${Date.now()}.png`;
            const filepath = path.join(this.outputDir, 'images', filename);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filepath, buffer);

            // Optimize with sharp
            await sharp(filepath)
                .png({ quality: parseInt(process.env.IMAGE_QUALITY) || 95 })
                .toFile(filepath.replace('.png', '_optimized.png'));

            const finalPath = filepath.replace('.png', '_optimized.png');
            fs.unlinkSync(filepath); // Remove unoptimized version

            // Get file stats
            const stats = fs.statSync(finalPath);

            // Save to database
            const imageId = await this.saveImage({
                itemId,
                filePath: finalPath,
                fileSizeBytes: stats.size,
                width,
                height,
                format: 'png',
                style,
                generationMethod: 'canvas',
                promptUsed: summaryText.substring(0, 200)
            });

            logger.info(`Generated image ${imageId} for item ${itemId}`);
            return { id: imageId, path: finalPath, width, height };
        } catch (error) {
            logger.error(`Error generating image for item ${itemId}:`, error);
            throw error;
        }
    }

    /**
     * Add decorative elements to canvas
     */
    addDecorativeElements(ctx, width, height, styleConfig) {
        // Add circles
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = styleConfig.accent;

        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = 50 + Math.random() * 150;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add lines
        ctx.strokeStyle = styleConfig.text;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
    }

    /**
     * Wrap text to fit within width
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine.trim());
        return lines;
    }

    /**
     * Generate multiple image variations
     */
    async generateVariations(itemId, summaryText, title) {
        const variations = [];
        const styles = Object.keys(this.styles);

        for (const style of styles) {
            try {
                const image = await this.generateFromSummary(itemId, summaryText, title, style);
                variations.push({ style, ...image });
            } catch (error) {
                logger.warn(`Failed to generate ${style} variation:`, error.message);
            }
        }

        return variations;
    }

    /**
     * Create collage from multiple images
     */
    async createCollage(imagePaths, outputPath) {
        try {
            const images = await Promise.all(
                imagePaths.map(p => Jimp.read(p))
            );

            const collageWidth = 1920;
            const collageHeight = 1080;
            const collage = new Jimp(collageWidth, collageHeight, '#ffffff');

            // Simple 2x2 grid
            const gridSize = Math.ceil(Math.sqrt(images.length));
            const cellWidth = collageWidth / gridSize;
            const cellHeight = collageHeight / gridSize;

            images.forEach((img, i) => {
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                img.resize(cellWidth, cellHeight);
                collage.composite(img, col * cellWidth, row * cellHeight);
            });

            await collage.writeAsync(outputPath);
            logger.info(`Created collage at ${outputPath}`);
            return outputPath;
        } catch (error) {
            logger.error('Error creating collage:', error);
            throw error;
        }
    }

    /**
     * Apply filters and effects
     */
    async applyEffects(imagePath, effects = []) {
        try {
            let image = await Jimp.read(imagePath);

            effects.forEach(effect => {
                switch (effect) {
                    case 'blur':
                        image.blur(5);
                        break;
                    case 'grayscale':
                        image.grayscale();
                        break;
                    case 'sepia':
                        image.sepia();
                        break;
                    case 'invert':
                        image.invert();
                        break;
                    case 'brightness':
                        image.brightness(0.2);
                        break;
                    case 'contrast':
                        image.contrast(0.3);
                        break;
                }
            });

            const outputPath = imagePath.replace('.png', '_effects.png');
            await image.writeAsync(outputPath);
            return outputPath;
        } catch (error) {
            logger.error('Error applying effects:', error);
            throw error;
        }
    }

    /**
     * Generate thumbnail
     */
    async generateThumbnail(imagePath, width = 320, height = 180) {
        try {
            const thumbnailPath = imagePath.replace('.png', '_thumb.png');
            await sharp(imagePath)
                .resize(width, height, { fit: 'cover' })
                .toFile(thumbnailPath);
            return thumbnailPath;
        } catch (error) {
            logger.error('Error generating thumbnail:', error);
            throw error;
        }
    }

    /**
     * Download and process external image
     */
    async downloadImage(url, itemId) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const filename = `downloaded_${itemId}_${Date.now()}.jpg`;
            const filepath = path.join(this.outputDir, 'images', filename);

            await sharp(Buffer.from(response.data))
                .resize(1920, 1080, { fit: 'cover' })
                .jpeg({ quality: 90 })
                .toFile(filepath);

            const stats = fs.statSync(filepath);

            const imageId = await this.saveImage({
                itemId,
                filePath: filepath,
                fileSizeBytes: stats.size,
                width: 1920,
                height: 1080,
                format: 'jpg',
                style: 'downloaded',
                generationMethod: 'download',
                promptUsed: url
            });

            return { id: imageId, path: filepath };
        } catch (error) {
            logger.error(`Error downloading image from ${url}:`, error);
            throw error;
        }
    }

    /**
     * Save image metadata to database
     */
    async saveImage(data) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO generated_images (item_id, file_path, file_size_bytes, width, height, format, style, generation_method, prompt_used)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [data.itemId, data.filePath, data.fileSizeBytes, data.width, data.height, data.format, data.style, data.generationMethod, data.promptUsed],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    /**
     * Get images for item
     */
    async getImagesForItem(itemId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM generated_images WHERE item_id = ? ORDER BY created_at DESC`,
                [itemId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
}

export const imageGenerator = new ImageGenerator();
