import React from 'react';
import { compressionPresets, PresetKey, CompressionOptions } from '../utils/compression';
import { Settings2, Zap } from 'lucide-react';

interface CompressionControlsProps {
    options: CompressionOptions;
    onChange: (options: CompressionOptions) => void;
    disabled?: boolean;
    selectedFormat: 'image/jpeg' | 'image/png' | 'image/webp';
    onFormatChange: (format: 'image/jpeg' | 'image/png' | 'image/webp') => void;
}

export const CompressionControls: React.FC<CompressionControlsProps> = ({
    options,
    onChange,
    disabled,
    selectedFormat,
    onFormatChange
}) => {
    const handleChange = (key: keyof CompressionOptions, value: number) => {
        onChange({ ...options, [key]: value });
    };

    const applyPreset = (presetKey: PresetKey) => {
        const preset = compressionPresets[presetKey];
        onChange({
            ...options,
            maxSizeMB: preset.maxSizeMB,
            maxWidthOrHeight: preset.maxWidthOrHeight,
            initialQuality: preset.initialQuality,
        });
    };

    return (
        <div className="w-full space-y-4">
            {/* Presets */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl shadow-black/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-text">Quick Presets</h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(compressionPresets).map(([key, preset]) => (
                        <button
                            key={key}
                            onClick={() => applyPreset(key as PresetKey)}
                            disabled={disabled}
                            className="text-left p-4 rounded-xl bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-text text-sm group-hover:text-primary transition-colors">
                                        {preset.label}
                                    </p>
                                    <p className="text-xs text-text-muted mt-0.5">{preset.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Format Selection */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl shadow-black/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Settings2 className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-text">Output Format</h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'image/jpeg', label: 'JPG' },
                        { value: 'image/png', label: 'PNG' },
                        { value: 'image/webp', label: 'WebP' },
                    ].map((format) => (
                        <button
                            key={format.value}
                            onClick={() => onFormatChange(format.value as any)}
                            disabled={disabled}
                            className={`
                                py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                                ${selectedFormat === format.value
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-slate-50 text-text-muted hover:bg-slate-100 hover:text-text border border-slate-100'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {format.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Manual Settings */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl shadow-black/5 rounded-3xl p-6 space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Settings2 className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-text">Manual Settings</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-text-muted">Max Size (MB)</span>
                            <span className="text-primary bg-primary/5 px-2 py-1 rounded-lg">{options.maxSizeMB} MB</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={options.maxSizeMB}
                            onChange={(e) => handleChange('maxSizeMB', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover"
                            disabled={disabled}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-text-muted">Max Width/Height</span>
                            <span className="text-primary bg-primary/5 px-2 py-1 rounded-lg">{options.maxWidthOrHeight}px</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="4096"
                            step="100"
                            value={options.maxWidthOrHeight}
                            onChange={(e) => handleChange('maxWidthOrHeight', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover"
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
