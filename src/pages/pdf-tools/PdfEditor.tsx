import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Save, RotateCw, Trash2, Undo,
    Type, Image as ImageIcon, X, Eraser, Move, MousePointer
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { DropZone } from '../../components/DropZone';
import { AdBanner } from '../../components/AdBanner';

// PDF.js v3 Setup
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PageThumbnail {
    pageIndex: number;
    imageSrc: string;
    rotation: number;
    isDeleted: boolean;
    width: number;
    height: number;
}

interface Annotation {
    id: string;
    type: 'text' | 'image' | 'eraser';
    x: number;
    y: number;
    content?: string;
    imageSrc?: string;
    width: number;
    height: number;
    isEditing?: boolean; // For text editing state
}

export const PdfEditor: React.FC = () => {
    const navigate = useNavigate();
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
    const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [scale] = useState(1);

    // Editor State
    const [editingPage, setEditingPage] = useState<number | null>(null);
    const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
    const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'eraser'>('select');
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

    // Interaction Refs
    const dragItem = useRef<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const location = useLocation();

    useEffect(() => {
        if (location.state?.file) {
            handleFileSelect([location.state.file]);
            // Clear state to prevent reload loops
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleFileSelect = async (files: File[]) => {
        if (files.length === 0) return;

        setIsLoading(true);
        const file = files[0];
        setPdfFile(file);
        setAnnotations({});

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            setPdfDoc(pdf);

            const thumbnails: PageThumbnail[] = [];
            const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
            const pdfViewer = await loadingTask.promise;

            for (let i = 1; i <= pdfViewer.numPages; i++) {
                const page = await pdfViewer.getPage(i);
                const viewport = page.getViewport({ scale: 1.0 }); // Use 1.0 for better initial quality in thumbnails

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;
                    thumbnails.push({
                        pageIndex: i - 1,
                        imageSrc: canvas.toDataURL(),
                        rotation: 0,
                        isDeleted: false,
                        width: viewport.width,
                        height: viewport.height
                    });
                }
            }
            setThumbnails(thumbnails);
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error loading PDF. Please try a different file.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (editingPage === null || !canvasRef.current || activeTool === 'select' || activeTool === 'image') return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (activeTool === 'text') {
            const newAnno: Annotation = {
                id: Date.now().toString(),
                type: 'text',
                x,
                y: y - 10, // Adjust centering
                content: '',
                width: 200,
                height: 30,
                isEditing: true
            };
            setAnnotations(prev => ({
                ...prev,
                [editingPage]: [...(prev[editingPage] || []), newAnno]
            }));
            setActiveTool('select'); // Switch back to select after placing
        } else if (activeTool === 'eraser') {
            const newAnno: Annotation = {
                id: Date.now().toString(),
                type: 'eraser',
                x,
                y,
                width: 100,
                height: 50
            };
            setAnnotations(prev => ({
                ...prev,
                [editingPage]: [...(prev[editingPage] || []), newAnno]
            }));
            setActiveTool('select');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingPage === null || !e.target.files?.[0]) return;

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Calculate display size keeping aspect ratio, max width 300
                const maxWidth = 300;
                const scaleFactor = maxWidth / img.width;

                const newAnno: Annotation = {
                    id: Date.now().toString(),
                    type: 'image',
                    x: 50,
                    y: 50,
                    imageSrc: event.target?.result as string,
                    width: maxWidth,
                    height: img.height * scaleFactor // Preserve aspect ratio
                };

                setAnnotations(prev => ({
                    ...prev,
                    [editingPage]: [...(prev[editingPage] || []), newAnno]
                }));
                setActiveTool('select');
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const updateAnnotation = (pageIdx: number, id: string, updates: Partial<Annotation>) => {
        setAnnotations(prev => ({
            ...prev,
            [pageIdx]: prev[pageIdx].map(a => a.id === id ? { ...a, ...updates } : a)
        }));
    };

    const deleteAnnotation = (pageIdx: number, id: string) => {
        setAnnotations(prev => ({
            ...prev,
            [pageIdx]: prev[pageIdx].filter(a => a.id !== id)
        }));
    };

    const savePdf = async () => {
        if (!pdfDoc) return;

        try {
            const newPdf = await PDFDocument.create();
            const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            const helveticaFont = await newPdf.embedFont(StandardFonts.Helvetica);

            for (let i = 0; i < thumbnails.length; i++) {
                const thumb = thumbnails[i];
                if (thumb.isDeleted) continue;

                const page = pages[i];
                const pageAnnos = annotations[i] || [];

                if (thumb.rotation !== 0) {
                    page.setRotation({ angle: (page.getRotation().angle + thumb.rotation) % 360, type: 'Degrees' } as any);
                }

                const { height } = page.getSize();
                // We assume visual thumbnail size matches PDF Point size (which it generally does if we use viewport size)
                // However, user might have zoomed. 
                // CRITICAL: We relied on `thumb.width` in the UI rendering which came from `viewport({scale:1})`.
                // So coordinates (x,y) are relative to that 1.0 scale.
                // It should map 1:1 to PDF points usually.

                for (const anno of pageAnnos) {


                    if (anno.type === 'eraser') {
                        page.drawRectangle({
                            x: anno.x,
                            y: height - anno.y - anno.height,
                            width: anno.width,
                            height: anno.height,
                            color: rgb(1, 1, 1), // White
                        });
                    } else if (anno.type === 'image' && anno.imageSrc) {
                        let embeddedImage;
                        if (anno.imageSrc.startsWith('data:image/png')) {
                            embeddedImage = await newPdf.embedPng(anno.imageSrc);
                        } else {
                            embeddedImage = await newPdf.embedJpg(anno.imageSrc);
                        }

                        page.drawImage(embeddedImage, {
                            x: anno.x,
                            y: height - anno.y - anno.height,
                            width: anno.width,
                            height: anno.height,
                        });
                    } else if (anno.type === 'text' && anno.content) {
                        // Simple text rendering
                        // Note: Multiline text support in pdf-lib is manual.
                        page.drawText(anno.content, {
                            x: anno.x + 5, // Padding adjustment
                            y: height - anno.y - 12 - 5, // Approximate baseline
                            size: 16,
                            font: helveticaFont,
                            color: rgb(0, 0, 0),
                        });
                    }
                }

                newPdf.addPage(page);
            }

            const pdfBytes = await newPdf.save();
            const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `edited_${pdfFile?.name || 'document.pdf'}`;
            link.click();
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert('Failed to save PDF.');
        }
    };

    const tools = [
        { id: 'select', icon: MousePointer, label: 'Select' },
        { id: 'text', icon: Type, label: 'Add Text' },
        { id: 'image', icon: ImageIcon, label: 'Add Image' },
        { id: 'eraser', icon: Eraser, label: 'Whiteout' },
    ] as const;

    return (
        <div className="space-y-4 py-4 animate-fade-in text-text h-[calc(100vh-100px)] flex flex-col">
            <header className="flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => editingPage !== null ? setEditingPage(null) : navigate('/category/pdf-tools')}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-primary">
                            {editingPage !== null ? 'Edit Page' : 'PDF Editor'}
                        </h1>
                        <p className="text-sm text-text-muted">
                            {editingPage !== null ? 'Add text, images, or erase content' : 'Rearrange, rotate, and organize pages'}
                        </p>
                    </div>
                </div>

                {pdfFile && editingPage === null && (
                    <div className="flex items-center space-x-2">
                        <button onClick={savePdf} className="px-6 py-3 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 flex items-center space-x-2 shadow-xl shadow-primary/20">
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                )}
            </header>

            {!pdfFile ? (
                <div className="max-w-4xl mx-auto w-full mt-12">
                    <div className="glass-card p-12 rounded-[3.5rem] border-white/10">
                        <DropZone
                            onFilesSelected={handleFileSelect}
                            multiple={false}
                            accept={{ 'application/pdf': ['.pdf'] }}
                        />
                        <AdBanner slot="pdf-editor-upload" className="mt-12" />
                    </div>
                </div>
            ) : editingPage !== null ? (
                // EDIT MODE
                <div className="flex-1 bg-surface/30 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col relative">
                    {/* Toolbar */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-2xl p-2 z-50 flex items-center gap-2 shadow-2xl border border-white/10">
                        {tools.map(tool => (
                            <div key={tool.id} className="relative">
                                {tool.id === 'image' ? (
                                    <label className={`
                                        flex flex-col items-center gap-1 p-3 rounded-xl transition-all cursor-pointer min-w-[70px]
                                        ${activeTool === tool.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:bg-white/10 hover:text-white'}
                                    `}>
                                        <tool.icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold">{tool.label}</span>
                                        <input
                                            type="file"
                                            id="editor-image-upload" // Robust ID
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            className="hidden"
                                            onClick={(e) => {
                                                // Reset value to allow same file selection again
                                                (e.target as HTMLInputElement).value = '';
                                                setActiveTool('image');
                                            }}
                                        />
                                    </label>
                                ) : (
                                    <button
                                        onClick={() => setActiveTool(tool.id)}
                                        className={`
                                            flex flex-col items-center gap-1 p-3 rounded-xl transition-all min-w-[70px]
                                            ${activeTool === tool.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:bg-white/10 hover:text-white'}
                                        `}
                                    >
                                        <tool.icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold">{tool.label}</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div
                        className="flex-1 overflow-auto flex items-center justify-center p-12 bg-dots cursor-crosshair"
                        onMouseMove={(e) => {
                            if (dragItem.current && editingPage !== null) {
                                const dx = e.clientX - dragItem.current.startX;
                                const dy = e.clientY - dragItem.current.startY;
                                updateAnnotation(
                                    editingPage,
                                    dragItem.current.id,
                                    {
                                        x: dragItem.current.initialX + dx,
                                        y: dragItem.current.initialY + dy
                                    }
                                );
                            }
                        }}
                        onMouseUp={() => dragItem.current = null}
                        onMouseLeave={() => dragItem.current = null}
                    >
                        <div
                            ref={canvasRef}
                            className="relative shadow-2xl transition-transform"
                            onClick={handleCanvasClick}
                        >
                            {/* Page Background */}
                            {thumbnails[editingPage] && (
                                <img
                                    src={thumbnails[editingPage].imageSrc}
                                    style={{
                                        width: thumbnails[editingPage].width,
                                        height: thumbnails[editingPage].height,
                                        transform: `rotate(${thumbnails[editingPage].rotation}deg)` // Visual rotation
                                    }}
                                    className="bg-white pointer-events-none select-none max-w-none"
                                />
                            )}

                            {/* Annotations Layer */}
                            <div className="absolute inset-0">
                                {(annotations[editingPage] || []).map(anno => (
                                    <div
                                        key={anno.id}
                                        className={`
                                            absolute group flex items-start
                                            ${activeTool === 'select' ? 'cursor-move' : ''}
                                            ${selectedAnnotation === anno.id ? 'z-40' : 'z-30'}
                                        `}
                                        style={{
                                            left: anno.x,
                                            top: anno.y,
                                            width: anno.width,
                                            height: anno.height
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAnnotation(anno.id);
                                            // Enable text editing on click
                                            if (anno.type === 'text') updateAnnotation(editingPage, anno.id, { isEditing: true });
                                        }}
                                        onMouseDown={(e) => {
                                            if (activeTool !== 'select' || anno.isEditing) return;
                                            e.stopPropagation();
                                            setSelectedAnnotation(anno.id);
                                            dragItem.current = {
                                                id: anno.id,
                                                startX: e.clientX,
                                                startY: e.clientY,
                                                initialX: anno.x,
                                                initialY: anno.y
                                            };
                                        }}
                                    >
                                        {/* Resize Handle (Simple bottom-right) */}
                                        {selectedAnnotation === anno.id && activeTool === 'select' && !anno.isEditing && (
                                            <div className="absolute -inset-1 border-2 border-primary/50 rounded-lg pointer-events-none"></div>
                                        )}

                                        {anno.type === 'text' ? (
                                            anno.isEditing ? (
                                                <textarea
                                                    autoFocus
                                                    className="w-full h-full bg-white/90 border-2 border-primary text-black p-1 resize min-w-[100px] min-h-[30px] rounded text-base font-sans leading-tight shadow-xl"
                                                    value={anno.content}
                                                    onChange={(e) => updateAnnotation(editingPage, anno.id, { content: e.target.value })}
                                                    onBlur={() => updateAnnotation(editingPage, anno.id, { isEditing: false })}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    style={{ fontSize: '16px' }}
                                                />
                                            ) : (
                                                <div className="w-full h-full text-black font-sans whitespace-pre-wrap leading-tight text-base p-1 overflow-hidden pointer-events-none" style={{ fontSize: '16px' }}>
                                                    {anno.content || "Type here..."}
                                                </div>
                                            )
                                        ) : anno.type === 'image' ? (
                                            <img src={anno.imageSrc} className="w-full h-full object-contain pointer-events-none" />
                                        ) : (
                                            // Eraser
                                            <div className="w-full h-full bg-white border border-gray-200/50 shadow-sm"></div>
                                        )}

                                        {activeTool === 'select' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteAnnotation(editingPage, anno.id); }}
                                                className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50 hover:scale-110"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl text-white text-xs font-bold shadow-2xl flex gap-4">
                        <span className="flex items-center gap-2"><Move className="w-4 h-4 text-primary" /> Drag items to move</span>
                        <span className="w-px h-4 bg-white/20"></span>
                        <span className="flex items-center gap-2"><Type className="w-4 h-4 text-primary" /> Click text to edit</span>
                    </div>
                </div>
            ) : (
                // DASHBOARD MODE
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
                    <div className="lg:col-span-1 space-y-6">
                        {/* Sidebar */}
                        <div className="bg-surface/50 border border-white/5 p-6 rounded-[2rem] shadow-xl backdrop-blur-xl sticky top-24">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-all" onClick={() => setThumbnails(prev => prev.map(t => ({ ...t, rotation: (t.rotation + 90) % 360 })))}>
                                    <RotateCw className="w-4 h-4 text-primary" /> Rotate All
                                </button>
                                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left text-xs font-bold flex items-center gap-3 transition-all text-red-400 hover:bg-red-500/10" onClick={() => setPdfFile(null)}>
                                    <Trash2 className="w-4 h-4" /> Close File
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {thumbnails.map((page, idx) => (
                                        <div
                                            key={idx}
                                            className={`relative group transition-all duration-300 ${page.isDeleted ? 'opacity-40 grayscale scale-90' : 'hover:scale-105'}`}
                                            style={{ width: `${100 * scale}%` }}
                                        >
                                            <div className="relative bg-white shadow-2xl rounded-lg overflow-hidden border border-white/10 aspect-[1/1.4]">
                                                <img
                                                    src={page.imageSrc}
                                                    alt={`Page ${idx + 1}`}
                                                    className="w-full h-full object-contain transition-transform duration-300"
                                                    style={{ transform: `rotate(${page.rotation}deg)` }}
                                                />
                                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-mono z-10">
                                                    #{idx + 1}
                                                </div>

                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                                                    <button
                                                        onClick={() => setEditingPage(idx)}
                                                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                                                    >
                                                        <Type className="w-3 h-3" /> Edit Page
                                                    </button>

                                                    <div className="flex gap-2">
                                                        <button onClick={() => setThumbnails(prev => prev.map((t, i) => i === idx ? { ...t, rotation: (t.rotation + 90) % 360 } : t))} className="p-2 bg-white text-primary rounded-full hover:scale-110 shadow-lg"><RotateCw className="w-4 h-4" /></button>
                                                        <button onClick={() => setThumbnails(prev => prev.map((t, i) => i === idx ? { ...t, isDeleted: !t.isDeleted } : t))} className={`p-2 rounded-full hover:scale-110 shadow-lg ${page.isDeleted ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                                            {page.isDeleted ? <Undo className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <AdBanner slot="pdf-editor-bottom" className="mt-8" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
