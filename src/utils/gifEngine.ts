/**
 * gifEngine.ts — real animated GIF compression, 100% in the browser.
 *
 * Decoding : WebCodecs ImageDecoder (Chrome / Edge 94+)
 * Encoding : gifenc (global-palette quantization + LZW)
 *
 * Quality-first philosophy:
 *   0. Lossless re-encode (global palette + LZW only) — often enough alone
 *   1. Frame-rate reduction (least perceptible change)
 *   2. Color reduction (essentially invisible down to ~128 colors)
 *   3. Resolution (most visible — only as much as mathematically needed,
 *      then refined upward to use the remaining size budget)
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

const MAX_DECODE_FRAMES = 800;
const MEMORY_BUDGET_BYTES = 500_000_000;
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
/* Frame transforms                                                    */
/* ------------------------------------------------------------------ */

export function scaleFrames(
    frames: GifFrameData[],
    width: number,
    height: number,
    scale: number
): { frames: GifFrameData[]; width: number; height: number } {
    if (scale >= 0.995) return { frames, width, height };

    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const src = document.createElement('canvas');
    src.width = width;
    src.height = height;
    const srcCtx = src.getContext('2d');

    const dst = document.createElement('canvas');
    dst.width = w;
    dst.height = h;
    const dstCtx = dst.getContext('2d', { willReadFrequently: true });

    if (!srcCtx || !dstCtx) throw new Error('Could not acquire 2D canvas contexts.');

    dstCtx.imageSmoothingEnabled = true;
    dstCtx.imageSmoothingQuality = 'high';

    const scaled: GifFrameData[] = frames.map((f) => {
        srcCtx.putImageData(
            new ImageData(f.data as unknown as Uint8ClampedArray<ArrayBuffer>, width, height),
            0,
            0
        );
        dstCtx.clearRect(0, 0, w, h);
        dstCtx.drawImage(src, 0, 0, w, h);
        return { data: dstCtx.getImageData(0, 0, w, h).data, delayMs: f.delayMs };
    });

    return { frames: scaled, width: w, height: h };
}

/** Drop frames so that at least `minDelayMs` passes between kept frames.
 *  Delays of dropped frames are merged into the kept frame, so total
 *  animation duration stays the same. */
export function thinFrames(frames: GifFrameData[], minDelayMs: number): GifFrameData[] {
    if (minDelayMs <= 0 || frames.length <= 1) return frames;

    const out: GifFrameData[] = [];
    let acc = 0;
    for (const f of frames) {
        acc += f.delayMs;
        if (out.length === 0 || acc >= minDelayMs * 0.999) {
            out.push({ data: f.data, delayMs: acc });
            acc = 0;
        }
    }
    if (acc > 0 && out.length > 0) {
        out[out.length - 1] = {
            data: out[out.length - 1].data,
            delayMs: out[out.length - 1].delayMs + acc,
        };
    }
    return out;
}

