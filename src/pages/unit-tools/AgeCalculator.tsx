import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const AgeCalculator: React.FC = () => {
    const navigate = useNavigate();
    const [birthDate, setBirthDate] = useState('');
    const [result, setResult] = useState<{ years: number; months: number; days: number } | null>(null);

    const calculateAge = () => {
        if (!birthDate) return;
        const today = new Date();
        const birth = new Date(birthDate);

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (months < 0 || (months === 0 && days < 0)) {
            years--;
            months += 12;
        }

        if (days < 0) {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);
            days += lastMonth.getDate();
            months--;
        }

        setResult({ years, months, days });
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
                    <h1 className="text-3xl font-black tracking-tight text-primary">Age Calculator</h1>
                    <p className="text-sm text-text-muted">Calculate your exact age in years, months, and days</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto w-full">
                <div className="bg-surface/50 border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-8 items-center">
                        <div className="md:col-span-5 space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Date of Birth</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-black focus:border-primary/50 focus:outline-none transition-all text-black [color-scheme:light]"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                    />
                                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary opacity-20 pointer-events-none" />
                                </div>
                            </div>

                            <button
                                onClick={calculateAge}
                                className="w-full py-6 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 tracking-[0.2em] transform active:scale-95 flex items-center justify-center space-x-3"
                            >
                                <Calculator className="w-5 h-5" />
                                <span>CALCULATE AGE</span>
                            </button>
                        </div>

                        <div className="md:col-span-1 hidden md:flex justify-center">
                            <div className="w-[1px] h-40 bg-white/5" />
                        </div>

                        <div className="md:col-span-5">
                            <AnimatePresence mode="wait">
                                {result ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="space-y-6 text-center"
                                    >
                                        <div className="relative inline-block">
                                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                            <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <User className="w-10 h-10 text-primary" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="text-4xl font-black text-white">{result.years}</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Years</div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="text-4xl font-black text-white">{result.months}</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Months</div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="text-4xl font-black text-white">{result.days}</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Days</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                                        <Calendar className="w-20 h-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest">Select your birth date</p>
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

import { AnimatePresence } from 'framer-motion';
