import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Percent, Calculator, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const PercentageCalculator: React.FC = () => {
    const navigate = useNavigate();

    // Scenarios
    const [sc1, setSc1] = useState({ value: '', total: '', result: 0 });
    const [sc2, setSc2] = useState({ percentage: '', total: '', result: 0 });
    const [sc3, setSc3] = useState({ oldVal: '', newVal: '', result: 0 });

    const calc1 = () => {
        const res = (Number(sc1.value) / Number(sc1.total)) * 100;
        setSc1({ ...sc1, result: isFinite(res) ? res : 0 });
    };

    const calc2 = () => {
        const res = (Number(sc2.percentage) / 100) * Number(sc2.total);
        setSc2({ ...sc2, result: isFinite(res) ? res : 0 });
    };

    const calc3 = () => {
        const res = ((Number(sc3.newVal) - Number(sc3.oldVal)) / Number(sc3.oldVal)) * 100;
        setSc3({ ...sc3, result: isFinite(res) ? res : 0 });
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
                    <h1 className="text-3xl font-black tracking-tight text-primary">Percentage Calculator</h1>
                    <p className="text-sm text-text-muted">Quick & accurate percentage calculations</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Find Percentage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] space-y-6"
                >
                    <div className="flex items-center space-x-3 text-primary mb-4">
                        <Calculator className="w-5 h-5" />
                        <h2 className="font-bold uppercase tracking-widest text-xs">What % is X of Y?</h2>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="number"
                            placeholder="Value (X)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary/50 focus:outline-none"
                            value={sc1.value}
                            onChange={(e) => setSc1({ ...sc1, value: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Total (Y)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary/50 focus:outline-none"
                            value={sc1.total}
                            onChange={(e) => setSc1({ ...sc1, total: e.target.value })}
                        />
                        <button
                            onClick={calc1}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                        >
                            Calculate
                        </button>
                        <div className="pt-4 text-center border-t border-white/5">
                            <div className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Result</div>
                            <div className="text-3xl font-black text-primary">{sc1.result.toFixed(2)}%</div>
                        </div>
                    </div>
                </motion.div>

                {/* Value from Percentage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] space-y-6"
                >
                    <div className="flex items-center space-x-3 text-secondary mb-4">
                        <Percent className="w-5 h-5 text-purple-400" />
                        <h2 className="font-bold uppercase tracking-widest text-xs">What is X% of Y?</h2>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="number"
                            placeholder="Percentage (X)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-secondary/50 focus:outline-none"
                            value={sc2.percentage}
                            onChange={(e) => setSc2({ ...sc2, percentage: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Total (Y)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-secondary/50 focus:outline-none"
                            value={sc2.total}
                            onChange={(e) => setSc2({ ...sc2, total: e.target.value })}
                        />
                        <button
                            onClick={calc2}
                            className="w-full py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20"
                        >
                            Calculate
                        </button>
                        <div className="pt-4 text-center border-t border-white/5">
                            <div className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Result</div>
                            <div className="text-3xl font-black text-purple-400">{sc2.result.toFixed(2)}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Percentage Change */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] space-y-6"
                >
                    <div className="flex items-center space-x-3 text-amber-400 mb-4">
                        <RefreshCw className="w-5 h-5" />
                        <h2 className="font-bold uppercase tracking-widest text-xs">% Increase / Decrease</h2>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="number"
                            placeholder="Old Value"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-amber-400/50 focus:outline-none"
                            value={sc3.oldVal}
                            onChange={(e) => setSc3({ ...sc3, oldVal: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="New Value"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-amber-400/50 focus:outline-none"
                            value={sc3.newVal}
                            onChange={(e) => setSc3({ ...sc3, newVal: e.target.value })}
                        />
                        <button
                            onClick={calc3}
                            className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                        >
                            Calculate
                        </button>
                        <div className="pt-4 text-center border-t border-white/5">
                            <div className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Change</div>
                            <div className={`text-3xl font-black ${sc3.result >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {sc3.result >= 0 ? '+' : ''}{sc3.result.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
