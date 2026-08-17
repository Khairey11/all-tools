/**
 * gifEngine.ts - real animated GIF compression, 100% in the browser.
 *
 * Decoding : WebCodecs ImageDecoder (Chrome / Edge 94+)
 * Encoding : gifenc (per-frame palette quantization + LZW)
 *
 * DIMENSIONS ARE NEVER CHANGED - width & height always stay identical
 * to the source. Compression levers are ONLY:
 *   0. Lossless re-encode (palette + LZW) - often enough on its own
 *   1. Adaptive lossy color rounding (coarser quantization steps)
 * Frame count, frame order, timing and resolution are NEVER altered.
 */
import { GIFEncoder, quantize, applyPalette, prequantize } from 'gifenc';

export type GifProgressFn = (percent: number, label?: string) => void;

export interface GifFrameData {
    /** fully-composited RGBA pixels of one frame */
    data: Uint8ClampedArray;
    delayMs: number;
}

export interface DecodedGif {
    frames: GifFrameData[];
    width: number;
    height: number;
    hasTransparency: boolean;
    frameCountTotal: number;
    truncated: boolean;
}

export interface GifPassInfo {
    colors: number;
    scale: number;
    frameInterval: number;
    bytes: number;
}

export interface GifCompressResult {
    file: File;
    bytes: number;
    sourceBytes: number;
    width: number;
    height: number;
    framesKept: number;
    framesTotal: number;
    passes: GifPassInfo[];
    targetMet: boolean;
    /** true when the result kept full resolution, 256 colors and every frame */
    lossless: boolean;
}

export function gifDecoderSupported(): boolean {
    return typeof window !== 'undefined' && 'ImageDecoder' in window;
}

/* ------------------------------------------------------------------ */
/* Decoding                                                            */
/* ------------------------------------------------------------------ */

const MAX_DECODE_FRAMES = 100000;
const MEMORY_BUDGET_BYTES = 3_500_000_000;
const MIN_DELAY_MS = 100; // browsers promote tiny frame delays to 100ms

function normalizeDelay(ms: number): number {
    if (!Number.isFinite(ms) || ms < 20) return MIN_DELAY_MS;
    return Math.min(ms, 60_000);
}

const sleep = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function decodeGifFile(file: File, onProgress?: GifProgressFn): Promise<DecodedGif> {
    if (!gifDecoderSupported()) {
        throw new Error('Animated GIF support requires Chrome or Edge (WebCodecs ImageDecoder).');
    }

    const buffer = await file.arrayBuffer();
    const decoder = new (window as any).ImageDecoder({ data: buffer, type: 'image/gif' });

    interface RawFrame {
        data: Uint8ClampedArray;
        timestampUs: number;
        durationUs: number;
    }
    const raw: RawFrame[] = [];
    let width: number;
    let height: number;
    let frameCountTotal: number;
    let hasTransparency = false;

    try {
        await decoder.tracks.ready;
        const track = decoder.tracks.selectedTrack;
        frameCountTotal = track?.frameCount ?? 1;

        const first = await decoder.decode({ frameIndex: 0 });
        const firstImage = first.image;
        width = firstImage.displayWidth;
        height = firstImage.displayHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Could not acquire a 2D canvas context.');

        // Keep memory under control for monster GIFs.
        const memoryCap = Math.max(
            100,
            Math.min(MAX_DECODE_FRAMES, Math.floor(MEMORY_BUDGET_BYTES / (width * height * 4)))
        );
        const count = Math.max(1, Math.min(frameCountTotal, memoryCap));

        for (let i = 0; i < count; i++) {
            const result = i === 0 ? first : await decoder.decode({ frameIndex: i });
            const image = result.image;

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0, width, height);
            const pixels = ctx.getImageData(0, 0, width, height).data;

            if (!hasTransparency) {
                for (let p = 3; p < pixels.length; p += 16) {
                    if (pixels[p] < 16) {
                        hasTransparency = true;
                        break;
                    }
                }
            }

            raw.push({
                data: pixels,
                timestampUs: typeof image.timestamp === 'number' ? image.timestamp : 0,
                durationUs: typeof image.duration === 'number' ? image.duration : 0,
            });

            image.close();
            onProgress?.(Math.round(((i + 1) / count) * 100), `Decoding frames (${i + 1}/${count})`);
            if (i % 24 === 23) await sleep(); // keep the UI responsive
        }
    } finally {
        try {
            decoder.close();
        } catch {
            /* ignore */
        }
    }
    const frames: GifFrameData[] = raw.map((f, i) => {
        let ms = f.durationUs / 1000;
        if (!(ms > 0) && i + 1 < raw.length) {
            ms = (raw[i + 1].timestampUs - f.timestampUs) / 1000;
        }
        return { data: f.data, delayMs: normalizeDelay(ms) };
    });

    return {
        frames,
        width,
        height,
        hasTransparency,
        frameCountTotal,
        truncated: frameCountTotal > frames.length,
    };
}

