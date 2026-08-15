import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Type, Copy, Trash2 } from 'lucide-react';

export const WordCounter: React.FC = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');

    const stats = useMemo(() => {
        const trimmed = text.trim();
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;
        const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g) ?? []).length || (words ? 1 : 0) : 0;
        const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
        const lines = text ? text.split('\n').length : 0;
        const readingMin = words / 200;
        const speakingMin = words / 130;
        return {
            words,
            chars,
            charsNoSpace,
            sentences,
            paragraphs,
            lines,
            readingTime: readingMin < 1 ? `${Math.max(1, Math.round(readingMin * 60))} sec` : `${Math.round(readingMin)} min`,
            speakingTime: speakingMin < 1 ? `${Math.max(1, Math.round(speakingMin * 60))} sec` : `${Math.round(speakingMin)} min`,
        };
    }, [text]);

    const cards = [
        { label: 'Words', value: stats.words.toLocaleString() },
        { label: 'Characters', value: stats.chars.toLocaleString() },
        { label: 'No Spaces', value: stats.charsNoSpace.toLocaleString() },
        { label: 'Sentences', value: stats.sentences.toLocaleString() },
        { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
        { label: 'Lines', value: stats.lines.toLocaleString() },
    ];

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/text-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-fuchsia-500">Word Counter</h1>
                    <p className="text-sm text-text-muted">Live word, character & reading time statistics</p>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cards.map((c) => (
                    <div key={c.label} className="bg-surface/50 border border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-fuchsia-400 font-mono">{c.value}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">{c.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-4 space-y-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here - stats update as you type..."
                    className="w-full h-72 bg-black/20 border border-white/5 rounded-2xl p-5 text-sm leading-relaxed focus:border-fuchsia-500/50 focus:outline-none resize-none"
                />
                <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex gap-2 text-xs text-text-muted">
                        <span className="bg-white/5 px-3 py-1.5 rounded-full">Reading: {stats.readingTime}</span>
                        <span className="bg-white/5 px-3 py-1.5 rounded-full">Speaking: {stats.speakingTime}</span>
                        <span className={`px-3 py-1.5 rounded-full ${stats.words > 280 ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5'}`}>Tweet limit: {stats.words}/280w</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(text); }} disabled={!text}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-40">
                            <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <button onClick={() => setText('')} disabled={!text}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-40">
                            <Trash2 className="w-3.5 h-3.5" /> Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-fuchsia-500/5 border border-fuchsia-500/10 p-5 rounded-2xl flex items-start gap-3">
                <Type className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    <span className="font-bold text-fuchsia-400">Limits reference:</span> Tweet 280 chars - Instagram caption 2,200 chars - Meta description 160 chars - College essay 250-650 words. Reading time uses 200 wpm; speaking uses 130 wpm.
                </p>
            </div>
        </div>
    );
};