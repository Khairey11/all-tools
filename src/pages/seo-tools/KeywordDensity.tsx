import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, FileText, Trash2 } from 'lucide-react';

interface KeywordStat {
    word: string;
    count: number;
    density: number;
}

export const KeywordDensity: React.FC = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');

    const stats = useMemo(() => {
        if (!text.trim()) return [];

        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);

        const totalWords = words.length;
        const frequency: Record<string, number> = {};

        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        const result: KeywordStat[] = Object.entries(frequency)
            .map(([word, count]) => ({
                word,
                count,
                density: (count / totalWords) * 100
            }))
            .sort((a, b) => b.count - a.count);

        return result.slice(0, 20); // Top 20 keywords
    }, [text]);

    const totalWordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-amber-500">Keyword Density</h1>
                    <p className="text-sm text-text-muted">Analyze your content for SEO keyword frequency</p>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Your Content</label>
                        <button
                            onClick={() => setText('')}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-muted transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea
                        className="w-full h-[500px] bg-surface/50 border border-white/5 rounded-3xl p-6 font-sans text-sm focus:border-amber-500/50 focus:outline-none resize-none transition-all shadow-inner"
                        placeholder="Paste your blog post or article text here to analyze..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-text-muted" />
                            <span className="text-sm font-medium">Word Count</span>
                        </div>
                        <span className="text-xl font-black text-amber-500">{totalWordsCount}</span>
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Top Keywords</label>
                    <div className="flex-grow bg-black/40 border border-white/5 rounded-3xl p-6 overflow-auto">
                        {!text.trim() ? (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-30 select-none">
                                <Search className="w-12 h-12 mb-4 opacity-10" />
                                <p>Start typing to see keyword data</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.map((stat, idx) => (
                                    <div
                                        key={stat.word}
                                        className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 hover:border-amber-500/30 transition-all"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xs font-black text-text-muted opacity-30 w-4">{idx + 1}</span>
                                            <span className="font-bold text-lg group-hover:text-amber-500 transition-colors uppercase tracking-tight">{stat.word}</span>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="text-right">
                                                <div className="text-xs text-text-muted uppercase font-bold tracking-widest">Density</div>
                                                <div className="text-sm font-black text-amber-400">{stat.density.toFixed(1)}%</div>
                                            </div>
                                            <div className="text-right min-w-[40px]">
                                                <div className="text-xs text-text-muted uppercase font-bold tracking-widest">Count</div>
                                                <div className="text-sm font-black text-white">{stat.count}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {stats.length === 0 && (
                                    <p className="text-center text-text-muted py-12">No significant keywords found yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
