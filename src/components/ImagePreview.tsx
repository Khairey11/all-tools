import React, { useEffect, useState } from 'react';
import { formatFileSize, createFileUrl } from '../utils/format';
import { DownloadButton } from './DownloadButton';
import { Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImagePreviewProps {
    originalFile: File;
    compressedFile: File | null;
    isCompressing: boolean;
    onReset: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    originalFile,
    compressedFile,
    isCompressing,
    onReset,
}) => {
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        const url = createFileUrl(originalFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [originalFile]);

    const savings = compressedFile
        ? Math.round(((originalFile.size - compressedFile.size) / originalFile.size) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-surface rounded-3xl overflow-hidden border border-white/5 relative">
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onReset}
                        className="p-2 bg-black/50 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-all"
                        title="Remove image"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-white/10">
                    {/* Original */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-center space-x-2 text-text-muted mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded">Original</span>
                        </div>
                        <div className="aspect-video rounded-xl overflow-hidden bg-black/20 flex items-center justify-center relative">
                            <img src={previewUrl} alt="Original" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex justify-between items-end border-t border-white/5 pt-4">
                            <div>
                                <p className="text-sm font-medium text-text truncate max-w-[150px]">{originalFile.name}</p>
                                <p className="text-xs text-text-muted">{formatFileSize(originalFile.size)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Compressed */}
                    <div className="p-6 space-y-4 bg-black/20">
                        <div className="flex items-center space-x-2 text-text-muted mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-1 rounded">Compressed</span>
                            {savings > 0 && (
                                <span className="text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                    -{savings}%
                                </span>
                            )}
                        </div>
                        <div className="aspect-video rounded-xl overflow-hidden bg-black/20 flex items-center justify-center relative border border-primary/10">
                            {isCompressing ? (
                                <div className="flex flex-col items-center gap-3 animate-pulse">
                                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                    <span className="text-sm text-text-muted">Optimizing pixels...</span>
                                </div>
                            ) : compressedFile ? (
                                <img src={URL.createObjectURL(compressedFile)} alt="Compressed" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <div className="text-text-muted text-sm">Waiting for preview...</div>
                            )}
                        </div>
                        <div className="flex justify-between items-end border-t border-white/5 pt-4">
                            <div>
                                <p className="text-sm font-medium text-text">Optimized Version</p>
                                {compressedFile ? (
                                    <p className="text-xs text-primary font-mono">{formatFileSize(compressedFile.size)}</p>
                                ) : (
                                    <p className="text-xs text-text-muted">---</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!isCompressing && compressedFile && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <DownloadButton files={[compressedFile]} />
                </motion.div>
            )}
        </motion.div>
    );
};
