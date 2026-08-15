import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Trash2, RefreshCw, FileType, CheckCircle2 } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { formatFileSize } from '../../utils/format';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

interface DocxParagraph {
    text: string;
    isHeading: boolean;
}

const X_AMP = '&' + 'amp;';
const X_LT = '&' + 'lt;';
const X_GT = '&' + 'gt;';
const X_QUOT = '&' + 'quot;';
const X_APOS = '&' + 'apos;';

function xmlEscape(s: string): string {
    return s
        .replace(/&/g, X_AMP)
        .replace(/</g, X_LT)
        .replace(/>/g, X_GT)
        .replace(/"/g, X_QUOT)
        .replace(/'/g, X_APOS);
}

/** Extract text paragraphs from a PDF using pdf.js, page by page. */
async function extractPdfParagraphs(file: File): Promise<DocxParagraph[]> {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    const paragraphs: DocxParagraph[] = [];
    for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();

        // Group items into lines by y position, then join lines into paragraphs.
        const lines: { y: number; text: string }[] = [];
        for (const item of content.items) {
            if (!('str' in item)) continue;
            const it = item as { str: string; transform: number[] };
            if (!it.str || !it.str.trim()) continue;
            const y = Math.round(it.transform[5]);
            const existing = lines.find((l) => Math.abs(l.y - y) <= 2);
            if (existing) {
                existing.text += it.str.endsWith(' ') ? it.str : it.str + ' ';
            } else {
                lines.push({ y, text: it.str.endsWith(' ') ? it.str : it.str + ' ' });
            }
        }

        if (p > 1 && paragraphs.length > 0) {
            paragraphs.push({ text: '', isHeading: false });
        }
        for (const line of lines) {
            const text = line.text.replace(/\s+/g, ' ').trim();
            if (text.length === 0) continue;
            // A short line high on the page, or numbered like a chapter, reads as a heading.
            const isHeading =
                text.length < 80 &&
                !/[.!?]$/.test(text) &&
                (line.y > 700 || /^[IVXLC0-9]+[.)]\s/.test(text));
            paragraphs.push({ text, isHeading });
        }
    }

    const withText = paragraphs.filter((p) => p.text.length > 0);
    if (withText.length === 0) {
        throw new Error('This PDF contains no extractable text. It may be a scanned image.');
    }
    return paragraphs;
}

/** Build a genuine .docx (Office Open XML) ZIP locally in the browser. */
async function buildDocx(paragraphs: DocxParagraph[]): Promise<Blob> {
    const zip = new JSZip();

    zip.file(
        '[Content_Types].xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
            '<Default Extension="xml" ContentType="application/xml"/>' +
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
            '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
            '</Types>'
    );

    zip.folder('_rels')!.file(
        '.rels',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
            '</Relationships>'
    );

    const word = zip.folder('word')!;
    word.folder('_rels')!.file(
        'document.xml.rels',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
            '</Relationships>'
    );

    word.file(
        'styles.xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
            '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
            '<w:style w:type="paragraph" w:styleId="Heading1">' +
            '<w:name w:val="heading 1"/><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>' +
            '<w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style>' +
            '<w:style w:type="paragraph" w:styleId="Normal">' +
            '<w:name w:val="Normal"/><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>' +
            '<w:rPr><w:sz w:val="22"/></w:rPr></w:style>' +
            '</w:styles>'
    );

    const body = paragraphs
        .map((p) => {
            if (p.text.length === 0) {
                return '<w:p/>';
            }
            if (p.isHeading) {
                return '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">' + xmlEscape(p.text) + '</w:t></w:r></w:p>';
            }
            return '<w:p><w:r><w:t xml:space="preserve">' + xmlEscape(p.text) + '</w:t></w:r></w:p>';
        })
        .join('');

    word.file(
        'document.xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
            '<w:body>' +
            body +
            '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>' +
            '</w:body></w:document>'
    );

    return zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
}

async function pdfToDocx(file: File): Promise<Blob> {
    const paragraphs = await extractPdfParagraphs(file);
    return buildDocx(paragraphs);
}

export const WordConverter: React.FC = () => {
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

    const convertToDocx = async (id: string, file: File) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, isProcessing: true } : f));

        try {
            const blob = await pdfToDocx(file);

            setFiles(prev => prev.map(f =>
                f.id === id ? { ...f, resultBlob: blob, isProcessing: false } : f
            ));
        } catch (error) {
            console.error('PDF to Word conversion failed', error);
            alert(error instanceof Error ? error.message : 'Conversion failed.');
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
                    <h1 className="text-3xl font-black tracking-tight text-orange-500">PDF to Word</h1>
                    <p className="text-sm text-text-muted">Convert PDF documents into editable Word files</p>
                </div>
            </header>

            <main className="space-y-8">
                {files.length === 0 ? (
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <DropZone
                            onFilesSelected={handleFilesSelected}
                            multiple={true}
                            accept={{
                                'application/pdf': ['.pdf']
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
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">DOCX Generated</p>
                                                <p className="text-xs font-bold text-white">{formatFileSize(item.resultBlob.size)}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const url = URL.createObjectURL(item.resultBlob!);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = item.file.name.replace(/\.pdf$/i, '.docx');
                                                a.click();
                                            }}
                                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/20 transition-all"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download DOCX</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => convertToDocx(item.id, item.file)}
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
                                                <span>Convert to Word</span>
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
                                input.accept = '.pdf';
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
                            <span className="text-xs font-black uppercase tracking-widest">Add more PDFs</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};