import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Activity, Info, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BmiCalculator: React.FC = () => {
    const navigate = useNavigate();
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft-in'>('cm');
    const [result, setResult] = useState<{ bmi: number; category: string; color: string } | null>(null);

    const calculateBMI = () => {
        const wVal = Number(weight);
        if (!wVal) return;

        const weightKg = weightUnit === 'kg' ? wVal : wVal * 0.453592;

        let heightM: number;
        if (heightUnit === 'cm') {
            const hVal = Number(height);
            if (!hVal) return;
            heightM = hVal / 100;
        } else {
            const ft = Number(heightFeet);
            const inch = Number(heightInches);
            if (!ft && !inch) return;
            heightM = ((ft * 12) + inch) * 0.0254;
        }

        const bmi = weightKg / (heightM * heightM);

        let category: string;
        let color: string;
        if (bmi < 18.5) {
            category = 'Underweight';
            color = 'text-blue-400';
        } else if (bmi < 25) {
            category = 'Normal weight';
            color = 'text-emerald-400';
        } else if (bmi < 30) {
            category = 'Overweight';
            color = 'text-amber-400';
        } else if (bmi < 35) {
            category = 'Obese Class I';
            color = 'text-orange-400';
        } else if (bmi < 40) {
            category = 'Obese Class II';
            color = 'text-red-400';
        } else {
            category = 'Obese Class III';
            color = 'text-purple-400';
        }

        setResult({ bmi, category, color });
    };

    const bmiReference = [
        { range: '< 18.5', label: 'Underweight', color: 'bg-blue-400' },
        { range: '18.5 – 24.9', label: 'Normal Weight', color: 'bg-emerald-400' },
        { range: '25.0 – 29.9', label: 'Overweight', color: 'bg-amber-400' },
        { range: '30.0 – 34.9', label: 'Obesity Class I', color: 'bg-orange-400' },
        { range: '35.0 – 39.9', label: 'Obesity Class II', color: 'bg-red-400' },
        { range: '≥ 40.0', label: 'Obesity Class III', color: 'bg-purple-400' },
    ];

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
                    <h1 className="text-3xl font-black tracking-tight text-primary">BMI Calculator</h1>
                    <p className="text-sm text-text-muted">Calculate your Body Mass Index (BMI) and health status</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Calculator */}
                <div className="lg:col-span-8">
                    <div className="bg-surface/50 border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl h-full">
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-12 items-center">
                            <div className="md:col-span-5 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-4">Weight Unit</label>
                                        <select
                                            value={weightUnit}
                                            onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold text-xs focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="kg" className="bg-white text-slate-900">Kilograms (kg)</option>
                                            <option value="lbs" className="bg-white text-slate-900">Pounds (lbs)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-4">Height Unit</label>
                                        <select
                                            value={heightUnit}
                                            onChange={(e) => setHeightUnit(e.target.value as 'cm' | 'ft-in')}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold text-xs focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="cm" className="bg-white text-slate-900">Centimeters (cm)</option>
                                            <option value="ft-in" className="bg-white text-slate-900">Feet & Inches</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">
                                            Current Weight
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-2xl font-black text-black focus:border-primary/50 focus:outline-none transition-all pr-20"
                                                placeholder="0.00"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                                {weightUnit.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">
                                            Current Height
                                        </label>
                                        {heightUnit === 'cm' ? (
                                            <input
                                                type="number"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-2xl font-black text-black focus:border-primary/50 focus:outline-none transition-all"
                                                placeholder="0.00"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                            />
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-2xl font-black text-black focus:border-primary/50 focus:outline-none transition-all pr-12"
                                                        placeholder="0"
                                                        value={heightFeet}
                                                        onChange={(e) => setHeightFeet(e.target.value)}
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-text-muted">FT</span>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-2xl font-black text-black focus:border-primary/50 focus:outline-none transition-all pr-12"
                                                        placeholder="0"
                                                        value={heightInches}
                                                        onChange={(e) => setHeightInches(e.target.value)}
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-text-muted">IN</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={calculateBMI}
                                    className="w-full py-6 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 tracking-[0.2em] transform active:scale-95 flex items-center justify-center space-x-3"
                                >
                                    <Calculator className="w-5 h-5" />
                                    <span>CALCULATE BMI</span>
                                </button>
                            </div>

                            <div className="md:col-span-1 hidden md:flex justify-center">
                                <div className="w-[1px] h-64 bg-white/5" />
                            </div>

                            <div className="md:col-span-5">
                                <AnimatePresence mode="wait">
                                    {result ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center space-y-8"
                                        >
                                            <div className="space-y-2">
                                                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Your BMI Score</div>
                                                <div className="text-8xl font-black text-black leading-none">{result.bmi.toFixed(1)}</div>
                                            </div>
                                            <div className={`text-xl font-black uppercase tracking-widest px-8 py-4 rounded-3xl bg-white/5 border border-white/10 inline-block ${result.color} shadow-2xl`}>
                                                {result.category}
                                            </div>

                                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-start space-x-4 text-left">
                                                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                                <p className="text-xs text-text-muted leading-relaxed">
                                                    BMI is a screening tool, not a diagnostic of body fatness or health. Consult a medical professional for a clinical assessment.
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                                            <Activity className="w-24 h-24 text-primary" />
                                            <p className="text-sm font-bold uppercase tracking-widest">Awaiting Input</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reference Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface/50 border border-white/5 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-xl">
                        <div className="flex items-center space-x-3 text-primary mb-6">
                            <List className="w-5 h-5" />
                            <span className="text-xs font-black uppercase tracking-widest">BMI Reference Hub</span>
                        </div>

                        <div className="space-y-4">
                            {bmiReference.map((ref, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${result && result.category.toLowerCase().includes(ref.label.toLowerCase().replace(' weight', ''))
                                        ? 'bg-white/10 border-primary/50 translate-x-2'
                                        : 'bg-white/5 border-white/5 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${ref.color} shadow-lg shadow-${ref.color.split('-')[1]}-400/50`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{ref.label}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-text-muted">{ref.range}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center space-x-3">
                                <div className="p-2 bg-blue-500 rounded-lg text-white">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase text-blue-400">Health Tip</div>
                                    <p className="text-[10px] text-text-muted leading-tight font-medium">Keep your BMI between 18.5 and 24.9 for a healthy weight range.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
