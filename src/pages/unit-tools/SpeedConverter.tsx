import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Wind, Navigation } from 'lucide-react';


const SPEED_RATES = {
    'm/s': 1,
    'km/h': 3.6,
    'mph': 2.23694,
    'knots': 1.94384,
    'mach': 0.00293867,
};

export const SpeedConverter: React.FC = () => {
    const navigate = useNavigate();
    const [value, setValue] = useState('100');
    const [fromUnit, setFromUnit] = useState('km/h');
    const [toUnit, setToUnit] = useState('m/s');
    const [result, setResult] = useState<number>(0);

    useEffect(() => {
        const baseValue = Number(value) / (SPEED_RATES as any)[fromUnit];
        setResult(baseValue * (SPEED_RATES as any)[toUnit]);
    }, [value, fromUnit, toUnit]);

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
                    <h1 className="text-3xl font-black tracking-tight text-primary">Speed Converter</h1>
                    <p className="text-sm text-text-muted">Convert velocity between metric, imperial, and aviation units</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto w-full">
                <div className="bg-surface/50 border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Wind className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 space-y-12">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 block">Speed Velocity</label>
                            <div className="flex bg-white/5 border border-white/10 rounded-3xl p-2 items-center">
                                <input
                                    type="number"
                                    className="flex-grow bg-transparent border-none p-6 text-6xl font-black focus:outline-none placeholder:text-white/5 min-w-0"
                                    placeholder="0"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                                <div className="h-20 w-[1px] bg-white/5 mx-4 hidden md:block" />
                                <select
                                    className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-xl font-black focus:outline-none appearance-none cursor-pointer min-w-[150px] text-primary"
                                    value={fromUnit}
                                    onChange={(e) => setFromUnit(e.target.value)}
                                >
                                    {Object.keys(SPEED_RATES).map(u => <option key={u} value={u} className="bg-surface">{u}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="h-[2px] flex-grow bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                            <div className="mx-8 bg-white/5 border border-white/10 p-4 rounded-full">
                                <Navigation className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <div className="h-[2px] flex-grow bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>

                        <div className="text-center space-y-6">
                            <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8 space-y-4 md:space-y-0">
                                <div className="space-y-2">
                                    <div className="text-8xl font-black text-white tracking-tighter">
                                        {result.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                                    </div>
                                    <div className="flex items-center justify-center space-x-2">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="text-xl font-black text-primary uppercase tracking-widest">{toUnit}</span>
                                    </div>
                                </div>

                                <select
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-black focus:outline-none appearance-none cursor-pointer min-w-[150px]"
                                    value={toUnit}
                                    onChange={(e) => setToUnit(e.target.value)}
                                >
                                    {Object.keys(SPEED_RATES).map(u => <option key={u} value={u} className="bg-surface">{u}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
                            {Object.entries(SPEED_RATES).filter(([u]) => u !== fromUnit && u !== toUnit).map(([unit, rate]) => {
                                const val = (Number(value) / (SPEED_RATES as any)[fromUnit]) * (rate as any);
                                return (
                                    <div key={unit} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col items-center">
                                        <div className="text-2xl font-black text-white">{val.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">{unit}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
