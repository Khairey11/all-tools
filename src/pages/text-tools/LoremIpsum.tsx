import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, RefreshCw, FileText } from 'lucide-react';

const WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

function rand(max: number) { return Math.floor(Math.random() * max); }

function sentence(): string {
    const len = 8 + rand(10);
    const words = Array.from({ length: len }, () => WORDS[rand(WORDS.length)]);
    const s = words.join(' ');
    return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

export const LoremIpsum: React.FC = () => {
    const navigate = useNavigate();
    const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [count, setCount] = useState(3);
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = () => {
        let result = '';
        if (type === 'words') {
            result = Array.from({ length: count }, () => WORDS[rand(WORDS.length)]).join(' ');
        } else if (type === 'sentences') {
            result = Array.from({ length: count }, sentence).join(' ');
        } else {
            result = Array.from({ length: count }, () =>
                Array.from({ length: 3 + rand(3) }, sentence).join(' ')
            ).join('\n\n');
        }
        setOutput(result);
        setCopied(false);
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-3xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/text-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-fuchsia-500">Lorem Ipsum Generator</h1>
                    <p className="text-sm text-text-muted">Placeholder text for designs and mockups</p>
                </div>
            </header>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-6 space-y-5">
                <div className="flex flex-wrap gap-3">
                    {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
                        <button key={t} onClick={() => setType(t)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black border capitalize transition-all ${type === t ? 'bg-fuchsia-500 text-white border-fuchsia-500' : 'bg-white/5 border-white/10 text-text-muted hover:text-text'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                        <span>Count</span><span className="font-mono text-fuchsia-400">{count}</span>
                    </div>
                    <input type="range" min={1} max={type === 'words' ? 100 : 15} value={Math.min(count, type === 'words' ? 100 : 15)}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
                </div>

                <div className="flex gap-3">
                    <button onClick={generate}
                        className="flex-1 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Generate
                    </button>
                    <button onClick={() => { if (output) { navigator.clipboard.writeText(output); setCopied(true); } }} disabled={!output}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40">
                        <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {output && (
                <div className="bg-surface/50 border border-white/5 rounded-3xl p-6">
                    <p className="text-sm leading-relaxed text-text-muted whitespace-pre-line">{output}</p>
                    <p className="mt-4 text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2">
                        <FileText className="w-3 h-3" /> {output.split(/\s+/).length} words - {output.length} characters
                    </p>
                </div>
            )}
        </div>
    );
};