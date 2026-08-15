import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Type,
    Image as ImageIcon,
    Download,
    Trash2,
    RotateCcw,
    Move,
    Layout,
    Loader2,
    CheckCircle2,
    Files,
    Plus,
    Sparkles,
    Settings2,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropZone } from '../../components/DropZone';
import { clsx } from 'clsx';
import JSZip from 'jszip';
import { AdBanner } from '../../components/AdBanner';

interface WatermarkSettings {
    type: 'text' | 'image';
    text: string;
    fontSize: number;
    color: string;
    opacity: number;
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
    x: number;
    y: number;
    rotation: number;
    scale: number;
}

interface ProcessedFile {
    name: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    originalFile: File;
    preview?: string;
}

export const WatermarkAdder: React.FC = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processProgress, setProcessProgress] = useState(0);
    const [processedZip, setProcessedZip] = useState<Blob | null>(null);
    const [settings, setSettings] = useState<WatermarkSettings>({
        type: 'text',
        text: 'OptiPik Watermark',
        fontSize: 48,
        color: '#ffffff',
        opacity: 0.5,
        position: 'center',
        x: 50,
        y: 50,
        rotation: 0,
        scale: 0.2
    });

    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    const handleFilesSelected = (selectedFiles: File[]) => {
        const newFiles = selectedFiles.map(file => ({
            name: file.name,
            status: 'pending' as const,
            originalFile: file
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleWatermarkSelected = (files: File[]) => {
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setWatermarkImage(e.target?.result as string);
                setSettings(prev => ({ ...prev, type: 'image' }));
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const processImage = (file: File, watermarkImg: string | null, sets: WatermarkSettings): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            // Use FileReader to avoid CORS-tainted canvas issues
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) { reject('No 2d context'); return; }

                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    ctx.save();
                    ctx.globalAlpha = sets.opacity;

                    const mimeType = ['image/png', 'image/webp'].includes(file.type) ? file.type : 'image/jpeg';
                    const finalize = () => {
                        canvas.toBlob((blob) => {
                            if (blob) resolve(blob);
                            else reject('canvas.toBlob returned null');
                        }, mimeType, 1.0);
                    };

                    let drawX = 0, drawY = 0;

                    const minDim = Math.min(canvas.width, canvas.height);
                    const scaleFactor = Math.max(0.1, minDim / 1080);
                    const margin = 40 * scaleFactor;

                    if (sets.type === 'text') {
                        const actualFontSize = sets.fontSize * scaleFactor;
                        ctx.font = `bold ${actualFontSize}px Outfit, sans-serif`;
                        ctx.fillStyle = sets.color;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const metrics = ctx.measureText(sets.text);
                        const textWidth = metrics.width;
                        const textHeight = actualFontSize;
                        switch (sets.position) {
                            case 'center': drawX = canvas.width / 2; drawY = canvas.height / 2; break;
                            case 'top-left': drawX = textWidth / 2 + margin; drawY = textHeight / 2 + margin; break;
                            case 'top-right': drawX = canvas.width - textWidth / 2 - margin; drawY = textHeight / 2 + margin; break;
                            case 'bottom-left': drawX = textWidth / 2 + margin; drawY = canvas.height - textHeight / 2 - margin; break;
                            case 'bottom-right': drawX = canvas.width - textWidth / 2 - margin; drawY = canvas.height - textHeight / 2 - margin; break;
                            case 'custom': drawX = (sets.x / 100) * canvas.width; drawY = (sets.y / 100) * canvas.height; break;
                        }
                        ctx.translate(drawX, drawY);
                        ctx.rotate((sets.rotation * Math.PI) / 180);
                        ctx.fillText(sets.text, 0, 0);
                        ctx.restore();
                        finalize();

                    } else if (sets.type === 'image' && watermarkImg) {
                        const wImg = new Image();
                        wImg.onload = () => {
                            const wWidth = minDim * sets.scale;
                            const wHeight = (wImg.height / wImg.width) * wWidth;
                            switch (sets.position) {
                                case 'center': drawX = canvas.width / 2 - wWidth / 2; drawY = canvas.height / 2 - wHeight / 2; break;
                                case 'top-left': drawX = margin; drawY = margin; break;
                                case 'top-right': drawX = canvas.width - wWidth - margin; drawY = margin; break;
                                case 'bottom-left': drawX = margin; drawY = canvas.height - wHeight - margin; break;
                                case 'bottom-right': drawX = canvas.width - wWidth - margin; drawY = canvas.height - wHeight - margin; break;
                                case 'custom': drawX = (sets.x / 100) * canvas.width - wWidth / 2; drawY = (sets.y / 100) * canvas.height - wHeight / 2; break;
                            }
                            ctx.translate(drawX + wWidth / 2, drawY + wHeight / 2);
                            ctx.rotate((sets.rotation * Math.PI) / 180);
                            ctx.drawImage(wImg, -wWidth / 2, -wHeight / 2, wWidth, wHeight);
                            ctx.restore();
                            finalize();
                        };
                        wImg.onerror = () => reject('Watermark image failed to load');
                        wImg.src = watermarkImg;
                    } else {
                        // No watermark image selected — just export the original
                        ctx.restore();
                        finalize();
                    }
                };
                img.onerror = () => reject('Source image failed to load');
                img.src = readerEvent.target?.result as string;
            };
            reader.onerror = () => reject('FileReader error');
            reader.readAsDataURL(file);
        });
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleDownload = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setProcessProgress(0);
        setProcessedZip(null);

        if (files.length === 1) {
            try {
                const blob = await processImage(files[0].originalFile, watermarkImage, settings);
                triggerDownload(blob, files[0].name);
            } catch (e) { console.error('Single download error:', e); }
            setIsProcessing(false);
        } else {
            // Bulk ZIP
            try {
                const zip = new JSZip();
                for (let i = 0; i < files.length; i++) {
                    setFiles(prev => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], status: 'processing' };
                        return updated;
                    });
                    try {
                        const blob = await processImage(files[i].originalFile, watermarkImage, settings);
                        zip.file(files[i].name, blob);
                        setFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], status: 'done' };
                            return updated;
                        });
                    } catch (e) {
                        console.error('Processing error for file', files[i].name, e);
                        setFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], status: 'error' };
                            return updated;
                        });
                    }
                    // We only use 0-90% for the image processing phase
                    setProcessProgress(Math.round(((i + 1) / files.length) * 90));
                }
                
                // Final 10% is generation of zip
                const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
                    const zipPercent = metadata.percent;
                    // Map 0-100% of zip to 90-100% of overall process
                    setProcessProgress(90 + Math.round(zipPercent * 0.1));
                });
                setProcessedZip(content);
                // Auto-trigger download immediately
                triggerDownload(content, `optipik_watermarked_${new Date().getTime()}.zip`);
            } catch (error) {
                console.error('Bulk ZIP generation error:', error);
                alert("Failed to create ZIP file. It may be too large. Try a smaller batch.");
            } finally {
                setIsProcessing(false);
                setProcessProgress(0);
            }
        }
    };

    const handleZipDownload = () => {
        if (!processedZip) return;
        const url = URL.createObjectURL(processedZip);
        const link = document.createElement('a');
        link.href = url;
        link.download = `optipik_studio_${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const updatePreview = useCallback(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas || files.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const previewIndex = activePreviewIndex < files.length ? activePreviewIndex : 0;
        const img = new Image();
        img.src = URL.createObjectURL(files[previewIndex].originalFile);
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            ctx.save();
            ctx.globalAlpha = settings.opacity;

            const minDim = Math.min(canvas.width, canvas.height);
            const scaleFactor = Math.max(0.1, minDim / 1080);
            const margin = 40 * scaleFactor;

            if (settings.type === 'text') {
                const actualFontSize = settings.fontSize * scaleFactor;
                ctx.font = `black ${actualFontSize}px Outfit, sans-serif`;
                ctx.fillStyle = settings.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const metrics = ctx.measureText(settings.text);
                const textWidth = metrics.width;
                const textHeight = actualFontSize;

                let drawX = 0, drawY = 0;
                switch (settings.position) {
                    case 'center': drawX = canvas.width / 2; drawY = canvas.height / 2; break;
                    case 'top-left': drawX = textWidth / 2 + margin; drawY = textHeight / 2 + margin; break;
                    case 'top-right': drawX = canvas.width - textWidth / 2 - margin; drawY = textHeight / 2 + margin; break;
                    case 'bottom-left': drawX = textWidth / 2 + margin; drawY = canvas.height - textHeight / 2 - margin; break;
                    case 'bottom-right': drawX = canvas.width - textWidth / 2 - margin; drawY = canvas.height - textHeight / 2 - margin; break;
                    case 'custom': drawX = (settings.x / 100) * canvas.width; drawY = (settings.y / 100) * canvas.height; break;
                }
                ctx.translate(drawX, drawY);
                ctx.rotate((settings.rotation * Math.PI) / 180);
                ctx.fillText(settings.text, 0, 0);
                ctx.restore();
            } else if (settings.type === 'image' && watermarkImage) {
                const wImg = new Image();
                wImg.src = watermarkImage;
                wImg.onload = () => {
                    const wWidth = minDim * settings.scale;
                    const wHeight = (wImg.height / wImg.width) * wWidth;
                    let drawX = 0, drawY = 0;
                    switch (settings.position) {
                        case 'center': drawX = canvas.width / 2 - wWidth / 2; drawY = canvas.height / 2 - wHeight / 2; break;
                        case 'top-left': drawX = margin; drawY = margin; break;
                        case 'top-right': drawX = canvas.width - wWidth - margin; drawY = margin; break;
                        case 'bottom-left': drawX = margin; drawY = canvas.height - wHeight - margin; break;
                        case 'bottom-right': drawX = canvas.width - wWidth - margin; drawY = canvas.height - wHeight - margin; break;
                        case 'custom': drawX = (settings.x / 100) * canvas.width - wWidth / 2; drawY = (settings.y / 100) * canvas.height - wHeight / 2; break;
                    }
                    ctx.translate(drawX + wWidth / 2, drawY + wHeight / 2);
                    ctx.rotate((settings.rotation * Math.PI) / 180);
                    ctx.drawImage(wImg, -wWidth / 2, -wHeight / 2, wWidth, wHeight);
                    ctx.restore();
                };
            }
        };
    }, [files, watermarkImage, settings, activePreviewIndex]);

    useEffect(() => {
        if (files.length > 0) updatePreview();
    }, [updatePreview, files]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-6 animate-fade-in text-text">
            {/* Premium Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <motion.button
                        whileHover={{ scale: 1.05, x: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/category/image-tools')}
                        className="p-4 bg-white/80 hover:bg-white border border-secondary luxury-shadow rounded-[2rem] transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 text-text" />
                    </motion.button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-black tracking-tight text-gradient">Watermark Adder</h1>
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Batch Engine</span>
                            <button
                                onClick={() => document.getElementById('header-add-bulk')?.click()}
                                className="flex items-center gap-2 px-4 py-1.5 bg-white border border-secondary luxury-shadow rounded-full text-[10px] font-black uppercase tracking-widest text-text hover:bg-secondary/20 transition-all ml-2 group"
                            >
                                <Plus className="w-3 h-3 text-primary group-hover:scale-125 transition-transform" />
                                Add More Images
                                <input id="header-add-bulk" type="file" multiple className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))} />
                            </button>
                        </div>
                        <p className="text-sm text-text-muted font-medium flex items-center gap-2">
                            Securely brand your assets with text or logo overlays
                        </p>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="flex items-center gap-3">
                        {/* Primary action button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                            onClick={handleDownload}
                            disabled={isProcessing}
                            className="flex items-center justify-center space-x-3 px-8 py-4 bg-primary text-white font-black rounded-[2rem] hover:bg-primary-hover disabled:opacity-60 transition-all shadow-2xl shadow-primary/20"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing {processProgress}%</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    <span>{files.length === 1 ? 'Download Branded Image' : `Batch Process ${files.length} Assets`}</span>
                                </>
                            )}
                        </motion.button>

                        {/* ZIP download button — shown after bulk processing completes */}
                        {processedZip && !isProcessing && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleZipDownload}
                                className="flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-500 text-white font-black rounded-[2rem] hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/30"
                            >
                                <Download className="w-5 h-5" />
                                <span>Download ZIP</span>
                            </motion.button>
                        )}
                    </div>
                )}
            </header>

            {!files.length ? (
                <div className="w-full">
                    <DropZone onFilesSelected={handleFilesSelected} multiple={true} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Visual Preview (Centerpiece) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="glass-card rounded-[3.5rem] p-6 luxury-shadow overflow-hidden relative group">
                            <div className="absolute top-10 left-10 z-20 flex items-center gap-3">
                                <span className="px-4 py-2 bg-black/70 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10 flex items-center gap-2">
                                    <Eye className="w-3 h-3" />
                                    Preview: {files[activePreviewIndex < files.length ? activePreviewIndex : 0]?.name || 'Master'}
                                </span>
                                {files.length > 1 && (
                                    <span className="px-4 py-2 bg-primary/80 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                        {activePreviewIndex + 1} of {files.length}
                                    </span>
                                )}
                            </div>

                            {/* Navigation Arrows */}
                            {files.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setActivePreviewIndex(prev => Math.max(0, prev - 1))}
                                        disabled={activePreviewIndex === 0}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur shadow-2xl rounded-full text-primary hover:bg-white hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all group"
                                    >
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                    <button 
                                        onClick={() => setActivePreviewIndex(prev => Math.min(files.length - 1, prev + 1))}
                                        disabled={activePreviewIndex === files.length - 1}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur shadow-2xl rounded-full text-primary hover:bg-white hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all group"
                                    >
                                        <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </>
                            )}

                            <div className="relative rounded-[2.5rem] bg-secondary/20 overflow-hidden flex items-center justify-center min-h-[500px]">
                                <canvas
                                    ref={previewCanvasRef}
                                    className="max-w-full h-auto rounded-[1.5rem] shadow-2xl"
                                />
                            </div>
                        </div>

                        {/* Queue Management Card */}
                        {files.length > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-8 rounded-[3rem] luxury-shadow"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                                        <Files className="w-4 h-4 text-primary" />
                                        Processing Queue
                                    </h3>
                                    <button
                                        onClick={() => { setFiles([]); setActivePreviewIndex(0); }}
                                        className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors underline underline-offset-4"
                                    >
                                        Clear Master List
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                                    {files.map((file, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => setActivePreviewIndex(idx)}
                                            className={clsx(
                                                "border transition-all cursor-pointer rounded-2xl p-4 flex items-center justify-between group",
                                                activePreviewIndex === idx ? "bg-white border-primary shadow-lg scale-[1.02]" : "bg-secondary/20 border-secondary/30 hover:bg-white"
                                            )}
                                        >
                                            <div className="flex items-center space-x-3 truncate">
                                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary/50 group-hover:text-primary transition-colors">
                                                    <ImageIcon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold truncate">{file.name}</span>
                                            </div>
                                            {file.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : file.status === 'processing' ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : null}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => document.getElementById('add-bulk')?.click()}
                                        className="border-2 border-dashed border-secondary hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-4 flex items-center justify-center text-text-muted hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest"
                                    >
                                        + Add More
                                        <input id="add-bulk" type="file" multiple className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Branding Controls (Right Sidebar) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card p-8 rounded-[3.5rem] luxury-shadow space-y-8 sticky top-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                                    <Settings2 className="w-4 h-4" />
                                    Branding Config
                                </h3>
                                <button onClick={() => setSettings({ ...settings, rotation: 0, x: 50, y: 50, opacity: 0.5, scale: 0.2 })} className="p-2 bg-secondary rounded-xl text-text-muted hover:text-primary transition-all"><RotateCcw className="w-4 h-4" /></button>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex p-1.5 bg-secondary/50 rounded-2xl">
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, type: 'text' }))}
                                    className={clsx(
                                        "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2",
                                        settings.type === 'text' ? "bg-white text-primary shadow-xl" : "text-text-muted hover:text-text"
                                    )}
                                >
                                    <Type className="w-4 h-4" />
                                    <span>Typography</span>
                                </button>
                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, type: 'image' }))}
                                    className={clsx(
                                        "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2",
                                        settings.type === 'image' ? "bg-white text-primary shadow-xl" : "text-text-muted hover:text-text"
                                    )}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Logo / SVG</span>
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {settings.type === 'text' ? (
                                    <motion.div key="text" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-4">Brand Message</label>
                                            <input
                                                type="text"
                                                value={settings.text}
                                                onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                                                className="w-full bg-secondary/30 border border-secondary/50 rounded-2xl p-5 font-bold focus:border-primary/50 focus:outline-none transition-all placeholder:text-text-muted/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-4">Size</label>
                                                <input
                                                    type="number"
                                                    value={settings.fontSize}
                                                    onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                                    className="w-full bg-secondary/30 border border-secondary/50 rounded-2xl p-5 font-bold focus:border-primary/50 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-4">Hex Color</label>
                                                <div className="relative h-[66px]">
                                                    <input
                                                        type="color"
                                                        value={settings.color}
                                                        onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div
                                                        className="w-full h-full rounded-2xl border border-secondary/50 flex items-center justify-center font-bold text-xs shadow-inner"
                                                        style={{ backgroundColor: settings.color, color: parseInt(settings.color.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff' }}
                                                    >
                                                        {settings.color.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="image" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                        {!watermarkImage ? (
                                            <div className="border-2 border-dashed border-secondary rounded-[2rem] p-10 text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-all">
                                                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto">
                                                    <ImageIcon className="w-8 h-8 text-text-muted" />
                                                </div>
                                                <label className="cursor-pointer block">
                                                    <span className="text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-8">Import Brand Asset</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleWatermarkSelected(Array.from(e.target.files))} />
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="relative group rounded-[2rem] bg-secondary/30 border border-secondary/50 p-6">
                                                    <img src={watermarkImage} className="w-full h-32 object-contain" alt="logo" />
                                                    <button onClick={() => setWatermarkImage(null)} className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                                <div className="space-y-3 px-4">
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                                                        <span>Scale Asset</span>
                                                        <span>{Math.round(settings.scale * 100)}%</span>
                                                    </div>
                                                    <input type="range" min="0.05" max="1" step="0.01" value={settings.scale} onChange={(e) => setSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))} className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-8 border-t border-secondary pt-8">
                                <div className="space-y-3 px-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <span>Master Opacity</span>
                                        <span>{Math.round(settings.opacity * 100)}%</span>
                                    </div>
                                    <input type="range" min="0" max="1" step="0.01" value={settings.opacity} onChange={(e) => setSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))} className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-4">Anchor Point</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right', 'custom'] as const).map((pos) => (
                                            <button
                                                key={pos}
                                                onClick={() => setSettings(prev => ({ ...prev, position: pos }))}
                                                className={clsx(
                                                    "py-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-2 relative overflow-hidden",
                                                    settings.position === pos
                                                        ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20"
                                                        : "bg-secondary/30 border-transparent text-text-muted hover:border-secondary hover:text-text"
                                                )}
                                            >
                                                {pos === 'custom' ? <Move className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                                                <span className="text-[8px] font-black uppercase tracking-tighter">{pos.replace('-', ' ')}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {settings.position === 'custom' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-black uppercase text-text-muted px-2"><span>X</span><span>{settings.x}%</span></div>
                                            <input type="range" min="0" max="100" value={settings.x} onChange={(e) => setSettings(prev => ({ ...prev, x: parseInt(e.target.value) }))} className="w-full accent-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-black uppercase text-text-muted px-2"><span>Y</span><span>{settings.y}%</span></div>
                                            <input type="range" min="0" max="100" value={settings.y} onChange={(e) => setSettings(prev => ({ ...prev, y: parseInt(e.target.value) }))} className="w-full accent-primary" />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="space-y-3 px-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <span>Rotation Angle</span>
                                        <span>{settings.rotation}°</span>
                                    </div>
                                    <input type="range" min="-180" max="180" value={settings.rotation} onChange={(e) => setSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))} className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setFiles([]); setActivePreviewIndex(0); }}
                                className="w-full py-5 border-2 border-dashed border-red-100 text-red-400 font-black rounded-3xl hover:bg-red-50 hover:border-red-200 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Reset Project</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            )}
            {/* Ad Banner Footer */}
            <AdBanner slot="tool-footer-ad" className="max-w-4xl mx-auto mt-12" />
        </div>
    );
};
