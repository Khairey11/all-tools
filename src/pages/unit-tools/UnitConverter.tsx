import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Repeat, Ruler, Box, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

const UNITS = {
    length: {
        meters: 1,
        kilometers: 0.001,
        centimeters: 100,
        millimeters: 1000,
        inches: 39.3701,
        feet: 3.28084,
        yards: 1.09361,
        miles: 0.000621371,
    },
    weight: {
        kilograms: 1,
        grams: 1000,
        milligrams: 1000000,
        pounds: 2.20462,
        ounces: 35.274,
        tons: 0.001,
    }
};

export const UnitConverter: React.FC = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'length' | 'weight' | 'temp'>('length');
    const [value, setValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('meters');
    const [toUnit, setToUnit] = useState('kilometers');
    const [result, setResult] = useState<number>(0);

    useEffect(() => {
        if (mode === 'temp') {
            const v = Number(value);
            if (fromUnit === 'Celsius' && toUnit === 'Fahrenheit') setResult((v * 9 / 5) + 32);
            else if (fromUnit === 'Celsius' && toUnit === 'Kelvin') setResult(v + 273.15);
            else if (fromUnit === 'Fahrenheit' && toUnit === 'Celsius') setResult((v - 32) * 5 / 9);
            else if (fromUnit === 'Fahrenheit' && toUnit === 'Kelvin') setResult((v - 32) * 5 / 9 + 273.15);
            else if (fromUnit === 'Kelvin' && toUnit === 'Celsius') setResult(v - 273.15);
            else if (fromUnit === 'Kelvin' && toUnit === 'Fahrenheit') setResult((v - 273.15) * 9 / 5 + 32);
            else setResult(v);
        } else {
            const rates = UNITS[mode as keyof typeof UNITS];
            const baseValue = Number(value) / (rates as any)[fromUnit];
            setResult(baseValue * (rates as any)[toUnit]);
        }
    }, [value, fromUnit, toUnit, mode]);

    const handleModeChange = (newMode: 'length' | 'weight' | 'temp') => {
        setMode(newMode);
        if (newMode === 'length') {
            setFromUnit('meters');
            setToUnit('kilometers');
        } else if (newMode === 'weight') {
            setFromUnit('kilograms');
            setToUnit('pounds');
        } else {
            setFromUnit('Celsius');
            setToUnit('Fahrenheit');
        }
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
                    <h1 className="text-3xl font-black tracking-tight text-primary">Unit Converter</h1>
                    <p className="text-sm text-text-muted">High-precision conversion for Length, Weight, and Temp</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto w-full">
                <div className="bg-surface/50 border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 mb-10 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => handleModeChange('length')}
                            className={`flex-1 py-4 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 whitespace-nowrap ${mode === 'length' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                        >
                            <Ruler className="w-4 h-4" />
                            <span>Length</span>
                        </button>
                        <button
                            onClick={() => handleModeChange('weight')}
                            className={`flex-1 py-4 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 whitespace-nowrap ${mode === 'weight' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                        >
                            <Box className="w-4 h-4" />
                            <span>Weight</span>
                        </button>
                        <button
                            onClick={() => handleModeChange('temp')}
                            className={`flex-1 py-4 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 whitespace-nowrap ${mode === 'temp' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                        >
                            <Thermometer className="w-4 h-4" />
                            <span>Temperature</span>
                        </button>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-6 items-end">
                        <div className="md:col-span-11 mb-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Enter Value</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-4xl font-black focus:border-primary/50 focus:outline-none transition-all placeholder:text-white/10 text-primary"
                                placeholder="0.00"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">From</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                            >
                                {mode === 'temp' ? (
                                    ['Celsius', 'Fahrenheit', 'Kelvin'].map(u => <option key={u} value={u} className="bg-surface">{u}</option>)
                                ) : (
                                    Object.keys(UNITS[mode as keyof typeof UNITS]).map(u => <option key={u} value={u} className="bg-surface">{u.charAt(0).toUpperCase() + u.slice(1)}</option>)
                                )}
                            </select>
                        </div>

                        <div className="md:col-span-1 flex justify-center pb-2">
                            <button
                                onClick={() => {
                                    setFromUnit(toUnit);
                                    setToUnit(fromUnit);
                                }}
                                className="p-4 bg-primary text-white rounded-full hover:rotate-180 transition-all duration-500 shadow-lg shadow-primary/20"
                            >
                                <Repeat className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="md:col-span-5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">To</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                            >
                                {mode === 'temp' ? (
                                    ['Celsius', 'Fahrenheit', 'Kelvin'].map(u => <option key={u} value={u} className="bg-surface">{u}</option>)
                                ) : (
                                    Object.keys(UNITS[mode as keyof typeof UNITS]).map(u => <option key={u} value={u} className="bg-surface">{u.charAt(0).toUpperCase() + u.slice(1)}</option>)
                                )}
                            </select>
                        </div>

                        <div className="md:col-span-11 pt-12 text-center border-t border-white/10 mt-8">
                            <motion.div
                                key={result}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted">Conversion Result</div>
                                <div className="text-6xl md:text-8xl font-black bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
                                    {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                </div>
                                <div className="text-xl font-black text-text-muted uppercase tracking-widest">{toUnit}</div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
