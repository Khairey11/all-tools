import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Type, Copy, Trash2, Check, Hash } from 'lucide-react';


export const TextCaseConverter: React.FC = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toTitleCase = (str: string) => {
        return str.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    };

    const toSentenceCase = (str: string) => {
        return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    };

    const toAlternatingCase = (str: string) => {
        return str.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    };

    const convert = (type: string) => {
        switch (type) {
            case 'upper': setText(text.toUpperCase()); break;
            case 'lower': setText(text.toLowerCase()); break;
            case 'title': setText(toTitleCase(text)); break;
            case 'sentence': setText(toSentenceCase(text)); break;
            case 'camel':
                setText(text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
                    index === 0 ? word.toLowerCase() : word.toUpperCase()
                ).replace(/\s+/g, ''));
                break;
            case 'snake': setText(text.toLowerCase().replace(/\s+/g, '_')); break;
            case 'kebab': setText(text.toLowerCase().replace(/\s+/g, '-')); break;
            case 'alternating': setText(toAlternatingCase(text)); break;
        }
    };

    const stats = {
        chars: text.length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text.trim() ? text.split('\n').length : 0
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/text-tools')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Text Case Converter</h1>
                    <p className="text-sm text-text-muted">Transform your text into any format instantly</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Editor Area */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-surface/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl relative group">
                        <div className="absolute top-6 right-6 flex items-center space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setText('')}
                                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                                title="Clear Text"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCopy}
                                className={`p-3 rounded-xl transition-all flex items-center space-x-2 ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>

                        <textarea
                            className="w-full h-[450px] bg-transparent p-10 text-lg font-medium focus:outline-none resize-none placeholder:text-white/10 custom-scrollbar"
                            placeholder="Paste or type your text here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <div className="bg-white/5 border-t border-white/5 px-10 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Hash className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{stats.chars} Characters</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Type className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{stats.words} Words</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{stats.lines} Lines</span>
                        </div>
                    </div>
                </div>

                {/* Controls Area */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-xl">
                        <div className="flex items-center space-x-3 text-primary mb-8">
                            <Type className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Transformations</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => convert('upper')}
                                className="w-full p-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm font-black uppercase tracking-widest">UPPERCASE</span>
                                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50" />
                            </button>
                            <button
                                onClick={() => convert('lower')}
                                className="w-full p-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm font-black lowercase tracking-widest">lowercase</span>
                                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50" />
                            </button>
                            <button
                                onClick={() => convert('title')}
                                className="w-full p-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm font-black tracking-widest">Title Case</span>
                                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50" />
                            </button>
                            <button
                                onClick={() => convert('sentence')}
                                className="w-full p-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm font-black tracking-widest">Sentence case</span>
                                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50" />
                            </button>
                            <button
                                onClick={() => convert('camel')}
                                className="w-full p-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm font-black tracking-widest">camelCase</span>
                                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50" />
                            </button>
                            <button
                                onClick={() => convert('snake')}
                                className="w-full p-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm font-black tracking-widest">snake_case</span>
                                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50" />
                            </button>
                            <button
                                onClick={() => convert('kebab')}
                                className="w-full p-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm font-black tracking-widest">kebab-case</span>
                                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50" />
                            </button>
                            <button
                                onClick={() => convert('alternating')}
                                className="w-full p-4 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-2xl text-left transition-all group flex items-center justify-between"
                            >
                                <span className="text-sm font-black tracking-widest">aLtErNaTiNg CaSe</span>
                                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/50" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] flex items-start space-x-4">
                        <div className="p-2 bg-primary rounded-xl text-white">
                            <Type className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                            Need a specific format for coding or design? Quick-convert any body of text into dev-friendly cases like camel, snake, or kebab.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
