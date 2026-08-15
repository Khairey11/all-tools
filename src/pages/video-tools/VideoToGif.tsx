import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Download, Trash2, RefreshCw, CheckCircle2, Film } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { formatFileSize } from '../../utils/format';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

interface GifJob {
    id: string;
    file: File;
    fileUrl: string;
    duration: number;
    startTime: number;
    clipLength: number;
    width: number;
    fps: number;
    resultBlob: Blob | null;
    resultUrl: string | null;
    isProcessing: boolean;
    progress: number;
}

export const VideoToGif: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<GifJob[]>([]);
    const [engineReady, setEngineReady] = useState(false);
    const [engineLoading, setEngineLoading] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    const loadEngine = async () => {
        if (engineReady || engineLoading) return;
        setEngineLoading(true);
        try {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            const ffmpeg = new FFmpeg();
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            ffmpegRef.current = ffmpeg;
            setEngineReady(true);
        } catch (e) {
            console.error('Failed to load video engine', e);
        } finally {
            setEngineLoading(false);
        }
    };

    useEffect(() => {
        loadEngine();
    }, []);

    const patch = (id: string, p: Partial<GifJob>) =>
        setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...p } : j)));

    const probeDuration = (file: File): Promise<number> =>
        new Promise((resolve) => {
            const el = document.createElement('video');
            el.preload = 'metadata';
            el.onloadedmetadata = () => {
                resolve(el.duration && isFinite(el.duration) ? el.duration : 10);
                URL.revokeObjectURL(el.src);
            };
            el.onerror = () => resolve(10);
            el.src = URL.createObjectURL(file);
        });

    const handleFilesSelected = async (files: File[]) => {
        const vids = files.filter((f) => f.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(f.name));
        if (!vids.length) return;
        const newJobs: GifJob[] = [];
        for (const f of vids) {
            const dur = await probeDuration(f);
            newJobs.push({
                id: Math.random().toString(36).slice(2) + Date.now().toString(36),
                file: f,
                fileUrl: URL.createObjectURL(f),
                duration: dur,
                startTime: 0,
                clipLength: Math.min(5, dur),
                width: 480,
                fps: 15,
                resultBlob: null,
                resultUrl: null,
                isProcessing: false,
                progress: 0,
            });
        }
        setJobs((prev) => [...prev, ...newJobs]);
    };

    const convert = async (job: GifJob) => {
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg) return;
        patch(job.id, { isProcessing: true, progress: 1, resultBlob: null, resultUrl: null });
        try {
            const inputName = 'input' + (job.file.name.match(/\.\w+$/)?.[0] ?? '.mp4').toLowerCase();
            await ffmpeg.writeFile(inputName, await fetchFile(job.file));

            const onProgress = ({ progress: p }: { progress: number }) => {
                patch(job.id, { progress: Math.max(1, Math.round(p * 100)) });
            };
            ffmpeg.on('progress', onProgress);

            // Two-pass palette approach for a good quality/size balance
            await ffmpeg.exec([
                '-ss', job.startTime.toFixed(2),
                '-t', job.clipLength.toFixed(2),
                '-i', inputName,
                '-vf', `fps=${job.fps},scale=${job.width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer`,
                '-loop', '0',
                'output.gif',
            ]);
            ffmpeg.off('progress', onProgress);

            const data = await ffmpeg.readFile('output.gif');
            const blob = new Blob([data as BlobPart], { type: 'image/gif' });
            if (blob.size < 1000) throw new Error('Conversion produced an empty GIF.');

            if (job.resultUrl) URL.revokeObjectURL(job.resultUrl);
            patch(job.id, { resultBlob: blob, resultUrl: URL.createObjectURL(blob), isProcessing: false, progress: 100 });
            try { await ffmpeg.deleteFile(inputName); await ffmpeg.deleteFile('output.gif'); } catch { /* best-effort */ }
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Conversion failed. Try a shorter clip.');
            patch(job.id, { isProcessing: false, progress: 0 });
        }
    };

    const removeJob = (id: string) => {
        setJobs((prev) => {
            const j = prev.find((x) => x.id === id);
            if (j) {
                URL.revokeObjectURL(j.fileUrl);
                if (j.resultUrl) URL.revokeObjectURL(j.resultUrl);
            }
            return prev.filter((x) => x.id !== id);
        });
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/video-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-purple-500">Video to GIF</h1>
                    <p className="text-sm text-text-muted">Turn any video clip into an animated GIF - 100% in your browser</p>
                </div>
            </header>

            {jobs.length === 0 ? (
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <DropZone onFilesSelected={handleFilesSelected} accept={{ 'video/*': ['.mp4', '.mov', '.webm', '.mkv', '.avi'] }} />
                    <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-3xl inline-block">
                        <p className="text-xs text-purple-400 font-medium">100% local - your video never leaves your device.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                    {!engineReady && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-sm text-amber-300 flex items-center gap-3">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {engineLoading ? 'Loading video engine (first use downloads ~30 MB)...' : 'Engine will load when you convert.'}
                        </div>
                    )}
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-surface/50 border border-white/5 rounded-3xl p-6 space-y-5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Film className="w-5 h-5" /></div>
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{job.file.name}</p>
                                        <p className="text-xs text-text-muted">{formatFileSize(job.file.size)} - {job.duration.toFixed(1)}s long</p>
                                    </div>
                                </div>
                                <button onClick={() => removeJob(job.id)} className="p-2 text-text-muted hover:text-red-500 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <video src={job.fileUrl} controls className="w-full rounded-xl bg-black/40 max-h-60" />

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                                        <span>Start</span><span className="font-mono">{job.startTime.toFixed(1)}s</span>
                                    </div>
                                    <input type="range" min={0} max={Math.max(0, job.duration - 1)} step={0.5} value={job.startTime}
                                        disabled={job.isProcessing}
                                        onChange={(e) => {
                                            const v = Number(e.target.value);
                                            patch(job.id, { startTime: v, clipLength: Math.min(job.clipLength, job.duration - v) });
                                        }}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                                        <span>Length</span><span className="font-mono">{job.clipLength.toFixed(1)}s</span>
                                    </div>
                                    <input type="range" min={0.5} max={Math.min(30, job.duration - job.startTime)} step={0.5} value={job.clipLength}
                                        disabled={job.isProcessing}
                                        onChange={(e) => patch(job.id, { clipLength: Number(e.target.value) })}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Width</span>
                                    <select value={job.width} disabled={job.isProcessing} onChange={(e) => patch(job.id, { width: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-text focus:outline-none focus:border-purple-500/50">
                                        <option value={320}>320px</option>
                                        <option value={480}>480px</option>
                                        <option value={640}>640px</option>
                                        <option value={800}>800px</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">FPS</span>
                                    <select value={job.fps} disabled={job.isProcessing} onChange={(e) => patch(job.id, { fps: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-text focus:outline-none focus:border-purple-500/50">
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                        <option value={20}>20</option>
                                        <option value={24}>24</option>
                                    </select>
                                </div>
                            </div>

                            {job.isProcessing && (
                                <div className="space-y-2">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${job.progress}%` }} />
                                    </div>
                                    <p className="text-xs text-text-muted font-mono text-center">Generating GIF... {job.progress}%</p>
                                </div>
                            )}

                            {job.resultBlob ? (
                                <div className="space-y-3">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-300">{formatFileSize(job.resultBlob.size)}</span>
                                    </div>
                                    <img src={job.resultUrl ?? ''} alt="result gif" className="w-full rounded-xl bg-black/40" />
                                    <button onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = job.resultUrl!;
                                        a.download = job.file.name.replace(/\.\w+$/, '') + '.gif';
                                        a.click();
                                    }} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" /> Download GIF
                                    </button>
                                </div>
                            ) : !job.isProcessing ? (
                                <button onClick={() => convert(job)} disabled={!engineReady}
                                    className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Video className="w-4 h-4" /> {engineReady ? 'Create GIF' : 'Loading engine...'}
                                </button>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

async function toBlobURL(url: string, type: string): Promise<string> {
    const resp = await fetch(url);
    const buf = await resp.arrayBuffer();
    return URL.createObjectURL(new Blob([buf], { type }));
}