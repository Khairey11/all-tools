import React from 'react';
import { Film, Sparkles } from 'lucide-react';
import { GifCompressionOptions } from '../utils/gifCompression';

interface GifControlsProps {
    options: GifCompressionOptions;
    onChange: (options: GifCompressionOptions) => void;
    disabled?: boolean;
    convertToWebP?: boolean;
    onConvertToWebPChange?: (value: boolean) => void;
}

export const GifControls: React.FC<GifControlsProps> = ({
    options,
    onChange,
    disabled,
    convertToWebP = false,
    onConvertToWebPChange
}) => {
    const handleChange = (key: keyof GifCompressionOptions, value: number) => {
        onChange({ ...options, [key]: value });
    };

    return (
        <div className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                <Film className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text">GIF Optimization</h3>
            </div>

            {/* Convert to WebP Option */}
            {onConvertToWebPChange && (
                <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl">
                    <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={convertToWebP}
                            onChange={(e) => onConvertToWebPChange(e.target.checked)}
                            className="w-5 h-5 rounded accent-primary mt-0.5"
                            disabled={disabled}
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-text">Convert to WebP</span>
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-xs text-text-muted mt-1">
                                WebP format provides better compression than GIF (up to 80% smaller) while maintaining quality
                            </p>
                        </div>
                    </label>
                </div>
            )}

            <div className="space-y-4">
                {/* Lossy Compression */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Compression Level</span>
                        <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded">{options.lossy || 80}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="200"
                        step="1"
                        value={options.lossy || 80}
                        onChange={(e) => handleChange('lossy', parseInt(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover"
                        disabled={disabled}
                    />
                    <div className="flex justify-between text-xs text-text-muted/40">
                        <span>Low (Better Quality)</span>
                        <span>High (Smaller Size)</span>
                    </div>
                </div>

                {/* Color Reduction */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Max Colors</span>
                        <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded">{options.colors || 128}</span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="256"
                        step="8"
                        value={options.colors || 128}
                        onChange={(e) => handleChange('colors', parseInt(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover"
                        disabled={disabled}
                    />
                    <div className="flex justify-between text-xs text-text-muted/40">
                        <span>8 colors</span>
                        <span>256 colors</span>
                    </div>
                </div>

                {/* Frame Rate */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Frame Rate</span>
                        <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded">
                            {options.fps && options.fps > 0 ? `${options.fps} fps` : 'Original'}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="30"
                        step="5"
                        value={options.fps && options.fps > 0 ? options.fps : 0}
                        onChange={(e) => handleChange('fps', parseInt(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover"
                        disabled={disabled}
                    />
                    <div className="flex justify-between text-xs text-text-muted/40">
                        <span>Original</span>
                        <span>30 fps</span>
                    </div>
                </div>
            </div>

            <div className="pt-3 border-t border-white/5">
                    <p className="text-xs text-text-muted">
                        💡 Tip: Animation and transparency are preserved. Fewer colors and lower FPS = smaller file size.
                    </p>
            </div>
        </div>
    );
};
