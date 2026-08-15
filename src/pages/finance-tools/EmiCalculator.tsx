import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Info, Search, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLD_CURRENCIES, getFlag } from '../../utils/finance';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

export const EmiCalculator: React.FC = () => {
    const navigate = useNavigate();

    // Inputs
    const [loanAmount, setLoanAmount] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [tenure, setTenure] = useState('');
    const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
    const [currency, setCurrency] = useState('USD');

    // Results
    const [result, setResult] = useState({ emi: 0, totalInterest: 0, totalPayment: 0 });

    const calculateEMI = () => {
        const P = Number(loanAmount);
        const R = (Number(interestRate) / 12) / 100;
        const N = tenureType === 'years' ? Number(tenure) * 12 : Number(tenure);

        if (P && R && N) {
            const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
            const totalPayment = emi * N;
            const totalInterest = totalPayment - P;

            setResult({
                emi: emi,
                totalInterest: totalInterest,
                totalPayment: totalPayment
            });
        }
    };

    // Auto-calculate on input change
    useEffect(() => {
        calculateEMI();
    }, [loanAmount, interestRate, tenure, tenureType]);

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
                    <h1 className="text-3xl font-black tracking-tight text-primary">Loan / EMI Calculator</h1>
                    <p className="text-sm text-text-muted">Calculate repayments in {WORLD_CURRENCIES[currency] || currency}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 text-primary">
                                <CreditCard className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Loan Settings</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <CurrencySelector
                                label="Select Currency"
                                value={currency}
                                options={WORLD_CURRENCIES}
                                onChange={setCurrency}
                            />

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Loan Amount ({currency})</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 focus:border-primary/50 focus:outline-none transition-all font-bold"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold opacity-30 text-sm">
                                        {currency}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 8.5"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary/50 focus:outline-none transition-all font-bold"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-8">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Loan Tenure</label>
                                    <input
                                        type="number"
                                        placeholder="Duration"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-primary/50 focus:outline-none transition-all font-bold"
                                        value={tenure}
                                        onChange={(e) => setTenure(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4 flex flex-col pt-6">
                                    <div className="flex bg-white/5 p-1 rounded-xl h-full border border-white/10">
                                        <button
                                            onClick={() => setTenureType('years')}
                                            className={`flex-1 text-[10px] font-black uppercase rounded-lg transition-all ${tenureType === 'years' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                                        >
                                            Yr
                                        </button>
                                        <button
                                            onClick={() => setTenureType('months')}
                                            className={`flex-1 text-[10px] font-black uppercase rounded-lg transition-all ${tenureType === 'months' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                                        >
                                            Mo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl flex items-start space-x-4">
                        <Info className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <p className="text-xs text-text-muted leading-relaxed italic">
                            Equated Monthly Installment (EMI) is the amount payable every month until the loan is fully paid off. It consists of the interest on loan as well as part of the principal amount.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="bg-gradient-to-br from-surface to-primary/5 border border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col justify-center overflow-hidden">
                        <div className="text-center space-y-4 mb-12">
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">Monthly Installment</span>
                            <div className="flex items-center justify-center space-x-4">
                                <span className="text-4xl font-black text-primary opacity-40">{currency}</span>
                                <div className="text-8xl font-black text-white tracking-tighter">
                                    {result.emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl mx-auto w-full">
                            <div className="space-y-8 bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Principal</span>
                                        <span className="text-sm font-black text-white">{currency} {Number(loanAmount).toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: loanAmount ? '70%' : 0 }}
                                            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Interest</span>
                                        <span className="text-sm font-black text-emerald-400">{currency} {result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: loanAmount ? '30%' : 0 }}
                                            className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center items-center p-8 bg-primary/10 rounded-[2rem] border border-primary/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <PieChart className="w-24 h-24" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Total Payable</span>
                                <div className="text-xs font-black text-text-muted mb-2">{currency}</div>
                                <div className="text-4xl font-black text-white">
                                    {result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recharts Pie Chart */}
            {result.emi > 0 && (
                <div className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                    <h2 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6 text-center">Loan Breakdown</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Principal', value: Number(loanAmount) },
                                    { name: 'Interest', value: Math.round(result.totalInterest) },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                <Cell fill="#a78bfa" />
                                <Cell fill="#34d399" />
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                formatter={(value: any) => [`${currency} ${Number(value).toLocaleString()}`, '']}
                            />
                            <Legend
                                formatter={(value) => <span style={{ color: '#a0a0b0', fontSize: '12px', fontWeight: 700 }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
