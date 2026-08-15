import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';
import { logger } from './logger.js';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VideoGenerator {
    constructor() {
        this.outputDir = process.env.OUTPUT_PATH || './output';
        this.tempDir = process.env.TEMP_PATH || './temp';
        this.ensureDirectories();
    }

    ensureDirectories() {
        const dirs = [this.outputDir, `${this.outputDir}/videos`, this.tempDir];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Generate video from image with various effects
     */
    async generateFromImage(itemId, imagePath, options = {}) {
        const {
            duration = parseInt(process.env.VIDEO_DURATION) || 5,
            format = 'mp4',
            style = 'fade',
            fps = parseInt(process.env.VIDEO_FPS) || 30,
            width = parseInt(process.env.VIDEO_WIDTH) || 1920,
            height = parseInt(process.env.VIDEO_HEIGHT) || 1080
        } = options;

        try {
            const filename = `video_${itemId}_${Date.now()}.${format}`;
            const outputPath = path.join(this.outputDir, 'videos', filename);

            await this.createVideoWithEffect(imagePath, outputPath, style, duration, fps, width, height, format);

            const stats = fs.statSync(outputPath);

            const videoId = await this.saveVideo({
                itemId,
                filePath: outputPath,
                fileSizeBytes: stats.size,
                durationSeconds: duration,
                width,
                height,
                fps,
                format,
                codec: format === 'mp4' ? 'h264' : 'vp9',
                videoStyle: style,
                hasAudio: false
            });

            logger.info(`Generated ${format} video ${videoId} for item ${itemId}`);
            return { id: videoId, path: outputPath, format, duration };
        } catch (error) {
            logger.error(`Error generating video for item ${itemId}:`, error);
            throw error;
        }
    }

    /**
     * Create video with specific effect
     */
    async createVideoWithEffect(imagePath, outputPath, style, duration, fps, width, height, format) {
        return new Promise((resolve, reject) => {
            let command = ffmpeg(imagePath)
                .inputOptions([`-loop 1`, `-t ${duration}`])
                .size(`${width}x${height}`)
                .fps(fps);

            // Apply different effects based on style
            switch (style) {
                case 'fade':
                    command = command.videoFilters([
                        `fade=in:0:${fps}`,
                        `fade=out:${(duration - 1) * fps}:${fps}`
                    ]);
                    break;
                case 'zoom':
                    command = command.videoFilters([
                        `zoompan=z='min(zoom+0.0015,1.5)':d=${duration * fps}:s=${width}x${height}`
                    ]);
                    break;
                case 'pan':
                    command = command.videoFilters([
                        `zoompan=z='1.5':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${duration * fps}:s=${width}x${height}`
                    ]);
                    break;
                case 'ken_burns':
                    command = command.videoFilters([
                        `zoompan=z='min(max(zoom,pzoom)+0.0015,1.5)':d=${duration * fps}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}`
                    ]);
                    break;
                case 'slide':
                    command = command.videoFilters([
                        `crop=iw/2:ih:0:0,scale=${width}:${height}`,
                        `fade=in:0:${fps}`,
                        `fade=out:${(duration - 1) * fps}:${fps}`
                    ]);
                    break;
                default:
                    // Static image
                    break;
            }

            // Format-specific settings
            if (format === 'mp4') {
                command = command
                    .videoCodec('libx264')
                    .outputOptions([
                        '-pix_fmt yuv420p',
                        '-preset medium',
                        '-crf 23'
                    ]);
            } else if (format === 'webm') {
                command = command
                    .videoCodec('libvpx-vp9')
                    .outputOptions([
                        '-b:v 1M',
                        '-crf 30'
                    ]);
            } else if (format === 'gif') {
                command = command
                    .videoFilters([
                        `fps=${Math.min(fps, 15)}`,
                        `scale=${Math.floor(width / 2)}:${Math.floor(height / 2)}:flags=lanczos`,
                        `split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`
                    ]);
            }

            command
                .output(outputPath)
                .on('end', () => {
                    logger.info(`Video created: ${outputPath}`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    logger.error('FFmpeg error:', err);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Generate multiple video formats
     */
    async generateMultipleFormats(itemId, imagePath, style = 'fade') {
        const formats = (process.env.VIDEO_FORMATS || 'mp4,webm,gif').split(',');
        const videos = [];

        for (const format of formats) {
            try {
                const video = await this.generateFromImage(itemId, imagePath, {
                    format: format.trim(),
                    style
                });
                videos.push(video);
            } catch (error) {
                logger.warn(`Failed to generate ${format} video:`, error.message);
            }
        }

        return videos;
    }

    /**
     * Create slideshow from multiple images
     */
    async createSlideshow(itemId, imagePaths, options = {}) {
        const {
            duration = 3,
            transition = 'fade',
            format = 'mp4',
            fps = 30,
            width = 1920,
            height = 1080
        } = options;

        try {
            const filename = `slideshow_${itemId}_${Date.now()}.${format}`;
            const outputPath = path.join(this.outputDir, 'videos', filename);

            // Create input file list
            const listPath = path.join(this.tempDir, `list_${Date.now()}.txt`);
            const listContent = imagePaths.map(p => `file '${p}'\nduration ${duration}`).join('\n');
            fs.writeFileSync(listPath, listContent);

            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(listPath)
                    .inputOptions(['-f concat', '-safe 0'])
                    .size(`${width}x${height}`)
                    .fps(fps)
                    .videoCodec('libx264')
                    .outputOptions(['-pix_fmt yuv420p', '-preset medium', '-crf 23'])
                    .output(outputPath)
                    .on('end', () => {
                        fs.unlinkSync(listPath);
                        resolve(outputPath);
                    })
                    .on('error', (err) => {
                        if (fs.existsSync(listPath)) fs.unlinkSync(listPath);
                        reject(err);
                    })
                    .run();
            });

            const stats = fs.statSync(outputPath);
            const totalDuration = imagePaths.length * duration;

            const videoId = await this.saveVideo({
                itemId,
                filePath: outputPath,
                fileSizeBytes: stats.size,
                durationSeconds: totalDuration,
                width,
                height,
                fps,
                format,
                codec: 'h264',
                videoStyle: 'slideshow',
                hasAudio: false
            });

            logger.info(`Created slideshow video ${videoId}`);
            return { id: videoId, path: outputPath, duration: totalDuration };
        } catch (error) {
            logger.error('Error creating slideshow:', error);
            throw error;
        }
    }

    /**
     * Add text overlay to video
     */
    async addTextOverlay(videoPath, text, options = {}) {
        const {
            fontSize = 48,
            fontColor = 'white',
            position = 'bottom',
            backgroundColor = 'black@0.5'
        } = options;

        try {
            const outputPath = videoPath.replace(/\.(mp4|webm)$/, '_text.$1');

            let yPosition = 'h-th-50';
            if (position === 'top') yPosition = '50';
            else if (position === 'center') yPosition = '(h-th)/2';

            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .videoFilters([
                        `drawtext=text='${text.replace(/'/g, "\\'")}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=${yPosition}:box=1:boxcolor=${backgroundColor}:boxborderw=10`
                    ])
                    .output(outputPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            return outputPath;
        } catch (error) {
            logger.error('Error adding text overlay:', error);
            throw error;
        }
    }

    /**
     * Add audio to video
     */
    async addAudio(videoPath, audioPath) {
        try {
            const outputPath = videoPath.replace(/\.(mp4|webm)$/, '_audio.$1');

            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .input(audioPath)
                    .outputOptions(['-c:v copy', '-c:a aac', '-shortest'])
                    .output(outputPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            return outputPath;
        } catch (error) {
            logger.error('Error adding audio:', error);
            throw error;
        }
    }

    /**
     * Concatenate multiple videos
     */
    async concatenateVideos(videoPaths, outputPath) {
        try {
            const listPath = path.join(this.tempDir, `concat_${Date.now()}.txt`);
            const listContent = videoPaths.map(p => `file '${p}'`).join('\n');
            fs.writeFileSync(listPath, listContent);

            await new Promise((resolve, reject) => {
                ffmpeg()
                    .input(listPath)
                    .inputOptions(['-f concat', '-safe 0'])
                    .outputOptions(['-c copy'])
                    .output(outputPath)
                    .on('end', () => {
                        fs.unlinkSync(listPath);
                        resolve(outputPath);
                    })
                    .on('error', (err) => {
                        if (fs.existsSync(listPath)) fs.unlinkSync(listPath);
                        reject(err);
                    })
                    .run();
            });

            return outputPath;
        } catch (error) {
            logger.error('Error concatenating videos:', error);
            throw error;
        }
    }

    /**
     * Generate video thumbnail
     */
    async generateThumbnail(videoPath, timestamp = '00:00:01') {
        try {
            const thumbnailPath = videoPath.replace(/\.(mp4|webm|gif)$/, '_thumb.jpg');

            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .screenshots({
                        timestamps: [timestamp],
                        filename: path.basename(thumbnailPath),
                        folder: path.dirname(thumbnailPath),
                        size: '320x180'
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            return thumbnailPath;
        } catch (error) {
            logger.error('Error generating video thumbnail:', error);
            throw error;
        }
    }

    /**
     * Save video metadata to database
     */
    async saveVideo(data) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO generated_videos (item_id, file_path, file_size_bytes, duration_seconds, width, height, fps, format, codec, video_style, has_audio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [data.itemId, data.filePath, data.fileSizeBytes, data.durationSeconds, data.width, data.height, data.fps, data.format, data.codec, data.videoStyle, data.hasAudio ? 1 : 0],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    /**
     * Get videos for item
     */
    async getVideosForItem(itemId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM generated_videos WHERE item_id = ? ORDER BY created_at DESC`,
                [itemId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
}

export const videoGenerator = new VideoGenerator();
