/**
 * VideoEngine.ts
 * Logic for generating video frames and encoding them in the browser.
 */

export interface GenerationOptions {
    text: string;
    style: string;
    width: number;
    height: number;
    duration: number; // in seconds
}

export const generateVideo = async (options: GenerationOptions): Promise<string> => {
    const { text, style, width, height, duration } = options;

    // 1. Setup Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // 2. Setup Recording
    const stream = canvas.captureStream(30); // 30 FPS
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    return new Promise((resolve) => {
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            resolve(URL.createObjectURL(blob));
        };

        recorder.start();

        // 3. Animation Loop (The "Video" part)
        const startTime = Date.now();
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = elapsed / duration;

            if (progress <= 1) {
                drawFrame(ctx, text, style, width, height, progress);
                requestAnimationFrame(animate);
            } else {
                recorder.stop();
            }
        };

        animate();
    });
};

/**
 * Draws a single frame of the video
 */
const drawFrame = (
    ctx: CanvasRenderingContext2D,
    text: string,
    style: string,
    width: number,
    height: number,
    progress: number
) => {
    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (style === 'vibrant') {
        grad.addColorStop(0, '#ec4899');
        grad.addColorStop(1, '#8b5cf6');
    } else {
        grad.addColorStop(0, '#2563eb');
        grad.addColorStop(1, '#06b6d4');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Animated Background Element (Ken Burns / Pan Effect)
    ctx.globalAlpha = 0.1 * (1 - progress);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, (500 + progress * 200), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw Text with "Fade In / Zoom" effect
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = 60 + progress * 10;
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;

    // Wrap text
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const maxWidth = width * 0.8;

    for (const word of words) {
        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(currentLine);
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);

    lines.forEach((line, i) => {
        const y = (height / 2) - ((lines.length - 1) * fontSize / 2) + (i * fontSize * 1.2);
        ctx.globalAlpha = Math.min(progress * 2, 1); // Fade in effect
        ctx.fillText(line, width / 2, y);
    });
};
