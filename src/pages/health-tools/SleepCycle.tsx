import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Clock } from 'lucide-react';

function fmtTime(d: Date): string {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMin(base: Date, min: number): Date {
    return new Date(base.getTime() + min * 60000);
}

export const SleepCycle: React.FC = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'wake' | 'sleep'>('wake');
    const [time, setTime] = useState('06:30');

    const cycles = (mode === 'wake'
        ? [6, 5, 4, 3]     // bedtimes for target wake
        : [6, 5, 4, 3]     // wake times for now-bed
    ).map((n) => n * 90 + 15); // 90-min cycles + ~15 min to fall asleep

    const compute = (offsetMin: number): string => {
        const [h, m] = time.split(':').map(Number);
        const base = new Date();
        base.setHours(h, m, 0, 0);
        const result = mode === 'wake'
            ? addMin(base, -offsetMin)
            : addMin(base, offsetMin);
        return fmtTime(result);
    };

    const labels = { wake: 'Go to bed at:', sleep: 'You will wake at:' };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-2xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/health-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-indigo-400">Sleep Cycle Calculator</h1>
                    <p className="text-sm text-text-muted">Wake up refreshed between sleep cycles</p>
                </div>
            </header>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setMode('wake')}
                        className={`py-3.5 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${mode === 'wake' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                        <Clock className="w-4 h-4" /> I want to wake up at...
                    </button>
                    <button onClick={() => setMode('sleep')}
                        className={`py-3.5 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${mode === 'sleep' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                        <Moon className="w-4 h-4" /> I am going to bed now
                    </button>
                </div>

                <label className="block space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
                        {mode === 'wake' ? 'Wake-up time' : 'Bed time'}
                    </span>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-4xl font-black font-mono text-indigo-300 focus:border-indigo-500/50 focus:outline-none text-center" />
                </label>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-text-muted text-center">{labels[mode]}</p>
            <div className="grid grid-cols-2 gap-4">
                {cycles.map((min, i) => {
                    const hours = Math.floor(min / 60);
                    const quality = ['Excellent', 'Great', 'Good', 'Minimum'][i];
                    const color = i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-indigo-500/70' : 'bg-white/5';
                    const border = i === 0 ? 'border-indigo-400' : i === 1 ? 'border-indigo-400/50' : 'border-white/10';
                    return (
                        <div key={min} className={`${color} ${border} border rounded-2xl p-5 text-center`}>
                            <p className="text-3xl font-black font-mono">{compute(min)}</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest mt-1.5 text-black/60 opacity-80">
                                {hours}h {min % 60}m - {quality}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex items-start gap-3">
                <Moon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    A sleep cycle lasts ~90 minutes. Waking mid-cycle causes grogginess ("sleep inertia") -
                    waking <span className="font-bold text-indigo-300">between</span> cycles lets you rise refreshed. Times include ~15 min to fall asleep.
                </p>
            </div>
        </div>
    );
};