/* ------------------------------------------------------------------ */
/* Encoding                                                            */
/* ------------------------------------------------------------------ */

function roundRgbFromLossy(lossy: number): number {
    // lossy = 0 -> step 1 -> roundStep() is a no-op -> visually lossless.
    return Math.max(1, Math.min(16, 1 + Math.floor(lossy / 25)));
}

export interface EncodeOptions {
    colors: number;
    /** 0 = lossless rounding, 1..200 = increasingly lossy rounding */
    lossy?: number;
    onProgress?: GifProgressFn;
}

export async function encodeFrames(
    frames: GifFrameData[],
    width: number,
    height: number,
    hasTransparency: boolean,
    opts: EncodeOptions
): Promise<Uint8Array> {
    // Every frame gets its OWN full 256-color LOCAL palette quantized from
    // that frame's own pixels - no cross-frame banding or color shifts.
    const format: 'rgb565' | 'rgba4444' = hasTransparency ? 'rgba4444' : 'rgb565';
    const roundRGB = roundRgbFromLossy(opts.lossy ?? 0);
    const gif = GIFEncoder();

    // Decimated sampling keeps per-frame quantization fast on large frames.
    const PALETTE_SAMPLES = 24_000;
    const framePixels = Math.max(1, width * height);
    const stride = Math.max(1, Math.floor(Math.sqrt(framePixels / PALETTE_SAMPLES)));

    for (let fi = 0; fi < frames.length; fi++) {
        const d = frames[fi].data;

        // Sample this frame for palette quantization.
        const sampleArr = new Uint8Array(PALETTE_SAMPLES * 4 + 4);
        let n = 0;
        for (let p = 0; p + 3 < d.length && n + 4 <= sampleArr.length; p += 4 * stride * stride) {
            sampleArr[n++] = d[p];
            sampleArr[n++] = d[p + 1];
            sampleArr[n++] = d[p + 2];
            sampleArr[n++] = d[p + 3];
        }
        const view = sampleArr.subarray(0, n);
        if (roundRGB > 1) {
            prequantize(view, {
                roundRGB,
                roundAlpha: hasTransparency ? 10 : 0,
                oneBitAlpha: hasTransparency ? 127 : null,
            });
        }

        // Full 256-color palette for THIS frame - never fewer.
        const palette = quantize(
            view,
            256,
            hasTransparency ? { format: 'rgba4444', oneBitAlpha: true } : { format: 'rgb565' }
        );

        let transparentIndex = -1;
        if (hasTransparency) {
            transparentIndex = palette.findIndex((col) => col[3] === 0);
            if (transparentIndex === -1) {
                if (palette.length < 256) {
                    palette.push([0, 0, 0, 0]);
                } else {
                    palette[palette.length - 1] = [0, 0, 0, 0];
                }
                transparentIndex = palette.length - 1;
            }
        }

        const index = applyPalette(d, palette, format);
        const delayMs = Math.max(10, Math.round(frames[fi].delayMs / 10) * 10);
        const colorDepth = Math.max(2, Math.min(8, Math.ceil(Math.log2(Math.max(2, palette.length)))));

        const frameOpts: {
            delay: number;
            colorDepth: number;
            dispose: number;
            palette?: number[][];
            repeat?: number;
            transparent?: boolean;
            transparentIndex?: number;
        } = {
            delay: delayMs,
            colorDepth,
            dispose: hasTransparency ? 2 : -1,
            palette, // LOCAL per-frame palette = exact colors per frame
        };
        if (fi === 0) {
            frameOpts.repeat = 0; // loop forever
        }
        if (hasTransparency) {
            frameOpts.transparent = true;
            frameOpts.transparentIndex = transparentIndex;
        }

        gif.writeFrame(index, width, height, frameOpts);
        opts.onProgress?.(Math.round(((fi + 1) / frames.length) * 100));
        if (fi % 8 === 7) await sleep();
    }

    gif.finish();
    return gif.bytes();
}

/* ------------------------------------------------------------------ */
/* Manual compressor                                                   */
/* ------------------------------------------------------------------ */

export interface GifManualOptions {
    colors?: number;
    fps?: number;
    lossy?: number;
}

function makeResultFile(file: File, bytes: Uint8Array): File {
    const base = file.name.replace(/\.gif$/i, '');
    return new File([bytes as unknown as BlobPart], `${base}-compressed.gif`, { type: 'image/gif' });
}

