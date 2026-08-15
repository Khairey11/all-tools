import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Timer, Coffee } from 'lucide-react';

type Phase = 'focus' | 'short' | 'long';

const DURATIONS: Record<Phase, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const PHASE_LABEL: Record<Phase, string> = { focus: 'Focus', short: 'Short Break', long: 'Long Break' };

export const PomodoroTimer: React.FC = () => {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<Phase>('focus');
    const [remaining, setRemaining] = useState(DURATIONS.focus);
    const [running, setRunning] = useState(false);
    const [completed, setCompleted] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const beep = () => {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch { /* audio may be blocked */ }
    };

    const nextPhase = () => {
        beep();
        if (phase === 'focus') {
            const done = completed + 1;
            setCompleted(done);
            const next: Phase = done % 4 === 0 ? 'long' : 'short';
            setPhase(next);
            setRemaining(DURATIONS[next]);
        } else {
            setPhase('focus');
            setRemaining(DURATIONS.focus);
        }
    };

    useEffect(() => {
        if (!running) return;
        intervalRef.current = window.setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    window.setTimeout(nextPhase, 0);
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
    }, [running, phase, completed]);

    const total = DURATIONS[phase];
    const pct = ((total - remaining) / total) * 100;
    const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
    const ss = (remaining % 60).toString().padStart(2, '0');

    const switchPhase = (p: Phase) => {
        setRunning(false);
        setPhase(p);
        setRemaining(DURATIONS[p]);
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/productivity-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-red-500">Pomodoro Timer</h1>
                    <p className="text-sm text-text-muted">25 min focus - 5 min breaks - stay productive</p>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-3">
                {(Object.keys(DURATIONS) as Phase[]).map((p) => (
                    <button key={p} onClick={() => switchPhase(p)}
                        className={`py-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${phase === p ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                        {p === 'focus' ? <Timer className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                        {PHASE_LABEL[p]}
                    </button>
                ))}
            </div>

            <div className="bg-surface/50 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                <div className="w-64 h-64 mx-auto relative">
                    <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                        <circle cx="100" cy="100" r="90" fill="none" stroke={phase === 'focus' ? '#ef4444' : '#10b981'} strokeWidth="10"
                            strokeLinecap="round" strokeDasharray={2 * Math.PI * 90}
                            strokeDashoffset={2 * Math.PI * 90 * (1 - pct / 100)}
                            style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-6xl font-black font-mono tabular-nums">{mm}:{ss}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-2">{PHASE_LABEL[phase]}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setRunning(!running)}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${running ? 'bg-white/10 hover:bg-white/15 text-text' : 'bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20'}`}>
                        {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
                    </button>
                    <button onClick={() => { setRunning(false); setRemaining(DURATIONS[phase]); }}
                        className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex justify-center gap-2">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${completed % 4 > i || (completed > 0 && completed % 4 === 0) ? 'bg-red-500' : 'bg-white/10'}`} />
                    ))}
                </div>
                <p className="text-center text-xs text-text-muted">{completed} pomodoros completed this session</p>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex items-start gap-3">
                <Timer className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    <span className="font-bold text-red-400">How it works:</span> Focus 25 min, break 5 min, repeat. After 4 pomodoros take a 15-minute long break.
                    A gentle beep plays at each transition. Keep this tab open while you work.
                </p>
            </div>
        </div>
    );
};