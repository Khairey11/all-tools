import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Code, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const JsonFormatter: React.FC = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const formatJson = (spaces: number = 4) => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, spaces));
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setOutput('');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-green-500">JSON Formatter</h1>
                    <p className="text-sm text-text-muted">Prettify and validate JSON data instantly</p>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Input JSON</label>
                        <button
                            onClick={() => setInput('')}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-muted transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <textarea
                        className="flex-grow bg-surface/50 border border-white/5 rounded-3xl p-6 font-mono text-sm focus:border-primary/50 focus:outline-none resize-none transition-all shadow-inner"
                        placeholder='Paste your messy JSON here... e.g. {"key":"value","number":1}'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="flex space-x-3">
                        <button
                            onClick={() => formatJson(4)}
                            className="flex-grow py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            Format JSON
                        </button>
                        <button
                            onClick={() => formatJson(0)}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl font-bold transition-all"
                        >
                            Minify
                        </button>
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center h-8">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Output</label>
                        {output && (
                            <button
                                onClick={handleCopy}
                                className="flex items-center space-x-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all"
                            >
                                <Copy className="w-3 h-3" />
                                <span>Copy to Clipboard</span>
                            </button>
                        )}
                    </div>
                    <div className="flex-grow bg-black/40 border border-white/5 rounded-3xl p-6 font-mono text-sm overflow-auto relative group">
                        {error ? (
                            <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                <p className="font-bold mb-1">Invalid JSON:</p>
                                <p className="opacity-80">{error}</p>
                            </div>
                        ) : output ? (
                            <pre className="text-green-400/90 leading-relaxed">{output}</pre>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-muted opacity-30 select-none">
                                <div className="text-center">
                                    <Code className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    <p>Output will appear here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
