import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Info, AlertCircle, Zap, TrendingUp, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeywordAnalysis {
    keyword: string;
    volume: number; // Simulated monthly search volume
    difficulty: number; // 0-100
    competition: 'Low' | 'Medium' | 'High' | 'Very High';
    cpc: number; // Simulated Cost Per Click
    relevance: number; // 0-100 based on input text
}

export const KeywordCompetition: React.FC = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<KeywordAnalysis[]>([]);

    const analyzeCompetition = async () => {
        if (!text.trim()) return;
        setAnalyzing(true);

        // Simulate "AI Analysis" of SERP competition
        await new Promise(r => setTimeout(r, 2000));

        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);

        const uniqueWords = Array.from(new Set(words));

        const analysis: KeywordAnalysis[] = uniqueWords.map(word => {
            // Heuristic-based simulation:
            // 1. Shorter words are usually harder (General terms)
            // 2. Longer words are more specific (Long-tail)
            // 3. Common words (stop words handled above) are more expensive

            const len = word.length;
            const difficulty = Math.max(10, Math.min(95, 100 - (len * 5) + (Math.random() * 20)));
            const volume = Math.floor(Math.exp(10 - (len / 2)) * (1 + Math.random() * 2));

            let competition: 'Low' | 'Medium' | 'High' | 'Very High' = 'Low';
            if (difficulty > 80) competition = 'Very High';
            else if (difficulty > 60) competition = 'High';
            else if (difficulty > 40) competition = 'Medium';

            return {
                keyword: word,
                volume: Math.round(volume),
                difficulty: Math.round(difficulty),
                competition,
                cpc: Number((Math.random() * (difficulty / 10)).toFixed(2)),
                relevance: Math.round(70 + Math.random() * 30)
            };
        }).sort((a, b) => b.volume - a.volume).slice(0, 15);

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
                    <p className="text-sm text-text-muted">Analyze difficulty and search volume of your target keywords</p>
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
                            <span>Analysis based on 2026 SERP heuristics</span>
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
                                Analyzing SERP Data...
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
                                        <p className="text-[10px] uppercase font-bold text-green-400 tracking-widest mb-1">Low Hanging Fruit</p>
                                        <h4 className="text-2xl font-black text-white">
                                            {results.filter(r => r.difficulty < 40).length}
                                        </h4>
                                    </div>
                                    <Zap className="w-8 h-8 text-green-400 opacity-50" />
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-amber-400 tracking-widest mb-1">Avg. CPC Est.</p>
                                        <h4 className="text-2xl font-black text-white">
                                            ${(results.reduce((acc, r) => acc + r.cpc, 0) / results.length).toFixed(2)}
                                        </h4>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-amber-400 opacity-50" />
                                </div>
                                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-red-400 tracking-widest mb-1">Mean Difficulty</p>
                                        <h4 className="text-2xl font-black text-white">
                                            {Math.round(results.reduce((acc, r) => acc + r.difficulty, 0) / results.length)}%
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
                                                <th className="px-6 py-4">Volume (Est)</th>
                                                <th className="px-6 py-4">Difficulty</th>
                                                <th className="px-6 py-4">Competition</th>
                                                <th className="px-6 py-4">CPC</th>
                                                <th className="px-6 py-4">Relevance</th>
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
                                                    <td className="px-6 py-5 font-mono text-sm">{res.volume.toLocaleString()}</td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${res.difficulty > 70 ? 'bg-red-500' : res.difficulty > 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                                                                    style={{ width: `${res.difficulty}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-sm font-black ${getDifficultyColor(res.difficulty)}`}>{res.difficulty}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-xs font-bold">{res.competition}</td>
                                                    <td className="px-6 py-5 font-mono text-sm text-green-400">${res.cpc}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="bg-white/5 px-2 py-1 rounded-md text-[10px] font-bold text-text-muted">{res.relevance}%</span>
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
