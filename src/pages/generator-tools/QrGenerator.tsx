import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Link2 } from 'lucide-react';
import QRCodeLib from 'qrcode';

export const QrGenerator: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [text, setText] = useState('https://');
    const [size, setSize] = useState(512);
    const [dark, setDark] = useState('#000000');
    const [light, setLight] = useState('#ffffff');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!canvasRef.current || !text) return;
        QRCodeLib.toCanvas(canvasRef.current, text, {
            width: size,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: { dark, light },
        }, (err) => setError(err ? 'Text is too long for a QR code.' : ''));
    }, [text, size, dark, light]);

    const presets = [
        { label: 'Website', value: 'https://' },
        { label: 'WiFi', value: 'WIFI:T:WPA;S:NetworkName;P:password;;' },
        { label: 'Phone', value: 'tel:+977' },
        { label: 'Email', value: 'mailto:' },
        { label: 'SMS', value: 'smsto:+977:' },
        { label: 'vCard', value: 'BEGIN:VCARD\nVERSION:3.0\nFN:Your Name\nTEL:+977\nEND:VCARD' },
    ];

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-3xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/generator-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-cyan-500">QR Code Generator</h1>
                    <p className="text-sm text-text-muted">Create QR codes for links, WiFi, contacts - fully offline</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="bg-surface/50 border border-white/5 rounded-3xl p-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {presets.map((p) => (
                            <button key={p.label} onClick={() => setText(p.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${text === p.value ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-white/5 border-white/10 text-text-muted hover:text-text'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <textarea value={text} onChange={(e) => setText(e.target.value)}
                        placeholder="Enter URL or text..."
                        className="w-full h-36 bg-black/20 border border-white/5 rounded-2xl p-4 font-mono text-sm focus:border-cyan-500/50 focus:outline-none resize-none" />
                    <div className="grid grid-cols-2 gap-3">
                        <label className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Size</span>
                            <select value={size} onChange={(e) => setSize(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-cyan-500/50">
                                <option value={256}>256 px</option>
                                <option value={512}>512 px</option>
                                <option value={1024}>1024 px</option>
                            </select>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">FG</span>
                                <input type="color" value={dark} onChange={(e) => setDark(e.target.value)}
                                    className="w-full h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer" />
                            </label>
                            <label className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">BG</span>
                                <input type="color" value={light} onChange={(e) => setLight(e.target.value)}
                                    className="w-full h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer" />
                            </label>
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                </div>

                <div className="bg-surface/50 border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-4">
                    <div className="bg-white rounded-2xl p-3">
                        <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
                    </div>
                    <button
                        onClick={() => {
                            const canvas = canvasRef.current;
                            if (!canvas) return;
                            const a = document.createElement('a');
                            a.href = canvas.toDataURL('image/png');
                            a.download = 'qr-code.png';
                            a.click();
                        }}
                        disabled={!text || !!error}
                        className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40">
                        <Download className="w-4 h-4" /> Download PNG
                    </button>
                </div>
            </div>

            <div className="bg-cyan-500/5 border border-cyan-500/10 p-5 rounded-2xl flex items-start gap-3">
                <Link2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    <span className="font-bold text-cyan-400">Tip:</span> WiFi preset shares your network credentials - guests scan and connect instantly. vCard preset shares your contact details. Everything is generated offline on your device.
                </p>
            </div>
        </div>
    );
};