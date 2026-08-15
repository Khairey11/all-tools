import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Download, Trash2, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { formatFileSize } from '../../utils/format';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

interface VideoJob {
    id: string;
    file: File;
    crf: number;
    scale: 'original' | '1080' | '720' | '480';
    keepAudio: boolean;
    resultBlob: Blob | null;
    resultUrl: string | null;
    isProcessing: boolean;
    progress: number;
}

const scaleFilter = (s: VideoJob['scale']) =>
    s === 'original' ? [] : ['-vf', `scale=-2:${s}`];

export const VideoCompressor: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<VideoJob[]>([]);
    const [engineReady, setEngineReady] = useState(false);
    const [engineLoading, setEngineLoading] = useState(false);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    const loadEngine = async () => {
        if (engineReady || engineLoading) return;
        setEngineLoading(true);
        try {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            const ffmpeg = new FFmpeg();
            ffmpeg.on('log', ({ message }) => console.log('[ffmpeg]', message));
            await ffmpeg.load({
                coreURL: await FFmpegHelper.toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await FFmpegHelper.toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
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

    const patch = (id: string, p: Partial<VideoJob>) =>
        setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...p } : j)));

    const handleFilesSelected = (files: File[]) => {
        const vids = files.filter((f) => f.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(f.name));
        if (!vids.length) return;
        setJobs((prev) => [
            ...prev,
            ...vids.map((f) => ({
                id: Math.random().toString(36).slice(2) + Date.now().toString(36),
                file: f,
                crf: 28,
                scale: 'original' as const,
                keepAudio: true,
                resultBlob: null,
                resultUrl: null,
                isProcessing: false,
                progress: 0,
            })),
        ]);
    };

    const compress = async (job: VideoJob) => {
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

            const args = [
                '-i', inputName,
                '-c:v', 'libx264',
                '-crf', String(job.crf),
                '-preset', 'fast',
                '-movflags', '+faststart',
                ...scaleFilter(job.scale),
                ...(job.keepAudio ? ['-c:a', 'aac', '-b:a', '96k'] : ['-an']),
                'output.mp4',
            ];
            await ffmpeg.exec(args);
            ffmpeg.off('progress', onProgress);

            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
            if (blob.size < 1000) throw new Error('Compression produced an empty file.');

            if (job.resultUrl) URL.revokeObjectURL(job.resultUrl);
            patch(job.id, { resultBlob: blob, resultUrl: URL.createObjectURL(blob), isProcessing: false, progress: 100 });
            try { await ffmpeg.deleteFile(inputName); await ffmpeg.deleteFile('output.mp4'); } catch { /* cleanup best-effort */ }
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Compression failed. Try a smaller file.');
            patch(job.id, { isProcessing: false, progress: 0 });
        }
    };

    const removeJob = (id: string) => {
        setJobs((prev) => {
            const j = prev.find((x) => x.id === id);
            if (j?.resultUrl) URL.revokeObjectURL(j.resultUrl);
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
                    <h1 className="text-3xl font-black tracking-tight text-purple-500">Video Compressor</h1>
                    <p className="text-sm text-text-muted">Compress videos right in your browser - nothing is uploaded</p>
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
                            {engineLoading ? 'Loading video engine (first use downloads ~30 MB)...' : 'Engine will load when you compress.'}
                        </div>
                    )}
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-surface/50 border border-white/5 rounded-3xl p-6 space-y-5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Video className="w-5 h-5" /></div>
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{job.file.name}</p>
                                        <p className="text-xs text-text-muted">{formatFileSize(job.file.size)}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeJob(job.id)} className="p-2 text-text-muted hover:text-red-500 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                                        <span>Quality</span>
                                        <span className="font-mono">CRF {job.crf}</span>
                                    </div>
                                    <input type="range" min={23} max={35} value={job.crf} disabled={job.isProcessing}
                                        onChange={(e) => patch(job.id, { crf: Number(e.target.value) })}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                                    <p className="text-[10px] text-text-muted">{job.crf <= 26 ? 'High quality' : job.crf <= 30 ? 'Balanced' : 'Smallest size'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Resolution</span>
                                    <select value={job.scale} disabled={job.isProcessing} onChange={(e) => patch(job.id, { scale: e.target.value as VideoJob['scale'] })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-text focus:outline-none focus:border-purple-500/50">
                                        <option value="original">Keep original</option>
                                        <option value="1080">1080p</option>
                                        <option value="720">720p</option>
                                        <option value="480">480p</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Audio</span>
                                    <button onClick={() => patch(job.id, { keepAudio: !job.keepAudio })} disabled={job.isProcessing}
                                        className={`w-full py-2.5 rounded-xl text-xs font-black border transition-all ${job.keepAudio ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-white/5 text-text-muted border-white/10'}`}>
                                        {job.keepAudio ? 'Keep audio' : 'Remove audio'}
                                    </button>
                                </div>
                            </div>

                            {job.isProcessing && (
                                <div className="space-y-2">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${job.progress}%` }} />
                                    </div>
                                    <p className="text-xs text-text-muted font-mono text-center">Compressing... {job.progress}% (large files take a while)</p>
                                </div>
                            )}

                            {job.resultBlob ? (
                                <div className="space-y-3">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-300">{formatFileSize(job.resultBlob.size)}</span>
                                        <span className="text-[10px] text-emerald-400/70 ml-auto">
                                            {Math.max(0, Math.round((1 - job.resultBlob.size / job.file.size) * 100))}% smaller
                                        </span>
                                    </div>
                                    <video src={job.resultUrl ?? ''} controls className="w-full rounded-xl bg-black/40 max-h-72" />
                                    <button onClick={() => {
                                        const a = document.createElement('a');
                                        a.href = job.resultUrl!;
                                        a.download = job.file.name.replace(/\.\w+$/, '') + '-compressed.mp4';
                                        a.click();
                                    }} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" /> Download MP4
                                    </button>
                                </div>
                            ) : !job.isProcessing ? (
                                <button onClick={() => compress(job)} disabled={!engineReady}
                                    className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Zap className="w-4 h-4" /> {engineReady ? 'Compress Video' : 'Loading engine...'}
                                </button>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/** Loads the wasm engine into a blob URL to avoid cross-origin worker issues. */
const FFmpegHelper = {
    async toBlobURL(url: string, type: string): Promise<string> {
        const resp = await fetch(url);
        const buf = await resp.arrayBuffer();
        return URL.createObjectURL(new Blob([buf], { type }));
    },
};