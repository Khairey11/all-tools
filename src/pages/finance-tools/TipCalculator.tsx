import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Users } from 'lucide-react';

export const TipCalculator: React.FC = () => {
    const navigate = useNavigate();
    const [bill, setBill] = useState('');
    const [tipPct, setTipPct] = useState(10);
    const [people, setPeople] = useState(2);

    const b = parseFloat(bill) || 0;
    const tip = b * (tipPct / 100);
    const total = b + tip;
    const perPerson = people > 0 ? total / people : total;

    const tipOptions = [0, 5, 10, 12.5, 15, 20];

    const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-2xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/finance-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-emerald-500">Tip & Bill Splitter</h1>
                    <p className="text-sm text-text-muted">Split the bill and tip fairly in seconds</p>
                </div>
            </header>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 space-y-6">
                <label className="block space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Bill amount</span>
                    <input type="number" inputMode="decimal" min="0" value={bill} onChange={(e) => setBill(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-4xl font-black font-mono text-emerald-400 focus:border-emerald-500/50 focus:outline-none" />
                </label>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                        <span>Tip</span><span className="font-mono text-emerald-400">{tipPct}%</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {tipOptions.map((t) => (
                            <button key={t} onClick={() => setTipPct(t)}
                                className={`py-2.5 rounded-xl text-xs font-black border transition-all ${tipPct === t ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/10 text-text-muted hover:text-text'}`}>
                                {t}%
                            </button>
                        ))}
                    </div>
                    <input type="range" min={0} max={30} step={0.5} value={tipPct} onChange={(e) => setTipPct(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Split between</span>
                        <span className="font-mono text-emerald-400">{people}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setPeople((p) => Math.max(1, p - 1))}
                            className="w-14 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-lg hover:bg-white/10">-</button>
                        <div className="flex-1 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl font-mono font-black">{people}</div>
                        <button onClick={() => setPeople((p) => Math.min(50, p + 1))}
                            className="w-14 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-lg hover:bg-white/10">+</button>
                    </div>
                </div>
            </div>

            {b > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-1">Tip</p>
                        <p className="text-2xl font-black font-mono text-white">{fmt(tip)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Total</p>
                        <p className="text-2xl font-black font-mono text-white">{fmt(total)}</p>
                    </div>
                    <div className="bg-emerald-500 border border-emerald-400 rounded-2xl p-5 text-center shadow-xl shadow-emerald-500/20">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-black/60 mb-1">Per person</p>
                        <p className="text-2xl font-black font-mono text-black">{fmt(perPerson)}</p>
                    </div>
                </div>
            )}

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex items-start gap-3">
                <Receipt className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    <span className="font-bold text-emerald-400">Guide:</span> 10% is standard in Nepal/India, 15-20% in the US, and no tip is expected in Japan. Adjust with the slider for service charges already included.
                </p>
            </div>
        </div>
    );
};