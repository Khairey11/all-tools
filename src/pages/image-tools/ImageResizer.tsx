import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize2, Download, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { formatFileSize } from '../../utils/format';

interface ResizeJob {
    id: string;
    file: File;
    originalUrl: string;
    resultBlob: Blob | null;
    resultUrl: string | null;
    outW: number;
    outH: number;
    srcW: number;
    srcH: number;
    lockAspect: boolean;
    isProcessing: boolean;
}

const PRESETS = [
    { label: 'Instagram Post', w: 1080, h: 1080 },
    { label: 'Instagram Story', w: 1080, h: 1920 },
    { label: 'Facebook Cover', w: 820, h: 312 },
    { label: 'Twitter Header', w: 1500, h: 500 },
    { label: 'YouTube Thumb', w: 1280, h: 720 },
    { label: 'HD 1920x1080', w: 1920, h: 1080 },
    { label: 'Half Size', w: 0, h: 0 },
];

export const ImageResizer: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<ResizeJob[]>([]);

    const handleFilesSelected = async (files: File[]) => {
        const imgs = files.filter((f) => f.type.startsWith('image/'));
        if (!imgs.length) return;
        const newJobs: ResizeJob[] = [];
        for (const f of imgs) {
            const url = URL.createObjectURL(f);
            const dims = await new Promise<{ w: number; h: number }>((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
                img.onerror = () => resolve({ w: 0, h: 0 });
                img.src = url;
            });
            if (dims.w === 0) {
                URL.revokeObjectURL(url);
                continue;
            }
            newJobs.push({
                id: Math.random().toString(36).slice(2) + Date.now().toString(36),
                file: f,
                originalUrl: url,
                resultBlob: null,
                resultUrl: null,
                outW: dims.w,
                outH: dims.h,
                srcW: dims.w,
                srcH: dims.h,
                lockAspect: true,
                isProcessing: false,
            });
        }
        setJobs((prev) => [...prev, ...newJobs]);
    };

    const patch = (id: string, p: Partial<ResizeJob>) =>
        setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...p } : j)));

    const setWidth = (j: ResizeJob, w: number) => {
        const val = Math.max(1, Math.min(8000, Math.round(w) || 1));
        patch(j.id, j.lockAspect ? { outW: val, outH: Math.round((val * j.srcH) / j.srcW) } : { outW: val });
    };

    const setHeight = (j: ResizeJob, h: number) => {
        const val = Math.max(1, Math.min(8000, Math.round(h) || 1));
        patch(j.id, j.lockAspect ? { outH: val, outW: Math.round((val * j.srcW) / j.srcH) } : { outH: val });
    };

    const applyPreset = (j: ResizeJob, p: { w: number; h: number }) => {
        if (p.w === 0) {
            patch(j.id, { outW: Math.round(j.srcW / 2), outH: Math.round(j.srcH / 2) });
        } else {
            patch(j.id, { outW: p.w, outH: p.h, lockAspect: false });
        }
    };

    const runResize = async (job: ResizeJob) => {
        patch(job.id, { isProcessing: true });
        try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = () => reject(new Error('Could not load image.'));
                el.src = job.originalUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = job.outW;
            canvas.height = job.outH;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported.');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, job.outW, job.outH);

            const isPng = job.file.type === 'image/png';
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => (b ? resolve(b) : reject(new Error('Export failed.'))),
                    isPng ? 'image/png' : 'image/jpeg',
                    0.92
                );
            });

            if (job.resultUrl) URL.revokeObjectURL(job.resultUrl);
            patch(job.id, { resultBlob: blob, resultUrl: URL.createObjectURL(blob), isProcessing: false });
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Resize failed.');
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
                    <h1 className="text-3xl font-black tracking-tight text-primary">Resize Image</h1>
                    <p className="text-sm text-text-muted">Resize to exact dimensions for social media and web</p>
                </div>
            </header>

            {jobs.length === 0 ? (
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <DropZone onFilesSelected={handleFilesSelected} multiple accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }} />
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl inline-block">
                        <p className="text-xs text-primary font-medium">100% local - your images never leave the browser.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-surface/50 border border-white/5 rounded-3xl p-6 space-y-5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Maximize2 className="w-5 h-5" /></div>
                                    <div className="min-w-0">
                                        <p className="font-bold truncate max-w-[200px]">{job.file.name}</p>
                                        <p className="text-xs text-text-muted">{job.srcW} x {job.srcH} - {formatFileSize(job.file.size)}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeJob(job.id)} className="p-2 text-text-muted hover:text-red-500 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {PRESETS.map((p) => (
                                    <button
                                        key={p.label}
                                        onClick={() => applyPreset(job, p)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                            job.outW === p.w && job.outH === p.h
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white/5 border-white/10 text-text-muted hover:text-text'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-end gap-3">
                                <label className="flex-1 space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Width</span>
                                    <input
                                        type="number"
                                        value={job.outW}
                                        onChange={(e) => setWidth(job, Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-text focus:border-primary/50 focus:outline-none"
                                    />
                                </label>
                                <button
                                    onClick={() => patch(job.id, { lockAspect: !job.lockAspect })}
                                    title="Lock aspect ratio"
                                    className={`px-4 py-3 rounded-xl font-black text-sm border transition-all ${
                                        job.lockAspect ? 'bg-primary/20 text-primary border-primary/40' : 'bg-white/5 text-text-muted border-white/10'
                                    }`}
                                >
                                    {job.lockAspect ? 'Locked' : 'Free'}
                                </button>
                                <label className="flex-1 space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Height</span>
                                    <input
                                        type="number"
                                        value={job.outH}
                                        onChange={(e) => setHeight(job, Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-text focus:border-primary/50 focus:outline-none"
                                    />
                                </label>
                            </div>

                            {job.resultBlob ? (
                                <div className="space-y-3">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-300">
                                            {job.outW} x {job.outH} - {formatFileSize(job.resultBlob.size)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <img src={job.originalUrl} alt="original" className="w-full h-32 object-contain bg-black/20 rounded-xl" />
                                        <img src={job.resultUrl ?? ''} alt="resized" className="w-full h-32 object-contain bg-black/20 rounded-xl" />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const a = document.createElement('a');
                                            a.href = job.resultUrl!;
                                            a.download = job.file.name.replace(/\.\w+$/, '') + `-${job.outW}x${job.outH}.` + (job.file.type === 'image/png' ? 'png' : 'jpg');
                                            a.click();
                                        }}
                                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => runResize(job)}
                                    disabled={job.isProcessing}
                                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {job.isProcessing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Resizing...</> : <><Maximize2 className="w-4 h-4" /> Resize</>}
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}
                        className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-text-muted hover:border-primary/50 hover:text-primary transition-all min-h-[200px] space-y-2"
                    >
                        <Maximize2 className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest">Add more images</span>
                    </button>
                </div>
            )}
        </div>
    );
};