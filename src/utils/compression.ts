import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    useWebWorker: boolean;
    initialQuality?: number;
    fileType?: string;
}

export const defaultOptions: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
};

export const compressionPresets = {
    'high-quality': {
        maxSizeMB: 2,
        maxWidthOrHeight: 2560,
        initialQuality: 0.9,
        label: 'High Quality',
        description: 'Best quality, larger file size'
    },
    'balanced': {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        initialQuality: 0.8,
        label: 'Balanced',
        description: 'Good quality, moderate size'
    },
    'web-optimized': {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        initialQuality: 0.7,
        label: 'Web Optimized',
        description: 'Fast loading, smaller size'
    },
    'maximum-compression': {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1024,
        initialQuality: 0.6,
        label: 'Maximum Compression',
        description: 'Smallest size, lower quality'
    },
    'email-friendly': {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        initialQuality: 0.65,
        label: 'Email Friendly',
        description: 'Perfect for email attachments'
    }
};

export type PresetKey = keyof typeof compressionPresets;

export async function compressImage(
    file: File,
    options: Partial<CompressionOptions> = {},
    onProgress?: (progress: number) => void
): Promise<File> {
    const settings = { ...defaultOptions, ...options };

    try {
        const compressedFile = await imageCompression(file, {
            ...settings,
            onProgress: onProgress || undefined,
        });
        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

export async function convertImageFormat(
    file: File,
    targetFormat: 'image/jpeg' | 'image/png' | 'image/webp',
    options: Partial<CompressionOptions> = {}
): Promise<File> {
    const settings = { ...defaultOptions, ...options, fileType: targetFormat };

    try {
        const convertedFile = await imageCompression(file, settings);

        // Create a new file with the correct extension
        const extension = targetFormat.split('/')[1];
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const newFileName = `${nameWithoutExt}.${extension}`;

        return new File([convertedFile], newFileName, { type: targetFormat });
    } catch (error) {
        console.error('Error converting image format:', error);
        throw error;
    }
}
