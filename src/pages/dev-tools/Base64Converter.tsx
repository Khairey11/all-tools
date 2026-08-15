import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, Copy, Trash2, Check, Zap } from 'lucide-react';

export const Base64Converter: React.FC = () => {
    const navigate = useNavigate();
    const [normalText, setNormalText] = useState('');
    const [base64Text, setBase64Text] = useState('');
    const [copied, setCopied] = useState<'normal' | 'base64' | null>(null);

    const handleCopy = (type: 'normal' | 'base64', val: string) => {
        if (!val) return;
        navigator.clipboard.writeText(val);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const encode = () => {
        try {
            setBase64Text(btoa(normalText));
        } catch (e) {
            setBase64Text('Invalid input for encoding');
        }
    };

    const decode = () => {
        try {
            setNormalText(atob(base64Text));
        } catch (e) {
            setNormalText('Invalid Base64 string');
        }
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
                    <h1 className="text-3xl font-black tracking-tight text-primary">Base64 Converter</h1>
                    <p className="text-sm text-text-muted">Encode and decode text in Base64 format</p>
                </div>
            </header>

            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Normal Text Area */}
                <div className="bg-white/80 border border-secondary p-8 rounded-[3.5rem] shadow-2xl backdrop-blur-xl relative flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Plain Text</div>
                        <div className="flex space-x-2">
                            <button onClick={() => setNormalText('')} className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={() => handleCopy('normal', normalText)} className={`p-2 rounded-lg transition-all ${copied === 'normal' ? 'bg-emerald-500/20 text-emerald-600' : 'hover:bg-secondary text-text-muted'}`}>
                                {copied === 'normal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="flex-grow bg-secondary/30 border border-secondary/50 rounded-2xl p-6 text-lg font-medium focus:border-primary/50 focus:outline-none resize-none transition-all placeholder:text-text-muted/20 text-text custom-scrollbar"
                        placeholder="Type normal text here..."
                        value={normalText}
                        onChange={(e) => setNormalText(e.target.value)}
                    />
                    <button
                        onClick={encode}
                        className="w-full mt-6 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 tracking-widest flex items-center justify-center space-x-3"
                    >
                        <span>ENCODE TO BASE64</span>
                        <Zap className="w-4 h-4" />
                    </button>
                </div>

                {/* Base64 Area */}
                <div className="bg-white/80 border border-secondary p-8 rounded-[3.5rem] shadow-2xl backdrop-blur-xl relative flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Base64 Output</div>
                        <div className="flex space-x-2">
                            <button onClick={() => setBase64Text('')} className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={() => handleCopy('base64', base64Text)} className={`p-2 rounded-lg transition-all ${copied === 'base64' ? 'bg-emerald-500/20 text-emerald-600' : 'hover:bg-secondary text-text-muted'}`}>
                                {copied === 'base64' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="flex-grow bg-secondary/30 border border-secondary/50 rounded-2xl p-6 text-lg font-medium focus:border-primary/50 focus:outline-none resize-none transition-all placeholder:text-text-muted/20 text-text custom-scrollbar font-mono"
                        placeholder="Paste Base64 here..."
                        value={base64Text}
                        onChange={(e) => setBase64Text(e.target.value)}
                    />
                    <button
                        onClick={decode}
                        className="w-full mt-6 py-4 bg-secondary/30 border border-secondary/50 text-text font-black rounded-2xl hover:bg-secondary transition-all tracking-widest flex items-center justify-center space-x-3"
                    >
                        <span>DECODE TO PLAIN</span>
                        <ArrowRightLeft className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
