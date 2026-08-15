import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Landmark, Search, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLD_CURRENCIES, getFlag } from '../../utils/finance';

const CurrencySelector = ({ label, value, options, onChange }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = Object.entries(options).filter(([code, name]: any) =>
        code.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">{label}</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-bold flex items-center justify-between hover:bg-white/10 transition-all text-sm"
            >
                <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFlag(value)}</span>
                    <span className="text-primary">{value}</span>
                </div>
                <Globe className="w-4 h-4 opacity-20" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-4 bg-surface/95 border border-white/10 rounded-3xl shadow-2xl z-[120] overflow-hidden backdrop-blur-3xl"
                        >
                            <div className="p-4 border-b border-white/5 relative">
                                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search currency..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                                {filtered.map(([code, name]: any) => (
                                    <button
                                        key={code}
                                        onClick={() => {
                                            onChange(code);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full text-left px-6 py-4 flex items-center space-x-4 hover:bg-primary/10 transition-all ${value === code ? 'bg-primary/20' : ''}`}
                                    >
                                        <span className="text-lg">{getFlag(code)}</span>
                                        <div className="flex flex-col">
                                            <span className="font-black text-xs text-white uppercase">{code}</span>
                                            <span className="text-[9px] text-text-muted uppercase font-bold tracking-tight">{name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export const InterestCalculator: React.FC = () => {
    const navigate = useNavigate();
    const [type, setType] = useState<'simple' | 'compound'>('simple');
    const [currency, setCurrency] = useState('USD');

    // Inputs
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [time, setTime] = useState('');
    const [compoundsPerYear, setCompoundsPerYear] = useState('1');

    // Results
    const [result, setResult] = useState({ interest: 0, total: 0 });

    const calculate = () => {
        const P = Number(principal);
        const R = Number(rate) / 100;
        const T = Number(time);

        if (type === 'simple') {
            const I = P * R * T;
            setResult({ interest: I, total: P + I });
        } else {
            const N = Number(compoundsPerYear);
            const total = P * Math.pow((1 + R / N), N * T);
            setResult({ interest: total - P, total: total });
        }
    };

    // Auto-calculate
    useEffect(() => {
        calculate();
    }, [principal, rate, time, compoundsPerYear, type]);

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
                    <h1 className="text-3xl font-black tracking-tight text-primary">Interest Calculator</h1>
                    <p className="text-sm text-text-muted">Simple & Compound interest in {currency}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12 flex bg-surface/50 p-1.5 rounded-2xl border border-white/5 max-w-sm">
                    <button
                        onClick={() => setType('simple')}
                        className={`flex-grow py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${type === 'simple' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text hover:bg-white/5'
                            }`}
                    >
                        Simple Interest
                    </button>
                    <button
                        onClick={() => setType('compound')}
                        className={`flex-grow py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${type === 'compound' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text hover:bg-white/5'
                            }`}
                    >
                        Compound Interest
                    </button>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                        <CurrencySelector
                            label="Calculation Currency"
                            value={currency}
                            options={WORLD_CURRENCIES}
                            onChange={setCurrency}
                        />

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Principal Amount ({currency})</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary/50 focus:outline-none font-bold"
                                    value={principal}
                                    onChange={(e) => setPrincipal(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Interest Rate (%)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 5"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary/50 focus:outline-none font-bold"
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Time Period (Years)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 2"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary/50 focus:outline-none font-bold"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                            {type === 'compound' && (
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Compounding Period</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary/50 focus:outline-none cursor-pointer font-bold"
                                        value={compoundsPerYear}
                                        onChange={(e) => setCompoundsPerYear(e.target.value)}
                                    >
                                        <option value="1">Annually</option>
                                        <option value="2">Semi-annually</option>
                                        <option value="4">Quarterly</option>
                                        <option value="12">Monthly</option>
                                        <option value="365">Daily</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-[2.5rem] p-10 h-full">
                        <div className="flex items-center space-x-3 text-primary mb-10">
                            <Landmark className="w-6 h-6" />
                            <h2 className="text-xl font-black tracking-tight">Financial Summary</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Initial Investment</span>
                                <div className="text-3xl font-black text-white">
                                    <span className="text-sm opacity-30 mr-2">{currency}</span>
                                    {Number(principal).toLocaleString()}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Accrued Interest</span>
                                <div className="text-3xl font-black text-primary">
                                    <span className="text-sm opacity-30 mr-2">{currency}</span>
                                    {result.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="col-span-2 pt-8 border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Maturity Value ({currency})</span>
                                <div className="text-6xl font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent mt-2">
                                    {result.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center space-x-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                            <TrendingUp className="w-10 h-10 text-primary opacity-50" />
                            <p className="text-sm text-text-muted leading-relaxed font-medium">
                                {type === 'compound'
                                    ? "Compound interest allows your earnings to generate their own earnings over time."
                                    : "Simple interest is calculated exclusively on your initial principal amount."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
