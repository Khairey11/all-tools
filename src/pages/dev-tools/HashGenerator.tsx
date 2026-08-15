import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, Copy } from 'lucide-react';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-512', 'SHA-384'] as const;

async function digest(algo: string, text: string): Promise<string> {
    const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const HashGenerator: React.FC = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [hashes, setHashes] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;
        if (!text) { setHashes({}); return; }
        Promise.all(ALGOS.map(async (a) => [a, await digest(a, text)] as const)).then((entries) => {
            if (!cancelled) setHashes(Object.fromEntries(entries));
        });
        return () => { cancelled = true; };
    }, [text]);

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-3xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/dev-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-green-500">Hash Generator</h1>
                    <p className="text-sm text-text-muted">SHA hashes computed locally via Web Crypto API</p>
                </div>
            </header>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-6 space-y-4">
                <textarea value={text} onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste text to hash..."
                    className="w-full h-32 bg-black/20 border border-white/5 rounded-2xl p-4 font-mono text-sm focus:border-green-500/50 focus:outline-none resize-none" />
            </div>

            {ALGOS.map((algo) => (
                <div key={algo} className="bg-surface/50 border border-white/5 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5" /> {algo}
                        </span>
                        <button onClick={() => hashes[algo] && navigator.clipboard.writeText(hashes[algo])} disabled={!hashes[algo]}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-muted disabled:opacity-40"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="font-mono text-xs break-all text-text-muted bg-black/20 rounded-xl p-3 min-h-10">
                        {hashes[algo] || <span className="opacity-40">awaiting input...</span>}
                    </p>
                </div>
            ))}
        </div>
    );
};