import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Download, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePalette } from 'color-thief-react';
import chroma from 'chroma-js';
import { DropZone } from '../../components/DropZone';
import { AdBanner } from '../../components/AdBanner'; // Import AdBanner

export const ColorPaletteExtractor: React.FC = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState<string | null>(null);
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    // Color Thief hook
    const { data, loading, error } = usePalette(image || '', 10, 'hex', { crossOrigin: 'anonymous', quality: 10 });

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    const downloadPalette = () => {
        if (!data) return;

        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#f5f3ef';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText('Color Palette', 50, 80);

        // Colors
        const itemWidth = (canvas.width - 100) / 5;
        const itemHeight = 150;

        data.forEach((color, i) => {
            const x = 50 + (i % 5) * itemWidth;
            const y = 150 + Math.floor(i / 5) * (itemHeight + 50);

            // Color Swatch
            ctx.fillStyle = color;
            ctx.fillRect(x, y, itemWidth - 20, itemHeight);

            // Hex Code
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 20px monospace';
            ctx.fillText(color, x, y + itemHeight + 30);
        });

        const link = document.createElement('a');
        link.download = 'optipik-palette.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/image-tools')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Palette Extractor</h1>
                    <p className="text-sm text-text-muted">Extract dominant color schemes from any image instantly</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Visualizer / Editor */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="glass-card p-4 rounded-[2.5rem] relative overflow-hidden min-h-[500px] flex flex-col justify-center">
                        {!image ? (
                            <div className="p-12">
                                <DropZone
                                    onFilesSelected={handleFileSelect}
                                    multiple={false}
                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                />
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex flex-col">
                                <div className="relative w-full h-[400px] rounded-[2rem] overflow-hidden mb-6 bg-slate-100 border border-white/20 shadow-inner group">
                                    <img src={image} alt="Source" className="w-full h-full object-contain" />
                                    <button
                                        onClick={() => setImage(null)}
                                        className="absolute top-4 right-4 p-3 bg-white/90 text-red-500 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : data ? (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-2">
                                        {data.map((color, index) => (
                                            <motion.button
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                onClick={() => copyToClipboard(color)}
                                                className="group relative aspect-square rounded-2xl flex flex-col items-center justify-end p-4 shadow-lg hover:scale-105 transition-all cursor-copy border border-white/10"
                                                style={{ backgroundColor: color }}
                                            >
                                                <div className={`
                                                    w-full py-2 px-3 rounded-xl backdrop-blur-md border border-white/20
                                                    flex items-center justify-between
                                                    text-xs font-black tracking-wider shadow-sm
                                                    ${chroma(color).luminance() > 0.5 ? 'bg-black/20 text-black' : 'bg-white/20 text-white'}
                                                 `}>
                                                    <span>{color}</span>
                                                    {copiedColor === color ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-50" />}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : error && (
                                    <div className="text-center text-red-400 font-bold">Failed to extract colors. Try another image.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Ad */}
                    <AdBanner slot="palette-extractor-footer" />
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-xl">
                        <div className="flex items-center space-x-3 text-primary mb-6">
                            <Download className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Export Palette</span>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={downloadPalette}
                                disabled={!data}
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                <ImageIcon className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                <span>Save as Image</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (data) {
                                        const cssVars = data.map((c, i) => `--color-${i + 1}: ${c};`).join('\n');
                                        navigator.clipboard.writeText(`:root {\n${cssVars}\n}`);
                                        alert('CSS Variables copied!');
                                    }
                                }}
                                disabled={!data}
                                className="w-full py-4 bg-white border border-secondary text-text font-black rounded-2xl hover:bg-secondary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Copy as CSS
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                                <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-2">Pro Tip</h4>
                                <p className="text-[11px] text-text-muted leading-relaxed">
                                    Click any color swatch to instantly copy its HEX code to your clipboard.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
