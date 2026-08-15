declare module 'gifenc' {
    export interface GIFEncoderOptions {
        initialCapacity?: number;
        auto?: boolean;
    }

    export interface WriteFrameOptions {
        transparent?: boolean;
        transparentIndex?: number;
        /** delay in milliseconds */
        delay?: number;
        palette?: number[][] | null;
        /** -1 = play once, 0 = forever, >0 = loop count */
        repeat?: number;
        colorDepth?: number;
        dispose?: number;
        first?: boolean;
    }

    export interface GIFEncoderInstance {
        reset(): void;
        finish(): void;
        bytes(): Uint8Array;
        bytesView(): Uint8Array;
        readonly buffer: ArrayBuffer;
        writeFrame(
            index: Uint8Array | Uint8ClampedArray,
            width: number,
            height: number,
            opts?: WriteFrameOptions
        ): void;
    }

    export function GIFEncoder(opt?: GIFEncoderOptions): GIFEncoderInstance;

    export function quantize(
        rgba: Uint8Array | Uint8ClampedArray,
        maxColors: number,
        options?: {
            format?: 'rgb565' | 'rgb444' | 'rgba4444';
            oneBitAlpha?: boolean | number;
            clearAlpha?: boolean;
            clearAlphaColor?: number;
            clearAlphaThreshold?: number;
            clearAlphaTolerance?: number;
        }
    ): number[][];

    export function applyPalette(
        rgba: Uint8Array | Uint8ClampedArray,
        palette: number[][],
        format?: 'rgb565' | 'rgb444' | 'rgba4444'
    ): Uint8Array;

    export function nearestColorIndex(palette: number[][], pixel: number[]): number;
    export function prequantize(rgba: Uint8Array | Uint8ClampedArray, options?: object): void;
    export function snapColorsToPalette(palette: number[][], snapWeight?: number): void;
}