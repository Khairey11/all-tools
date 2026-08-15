import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Info, AlertCircle, Zap, TrendingUp, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeywordAnalysis {
    keyword: string;
    frequency: number;
    density: number;
    specificity: number;
    competition: 'Low' | 'Medium' | 'High' | 'Very High';
    opportunity: number;
}

const STOP_WORDS = new Set([
    'this', 'that', 'with', 'from', 'have', 'been', 'were', 'will', 'your', 'they',
    'them', 'their', 'there', 'here', 'what', 'when', 'which', 'while', 'about',
    'into', 'than', 'then', 'because', 'also', 'very', 'just', 'more', 'some',
    'such', 'only', 'over', 'under', 'after', 'before', 'between', 'both', 'each',
    'other', 'most', 'many', 'much', 'should', 'could', 'would', 'these', 'those',
]);

export const KeywordCompetition: React.FC = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<KeywordAnalysis[]>([]);

    const analyzeCompetition = () => {
        if (!text.trim()) return;
        setAnalyzing(true);

        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !STOP_WORDS.has(word));

        const counts = new Map<string, number>();
        words.forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));
        const total = Math.max(1, words.length);

        const analysis: KeywordAnalysis[] = Array.from(counts.entries()).map(([word, count]) => {
            const density = (count / total) * 100;
            const specificity = Math.round(Math.min(100, Math.max(10, word.length * 7)));
            const difficulty = Math.round(Math.max(10, Math.min(95, 100 - specificity * 0.8)));

            let competition: 'Low' | 'Medium' | 'High' | 'Very High' = 'Low';
            if (difficulty > 80) competition = 'Very High';
            else if (difficulty > 60) competition = 'High';
            else if (difficulty > 40) competition = 'Medium';

            const opportunity = Math.round(
                Math.min(100, Math.max(5, specificity * 0.6 + Math.min(40, density * 4)))
            );

            return {
                keyword: word,
                frequency: count,
                density: Number(density.toFixed(1)),
                specificity,
                competition,
                opportunity,
            };
        }).sort((a, b) => b.frequency - a.frequency).slice(0, 15);

        setResults(analysis);
        setAnalyzing(false);
    };

    const getDifficultyColor = (score: number) => {
        if (score < 30) return 'text-green-400';
        if (score < 60) return 'text-yellow-400';
        if (score < 80) return 'text-orange-400';
        return 'text-red-400';
    };

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
                    <h1 className="text-3xl font-black tracking-tight text-amber-500">Keyword Competition</h1>
                    <p className="text-sm text-text-muted">Analyze keywords in your content by frequency, density and specificity</p>
                </div>
            </header>

            <main className="space-y-8">
                <section className="bg-surface/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                            <Target className="w-4 h-4" /> Seed Content / Target Keywords
                        </label>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Info className="w-3 h-3" />
                            <span>Analyzed instantly from your text - 100% local</span>
                        </div>
                    </div>

                    <textarea
                        className="w-full h-40 bg-black/20 border border-white/5 rounded-2xl p-6 font-sans text-sm focus:border-amber-500/50 focus:outline-none resize-none transition-all shadow-inner leading-relaxed"
                        placeholder="Paste your content or a list of keywords to analyze... (e.g. 'best gaming laptops 2026', 'organic coffee beans')"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <button
                        onClick={analyzeCompetition}
                        disabled={analyzing || !text.trim()}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {analyzing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                Analyzing Keywords...
                            </>
                        ) : (
                            <>
                                <BarChart3 className="w-5 h-5" />
                                Check Competition
                            </>
                        )}
                    </button>
                </section>

                <AnimatePresence>
                    {results.length > 0 && !analyzing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[2rem] flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-green-400 tracking-widest mb-1">Low Competition</p>
                                        <h4 className="text-2xl font-black text-white">
                                            {results.filter(r => r.competition === 'Low').length}
                                        </h4>
                                    </div>
                                    <Zap className="w-8 h-8 text-green-400 opacity-50" />
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-amber-400 tracking-widest mb-1">Top Keyword</p>
                                        <h4 className="text-2xl font-black text-white lowercase">
                                            {results[0].keyword.length > 12 ? results[0].keyword.slice(0, 12) + '...' : results[0].keyword}
                                        </h4>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-amber-400 opacity-50" />
                                </div>
                                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-red-400 tracking-widest mb-1">Long-tail Words</p>
                                        <h4 className="text-2xl font-black text-white">
                                            {results.filter(r => r.specificity > 60).length}
                                        </h4>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-red-400 opacity-50" />
                                </div>
                            </div>

                            <div className="bg-surface/50 border border-white/5 rounded-[2.5rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-[10px] uppercase font-bold text-text-muted tracking-[0.2em]">
                                                <th className="px-8 py-4">Keyword</th>
                                                <th className="px-6 py-4">Frequency</th>
                                                <th className="px-6 py-4">Density</th>
                                                <th className="px-6 py-4">Specificity</th>
                                                <th className="px-6 py-4">Competition</th>
                                                <th className="px-6 py-4">Opportunity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {results.map((res, idx) => (
                                                <motion.tr
                                                    key={res.keyword}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    <td className="px-8 py-5 font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{res.keyword}</td>
                                                    <td className="px-6 py-5 font-mono text-sm">{res.frequency}x</td>
                                                    <td className="px-6 py-5 font-mono text-sm">{res.density}%</td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${res.specificity > 70 ? 'bg-green-500' : res.specificity > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${res.specificity}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-sm font-black ${getDifficultyColor(100 - res.specificity)}`}>{res.specificity}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-xs font-bold">{res.competition}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="bg-white/5 px-2 py-1 rounded-md text-[10px] font-bold text-text-muted">{res.opportunity}%</span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};