function medianDelay(frames: GifFrameData[]): number {
    if (!frames.length) return MIN_DELAY_MS;
    const sorted = frames.map((f) => f.delayMs).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

/* ------------------------------------------------------------------ */
/* Encoding                                                            */
/* ------------------------------------------------------------------ */

const MAX_SAMPLE_PIXELS = 800_000;
const MAX_PALETTE_SAMPLE_FRAMES = 64;

function roundRgbFromLossy(lossy: number): number {
    // lossy = 0 → step 1 → roundStep() is a no-op → visually lossless.
    return Math.max(1, Math.min(16, 1 + Math.floor(lossy / 25)));
}

function buildGlobalPalette(
    frames: GifFrameData[],
    width: number,
    height: number,
    maxColors: number,
    roundRGB: number,
    hasTransparency: boolean
): { palette: number[][]; transparentIndex: number } {
    const frameStride = Math.max(1, Math.ceil(frames.length / MAX_PALETTE_SAMPLE_FRAMES));
    const sampledFrameCount = Math.ceil(frames.length / frameStride);
    const totalPixels = width * height * sampledFrameCount;
    const pixelStride = Math.max(1, Math.floor(Math.sqrt(totalPixels / MAX_SAMPLE_PIXELS)));

    const sample = new Uint8Array(Math.min(totalPixels, MAX_SAMPLE_PIXELS) * 4 + 4);
    let n = 0;
    for (let fi = 0; fi < frames.length; fi += frameStride) {
        const d = frames[fi].data;
        for (let p = 0; p < d.length && n + 4 <= sample.length; p += 4 * pixelStride) {
            sample[n++] = d[p];
            sample[n++] = d[p + 1];
            sample[n++] = d[p + 2];
            sample[n++] = d[p + 3];
        }
    }
    const view = sample.subarray(0, n);

    prequantize(view, {
        roundRGB,
        roundAlpha: hasTransparency ? 10 : 0,
        oneBitAlpha: hasTransparency ? 127 : null,
    });

    const colors = Math.max(8, Math.min(256, Math.round(maxColors)));
    const palette = quantize(
        view,
        colors,
        hasTransparency ? { format: 'rgba4444', oneBitAlpha: true } : { format: 'rgb565' }
    );

    let transparentIndex = -1;
    if (hasTransparency) {
        transparentIndex = palette.findIndex((c) => c[3] === 0);
        if (transparentIndex === -1) {
            if (palette.length < 256) {
                palette.push([0, 0, 0, 0]);
            } else {
                palette[palette.length - 1] = [0, 0, 0, 0];
            }
            transparentIndex = palette.length - 1;
        }
    }

    return { palette, transparentIndex };
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
    const { palette, transparentIndex } = buildGlobalPalette(
        frames,
        width,
        height,
        opts.colors,
        roundRgbFromLossy(opts.lossy ?? 0),
        hasTransparency
    );

    const format: 'rgb565' | 'rgba4444' = hasTransparency ? 'rgba4444' : 'rgb565';
    const gif = GIFEncoder();
    const colorDepth = Math.max(2, Math.min(8, Math.ceil(Math.log2(Math.max(2, palette.length)))));

    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const index = applyPalette(frame.data, palette, format);
        const delayMs = Math.max(10, Math.round(frame.delayMs / 10) * 10);

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
        };
        if (i === 0) {
            frameOpts.palette = palette;
            frameOpts.repeat = 0; // loop forever
        }
        if (hasTransparency) {
            frameOpts.transparent = true;
            frameOpts.transparentIndex = transparentIndex;
        }

        gif.writeFrame(index, width, height, frameOpts);
        opts.onProgress?.(Math.round(((i + 1) / frames.length) * 100));
        if (i % 8 === 7) await sleep();
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
    scale?: number;
    /** absolute pixel width — wins over `scale` */
    targetWidth?: number;
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

    onProgress?.(2, 'Decoding GIF…');
    const decoded =
        callbacks?.preDecoded ??
        (await decodeGifFile(file, (p) => onProgress?.(p * 0.25, 'Decoding frames…')));

    let scale = Math.min(1, Math.max(0.05, options.scale ?? 1));
    if (options.targetWidth && options.targetWidth > 0) {
        scale = Math.min(1, Math.max(0.05, options.targetWidth / decoded.width));
    }

    onProgress?.(28, 'Scaling frames…');
    const scaled = scaleFrames(decoded.frames, decoded.width, decoded.height, scale);

    const minDelay = options.fps && options.fps > 0 ? 1000 / options.fps : 0;
    const thinned = thinFrames(scaled.frames, minDelay);

    onProgress?.(32, 'Encoding GIF…');
    const bytes = await encodeFrames(
        thinned,
        scaled.width,
        scaled.height,
        decoded.hasTransparency,
        {
            colors: options.colors ?? 256,
            lossy: options.lossy ?? 0,
            onProgress: (p) => onProgress?.(32 + p * 0.66, 'Encoding frames…'),
        }
    );

    const usedColors = Math.max(8, Math.min(256, options.colors ?? 256));
    const frameInterval =
        minDelay > 0 ? Math.max(1, Math.round(minDelay / Math.max(1, medianDelay(scaled.frames)))) : 1;

    onProgress?.(100, 'Done');
    return {
        file: makeResultFile(file, bytes),
        bytes: bytes.length,
        sourceBytes: file.size,
        width: scaled.width,
        height: scaled.height,
        framesKept: thinned.length,
        framesTotal: decoded.frameCountTotal,
        passes: [{ colors: usedColors, scale, frameInterval, bytes: bytes.length }],
        targetMet: true,
        lossless: false,
    };
}

