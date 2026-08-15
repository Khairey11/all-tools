import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { DropZone } from '../../components/DropZone';
import { AdBanner } from '../../components/AdBanner';

// Use same version strategy as PdfEditor
const PDFJS_VERSION = '3.11.174';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

export const PdfToImage: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = async (files: File[]) => {
        if (files.length === 0) return;
        const pdfFile = files[0];
        setFile(pdfFile);
        setImages([]);
        setIsConverting(true);
        setProgress(0);

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;

            const totalPages = pdf.numPages;
            const convertedImages: string[] = [];

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // High quality scale
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                convertedImages.push(canvas.toDataURL('image/jpeg', 0.9));
                setProgress(Math.round((i / totalPages) * 100));
            }

            setImages(convertedImages);
        } catch (error) {
            console.error('Error converting PDF:', error);
            alert('Failed to convert PDF to images.');
        } finally {
            setIsConverting(false);
        }
    };

    const downloadAll = async () => {
        if (images.length === 0) return;

        const zip = new JSZip();
        images.forEach((img, idx) => {
            const data = img.replace(/^data:image\/\w+;base64,/, "");
            zip.file(`page-${idx + 1}.jpg`, data, { base64: true });
        });

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${file?.name.replace('.pdf', '')}_images.zip`;
        link.click();
    };

    const downloadSingle = (img: string, index: number) => {
        const link = document.createElement('a');
        link.href = img;
        link.download = `page-${index + 1}.jpg`;
        link.click();
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/category/pdf-tools')}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-primary">PDF to Image</h1>
                        <p className="text-sm text-text-muted">Convert PDF pages to high-quality JPGs</p>
                    </div>
                </div>
                {images.length > 0 && (
                    <button
                        onClick={downloadAll}
                        className="px-6 py-3 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 flex items-center gap-2 shadow-xl shadow-primary/20"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download ZIP</span>
                    </button>
                )}
            </header>

            {!file ? (
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-12 rounded-[3.5rem] border-white/10">
                        <DropZone
                            onFilesSelected={handleFileSelect}
                            multiple={false}
                            accept={{ 'application/pdf': ['.pdf'] }}
                        />
                        <AdBanner slot="pdf-to-img-upload" className="mt-12" />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {isConverting && (
                        <div className="glass-card p-8 rounded-3xl flex items-center gap-6">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                <span className="text-xs font-bold">{progress}%</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Converting detailed pages...</h3>
                                <p className="text-sm text-text-muted">This happens locally on your device.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img, idx) => (
                            <div key={idx} className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl transition-all">
                                <img src={img} alt={`Page ${idx + 1}`} className="w-full h-auto" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button
                                        onClick={() => downloadSingle(img, idx)}
                                        className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download JPG</span>
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-mono text-white">
                                    Page {idx + 1}
                                </div>
                            </div>
                        ))}
                    </div>

                    <AdBanner slot="pdf-to-img-results" />
                </div>
            )}
        </div>
    );
};
