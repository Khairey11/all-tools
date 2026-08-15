import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, UploadCloud, Download, RefreshCw, Sparkles, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatFileSize, downloadFile } from '../../utils/format';
import {
 compressGifToSize,
 compressGifManual,
 decodeGifFile,
 gifDecoderSupported,
 type GifCompressResult,
 type DecodedGif,
 type GifStrength,
} from '../../utils/gifEngine';

type Mode = 'target' | 'manual';

interface GifJob {
 id: string;
 original: File;
 result: GifCompressResult | null;
 status: 'ready' | 'queued' | 'working' | 'done' | 'error';
 progress: number;
 label: string;
 error?: string;
 originalUrl: string;
 resultUrl: string | null;
 decoded?: DecodedGif;
}

const TARGET_PRESETS = [
 { label: '500 KB', bytes: 500 * 1024 },
 { label: '1 MB', bytes: 1024 * 1024 },
 { label: '2 MB', bytes: 2 * 1024 * 1024 },
 { label: '5 MB', bytes: 5 * 1024 * 1024 },
 { label: '10 MB', bytes: 10 * 1024 * 1024 },
];

export const GifCompressor = () => {
 const navigate = useNavigate();

 const [jobs, setJobs] = useState<GifJob[]>([]);
 const [mode, setMode] = useState<Mode>('target');
 const [targetBytes, setTargetBytes] = useState(1024 * 1024);
 const [manualColors] = useState(256);
 const [manualScale, setManualScale] = useState(1); // 1 = original
 const [manualLossy, setManualLossy] = useState(60);
 const [strength, setStrength] = useState<GifStrength>('balanced');

 const supportedRef = useRef<boolean>();
 if (supportedRef.current === undefined) {
 supportedRef.current = gifDecoderSupported();
 }
 const mountedRef = useRef(true);
 const inFlightRef = useRef<Set<string>>(new Set());

 useEffect(() => {
 mountedRef.current = true;
 return () => {
 mountedRef.current = false;
 };
 }, []);

 const patchJob = useCallback((id: string, p: Partial<GifJob>) => {
 setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...p } : j)));
 }, []);

 const addFiles = useCallback((files: File[]) => {
 const gifs = files.filter(
 (f) => f.type === 'image/gif' || f.name.toLowerCase().endsWith('.gif')
 );
 if (gifs.length === 0) {
 toast.error('Please select GIF files only.');
 return;
 }
 setJobs((prev) => [
 ...prev,
 ...gifs.map<GifJob>((f) => ({
 id: Math.random().toString(36).slice(2) + Date.now().toString(36),
 original: f,
 result: null,
 status: 'ready',
 progress: 0,
 label: 'Waitingâ€¦',
 originalUrl: URL.createObjectURL(f),
 resultUrl: null,
 })),
 ]);
 }, []);

 const onDrop = useCallback(
 (accepted: File[]) => {
 if (accepted?.length) addFiles(accepted);
 },
 [addFiles]
 );

 const { getRootProps, getInputProps, isDragActive } = useDropzone({
 onDrop,
 accept: { 'image/gif': ['.gif'] },
 multiple: true,
 });

 const removeJob = (id: string) => {
 inFlightRef.current.delete(id);
 setJobs((prev) => {
 const job = prev.find((j) => j.id === id);
 if (job) {
 URL.revokeObjectURL(job.originalUrl);
 if (job.resultUrl) URL.revokeObjectURL(job.resultUrl);
 }
 return prev.filter((j) => j.id !== id);
 });
 };

 const reset = () => {
 inFlightRef.current.clear();
 jobs.forEach((j) => {
 URL.revokeObjectURL(j.originalUrl);
 if (j.resultUrl) URL.revokeObjectURL(j.resultUrl);
 });
 setJobs([]);
 };

 // Run one job all the way to completion. Progress updates only patch
 // state â€” they never cancel the run. (A previous version cancelled
 // itself on every re-render and froze at "Decoding GIFâ€¦".)
 const processJob = useCallback(
 async (jobId: string, original: File, cachedDecoded?: DecodedGif) => {
 const runMode = mode;
 try {
 patchJob(jobId, {
 status: 'working',
 progress: 1,
 label: 'Decoding GIFâ€¦',
 error: undefined,
 });

 let decoded = cachedDecoded;
 if (!decoded) {
 decoded = await decodeGifFile(original, (p) => {
 if (mountedRef.current) {
 patchJob(jobId, {
 progress: Math.max(1, Math.round(p * 0.25)),
 label: `Decoding framesâ€¦ ${p}%`,
 });
 }
 });
 }
 if (!mountedRef.current || !decoded) return;

 patchJob(jobId, { decoded });

 const onProgress = (p: number, label?: string) => {
 if (mountedRef.current) {
 patchJob(jobId, { progress: p, label: label ?? 'Workingâ€¦' });
 }
 };

 let result: GifCompressResult;
 if (runMode === 'target') {
 result = await compressGifToSize(original, targetBytes, {
 preDecoded: decoded,
 onProgress,
 });
 } else {
 result = await compressGifManual(
 original,
 {
 colors: manualColors,
 lossy: manualLossy,
 scale: manualScale,
 },
 { preDecoded: decoded, onProgress }
 );
 }
 if (!mountedRef.current) return;

 if (runMode === 'target' && !result.targetMet) {
 toast(
 `Couldn't reach ${formatFileSize(targetBytes)} for "${original.name}" â€” best result shown (${formatFileSize(result.bytes)}).`,
 { icon: 'âš ï¸' }
 );
 }

 const url = URL.createObjectURL(result.file);
 patchJob(jobId, {
 result,
 status: 'done',
 progress: 100,
 label: 'Done',
 resultUrl: url,
 });
 } catch (err) {
 console.error('GIF compression failed:', err);
 if (mountedRef.current) {
 patchJob(jobId, {
 status: 'error',
 label: 'Failed',
 error: err instanceof Error ? err.message : 'Unknown error',
 });
 }
 } finally {
 inFlightRef.current.delete(jobId);
 }
 },
 [mode, targetBytes, manualColors, manualScale, manualLossy, strength, patchJob]
 );

 // Pick up queued jobs (uploads or Re-compress). The in-flight set
 // prevents duplicate processing when this effect re-runs.
 useEffect(() => {
 const queue = jobs.filter((j) => j.status === 'queued' && !inFlightRef.current.has(j.id));
 for (const job of queue) {
 inFlightRef.current.add(job.id);
 void processJob(job.id, job.original, job.decoded);
 }
 }, [jobs, processJob]);

 const compressAll = () => {
  setJobs((prev) =>
   prev.map((j) => {
    if (j.status !== 'ready') return j;
    if (j.resultUrl) URL.revokeObjectURL(j.resultUrl);
    return {
     ...j,
     result: null,
     resultUrl: null,
     status: 'queued',
     progress: 0,
     label: 'Waiting...',
     error: undefined,
    };
   })
  );
 };
  const rerunAll = () => {
 setJobs((prev) =>
 prev.map((j) => {
 if (j.resultUrl) URL.revokeObjectURL(j.resultUrl);
 return {
 ...j,
 result: null,
 resultUrl: null,
 status: 'ready',
 progress: 0,
 label: 'Waitingâ€¦',
 error: undefined,
 decoded: j.decoded, // reuse decode for speed
 };
 })
 );
 };

 // Auto re-compress when the target size (or manual settings) change.
 // Debounced so dragging the slider doesn't spam re-encodes; decoded
 // frames are reused from job.decoded so re-runs are fast.
 const settingsKey =
 mode === 'target'
 ? `t:${targetBytes}`
 : `m:${manualColors}:${manualScale}:${manualLossy}`;

 const settingsKeyRef = useRef(settingsKey);
 useEffect(() => {
 if (settingsKeyRef.current === settingsKey) return; // no actual change
 settingsKeyRef.current = settingsKey;

 const hasFinished = jobs.some((j) => j.status === 'done' || j.status === 'error');
 if (!hasFinished) return;

 const t = setTimeout(() => {
 setJobs((prev) =>
 prev.map((j) => {
 if (j.status !== 'done' && j.status !== 'error') return j;
 if (j.resultUrl) URL.revokeObjectURL(j.resultUrl);
 return {
 ...j,
 result: null,
 resultUrl: null,
 status: 'ready',
 progress: 0,
 label: 'Re-compressingâ€¦',
 error: undefined,
 };
 })
 );
 }, 500);

 return () => clearTimeout(t);
 }, [settingsKey]);

 const downloadAll = () => {
 const done = jobs.filter((j) => j.status === 'done' && j.result);
 if (!done.length) return;
 done.forEach((j, i) => setTimeout(() => downloadFile(j.result!.file), i * 300));
 };

 const totalOriginal = jobs.reduce((s, j) => s + j.original.size, 0);
 const totalResult = jobs.reduce((s, j) => s + (j.result?.bytes ?? 0), 0);
 const savings =
 totalOriginal > 0 && totalResult > 0
 ? Math.max(0, Math.round((1 - totalResult / totalOriginal) * 100))
 : 0;

 return (
 <div className="space-y-8 py-4 animate-fade-in">
 <header className="flex items-center space-x-4">
 <button
 onClick={() => navigate('/')}
 className="p-3 bg-secondary/50 hover:bg-secondary border border-secondary rounded-2xl transition-all"
 >
 <ArrowLeft className="w-5 h-5 text-text" />
 </button>
 <div>
 <h1 className="text-3xl font-black tracking-tight text-text flex items-center gap-3">
 <Film className="w-8 h-8 text-primary" /> GIF Compressor
 </h1>
 <p className="text-sm text-text-muted">
 Compress heavy animated GIFs to your exact target size â€” 100% in your browser
 </p>
 </div>
 </header>

 {!supportedRef.current && (
 <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm">
 âš ï¸ Your browser doesn't support animated GIF decoding (WebCodecs).
 Please use <strong>Chrome</strong> or <strong>Edge</strong> (version 94 or newer) for GIF compression.
 </div>
 )}

 {jobs.length === 0 ? (
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
 <div
 {...getRootProps()}
 className={clsx(
 'cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all p-12 text-center',
 isDragActive
 ? 'border-primary bg-primary/5'
 : 'border-secondary bg-white hover:border-primary/50 hover:bg-secondary/30'
 )}
 >
 <input {...getInputProps()} />
 <div className="flex flex-col items-center gap-4">
 <div className="p-4 rounded-full bg-secondary text-text-muted">
 <UploadCloud className="w-8 h-8" />
 </div>
 <p className="text-xl font-bold text-text">
 {isDragActive ? 'Drop your GIFs!' : 'Drag & drop animated GIFs'}
 </p>
 <p className="text-sm text-text-muted">or click to browse â€” multiple files supported</p>
 <p className="text-xs text-primary/80 font-bold pt-2">
 âœ¨ Every frame kept / transparency preserved / exact target size
 </p>
 </div>
 </div>
 </motion.div>
 ) : (
 <>
 {/* Settings bar */}
 <div className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 space-y-5">
 <div className="flex flex-wrap items-center gap-3">
 <button
 onClick={() => setMode('target')}
 className={clsx(
 'px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all flex items-center gap-2',
 mode === 'target'
 ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
 : 'bg-white/80 text-text-muted hover:text-text border-secondary'
 )}
 >
 <Target className="w-4 h-4" /> Compress to size
 </button>
 <button
 onClick={() => setMode('manual')}
 className={clsx(
 'px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all flex items-center gap-2',
 mode === 'manual'
 ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
 : 'bg-white/80 text-text-muted hover:text-text border-secondary'
 )}
 >
 <Sparkles className="w-4 h-4" /> Manual quality
 </button>

 <div className="flex-1" />

 <button
  onClick={compressAll}
  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
 >
  <Zap className="w-4 h-4" /> Compress
 </button> <button
 onClick={rerunAll}
 className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border border-secondary bg-white/80 text-text-muted hover:text-text transition-all flex items-center gap-2"
 >
 <RefreshCw className="w-4 h-4" /> Re-compress
 </button>
 <button
 onClick={downloadAll}
 className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
 >
 <Download className="w-4 h-4" /> Download all
 </button>
 <button
 onClick={reset}
 className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-red-100"
 >
 Clear
 </button>
 </div>

 {mode === 'target' && (
 <div className="space-y-3">
 <div className="flex items-center justify-between text-sm">
 <span className="text-text-muted">Target file size</span>
 <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded">
 â‰¤ {formatFileSize(targetBytes)}
 </span>
 </div>
 <div className="flex flex-wrap gap-2">
 {TARGET_PRESETS.map((p) => (
 <button
 key={p.label}
 onClick={() => setTargetBytes(p.bytes)}
 className={clsx(
 'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
 targetBytes === p.bytes
 ? 'bg-primary text-white border-primary'
 : 'bg-white/80 text-text-muted border-secondary hover:text-text'
 )}
 >
 {p.label}
 </button>
 ))}

 <div className="space-y-2">
  <div className="flex items-center justify-between text-sm">
   <span className="text-text-muted">Compression strength</span>
   <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded capitalize">{strength}</span>
  </div>
  <div className="flex flex-wrap gap-2">
   {(['light', 'balanced', 'strong', 'extreme'] as GifStrength[]).map((s) => (
    <button
     key={s}
     onClick={() => setStrength(s)}
     className={clsx(
      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize',
      strength === s
       ? 'bg-primary text-white border-primary'
       : 'bg-white/80 text-text-muted border-secondary hover:text-text'
     )}
    >
     {s}
    </button>
   ))}
  </div>
  <p className="text-xs text-text-muted">
   Colors are always kept at the full 256-color GIF maximum with per-frame palettes - never downgraded. Strength only controls the resolution floor. Every frame is always kept.
  </p>
 </div> </div>
 <input
 type="range"
 min={100 * 1024}
 max={20 * 1024 * 1024}
 step={100 * 1024}
 value={targetBytes}
 onChange={(e) => setTargetBytes(Number(e.target.value))}
 className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
 />
 <p className="text-xs text-text-muted">
 Every frame is always preserved. The engine only trades colors first (invisible), then resolution as little as mathematically needed - the animation stays exactly like the original.
 and stops as soon as the target is met, so quality stays as close to the
 original as possible.
 </p>
 </div>
 )}

 {mode === 'manual' && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-text-muted">Resolution</span>
 <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded">
 {Math.round(manualScale * 100)}%
 </span>
 </div>
 <input
 type="range" min={0.25} max={1} step={0.05}
 value={manualScale}
 onChange={(e) => setManualScale(Number(e.target.value))}
 className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
 />
 <div className="flex justify-between text-xs text-text-muted/40">
 <span>25%</span><span>100%</span>
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-text-muted">Lossy level</span>
 <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded">{manualLossy}</span>
 </div>
 <input
 type="range" min={1} max={200} step={1}
 value={manualLossy}
 onChange={(e) => setManualLossy(Number(e.target.value))}
 className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
 />
 <div className="flex justify-between text-xs text-text-muted/40">
 <span>Best quality</span><span>Smallest</span>
 </div>
 </div>

 <p className="sm:col-span-2 text-xs text-text-muted">
 ðŸ’¡ Changes apply automatically after a short pause â€” no button needed.
 </p>
 </div>
 )}
 </div>

 {/* Results */}
 {savings > 0 && (
 <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl text-sm text-text font-semibold flex items-center gap-3">
 <Sparkles className="w-5 h-5 text-primary" />
 Saved {savings}% overall â€” {formatFileSize(totalOriginal)} â†’{' '}
 {formatFileSize(totalResult)}
 </div>
 )}

 <div className="space-y-4">
 {jobs.map((job) => (
 <div
 key={job.id}
 className="bg-surface/50 border border-white/5 rounded-3xl p-5 space-y-4"
 >
 <div className="flex items-center justify-between gap-3 flex-wrap">
 <div className="min-w-0">
 <p className="font-bold text-text truncate">{job.original.name}</p>
 <p className="text-xs text-text-muted">
 {job.decoded
 ? `${job.decoded.width}Ã—${job.decoded.height} Â· ${job.decoded.frameCountTotal} frames`
 : formatFileSize(job.original.size)}
 </p>
 </div>
 <div className="flex items-center gap-2">
 {job.status === 'done' && job.result && (
 <button
 onClick={() => downloadFile(job.result!.file)}
 className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
 >
 <Download className="w-4 h-4" /> Download
 </button>
 )}
 <button
 onClick={() => removeJob(job.id)}
 className="px-3 py-2 text-text-muted hover:text-red-500 transition-all text-xs font-bold uppercase"
 >
 Remove
 </button>
 </div>
 </div>

 {job.status !== 'done' && (
 <div className="space-y-2">
 <div className="flex justify-between text-xs text-text-muted">
 <span>{job.error ?? job.label}</span>
 <span>{job.progress}%</span>
 </div>
 <div className="h-2 bg-secondary rounded-full overflow-hidden">
 <div
 className={clsx(
 'h-full rounded-full transition-all duration-300',
 job.status === 'error' ? 'bg-red-500' : 'bg-primary'
 )}
 style={{ width: `${job.error ? 100 : job.progress}%` }}
 />
 </div>
 </div>
 )}

 {job.status === 'done' && job.result && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="space-y-2">
 <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
 Original Â· {formatFileSize(job.original.size)}
 </p>
 <img
 src={job.originalUrl}
 alt={job.original.name}
 className="w-full rounded-2xl bg-secondary/50 object-contain max-h-72"
 />
 </div>
 <div className="space-y-2">
 <p className="text-xs font-bold uppercase tracking-widest text-primary">
 Compressed Â· {formatFileSize(job.result.bytes)} (
 {Math.max(
 0,
 Math.round((1 - job.result.bytes / job.original.size) * 100)
 )}
 % smaller)
 {mode === 'target' &&
 (job.result.targetMet ? ' Â· target met âœ“' : ' Â· best effort')}
 {job.result.lossless && ' Â· lossless âš¡'}
 </p>
 <img
 src={job.resultUrl ?? undefined}
 alt="compressed"
 className="w-full rounded-2xl bg-secondary/50 object-contain max-h-72"
 />
 {job.result.passes.length > 1 && (
 <p className="text-xs text-text-muted">
 Tried {job.result.passes.length} quality steps Â· final:{' '}
 {job.result.width}Ã—{job.result.height} Â· kept ~
 {job.result.framesKept}/{job.result.framesTotal} frames
 </p>
 )}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>

 <input
 type="file"
 accept=".gif,image/gif"
 multiple
 className="hidden"
 id="gif-add-more"
 onChange={(e) => {
 if (e.target.files) {
 addFiles(Array.from(e.target.files));
 e.target.value = '';
 }
 }}
 />
 <label
 htmlFor="gif-add-more"
 className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-dashed border-secondary hover:border-primary/50 text-text-muted hover:text-text font-bold text-sm cursor-pointer transition-all"
 >
 <UploadCloud className="w-4 h-4" /> Add more GIFs
 </label>
 </>
 )}
 </div>
 );
};