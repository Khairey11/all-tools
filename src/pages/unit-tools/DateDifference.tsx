import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DateDifference: React.FC = () => {
    const navigate = useNavigate();
    const [date1, setDate1] = useState('');
    const [date2, setDate2] = useState('');
    const [result, setResult] = useState<{ days: number; weeks: number; months: number; years: number } | null>(null);

    const calculateDifference = () => {
        if (!date1 || !date2) return;
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const weeks = (diffDays / 7).toFixed(1);
        const months = (diffDays / 30.44).toFixed(1);
        const years = (diffDays / 365.25).toFixed(1);

        setResult({ days: diffDays, weeks: parseFloat(weeks), months: parseFloat(months), years: parseFloat(years) });
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/unit-tools')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Date Difference</h1>
                    <p className="text-sm text-text-muted">Calculate the duration between two dates</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto w-full">
                <div className="bg-surface/50 border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-12 items-center">
                        <div className="md:col-span-11 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-black focus:border-primary/50 focus:outline-none transition-all [color-scheme:dark]"
                                    value={date1}
                                    onChange={(e) => setDate1(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">End Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-black focus:border-primary/50 focus:outline-none transition-all [color-scheme:dark]"
                                    value={date2}
                                    onChange={(e) => setDate2(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-11">
                            <button
                                onClick={calculateDifference}
                                className="w-full py-6 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 tracking-[0.2em] transform active:scale-95 flex items-center justify-center space-x-3 mb-10"
                            >
                                <Clock className="w-5 h-5" />
                                <span>CALCULATE DURATION</span>
                            </button>

                            <AnimatePresence mode="wait">
                                {result ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                                    >
                                        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center group hover:bg-primary/5 transition-all">
                                            <div className="text-5xl font-black text-white group-hover:text-primary transition-colors">{result.days}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-2">Days</div>
                                        </div>
                                        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center group hover:bg-primary/5 transition-all">
                                            <div className="text-5xl font-black text-white group-hover:text-primary transition-colors">{result.weeks}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-2">Weeks</div>
                                        </div>
                                        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center group hover:bg-primary/5 transition-all">
                                            <div className="text-5xl font-black text-white group-hover:text-primary transition-colors">{result.months}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-2">Months</div>
                                        </div>
                                        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-center group hover:bg-primary/5 transition-all">
                                            <div className="text-5xl font-black text-white group-hover:text-primary transition-colors">{result.years}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-2">Years</div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-10 py-12">
                                        <Calendar className="w-32 h-32" />
                                        <p className="text-sm font-bold uppercase tracking-[0.4em]">Select boundaries to see the gap</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