/* ------------------------------------------------------------------ */
/* Target-size compressor (quality-first, adaptive)                    */
/* ------------------------------------------------------------------ */

interface PassConfig {
    colors: number;
    /** keep 1 of every `interval` (in median-delay multiples) */
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

/** Perceived-quality score — resolution dominates, then smoothness, then colors. */
function qualityScore(c: PassConfig): number {
    const colorScore = c.colors / 256;
    const smoothness = 1 / Math.max(1, c.interval);
    const losslessBonus = c.lossy === 0 ? 0.05 : 0;
    return 2.2 * c.scale + 1.2 * smoothness + 0.6 * colorScore + losslessBonus;
}

function describePass(p: PassConfig): string {
    const parts: string[] = [];
    if (p.scale >= 0.995 && p.interval <= 1 && p.lossy === 0) return 'lossless re-encode';
    if (p.scale < 1) parts.push(`${Math.round(p.scale * 100)}% size`);
    if (p.interval > 1) parts.push(`${Math.round(100 / p.interval)}% frames`);
    if (p.colors < 256) parts.push(`${p.colors} colors`);
    if (p.lossy > 0) parts.push('lossy rounding');
    return parts.length ? parts.join(' · ') : 're-encode';
}

const FLOOR_SCALE = 0.04;

function clampScale(s: number): number {
    return Math.min(1, Math.max(FLOOR_SCALE, s));
}

export async function compressGifToSize(
    file: File,
    targetBytes: number,
    callbacks?: { onProgress?: GifProgressFn; preDecoded?: DecodedGif }
): Promise<GifCompressResult> {
    const onProgress = callbacks?.onProgress;

    // Already fits — return untouched.
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

    onProgress?.(2, 'Decoding GIF…');
    const decoded =
        callbacks?.preDecoded ??
        (await decodeGifFile(file, (p) => onProgress?.(2 + p * 0.08, 'Decoding frames…')));

    const median = medianDelay(decoded.frames);

    // Cache scaled frame sets (bounded to 2 entries).
    const scaleCache: { scale: number; frames: GifFrameData[]; width: number; height: number }[] =
        [];
    const getScaled = (scale: number) => {
        const hit = scaleCache.find((c) => Math.abs(c.scale - scale) < 1e-6);
        if (hit) return hit;
        const s = scaleFrames(decoded.frames, decoded.width, decoded.height, scale);
        scaleCache.push({ scale, frames: s.frames, width: s.width, height: s.height });
        while (scaleCache.length > 2) scaleCache.shift();
        return scaleCache[scaleCache.length - 1];
    };

    const passes: GifPassInfo[] = [];
    // Best pass that fits the target (max quality score wins).
    const bestFitRef: { current: PassOutcome | null } = { current: null };
    // Smallest pass overall (fallback if the target can't be met).
    const smallestRef: { current: PassOutcome | null } = { current: null };
    // Most recent outcome (input for the scale estimator).
    const lastRef: { current: PassOutcome | null } = { current: null };

    // Getters — reading through a function boundary avoids bogus CFA
    // narrowing to `never` (TS cannot see the async mutations above).
    const bestFit = (): PassOutcome | null => bestFitRef.current;
    const smallest = (): PassOutcome | null => smallestRef.current;
    const lastOutcome = (): PassOutcome => lastRef.current as PassOutcome;

    let passIndex = 0;
    const runPass = async (cfg: PassConfig, progress: number): Promise<PassOutcome> => {
        passIndex++;
        const scaled = getScaled(cfg.scale);
        const thinned = thinFrames(
            scaled.frames,
            cfg.interval > 1 ? cfg.interval * median * 0.999 : 0
        );
        const bytes = await encodeFrames(
            thinned,
            scaled.width,
            scaled.height,
            decoded.hasTransparency,
            {
                colors: cfg.colors,
                lossy: cfg.lossy,
                onProgress: (p) =>
                    onProgress?.(
                        Math.min(97, progress + (p / 100) * 4),
                        `Pass ${passIndex} — ${describePass(cfg)}`
                    ),
            }
        );

        const outcome: PassOutcome = { cfg, bytes: bytes.length, data: bytes };
        passes.push({
            colors: cfg.colors,
            scale: cfg.scale,
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
        lastRef.current = outcome;
        return outcome;
    };

    /* ---- Phase 0: lossless re-encode ------------------------------ */
    // Global palette + LZW only. Bloated GIFs often shrink 30–60% here
    // with ZERO quality loss (all frames, full colors, full resolution).
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

    /* ---- Phase 1: frame-rate only ---------------------------------- */
    // Dropping frames (with delay merging) preserves every pixel and every
    // color — playback just gets slightly less smooth. Far less visible
    // than color or resolution loss, so we spend this budget first.
    const intervals = [1.6, 2, 2.5, 3, 4, 5, 6];
    for (let i = 0; i < intervals.length; i++) {
        const out = await runPass(
            { colors: 256, interval: intervals[i], scale: 1, lossy: 0 },
            16 + i * 3
        );
        if (out.bytes <= targetBytes) break;
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

    /* ---- Phase 2: colors (at the best interval so far) ------------- */
    // Color reduction down to ~96 colors is essentially invisible on
    // real-world content.
    const intervalBase = Math.min(...intervals); // start from the gentlest thinning
    const colorLadder = [192, 160, 128, 96, 64];
    for (let i = 0; i < colorLadder.length; i++) {
        const out = await runPass(
            { colors: colorLadder[i], interval: intervalBase, scale: 1, lossy: 0 },
            40 + i * 3
        );
        if (out.bytes <= targetBytes) break;
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

    /* ---- Phase 3: adaptive resolution ------------------------------ */
    // Estimate the scale that hits the target from real measurements
    // (GIF bytes scale ~linearly with pixels → scale ∝ √ratio), then refine.
    for (let k = 0; k < 5; k++) {
        const last = lastOutcome();
        const ratio = Math.max(0.004, targetBytes / last.bytes);
        const margin = last.bytes > targetBytes ? 0.9 : 1.08; // undershoot when too big
        const scale = clampScale(last.cfg.scale * Math.sqrt(ratio) * margin);
        const cfg: PassConfig = {
            colors: Math.max(64, Math.min(128, last.cfg.colors)),
            interval: intervalBase,
            scale,
            lossy: 0,
        };
        const out = await runPass(cfg, 58 + k * 3);
        if (out.bytes <= targetBytes) break;
    }

    /* ---- Phase 3b: budget utilization ------------------------------ */
    // If we are well under the target we "wasted" quality — claw it back by
    // increasing resolution / colors while still fitting the target.
    const clawBack = async (): Promise<void> => {
        for (let k = 0; k < 4; k++) {
            const fit = bestFit();
            if (!fit || fit.bytes > targetBytes * 0.8) return;
            const cfg: PassConfig = {
                colors: Math.min(256, Math.max(fit.cfg.colors, 160)),
                interval: fit.cfg.interval,
                scale: clampScale(fit.cfg.scale * 1.2),
                lossy: 0,
            };
            if (cfg.scale <= fit.cfg.scale * 1.01 && cfg.colors === fit.cfg.colors) return;
            const out = await runPass(cfg, 76 + k * 2);
            if (out.bytes > targetBytes) return; // too greedy — keep what we have
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

    /* ---- Phase 4: last resort -------------------------------------- */
    // Extreme targets only: aggressive thinning + lossy rounding + scale.
    const floorSteps: PassConfig[] = [
        { colors: 48, interval: 6, scale: clampScale((smallest()?.cfg.scale ?? 1) * 0.7), lossy: 30 },
        { colors: 32, interval: 8, scale: FLOOR_SCALE, lossy: 60 },
    ];
    for (let i = 0; i < floorSteps.length; i++) {
        const out = await runPass(floorSteps[i], 88 + i * 3);
        if (out.bytes <= targetBytes) break;
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
    const isLossless =
        lossless || (cfg.scale >= 0.995 && cfg.interval <= 1 && cfg.colors >= 256 && cfg.lossy === 0);
    return {
        file: makeResultFile(file, outcome.data),
        bytes: outcome.bytes,
        sourceBytes: file.size,
        width: Math.max(1, Math.round(decoded.width * cfg.scale)),
        height: Math.max(1, Math.round(decoded.height * cfg.scale)),
        framesKept: Math.max(1, Math.round(decoded.frames.length / cfg.interval)),
        framesTotal: decoded.frameCountTotal,
        passes,
        targetMet: outcome.bytes <= targetBytes,
        lossless: isLossless,
    };
}