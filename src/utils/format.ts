import JSZip from 'jszip';

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function createFileUrl(file: File): string {
    return URL.createObjectURL(file);
}

export function getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

export function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
}

export function downloadFile(file: File, filename?: string) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function downloadAsZip(files: File[], zipName: string = 'compressed-images.zip') {
    const zip = new JSZip();

    // Add all files to zip
    files.forEach((file, index) => {
        const filename = file.name || `image_${index + 1}.${getFileExtension(file.name)}`;
        zip.file(filename, file);
    });

    // Generate zip file
    const blob = await zip.generateAsync({ type: 'blob' });

    // Download zip
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

export async function resizeImage(
    file: File,
    targetWidth: number,
    targetHeight: number,
    maintainAspectRatio: boolean = true
): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            let width = targetWidth;
            let height = targetHeight;

            if (maintainAspectRatio) {
                const aspectRatio = img.width / img.height;
                if (targetWidth / targetHeight > aspectRatio) {
                    width = targetHeight * aspectRatio;
                } else {
                    height = targetWidth / aspectRatio;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const resizedFile = new File([blob], file.name, { type: file.type });
                    resolve(resizedFile);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            }, file.type);

            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
