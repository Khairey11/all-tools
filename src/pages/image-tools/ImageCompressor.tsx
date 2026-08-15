import { useState, useEffect } from 'react';
import { DropZone } from '../../components/DropZone';
import { CompressionControls } from '../../components/CompressionControls';
import { ResizeControls } from '../../components/ResizeControls';
import { GifControls } from '../../components/GifControls';
import { BatchImagePreview, ImageItem } from '../../components/BatchImagePreview';
import { compressImage, convertImageFormat, CompressionOptions, defaultOptions } from '../../utils/compression';
import { downloadFile, resizeImage } from '../../utils/format';
import { compressGif, convertGifToWebP, isGif, GifCompressionOptions, defaultGifOptions } from '../../utils/gifCompression';
import toast from 'react-hot-toast';
import { Maximize2, Film, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImageCompressor = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState<ImageItem[]>([]);
    const [options, setOptions] = useState<CompressionOptions>(defaultOptions);
    const [selectedFormat, setSelectedFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
    const [resizeDimensions, setResizeDimensions] = useState<{ width: number; height: number; maintainAspectRatio: boolean } | null>(null);
    const [showResizePanel, setShowResizePanel] = useState(false);
    const [gifOptions, setGifOptions] = useState<GifCompressionOptions>(defaultGifOptions);
    const [shouldConvertGifToWebP, setShouldConvertGifToWebP] = useState(false);
    const [showGifPanel, setShowGifPanel] = useState(false);

    const hasGifs = images.some(img => isGif(img.originalFile));

    const handleFilesSelected = (files: File[]) => {
        const newImages: ImageItem[] = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            originalFile: file,
            compressedFile: null,
            isCompressing: false,
            progress: 0,
            previewUrl: URL.createObjectURL(file),
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const handleRemoveImage = (id: string) => {
        setImages(prev => {
            const image = prev.find(img => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.previewUrl);
            }
            return prev.filter(img => img.id !== id);
        });
    };

    const handleDownloadSingle = (file: File, filename: string) => {
        downloadFile(file, filename);
    };

    const handleReset = () => {
        images.forEach(img => URL.revokeObjectURL(img.previewUrl));
        setImages([]);
    };

    const handleResize = (width: number, height: number, maintainAspectRatio: boolean) => {
        setResizeDimensions({ width, height, maintainAspectRatio });
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                navigator.clipboard.read().then(items => {
                    for (const item of items) {
                        for (const type of item.types) {
                            if (type.startsWith('image/')) {
                                item.getType(type).then(blob => {
                                    const file = new File([blob], `pasted-image-${Date.now()}.png`, { type });
                                    handleFilesSelected([file]);
                                });
                            }
                        }
                    }
                }).catch(() => { });
            }

            if (e.key === 'Escape') {
                setShowResizePanel(false);
                setShowGifPanel(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [showResizePanel, showGifPanel]);

    // Compression Logic
    useEffect(() => {
        const compressImages = async () => {
            for (const image of images) {
                if (image.compressedFile || image.isCompressing) continue;

                setImages(prev => prev.map(img =>
                    img.id === image.id ? { ...img, isCompressing: true, progress: 0 } : img
                ));

                try {
                    let fileToCompress = image.originalFile;
                    let finalFile: File;

                    if (isGif(fileToCompress)) {
                        if (shouldConvertGifToWebP) {
                            finalFile = await convertGifToWebP(fileToCompress, {
                                quality: 0.8,
                                resize: resizeDimensions ? { width: resizeDimensions.width, height: resizeDimensions.height } : undefined
                            });
                        } else {
                            finalFile = await compressGif(
                                fileToCompress,
                                {
                                    ...gifOptions,
                                    resize: resizeDimensions ? { width: resizeDimensions.width, height: resizeDimensions.height } : undefined
                                },
                                (progress) => {
                                    setImages(prev => prev.map(img =>
                                        img.id === image.id ? { ...img, progress } : img
                                    ));
                                }
                            );
                        }
                    } else {
                        if (resizeDimensions) {
                            fileToCompress = await resizeImage(
                                fileToCompress,
                                resizeDimensions.width,
                                resizeDimensions.height,
                                resizeDimensions.maintainAspectRatio
                            );
                        }

                        const compressed = await compressImage(
                            fileToCompress,
                            options,
                            (progress) => {
                                setImages(prev => prev.map(img =>
                                    img.id === image.id ? { ...img, progress } : img
                                ));
                            }
                        );

                        finalFile = compressed;
                        if (selectedFormat !== image.originalFile.type) {
                            finalFile = await convertImageFormat(compressed, selectedFormat, options);
                        }
                    }

                    setImages(prev => prev.map(img =>
                        img.id === image.id
                            ? { ...img, compressedFile: finalFile, isCompressing: false, progress: 100 }
                            : img
                    ));
                } catch (error) {
                    console.error('Compression failed', error);
                    toast.error(
                        isGif(image.originalFile) && !( 'ImageDecoder' in window)
                            ? 'GIF needs Chrome/Edge — animation engine unsupported in this browser'
                            : `Couldn't compress "${image.originalFile.name}"`
                    );
                    setImages(prev => prev.map(img =>
                        img.id === image.id ? { ...img, isCompressing: false, progress: 0 } : img
                    ));
                }
            }
        };

        const timeoutId = setTimeout(compressImages, 300);
        return () => clearTimeout(timeoutId);
    }, [images, options, selectedFormat, resizeDimensions, gifOptions, shouldConvertGifToWebP]);

    useEffect(() => {
        if (images.length > 0) {
            setImages(prev => prev.map(img => ({
                ...img,
                compressedFile: null,
                isCompressing: false,
                progress: 0,
            })));
        }
    }, [options.maxSizeMB, options.maxWidthOrHeight, options.initialQuality, selectedFormat, resizeDimensions, gifOptions, shouldConvertGifToWebP]);

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
                    <h1 className="text-3xl font-black tracking-tight text-text">Image Tools</h1>
                    <p className="text-sm text-text-muted">Compress and resize images locally</p>
                </div>
            </header>

            <main className="space-y-8">
                {images.length === 0 ? (
                    <DropZone onFilesSelected={handleFilesSelected} multiple={true} />
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center flex-wrap gap-3">
                            <h2 className="text-2xl font-bold text-text">
                                Your Images ({images.length})
                            </h2>
                            <div className="flex gap-3 flex-wrap">
                                {hasGifs && (
                                    <button
                                        onClick={() => setShowGifPanel(!showGifPanel)}
                                        className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border flex items-center gap-2 ${showGifPanel
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-white/80 text-text-muted hover:text-text border-secondary hover:border-primary/30'
                                            }`}
                                    >
                                        <Film className="w-4 h-4" />
                                        GIF Options
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowResizePanel(!showResizePanel)}
                                    className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border flex items-center gap-2 ${showResizePanel
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-white/80 text-text-muted hover:text-text border-secondary hover:border-primary/30'
                                        }`}
                                >
                                    <Maximize2 className="w-4 h-4" />
                                    Resize Options
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-red-100"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => document.getElementById('add-more-trigger')?.click()}
                                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                                >
                                    + Add More
                                </button>
                            </div>
                        </div>

                        <input
                            id="add-more-trigger"
                            type="file"
                            multiple
                            accept="image/*,image/gif"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) {
                                    handleFilesSelected(Array.from(e.target.files));
                                    e.target.value = '';
                                }
                            }}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <BatchImagePreview
                                    images={images}
                                    onRemove={handleRemoveImage}
                                    onDownloadSingle={handleDownloadSingle}
                                />
                            </div>

                            <div className="lg:col-span-1">
                                <div className="sticky top-8 space-y-4">
                                    {showResizePanel && (
                                        <ResizeControls
                                            onResize={handleResize}
                                            disabled={images.some(img => img.isCompressing)}
                                        />
                                    )}

                                    {showGifPanel && hasGifs && (
                                        <GifControls
                                            options={gifOptions}
                                            onChange={setGifOptions}
                                            disabled={images.some(img => img.isCompressing)}
                                            convertToWebP={shouldConvertGifToWebP}
                                            onConvertToWebPChange={setShouldConvertGifToWebP}
                                        />
                                    )}

                                    <CompressionControls
                                        options={options}
                                        onChange={setOptions}
                                        disabled={images.some(img => img.isCompressing)}
                                        selectedFormat={selectedFormat}
                                        onFormatChange={setSelectedFormat}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
