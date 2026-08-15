import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileImage, Download, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { formatFileSize } from '../../utils/format';

interface ConvertJob {
    id: string;
    file: File;
    originalUrl: string;
    resultBlob: Blob | null;
    resultUrl: string | null;
    quality: number;
    toFormat: 'jpeg' | 'png' | 'webp';
    isProcessing: boolean;
}

const TARGETS: { key: 'jpeg' | 'png' | 'webp'; label: string; ext: string }[] = [
    { key: 'jpeg', label: 'JPG', ext: 'jpg' },
    { key: 'png', label: 'PNG', ext: 'png' },
    { key: 'webp', label: 'WebP', ext: 'webp' },
];

export const ImageFormatConverter: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<ConvertJob[]>([]);

    const handleFilesSelected = (files: File[]) => {
        const imgs = files.filter((f) => f.type.startsWith('image/'));
        if (!imgs.length) return;
        setJobs((prev) => [
            ...prev,
            ...imgs.map((f) => ({
                id: Math.random().toString(36).slice(2) + Date.now().toString(36),
                file: f,
                originalUrl: URL.createObjectURL(f),
                resultBlob: null,
                resultUrl: null,
                quality: 90,
                toFormat: 'jpeg' as const,
                isProcessing: false,
            })),
        ]);
    };

    const patch = (id: string, p: Partial<ConvertJob>) =>
        setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...p } : j)));

    const convert = async (job: ConvertJob) => {
        patch(job.id, { isProcessing: true });
        try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = () => reject(new Error('Could not load image.'));
                el.src = job.originalUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported.');

            if (job.toFormat === 'jpeg') {
                // JPEG has no alpha channel - flatten transparency to white
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);

            const mime = job.toFormat === 'jpeg' ? 'image/jpeg' : job.toFormat === 'png' ? 'image/png' : 'image/webp';
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error('Conversion failed. Your browser may not support WebP export.'))),
                    mime,
                    job.toFormat === 'png' ? undefined : job.quality / 100
                );
            });

            if (job.resultUrl) URL.revokeObjectURL(job.resultUrl);
            patch(job.id, { resultBlob: blob, resultUrl: URL.createObjectURL(blob), isProcessing: false });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Conversion failed.');
            patch(job.id, { isProcessing: false });
        }
    };

    const removeJob = (id: string) => {
        setJobs((prev) => {
            const j = prev.find((x) => x.id === id);
            if (j) {
                URL.revokeObjectURL(j.originalUrl);
                if (j.resultUrl) URL.revokeObjectURL(j.resultUrl);
            }
            return prev.filter((x) => x.id !== id);
        });
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/image-tools')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Image Format Converter</h1>
                    <p className="text-sm text-text-muted">Convert between PNG, JPG and WebP instantly</p>
                </div>
            </header>

            {jobs.length === 0 ? (
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <DropZone onFilesSelected={handleFilesSelected} multiple accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] }} />
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl inline-block">
                        <p className="text-xs text-primary font-medium">100% local - your images never leave the browser.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job) => {
                        const target = TARGETS.find((t) => t.key === job.toFormat)!;
                        return (
                            <div key={job.id} className="bg-surface/50 border border-white/5 rounded-3xl p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-3 bg-primary/10 text-primary rounded-xl"><FileImage className="w-5 h-5" /></div>
                                        <div className="min-w-0">
                                            <p className="font-bold truncate max-w-[180px]">{job.file.name}</p>
                                            <p className="text-xs text-text-muted">{formatFileSize(job.file.size)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeJob(job.id)} className="p-2 text-text-muted hover:text-red-500 rounded-lg transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {TARGETS.map((t) => (
                                        <button
                                            key={t.key}
                                            onClick={() => patch(job.id, { toFormat: t.key, resultBlob: null, resultUrl: null })}
                                            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                                                job.toFormat === t.key
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white/5 border-white/10 text-text-muted hover:text-text'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {job.toFormat !== 'png' && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                                            <span>Quality</span>
                                            <span className="font-mono">{job.quality}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={30}
                                            max={100}
                                            value={job.quality}
                                            onChange={(e) => patch(job.id, { quality: Number(e.target.value) })}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                )}

                                {job.resultBlob ? (
                                    <div className="space-y-3">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-bold text-emerald-300">{formatFileSize(job.resultBlob.size)}</span>
                                            {job.resultBlob.size < job.file.size ? (
                                                <span className="text-[10px] text-emerald-400/70 ml-auto">
                                                    {Math.round((1 - job.resultBlob.size / job.file.size) * 100)}% smaller
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <img src={job.originalUrl} alt="original" className="w-full h-28 object-contain bg-black/20 rounded-xl" />
                                            <img src={job.resultUrl ?? ''} alt="converted" className="w-full h-28 object-contain bg-black/20 rounded-xl" />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const a = document.createElement('a');
                                                a.href = job.resultUrl!;
                                                a.download = job.file.name.replace(/\.\w+$/, '') + '.' + target.ext;
                                                a.click();
                                            }}
                                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" /> Download {target.label}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => convert(job)}
                                        disabled={job.isProcessing}
                                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {job.isProcessing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Converting...</> : <>Convert to {target.label}</>}
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}
                        className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-text-muted hover:border-primary/50 hover:text-primary transition-all min-h-[200px] space-y-2"
                    >
                        <FileImage className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest">Add more images</span>
                    </button>
                </div>
            )}
        </div>
    );
};