export async function compressGifManual(
    file: File,
    options: GifManualOptions,
    callbacks?: { onProgress?: GifProgressFn; preDecoded?: DecodedGif }
): Promise<GifCompressResult> {
    const onProgress = callbacks?.onProgress;

    onProgress?.(2, 'Decoding GIF...');
    const decoded =
        callbacks?.preDecoded ??
        (await decodeGifFile(file, (p) => onProgress?.(p * 0.25, 'Decoding frames...')));

    // DIMENSIONS ARE NEVER CHANGED - only lossy color rounding is applied.
    onProgress?.(28, 'Preparing frames...');
    const kept = decoded.frames;

    onProgress?.(32, 'Encoding GIF...');
    const bytes = await encodeFrames(
        kept,
        decoded.width,
        decoded.height,
        decoded.hasTransparency,
        {
            colors: 256,
            lossy: options.lossy ?? 0,
            onProgress: (p) => onProgress?.(32 + p * 0.66, 'Encoding frames...'),
        }
    );

    onProgress?.(100, 'Done');
    return {
        file: makeResultFile(file, bytes),
        bytes: bytes.length,
        sourceBytes: file.size,
        width: decoded.width,
        height: decoded.height,
        framesKept: kept.length,
        framesTotal: decoded.frameCountTotal,
        passes: [{ colors: 256, scale: 1, frameInterval: 1, bytes: bytes.length }],
        targetMet: true,
        lossless: (options.lossy ?? 0) === 0,
    };
}

/* ------------------------------------------------------------------ */
/* Target-size compressor (resolution-preserving, adaptive lossy)      */
/* ------------------------------------------------------------------ */

interface PassConfig {
    colors: number;
    /** kept for reporting - always 1 (resolution never changes) */
    interval: number;
    scale: number;
    /** 0 = lossless color rounding */
    lossy: number;
}

interface PassOutcome {
    cfg: PassConfig;
    bytes: number;
    data: Uint8Array;
}

/** Perceived-quality score - resolution is fixed, so less lossy wins. */
function qualityScore(c: PassConfig): number {
    const losslessBonus = c.lossy === 0 ? 0.05 : 0;
    return 1 - c.lossy / 250 + (c.colors / 256) * 0.1 + losslessBonus;
}

export type GifStrength = 'light' | 'balanced' | 'strong' | 'extreme';

/**
 * Maximum lossy rounding per strength. Resolution is never a lever, so the
 * lossy budgets are generous enough to reach aggressive targets.
 */
const STRENGTH_BOUNDS: Record<GifStrength, { maxLossy: number }> = {
    light: { maxLossy: 0 },
    balanced: { maxLossy: 40 },
    strong: { maxLossy: 110 },
    extreme: { maxLossy: 200 },
};

