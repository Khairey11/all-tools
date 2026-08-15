import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, RefreshCw, Shield } from 'lucide-react';

const SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

type SetKey = keyof typeof SETS;

/** Cryptographically secure random index within pool length. */
function randomIndex(max: number): number {
    const arr = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / max) * max;
    let v = 0;
    do {
        crypto.getRandomValues(arr);
        v = arr[0];
    } while (v >= limit);
    return v % max;
}

export const PasswordGenerator: React.FC = () => {
    const navigate = useNavigate();
    const [length, setLength] = useState(16);
    const [sets, setSets] = useState<Record<SetKey, boolean>>({ lower: true, upper: true, numbers: true, symbols: true });
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = () => {
        let pool = (Object.keys(SETS) as SetKey[]).filter((k) => sets[k]).map((k) => SETS[k]).join('');
        if (excludeAmbiguous) pool = pool.replace(/[Il1O0o]/g, '');
        if (!pool) { setPassword(''); return; }

        // Guarantee at least one char from each selected set
        const chars: string[] = [];
        (Object.keys(SETS) as SetKey[]).filter((k) => sets[k]).forEach((k) => {
            let s = SETS[k];
            if (excludeAmbiguous) s = s.replace(/[Il1O0o]/g, '');
            if (s) chars.push(s[randomIndex(s.length)]);
        });
        while (chars.length < length) chars.push(pool[randomIndex(pool.length)]);

        // Fisher-Yates shuffle (crypto-based)
        for (let i = chars.length - 1; i > 0; i--) {
            const j = randomIndex(i + 1);
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        setPassword(chars.slice(0, length).join(''));
        setCopied(false);
    };

    const strength = (() => {
        const poolSize = (Object.keys(SETS) as SetKey[]).filter((k) => sets[k]).reduce((acc, k) => acc + SETS[k].length, 0);
        if (!poolSize || !password) return { label: '-', color: 'text-text-muted', bar: 0 };
        const bits = Math.round(length * Math.log2(poolSize));
        if (bits > 100) return { label: `Very Strong (${bits} bits)`, color: 'text-emerald-400', bar: 100 };
        if (bits > 75) return { label: `Strong (${bits} bits)`, color: 'text-green-400', bar: 80 };
        if (bits > 50) return { label: `Medium (${bits} bits)`, color: 'text-amber-400', bar: 55 };
        return { label: `Weak (${bits} bits)`, color: 'text-red-400', bar: 30 };
    })();

    const labels: Record<SetKey, string> = { lower: 'a-z', upper: 'A-Z', numbers: '0-9', symbols: '!@#$' };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-3xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/dev-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-green-500">Password Generator</h1>
                    <p className="text-sm text-text-muted">Cryptographically secure passwords - generated on your device only</p>
                </div>
            </header>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-6 min-h-24 flex items-center justify-center">
                    <p className="font-mono text-2xl break-all text-center text-green-300">
                        {password || <span className="text-text-muted text-base">Click Generate to create a password</span>}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button onClick={generate}
                        className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Generate
                    </button>
                    <button onClick={() => { if (password) { navigator.clipboard.writeText(password); setCopied(true); } }} disabled={!password}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40">
                        <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                        <span>Length</span><span className="font-mono text-green-400">{length}</span>
                    </div>
                    <input type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(SETS) as SetKey[]).map((k) => (
                        <button key={k} onClick={() => setSets((s) => ({ ...s, [k]: !s[k] }))}
                            className={`py-3 rounded-xl text-xs font-black border transition-all ${sets[k] ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-white/5 text-text-muted border-white/10'}`}>
                            {labels[k]}
                        </button>
                    ))}
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={excludeAmbiguous} onChange={(e) => setExcludeAmbiguous(e.target.checked)} className="accent-green-500 w-4 h-4" />
                    <span className="text-sm text-text-muted">Exclude ambiguous characters (I, l, 1, O, 0)</span>
                </label>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="font-bold uppercase tracking-widest text-text-muted">Strength</span>
                        <span className={`font-black ${strength.color}`}>{strength.label}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${strength.bar > 70 ? 'bg-emerald-500' : strength.bar > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${password ? strength.bar : 0}%` }} />
                    </div>
                </div>
            </div>

            <div className="bg-green-500/5 border border-green-500/10 p-5 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    Passwords use <span className="font-bold text-green-400">crypto.getRandomValues</span> (the browser's cryptographic random source) and are never sent anywhere. Ambiguous character exclusion helps when writing passwords by hand.
                </p>
            </div>
        </div>
    );
};