import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Percent } from 'lucide-react';

export const DiscountCalculator: React.FC = () => {
    const navigate = useNavigate();
    const [price, setPrice] = useState('');
    const [disc1, setDisc1] = useState('');
    const [disc2, setDisc2] = useState('');
    const [taxPct, setTaxPct] = useState('');

    const p = parseFloat(price) || 0;
    const d1 = parseFloat(disc1) || 0;
    const d2 = parseFloat(disc2) || 0;
    const t = parseFloat(taxPct) || 0;

    const afterD1 = p * (1 - d1 / 100);
    const afterD2 = afterD1 * (1 - d2 / 100);
    const taxAmount = afterD2 * (t / 100);
    const finalPrice = afterD2 + taxAmount;
    const saved = p - afterD2;

    const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-2xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/finance-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-emerald-500">Discount Calculator</h1>
                    <p className="text-sm text-text-muted">Stacked discounts, tax and final price - instantly</p>
                </div>
            </header>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 space-y-5">
                <label className="block space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Original price</span>
                    <input type="number" inputMode="decimal" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-4xl font-black font-mono text-emerald-400 focus:border-emerald-500/50 focus:outline-none" />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Discount 1</span>
                        <input type="number" inputMode="decimal" min="0" max="100" value={disc1} onChange={(e) => setDisc1(e.target.value)} placeholder="e.g. 30"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 font-mono text-lg focus:border-emerald-500/50 focus:outline-none" />
                    </label>
                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Extra discount</span>
                        <input type="number" inputMode="decimal" min="0" max="100" value={disc2} onChange={(e) => setDisc2(e.target.value)} placeholder="e.g. 10"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 font-mono text-lg focus:border-emerald-500/50 focus:outline-none" />
                    </label>
                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" /> VAT / Tax %</span>
                        <input type="number" inputMode="decimal" min="0" max="100" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} placeholder="e.g. 13"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 font-mono text-lg focus:border-emerald-500/50 focus:outline-none" />
                    </label>
                </div>
                <p className="text-[10px] text-text-muted">Extra discounts apply to the already-discounted price (30% + 10% = 37% total, not 40%).</p>
            </div>

            {p > 0 && (
                <div className="space-y-4">
                    <div className="bg-emerald-500 border border-emerald-400 rounded-3xl p-8 text-center shadow-xl shadow-emerald-500/20">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-black/60 mb-2">Final price</p>
                        <p className="text-5xl font-black font-mono text-black">{fmt(finalPrice)}</p>
                        {saved > 0 && (
                            <p className="mt-2 text-sm font-bold text-black/60">
                                You save {fmt(saved)} ({Math.round((saved / p) * 100)}% off)
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">After discounts</p>
                            <p className="text-xl font-black font-mono">{fmt(afterD2)}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Tax added</p>
                            <p className="text-xl font-black font-mono">{fmt(taxAmount)}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};