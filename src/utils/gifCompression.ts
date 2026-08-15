/**
 * gifCompression.ts — public GIF helpers.
 *
 * Real animated compression is implemented in gifEngine.ts (WebCodecs decode
 * + gifenc encode). This module keeps the historical API surface used by the
 * UI and maps it onto the engine.
 */
import { compressGifManual, type GifManualOptions } from './gifEngine';

export { compressGifToSize, gifDecoderSupported } from './gifEngine';
export type { GifCompressResult } from './gifEngine';

export interface GifCompressionOptions {
    lossy?: number; // 1-200, higher = more compression but lower quality
    colors?: number; // Max colors (8-256)
    resize?: { width: number; height: number };
    /** target frame rate; 0 (or undefined) = keep original timing */
    fps?: number;
    /** relative size, 1 = original */
    scale?: number;
}

export const defaultGifOptions: GifCompressionOptions = {
    lossy: 60,
    colors: 192,
    fps: 0, // 0 = keep original frame rate
};

export async function compressGif(
    file: File,
    options: GifCompressionOptions = defaultGifOptions,
    onProgress?: (progress: number) => void
): Promise<File> {
    const engineOptions: GifManualOptions = {
        colors: options.colors,
        fps: options.fps && options.fps > 0 ? options.fps : 0,
        lossy: options.lossy,
        scale: options.scale,
        targetWidth: options.resize?.width,
    };

    const result = await compressGifManual(file, engineOptions, {
        onProgress: (p) => onProgress?.(p),
    });

    // If re-encoding made the file *bigger*, return the original untouched.
    return result.bytes < file.size ? result.file : file;
}

export async function convertGifToWebP(
    file: File,
    options: { quality?: number; resize?: { width: number; height: number } } = {}
): Promise<File> {
    // Note: this produces a still (first-frame) WebP — browsers cannot encode
    // animated WebP natively.
    const blob = new Blob([await file.arrayBuffer()], { type: 'image/gif' });

    const img = new Image();
    const url = URL.createObjectURL(blob);

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        URL.revokeObjectURL(url);
        throw new Error('Could not get canvas context');
    }

    if (options.resize) {
        canvas.width = options.resize.width;
        canvas.height = options.resize.height;
    } else {
        canvas.width = img.width;
        canvas.height = img.height;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const resultBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
            'image/webp',
            options.quality || 0.8
        );
    });

    URL.revokeObjectURL(url);

    const fileName = file.name.replace(/\.gif$/i, '.webp');
    return new File([resultBlob], fileName, { type: 'image/webp' });
}

export function isGif(file: File): boolean {
    return file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
}

export function isVideo(file: File): boolean {
    return (
        file.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name)
    );
}

export async function extractVideoFrame(
    file: File,
    timeInSeconds: number = 0
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
            video.currentTime = Math.min(timeInSeconds, video.duration);
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (blob) resolve(blob);
                else reject(new Error('Failed to extract frame'));
            }, 'image/png');
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load video'));
        };

        video.src = url;
    });
}