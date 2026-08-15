import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Trash2, RefreshCw, FileCode, Edit, Settings } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { formatFileSize } from '../../utils/format';
import { SEO } from '../../components/SEO';

interface FileItem {
    id: string;
    file: File;
    resultFile: Blob | null;
    isProcessing: boolean;
    statusText?: string;
}

export const WordConverter: React.FC = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState<FileItem[]>([]);

    const handleFilesSelected = (selectedFiles: File[]) => {
        const newFiles: FileItem[] = selectedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            resultFile: null,
            isProcessing: false,
            statusText: ''
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    const convertToWord = async (id: string, file: File) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, isProcessing: true, statusText: 'Uploading to local Python server...' } : f));

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Same-origin request — handled by the Vite dev server proxy,
            // which forwards it to the LOCAL Python backend (127.0.0.1:8000).
            // The browser never contacts any external/VPS server.
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Server conversion failed');
            }

            const blob = await response.blob();

            setFiles(prev => prev.map(f =>
                f.id === id ? { ...f, resultFile: blob, isProcessing: false, statusText: 'Done!' } : f
            ));

        } catch (error) {
            console.error('Conversion failed', error);
            alert(`Failed to convert PDF. Start the local backend with START-LOCALHOST.bat or start-pdf-backend.bat (uvicorn on port 8000).\nError: ${(error as Error).message}`);
            setFiles(prev => prev.map(f => f.id === id ? { ...f, isProcessing: false, statusText: 'Failed' } : f));
        }
    };

    const openInEditor = (file: File) => {
        navigate('/pdf-tools/editor', { state: { file } });
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <SEO 
                title="Best Free PDF to Word Converter Online | AceTools"
                description="Securely convert your PDF files into editable Microsoft Word (.docx) documents offline with perfect table and image formatting preservation. 100% Free."
                type="website"
            />
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/pdf-tools')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-blue-500">PDF to Word</h1>
                    <p className="text-sm text-text-muted">Convert with Text Layout or Image Layout</p>
                </div>
            </header>

            <main className="space-y-8">
                {files.length === 0 ? (
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <DropZone
                            onFilesSelected={handleFilesSelected}
                            multiple={true}
                            accept={{ 'application/pdf': ['.pdf'] }}
                        />
                        <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl inline-block max-w-2xl">
                            <h4 className="flex items-center justify-center gap-2 text-blue-500 font-bold mb-2">
                                <Settings className="w-4 h-4" />
                                <span>Optimization Tip</span>
                            </h4>
                            <p className="text-xs text-text-muted leading-relaxed">
                                Upload your PDF securely. It will be sent directly to your running Python backend (localhost:8000) for highest quality DOCX compilation using pdf2docx.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {files.map((item) => (
                            <div key={item.id} className="bg-surface/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl backdrop-blur-xl group transition-all hover:border-blue-500/30 relative overflow-hidden">
                                <div className="flex justify-between items-start z-10 relative">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-black truncate w-[150px]">{item.file.name}</p>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{formatFileSize(item.file.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFiles(prev => prev.filter(f => f.id !== item.id))}
                                        className="p-2 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {item.resultFile ? (
                                    <div className="space-y-4 z-10 relative">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                                            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                                                <FileCode className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Ready</span>
                                            </div>
                                            <p className="text-sm font-bold text-white">Word Document (.doc)</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const url = URL.createObjectURL(item.resultFile!);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = item.file.name.replace('.pdf', '.docx');
                                                a.click();
                                            }}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/20 transition-all"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download Word</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 z-10 relative">
                                        <button
                                            onClick={() => convertToWord(item.id, item.file)}
                                            disabled={item.isProcessing}
                                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20"
                                        >
                                            {item.isProcessing ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    <span>{item.statusText || 'Converting...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="w-4 h-4" />
                                                    <span>Convert to DOCX</span>
                                                </>
                                            )}
                                        </button>

                                        <div className="pt-2 border-t border-white/5">
                                            <button
                                                onClick={() => openInEditor(item.file)}
                                                className="w-full py-2 text-text-muted hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors"
                                            >
                                                <Edit className="w-3 h-3" />
                                                <span>Or Edit Directly</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.pdf';
                                input.multiple = true;
                                input.onchange = (e) => {
                                    const files = Array.from((e.target as HTMLInputElement).files || []);
                                    handleFilesSelected(files);
                                };
                                input.click();
                            }}
                            className="border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-text-muted hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-500 transition-all space-y-3 min-h-[300px]"
                        >
                            <div className="p-4 bg-white/5 rounded-full">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Add more PDF</span>
                        </button>
                    </div>
                )}
            </main>

            {/* SEO Text Content Area - Required for Google Ranking */}
            <section className="mt-20 max-w-4xl mx-auto space-y-12 pb-20 border-t border-white/10 pt-16">
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-white">How to Convert PDF to Word Natively</h2>
                    <p className="text-text-muted leading-relaxed">
                        Converting a PDF to an editable Microsoft Word document (.docx) used to require expensive desktop software. With AceTools, you can seamlessly translate fixed-layout PDFs into completely reflowable text documents directly in your browser. Our engine leverages advanced mathematical models to reconstruct paragraphs, maintain image blocks, and structure complex tables natively, allowing you to edit the generated Word file instantly.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-white">Why Choose AceTools Fast & Secure Engine?</h2>
                    <ul className="space-y-3 text-text-muted list-disc ml-5">
                        <li><strong>High Fidelity Layouts:</strong> We don't just extract random text. Our algorithm understands columns, headers, and footer data to recreate your original document perfectly.</li>
                        <li><strong>100% Secure & Private:</strong> Data privacy is crucial. Unlike other cloud converters that store your sensitive legal or financial documents on unsecure remote servers, our conversion happens instantly using a highly tuned micro-service. We never store, read, or sell your document data.</li>
                        <li><strong>Lightning Fast:</strong> Engineered for absolute speed, ensuring your document is downloaded securely in seconds without frustrating queue lines.</li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
                    
                    <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
                        <h3 className="font-bold text-blue-400 mb-2">Can I edit the converted Word Document?</h3>
                        <p className="text-sm text-text-muted">Yes! The output is a standard Microsoft Word <code>.docx</code> binary file. You can open it in Microsoft Word, Google Docs, or Apple Pages and type, delete, or modify any text just as if you had typed it originally.</p>
                    </div>

                    <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
                        <h3 className="font-bold text-blue-400 mb-2">What happens to my uploaded files?</h3>
                        <p className="text-sm text-text-muted">Security is our highest priority. The system processes the binary data locally to construct the DOCX equivalent and destroys the input instantly. We have zero database storage for uploaded files.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
