import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Trash2, RefreshCw } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { PDFDocument } from 'pdf-lib';
import { formatFileSize } from '../../utils/format';

export const PdfCompressor: React.FC = () => {
    const navigate = useNavigate();
    const [pdfFiles, setPdfFiles] = useState<{ id: string, file: File, compressedFile: Blob | null, isProcessing: boolean }[]>([]);

    const handleFilesSelected = (files: File[]) => {
        const newPdfs = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            compressedFile: null,
            isProcessing: false
        }));
        setPdfFiles(prev => [...prev, ...newPdfs]);
    };

    const compressPdf = async (id: string, file: File) => {
        setPdfFiles(prev => prev.map(p => p.id === id ? { ...p, isProcessing: true } : p));

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Client-side PDF compression is limited, but we can re-save it with optimizations
            // Typical tools use Ghostscript or similar which isn't easy in browser
            // Here we basic re-save which can sometimes reduce size slightly or prepare for further steps
            const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
            const compressedBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });

            setPdfFiles(prev => prev.map(p =>
                p.id === id ? { ...p, compressedFile: compressedBlob, isProcessing: false } : p
            ));
        } catch (error) {
            console.error('PDF processing failed', error);
            setPdfFiles(prev => prev.map(p => p.id === id ? { ...p, isProcessing: false } : p));
        }
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/pdf-tools')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-red-500">PDF Compressor</h1>
                    <p className="text-sm text-text-muted">Optimize your PDF files locally for faster sharing</p>
                </div>
            </header>

            <main className="space-y-8">
                {pdfFiles.length === 0 ? (
                    <div className="max-w-4xl mx-auto">
                        <DropZone
                            onFilesSelected={handleFilesSelected}
                            multiple={true}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pdfFiles.map((item) => (
                            <div key={item.id} className="bg-surface/50 border border-white/5 rounded-[2rem] p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold truncate max-w-[200px]">{item.file.name}</p>
                                            <p className="text-xs text-text-muted">{formatFileSize(item.file.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPdfFiles(prev => prev.filter(p => p.id !== item.id))}
                                        className="p-2 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {item.compressedFile ? (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-green-400 font-bold uppercase">Optimized</p>
                                            <p className="text-sm font-mono">{formatFileSize(item.compressedFile.size)}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const url = URL.createObjectURL(item.compressedFile!);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `optimized_${item.file.name}`;
                                                a.click();
                                            }}
                                            className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-green-500/20"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => compressPdf(item.id, item.file)}
                                        disabled={item.isProcessing}
                                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                                    >
                                        {item.isProcessing ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Zap className="w-5 h-5" />
                                                <span>Compress PDF Now</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const Zap = ({ className }: { className: string }) => (
    <div className={className}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    </div>
);
