import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Activity } from 'lucide-react';

const ACTIVITY = [
    { label: 'Sedentary (desk job)', factor: 1.2 },
    { label: 'Light (1-3 days/wk)', factor: 1.375 },
    { label: 'Moderate (3-5 days/wk)', factor: 1.55 },
    { label: 'Active (6-7 days/wk)', factor: 1.725 },
    { label: 'Very active (athlete)', factor: 1.9 },
];

const GOALS = [
    { label: 'Lose weight', delta: -500 },
    { label: 'Maintain', delta: 0 },
    { label: 'Gain weight', delta: 500 },
];

export const CalorieCalculator: React.FC = () => {
    const navigate = useNavigate();
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [age, setAge] = useState('25');
    const [weight, setWeight] = useState('70');
    const [height, setHeight] = useState('170');
    const [activity, setActivity] = useState(1.55);
    const [goal, setGoal] = useState(0);

    const a = parseFloat(age) || 0;
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;

    const valid = a > 10 && a < 100 && w > 25 && w < 300 && h > 100 && h < 250;

    // Mifflin-St Jeor
    const bmr = valid ? 10 * w + 6.25 * h - 5 * a + (gender === 'male' ? 5 : -161) : 0;
    const tdee = bmr * activity;
    const goalCals = tdee + GOALS.find((g) => g.delta === goal)!.delta;
    const protein = w * (goal < 0 ? 2.2 : 1.8);
    const carbs = (goalCals * 0.45) / 4;
    const fat = (goalCals * 0.25) / 9;

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-2xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/health-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-rose-500">Calorie Calculator</h1>
                    <p className="text-sm text-text-muted">Daily calorie needs (TDEE) with macro breakdown</p>
                </div>
            </header>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                    {(['male', 'female'] as const).map((g) => (
                        <button key={g} onClick={() => setGender(g)}
                            className={`py-3 rounded-xl text-xs font-black border capitalize transition-all ${gender === g ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                            {g}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Age</span>
                        <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-mono focus:border-rose-500/50 focus:outline-none" />
                    </label>
                    <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Weight (kg)</span>
                        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-mono focus:border-rose-500/50 focus:outline-none" />
                    </label>
                    <label className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Height (cm)</span>
                        <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-mono focus:border-rose-500/50 focus:outline-none" />
                    </label>
                </div>

                <label className="block space-y-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Activity level</span>
                    <select value={activity} onChange={(e) => setActivity(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-rose-500/50 focus:outline-none">
                        {ACTIVITY.map((x) => <option key={x.factor} value={x.factor}>{x.label}</option>)}
                    </select>
                </label>

                <div className="grid grid-cols-3 gap-3">
                    {GOALS.map((g) => (
                        <button key={g.label} onClick={() => setGoal(g.delta)}
                            className={`py-3 rounded-xl text-xs font-black border transition-all ${goal === g.delta ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                            {g.label}
                        </button>
                    ))}
                </div>
            </div>

            {valid && (
                <div className="space-y-4">
                    <div className="bg-rose-500 border border-rose-400 rounded-3xl p-8 text-center shadow-xl shadow-rose-500/20">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-black/60 mb-2 flex items-center justify-center gap-1.5">
                            <Flame className="w-3.5 h-3.5" /> Daily target ({GOALS.find((g) => g.delta === goal)!.label})
                        </p>
                        <p className="text-5xl font-black font-mono text-black">{Math.round(goalCals).toLocaleString()}</p>
                        <p className="mt-2 text-sm font-bold text-black/60">calories / day</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'BMR (rest)', value: `${Math.round(bmr)} cal` },
                            { label: 'Maintenance', value: `${Math.round(tdee)} cal` },
                            { label: 'Protein', value: `${Math.round(protein)} g` },
                            { label: 'Carbs / Fat', value: `${Math.round(carbs)} / ${Math.round(fat)} g` },
                        ].map((c) => (
                            <div key={c.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">{c.label}</p>
                                <p className="text-lg font-black font-mono">{c.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl flex items-start gap-3">
                <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    Uses the <span className="font-bold text-rose-400">Mifflin-St Jeor</span> formula, the most accurate BMR estimate.
                    +/- 500 cal = about 0.45 kg (1 lb) per week. Protein set higher when losing weight to preserve muscle. Estimates only - not medical advice.
                </p>
            </div>
        </div>
    );
};