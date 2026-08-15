import React, { useState } from 'react';
import { Crop } from 'lucide-react';
import { socialMediaPresets, PresetKey } from '../utils/presets';

interface ResizeControlsProps {
    onResize: (width: number, height: number, maintainAspectRatio: boolean) => void;
    disabled?: boolean;
}

export const ResizeControls: React.FC<ResizeControlsProps> = ({ onResize, disabled }) => {
    const [customWidth, setCustomWidth] = useState<number>(1920);
    const [customHeight, setCustomHeight] = useState<number>(1080);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null);

    const handlePresetClick = (presetKey: PresetKey) => {
        const preset = socialMediaPresets[presetKey];
        setSelectedPreset(presetKey);
        setCustomWidth(preset.width);
        setCustomHeight(preset.height);
        onResize(preset.width, preset.height, maintainAspectRatio);
    };

    const handleCustomResize = () => {
        setSelectedPreset(null);
        onResize(customWidth, customHeight, maintainAspectRatio);
    };

    // Group presets by category
    const categories = Array.from(new Set(Object.values(socialMediaPresets).map(p => p.category)));

    return (
        <div className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                <Crop className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-text">Resize Options</h3>
            </div>

            {/* Social Media Presets */}
            <div className="space-y-3">
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Social Media Presets</p>

                {categories.map(category => (
                    <div key={category} className="space-y-2">
                        <p className="text-xs text-primary/80 font-medium">{category}</p>
                        <div className="grid grid-cols-1 gap-1.5">
                            {Object.entries(socialMediaPresets)
                                .filter(([_, preset]) => preset.category === category)
                                .map(([key, preset]) => (
                                    <button
                                        key={key}
                                        onClick={() => handlePresetClick(key as PresetKey)}
                                        disabled={disabled}
                                        className={`
                      text-left px-3 py-2 rounded-lg text-sm transition-all
                      ${selectedPreset === key
                                                ? 'bg-primary/20 text-primary border border-primary/30'
                                                : 'bg-secondary/30 text-text-muted hover:bg-secondary/50 hover:text-text border border-white/5'
                                            }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{preset.name}</span>
                                            <span className="text-xs opacity-60">{preset.width}×{preset.height}</span>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Dimensions */}
            <div className="space-y-3 pt-3 border-t border-white/5">
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Custom Size</p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-text-muted">Width (px)</label>
                        <input
                            type="number"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-secondary rounded-lg text-text text-sm border border-white/5 focus:border-primary/50 focus:outline-none"
                            disabled={disabled}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-text-muted">Height (px)</label>
                        <input
                            type="number"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-secondary rounded-lg text-text text-sm border border-white/5 focus:border-primary/50 focus:outline-none"
                            disabled={disabled}
                        />
                    </div>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={maintainAspectRatio}
                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                        className="w-4 h-4 rounded accent-primary"
                        disabled={disabled}
                    />
                    <span className="text-sm text-text-muted">Maintain aspect ratio</span>
                </label>

                <button
                    onClick={handleCustomResize}
                    disabled={disabled || !customWidth || !customHeight}
                    className="w-full py-2 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-primary/30"
                >
                    Apply Custom Size
                </button>
            </div>
        </div>
    );
};
