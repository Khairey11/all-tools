import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Sun, Dumbbell } from 'lucide-react';

export const WaterIntake: React.FC = () => {
    const navigate = useNavigate();
    const [weight, setWeight] = useState('60');
    const [exercise, setExercise] = useState(30);
    const [hot, setHot] = useState(false);

    const w = parseFloat(weight) || 0;
    const valid = w > 20 && w < 250;
    // Base: 35 ml per kg; +350ml per 30 min exercise; +500ml hot climate
    const liters = valid ? (w * 35 + (exercise / 30) * 350 + (hot ? 500 : 0)) / 1000 : 0;
    const glasses = Math.round((liters * 1000) / 250);

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-2xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/health-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-sky-500">Water Intake Calculator</h1>
                    <p className="text-sm text-text-muted">How much water you should drink daily</p>
                </div>
            </header>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 space-y-6">
                <label className="block space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Weight (kg)</span>
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-4xl font-black font-mono text-sky-400 focus:border-sky-500/50 focus:outline-none" />
                </label>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                        <span className="flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5" /> Exercise</span>
                        <span className="font-mono text-sky-400">{exercise} min/day</span>
                    </div>
                    <input type="range" min={0} max={180} step={15} value={exercise} onChange={(e) => setExercise(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                </div>

                <button onClick={() => setHot(!hot)}
                    className={`w-full py-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${hot ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' : 'bg-white/5 text-text-muted border-white/10'}`}>
                    <Sun className="w-4 h-4" /> {hot ? 'Hot climate / summer - ON' : 'Hot climate / summer - OFF'}
                </button>
            </div>

            {valid && (
                <div className="bg-sky-500 border border-sky-400 rounded-3xl p-8 text-center shadow-xl shadow-sky-500/20">
                    <Droplets className="w-8 h-8 text-black/60 mx-auto mb-2" />
                    <p className="text-5xl font-black font-mono text-black">{liters.toFixed(1)}</p>
                    <p className="mt-2 text-sm font-bold text-black/60">liters per day - about {glasses} glasses (250ml)</p>
                </div>
            )}

            <div className="bg-sky-500/5 border border-sky-500/10 p-5 rounded-2xl flex items-start gap-3">
                <Droplets className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    Formula: 35ml per kg body weight, plus extra for exercise and hot weather. Spread intake across the day -
                    your body absorbs ~250ml every 30 minutes. Also note: tea, coffee, fruits and soup all count toward hydration.
                </p>
            </div>
        </div>
    );
};