export async function compressGifToSize(
    file: File,
    targetBytes: number,
    callbacks?: { onProgress?: GifProgressFn; preDecoded?: DecodedGif; strength?: GifStrength }
): Promise<GifCompressResult> {
    const onProgress = callbacks?.onProgress;
    const bounds = STRENGTH_BOUNDS[callbacks?.strength ?? 'balanced'];

    // Already fits - return untouched.
    if (file.size <= targetBytes) {
        return {
            file,
            bytes: file.size,
            sourceBytes: file.size,
            width: 0,
            height: 0,
            framesKept: 0,
            framesTotal: 0,
            passes: [],
            targetMet: true,
            lossless: true,
        };
    }

    onProgress?.(2, 'Decoding GIF...');
    const decoded =
        callbacks?.preDecoded ??
        (await decodeGifFile(file, (p) => onProgress?.(2 + p * 0.08, 'Decoding frames...')));

    const passes: GifPassInfo[] = [];
    // Best pass that fits the target (max quality score wins).
    const bestFitRef: { current: PassOutcome | null } = { current: null };
    // Smallest pass overall (fallback if the target can't be met).
    const smallestRef: { current: PassOutcome | null } = { current: null };

    const bestFit = (): PassOutcome | null => bestFitRef.current;
    const smallest = (): PassOutcome | null => smallestRef.current;

    const runPass = async (cfg: PassConfig, progress: number): Promise<PassOutcome> => {
        // Resolution is ALWAYS the original - frames pass through untouched.
        const bytes = await encodeFrames(
            decoded.frames,
            decoded.width,
            decoded.height,
            decoded.hasTransparency,
            {
                colors: cfg.colors,
                lossy: cfg.lossy,
                onProgress: (p) =>
                    onProgress?.(Math.min(97, progress + (p / 100) * 4), 'Compressing GIF'),
            }
        );

        const outcome: PassOutcome = { cfg, bytes: bytes.length, data: bytes };
        passes.push({
            colors: cfg.colors,
            scale: 1,
            frameInterval: cfg.interval,
            bytes: bytes.length,
        });

        if (!smallestRef.current || bytes.length < smallestRef.current.bytes) {
            smallestRef.current = outcome;
        }
        if (bytes.length <= targetBytes) {
            const cur = bestFitRef.current;
            if (!cur || qualityScore(cfg) > qualityScore(cur.cfg)) {
                bestFitRef.current = outcome;
            }
        }
        return outcome;
    };

    /* ---- Phase 0: lossless re-encode ------------------------------ */
    // Palette + LZW only. Bloated GIFs often shrink 30-60% here with ZERO
    // quality loss (all frames, full colors, full resolution).
    const p0 = await runPass({ colors: 256, interval: 1, scale: 1, lossy: 0 }, 12);
    if (p0.bytes <= targetBytes) {
        return finish(
            { cfg: p0.cfg, bytes: p0.bytes, data: p0.data },
            passes,
            decoded,
            file,
            targetBytes,
            true,
            onProgress
        );
    }

    /* ---- Phase 1: adaptive lossy ladder ---------------------------- */
    // Coarser color rounding shrinks LZW output. Climb the ladder until the
    // target is met - width/height NEVER change.
    const lossyLadder = [10, 20, 35, 50, 70, 90, 110, 130, 150, 175, 200];
    for (let i = 0; i < lossyLadder.length; i++) {
        const lossy = Math.min(bounds.maxLossy, lossyLadder[i]);
        const cfg: PassConfig = { colors: 256, interval: 1, scale: 1, lossy };
        const out = await runPass(cfg, 30 + i * 4);
        if (out.bytes <= targetBytes) break;
        if (lossy >= bounds.maxLossy) break; // strength limit reached
    }

    {
        const fit = bestFit();
        if (fit) {
            return finish(
                { cfg: fit.cfg, bytes: fit.bytes, data: fit.data },
                passes,
                decoded,
                file,
                targetBytes,
                false,
                onProgress
            );
        }
    }

    /* ---- Phase 2: budget utilization ------------------------------- */
    // If we are well under the target we "wasted" quality - claw it back
    // by easing off the lossy rounding while still fitting the target.
    const clawBack = async (): Promise<void> => {
        for (let k = 0; k < 4; k++) {
            const fit = bestFit();
            if (!fit || fit.bytes > targetBytes * 0.8 || fit.cfg.lossy <= 0) return;
            const cfg: PassConfig = {
                colors: 256,
                interval: 1,
                scale: 1,
                lossy: Math.max(0, Math.round(fit.cfg.lossy * 0.6)),
            };
            if (cfg.lossy >= fit.cfg.lossy) return;
            const out = await runPass(cfg, 78 + k * 2);
            if (out.bytes > targetBytes) return; // too greedy - keep what we have
        }
    };
    await clawBack();

    {
        const fit = bestFit();
        if (fit) {
            return finish(
                { cfg: fit.cfg, bytes: fit.bytes, data: fit.data },
                passes,
                decoded,
                file,
                targetBytes,
                false,
                onProgress
            );
        }
    }

    /* ---- Phase 3: last resort -------------------------------------- */
    // Extreme targets only: the strength's maximum lossy rounding.
    if (bounds.maxLossy > 0) {
        await runPass(
            { colors: 256, interval: 1, scale: 1, lossy: bounds.maxLossy },
            90
        );
    }
    await clawBack();

    const result = bestFit() ?? smallest();
    if (!result) throw new Error('GIF compression failed.');
    return finish(
        { cfg: result.cfg, bytes: result.bytes, data: result.data },
        passes,
        decoded,
        file,
        targetBytes,
        false,
        onProgress
    );
}

function finish(
    outcome: { cfg: PassConfig; bytes: number; data: Uint8Array },
    passes: GifPassInfo[],
    decoded: DecodedGif,
    file: File,
    targetBytes: number,
    lossless: boolean,
    onProgress?: GifProgressFn
): GifCompressResult {
    onProgress?.(100, 'Done');
    const cfg = outcome.cfg;
    const isLossless = lossless || (cfg.lossy === 0 && cfg.colors >= 256);
    return {
        file: makeResultFile(file, outcome.data),
        bytes: outcome.bytes,
        sourceBytes: file.size,
        // Dimensions are always the ORIGINAL - resolution never changes.
        width: decoded.width,
        height: decoded.height,
        framesKept: decoded.frames.length,
        framesTotal: decoded.frameCountTotal,
        passes,
        targetMet: outcome.bytes <= targetBytes,
        lossless: isLossless,
    };
}