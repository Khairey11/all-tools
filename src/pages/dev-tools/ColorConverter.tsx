import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pipette, Copy, Check, Repeat } from 'lucide-react';

export const ColorConverter: React.FC = () => {
    const navigate = useNavigate();
    const [hex, setHex] = useState('#6366f1');
    const [rgb, setRgb] = useState('110, 114, 255');
    const [copied, setCopied] = useState<'hex' | 'rgb' | null>(null);

    const hexToRgb = (hexStr: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexStr);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const componentToHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    const handleHexChange = (val: string) => {
        setHex(val);
        if (/^#?[0-9A-Fa-f]{6}$/.test(val)) {
            const rgbVal = hexToRgb(val);
            if (rgbVal) setRgb(`${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b}`);
        }
    };

    const handleRgbChange = (val: string) => {
        setRgb(val);
        const parts = val.split(',').map(p => parseInt(p.trim()));
        if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
            setHex(rgbToHex(parts[0], parts[1], parts[2]));
        }
    };

    const handleCopy = (type: 'hex' | 'rgb', val: string) => {
        navigator.clipboard.writeText(val);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/dev-tools')}
                    className="p-3 bg-secondary/50 hover:bg-secondary border border-secondary rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-text" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Color Converter</h1>
                    <p className="text-sm text-text-muted">Convert between HEX and RGB color formats</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto w-full">
                <div className="bg-white/80 border border-secondary p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">HEX Code</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-secondary/30 border border-secondary/50 rounded-2xl p-6 text-xl font-mono focus:border-primary/50 focus:outline-none transition-all pr-16 text-text"
                                            value={hex}
                                            onChange={(e) => handleHexChange(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleCopy('hex', hex)}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${copied === 'hex' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-secondary hover:bg-secondary/80 text-text'}`}
                                        >
                                            {copied === 'hex' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="p-3 bg-secondary/30 rounded-full border border-secondary/20">
                                        <Repeat className="w-5 h-5 text-text-muted rotate-90" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">RGB Value</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-secondary/30 border border-secondary/50 rounded-2xl p-6 text-xl font-mono focus:border-primary/50 focus:outline-none transition-all pr-16 text-text"
                                            value={rgb}
                                            onChange={(e) => handleRgbChange(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleCopy('rgb', `rgb(${rgb})`)}
                                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${copied === 'rgb' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-secondary hover:bg-secondary/80 text-text'}`}
                                        >
                                            {copied === 'rgb' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center space-y-8">
                            <label className="relative cursor-pointer group">
                                <input
                                    type="color"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    value={hex}
                                    onChange={(e) => handleHexChange(e.target.value)}
                                />
                                <div
                                    className="w-64 h-64 rounded-[3rem] shadow-2xl border-4 border-white relative overflow-hidden transition-transform duration-500 group-hover:scale-105 group-active:scale-95"
                                    style={{ backgroundColor: hex }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-full border border-secondary shadow-2xl">
                                            <Pipette className="w-8 h-8 text-text" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-secondary text-center shadow-lg">
                                            <div className="text-[10px] uppercase font-black tracking-widest text-text-muted mb-1">Click to select</div>
                                            <div className="text-sm font-black text-text">{hex.toUpperCase()}</div>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <div className="grid grid-cols-3 gap-4 w-full px-8">
                                <div className="bg-secondary/30 p-4 rounded-2xl border border-secondary/50 text-center">
                                    <div className="text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">R</div>
                                    <div className="text-xl font-black text-text">{rgb.split(',')[0]}</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-2xl border border-secondary/50 text-center">
                                    <div className="text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">G</div>
                                    <div className="text-xl font-black text-text">{rgb.split(',')[1]}</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-2xl border border-secondary/50 text-center">
                                    <div className="text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">B</div>
                                    <div className="text-xl font-black text-text">{rgb.split(',')[2]}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
