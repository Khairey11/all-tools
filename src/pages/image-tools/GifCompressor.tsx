import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, UploadCloud, Download, Sparkles, Target, Zap, Lock } from 'lucide-react';
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

const STRENGTHS: GifStrength[] = ['light', 'balanced', 'strong', 'extreme'];

export const GifCompressor = () => {
 const navigate = useNavigate();

 const [jobs, setJobs] = useState<GifJob[]>([]);
 const [mode, setMode] = useState<Mode>('target');
  const [targetBytes, setTargetBytes] = useState(1024 * 1024);
  const [manualLossy, setManualLossy] = useState(0);
  const [strength, setStrength] = useState<GifStrength>('balanced');

  const settingsRef = useRef({ mode, targetBytes, manualLossy, strength });
  settingsRef.current = { mode, targetBytes, manualLossy, strength };

 const supportedRef = useRef<boolean>();
 if (supportedRef.current === undefined) {
  supportedRef.current = gifDecoderSupported();
 }
 const mountedRef = useRef(true);
 const runningRef = useRef(false);

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
    label: 'Ready',
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
  jobs.forEach((j) => {
   URL.revokeObjectURL(j.originalUrl);
   if (j.resultUrl) URL.revokeObjectURL(j.resultUrl);
  });
  setJobs([]);
 };

 const runAll = useCallback(async () => {
  if (runningRef.current) {
   toast('Compression is already running.');
   return;
  }
  const current = jobs.filter((j) => j.status !== 'working');
  if (current.length === 0) return;
  runningRef.current = true;

  const queued = current.map((j) => ({
   ...j,
   result: null,
   resultUrl: null,
   status: 'queued' as const,
   progress: 0,
   label: 'Waiting',
   error: undefined,
  }));
  setJobs(queued);

  for (const job of queued) {
   if (!mountedRef.current) break;
   const s = settingsRef.current;
   try {
    patchJob(job.id, { status: 'working', progress: 1, label: 'Decoding GIF' });

    let decoded = job.decoded;
    if (!decoded) {
     decoded = await decodeGifFile(job.original, (p) => {
      if (mountedRef.current) {
       patchJob(job.id, {
        progress: Math.max(1, Math.round(p * 0.25)),
        label: `Decoding frames ${p}%`,
       });
      }
     });
    }
    if (!mountedRef.current) break;
    patchJob(job.id, { decoded });

    const onProgress = (p: number, label?: string) => {
     if (mountedRef.current) {
      patchJob(job.id, { progress: p, label: label ?? 'Working' });
     }
    };

    const result: GifCompressResult =
     s.mode === 'target'
      ? await compressGifToSize(job.original, s.targetBytes, {
         preDecoded: decoded,
         onProgress,
         strength: s.strength,
        })
       : await compressGifManual(
          job.original,
          {
           colors: 256,
           lossy: s.manualLossy,
          },
          { preDecoded: decoded, onProgress }
         );
    if (!mountedRef.current) break;

    if (s.mode === 'target' && !result.targetMet) {
     toast(
      `Target not reached for "${job.original.name}". Best result: ${formatFileSize(result.bytes)}.`,
      { icon: '⚠️' }
     );
    }

    const url = URL.createObjectURL(result.file);
    patchJob(job.id, {
     result,
     status: 'done',
     progress: 100,
     label: 'Done',
     resultUrl: url,
    });
   } catch (err) {
    if (mountedRef.current) {
     patchJob(job.id, {
      status: 'error',
      label: 'Failed',
      error: err instanceof Error ? err.message : 'Unknown error',
     });
    }
   }
  }

  runningRef.current = false;
 }, [jobs, patchJob]);

 const autoRerunRef = useRef(false);
 useEffect(() => {
  if (jobs.length === 0) return;
  if (!jobs.some((j) => j.status === 'done' || j.status === 'error')) return;
  const t = setTimeout(() => {
   if (autoRerunRef.current) {
    void runAll();
   }
  }, 400);
  return () => clearTimeout(t);
  }, [mode, targetBytes, manualLossy, strength]);

 const markAutoRerun = () => {
  autoRerunRef.current = true;
 };

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
 const hasReady = jobs.some((j) => j.status === 'ready');

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
      Compress animated GIFs in your browser. Every frame, color and timing is preserved.
     </p>
    </div>
   </header>

   {!supportedRef.current && (
    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm">
     This browser does not support animated GIF compression. Please use Chrome or Edge 94 or newer.
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
        {isDragActive ? 'Drop your GIFs' : 'Drag and drop animated GIFs'}
       </p>
       <p className="text-sm text-text-muted">or click to browse. Multiple files supported.</p>
      </div>
     </div>
    </motion.div>
   ) : (
    <>
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
        <Target className="w-4 h-4" /> Target size
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
        <Sparkles className="w-4 h-4" /> Manual settings
       </button>

       <div className="flex-1" />

       <button
        onClick={() => {
         markAutoRerun();
         void runAll();
        }}
        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
       >
        <Zap className="w-4 h-4" /> {hasReady ? 'Compress' : 'Re-compress'}
       </button>
       <button
        onClick={downloadAll}
        className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border border-secondary bg-white/80 text-text-muted hover:text-text transition-all flex items-center gap-2"
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
          {formatFileSize(targetBytes)} or less
         </span>
        </div>
        <div className="flex flex-wrap gap-2">
         {TARGET_PRESETS.map((p) => (
          <button
           key={p.label}
           onClick={() => {
            markAutoRerun();
            setTargetBytes(p.bytes);
           }}
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
        </div>
        <input
         type="range"
         min={100 * 1024}
         max={20 * 1024 * 1024}
         step={100 * 1024}
         value={targetBytes}
         onChange={(e) => {
          markAutoRerun();
          setTargetBytes(Number(e.target.value));
         }}
         className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div className="flex items-center justify-between text-sm pt-2">
         <span className="text-text-muted">Strength</span>
         <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded capitalize">
          {strength}
         </span>
        </div>
        <div className="flex flex-wrap gap-2">
         {STRENGTHS.map((s) => (
          <button
           key={s}
           onClick={() => {
            markAutoRerun();
            setStrength(s);
           }}
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
       </div>
      )}

      {mode === 'manual' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         <div className="space-y-2 rounded-2xl border border-secondary bg-white/40 p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-primary shrink-0" />
          <div>
           <p className="text-sm font-bold text-text">Dimensions always preserved</p>
           <p className="text-xs text-text-muted">
            Width & height are never reduced - compression uses color optimization only.
           </p>
          </div>
         </div>

         <div className="space-y-2">
         <div className="flex justify-between text-sm">
          <span className="text-text-muted">Dithering level</span>
          <span className="text-text font-mono text-xs bg-white/5 px-2 py-1 rounded">
           {manualLossy}
          </span>
         </div>
         <input
          type="range"
          min={0}
          max={200}
          step={1}
          value={manualLossy}
          onChange={(e) => {
           markAutoRerun();
           setManualLossy(Number(e.target.value));
          }}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
         />
         <div className="flex justify-between text-xs text-text-muted/40">
          <span>0</span>
          <span>200</span>
         </div>
        </div>
       </div>
      )}
     </div>

     {savings > 0 && (
      <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl text-sm text-text font-semibold flex items-center gap-3">
       <Sparkles className="w-5 h-5 text-primary" />
       Saved {savings}% overall. {formatFileSize(totalOriginal)} to {formatFileSize(totalResult)}.
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
            ? `${job.decoded.width}x${job.decoded.height} · ${job.decoded.frameCountTotal} frames`
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
            Original · {formatFileSize(job.original.size)}
           </p>
           <img
            src={job.originalUrl}
            alt={job.original.name}
            className="w-full rounded-2xl bg-secondary/50 object-contain max-h-72"
           />
          </div>
          <div className="space-y-2">
           <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Compressed · {formatFileSize(job.result.bytes)} ·{' '}
            {Math.max(
             0,
             Math.round((1 - job.result.bytes / job.original.size) * 100)
            )}
            % smaller
            {mode === 'target' && (job.result.targetMet ? ' · target met' : ' · best effort')}
           </p>
           <img
            src={job.resultUrl ?? undefined}
            alt="compressed"
            className="w-full rounded-2xl bg-secondary/50 object-contain max-h-72"
           />
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