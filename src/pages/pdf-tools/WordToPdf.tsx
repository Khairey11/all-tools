import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Trash2, RefreshCw, FileType, CheckCircle2 } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatFileSize } from '../../utils/format';
import JSZip from 'jszip';

interface DocxParagraph {
    text: string;
    isHeading: boolean;
    isListItem: boolean;
    isBold: boolean;
}

const X_AMP = '&' + 'amp;';
const X_LT = '&' + 'lt;';
const X_GT = '&' + 'gt;';
const X_QUOT = '&' + 'quot;';
const X_APOS = '&' + 'apos;';

function xmlUnescape(s: string): string {
    return s
        .replace(new RegExp(X_LT, 'g'), '<')
        .replace(new RegExp(X_GT, 'g'), '>')
        .replace(new RegExp(X_QUOT, 'g'), '"')
        .replace(new RegExp(X_APOS, 'g'), "'")
        .replace(new RegExp(X_AMP, 'g'), '&');
}

/** Parse a .docx file (a ZIP of XML) into structured paragraphs. */
async function parseDocx(file: File): Promise<DocxParagraph[]> {
    const zip = await JSZip.loadAsync(file);
    const docXml = zip.file('word/document.xml');
    if (!docXml) {
        throw new Error('This file is not a valid .docx document.');
    }
    const xml = await docXml.async('string');

    const paragraphs: DocxParagraph[] = [];
    // Split into <w:p ...> ... </w:p> blocks
    const paraRegex = /<w:p[ >][\s\S]*?<\/w:p>/g;
    const paraBlocks = xml.match(paraRegex) ?? [];

    for (const block of paraBlocks) {
        const isListItem = /<w:numPr>/.test(block);
        const isHeading = /w:val="Heading(\d)"/.test(block);
        const isBold = /<w:b\/>/.test(block) || /<w:b [^>]*\/>/.test(block);

        // Extract text runs: <w:t>...</w:t> plus <w:tab/> and breaks
        let text = '';
        const runRegex = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\s*\/>|<w:br\s*\/>/g;
        let m: RegExpExecArray | null;
        while ((m = runRegex.exec(block)) !== null) {
            if (m[0].startsWith('<w:t')) {
                text += xmlUnescape(m[1] ?? '');
            } else if (m[0].startsWith('<w:tab')) {
                text += '    ';
            } else {
                text += '\n';
            }
        }

        if (text.trim().length > 0) {
            paragraphs.push({ text, isHeading, isListItem, isBold });
        }
    }

    if (paragraphs.length === 0) {
        throw new Error('No readable text found in this document.');
    }
    return paragraphs;
}

/** Lay out parsed paragraphs into a real multi-page PDF. */
async function docxToPdf(file: File): Promise<Blob> {
    const paragraphs = await parseDocx(file);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const MARGIN = 56.7; // 2cm
    const CONTENT_W = PAGE_W - MARGIN * 2;

    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const newPage = () => {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
    };

    for (const para of paragraphs) {
        const bodySize = 11;
        const headingSize = para.isHeading ? 16 : bodySize;
        const useBold = para.isHeading || para.isBold;
        const useFont = useBold ? boldFont : font;
        const lineH = headingSize * 1.35;

        // Word wrap with width measurement
        const words = para.text.split(/\s+/);
        const lines: string[] = [];
        let current = para.isListItem ? '\u2022 ' : '';
        for (const w of words) {
            const candidate = current ? current + ' ' + w : w;
            const width = useFont.widthOfTextAtSize(candidate, headingSize);
            if (width > CONTENT_W && current) {
                lines.push(current);
                current = (para.isListItem ? '   ' : '') + w;
            } else {
                current = candidate;
            }
        }
        if (current) lines.push(current);

        // Paragraph spacing before
        y -= para.isHeading ? lineH * 0.8 : lineH * 0.5;
        if (y < MARGIN + lineH) newPage();

        for (const line of lines) {
            if (y < MARGIN + lineH) newPage();
            page.drawText(line, {
                x: MARGIN,
                y: y - headingSize,
                size: headingSize,
                font: useFont,
                color: rgb(0.1, 0.1, 0.1),
            });
            y -= lineH;
        }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}

export const WordToPdf: React.FC = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState<{ id: string, file: File, resultBlob: Blob | null, isProcessing: boolean }[]>([]);

    const handleFilesSelected = (selectedFiles: File[]) => {
        const newFiles = selectedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            resultBlob: null,
            isProcessing: false
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    const convertToPdf = async (id: string, file: File) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, isProcessing: true } : f));

        try {
            const blob = await docxToPdf(file);

            setFiles(prev => prev.map(f =>
                f.id === id ? { ...f, resultBlob: blob, isProcessing: false } : f
            ));
        } catch (error) {
            console.error('Word to PDF conversion failed', error);
            alert(error instanceof Error ? error.message : 'Conversion failed. Please try a standard .docx file.');
            setFiles(prev => prev.map(f => f.id === id ? { ...f, isProcessing: false } : f));
        }
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/pdf-tools')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-orange-500">Word to PDF</h1>
                    <p className="text-sm text-text-muted">Convert Word documents into high-quality PDFs</p>
                </div>
            </header>

            <main className="space-y-8">
                {files.length === 0 ? (
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <DropZone
                            onFilesSelected={handleFilesSelected}
                            multiple={true}
                            accept={{
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                            }}
                        />
                        <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl inline-block">
                            <p className="text-xs text-orange-400 font-medium">🛡️ Secure Local Conversion: Your files never leave your browser.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {files.map((item) => (
                            <div key={item.id} className="bg-surface/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl backdrop-blur-xl group transition-all hover:border-orange-500/30">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
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

                                {item.resultBlob ? (
                                    <div className="space-y-4">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center space-x-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">PDF Generated</p>
                                                <p className="text-xs font-bold text-white">{formatFileSize(item.resultBlob.size)}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const url = URL.createObjectURL(item.resultBlob!);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = item.file.name.replace(/\.(doc|docx)$/i, '.pdf');
                                                a.click();
                                            }}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/20 transition-all"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download PDF</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => convertToPdf(item.id, item.file)}
                                        disabled={item.isProcessing}
                                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-xl shadow-orange-500/20"
                                    >
                                        {item.isProcessing ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileType className="w-4 h-4" />
                                                <span>Convert to PDF</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.doc,.docx';
                                input.multiple = true;
                                input.onchange = (e) => {
                                    const files = Array.from((e.target as HTMLInputElement).files || []);
                                    handleFilesSelected(files);
                                };
                                input.click();
                            }}
                            className="border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-text-muted hover:border-orange-500/50 hover:bg-orange-500/5 hover:text-orange-500 transition-all space-y-3 min-h-[250px]"
                        >
                            <div className="p-4 bg-white/5 rounded-full">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Add more Word</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};