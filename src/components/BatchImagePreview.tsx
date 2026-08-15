import React, { useState } from 'react';
import { formatFileSize } from '../utils/format';
import { DownloadButton } from './DownloadButton';
import { ComparisonSlider } from './ComparisonSlider';
import { Trash2, RefreshCw, Download, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ImageItem {
    id: string;
    originalFile: File;
    compressedFile: File | null;
    isCompressing: boolean;
    progress: number;
    previewUrl: string;
}

interface BatchImagePreviewProps {
    images: ImageItem[];
    onRemove: (id: string) => void;
    onDownloadSingle: (file: File, filename: string) => void;
}

export const BatchImagePreview: React.FC<BatchImagePreviewProps> = ({
    images,
    onRemove,
    onDownloadSingle,
}) => {
    const [selectedImageForComparison, setSelectedImageForComparison] = useState<string | null>(null);

    const compressedFiles = images
        .filter(img => img.compressedFile !== null)
        .map(img => img.compressedFile!);

    const allCompressed = images.every(img => img.compressedFile !== null);
    const anyCompressing = images.some(img => img.isCompressing);

    const selectedImage = images.find(img => img.id === selectedImageForComparison);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Comparison Modal */}
            <AnimatePresence>
                {selectedImageForComparison && selectedImage?.compressedFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedImageForComparison(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-4xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">{selectedImage.originalFile.name}</h3>
                                <button
                                    onClick={() => setSelectedImageForComparison(null)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                >
                                    Close
                                </button>
                            </div>
                            <ComparisonSlider
                                originalUrl={selectedImage.previewUrl}
                                compressedUrl={URL.createObjectURL(selectedImage.compressedFile)}
                                originalSize={selectedImage.originalFile.size}
                                compressedSize={selectedImage.compressedFile.size}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                    <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 relative group shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
                    >
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.compressedFile && (
                                <button
                                    onClick={() => setSelectedImageForComparison(image.id)}
                                    className="p-3 bg-white/90 hover:bg-primary backdrop-blur-md rounded-2xl text-text hover:text-white transition-all shadow-xl shadow-black/10"
                                    title="Compare before/after"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => onRemove(image.id)}
                                className="p-3 bg-white/90 hover:bg-red-500 backdrop-blur-md rounded-2xl text-text hover:text-white transition-all shadow-xl shadow-black/10"
                                title="Remove image"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Image Preview */}
                        <div className="aspect-video bg-slate-50 flex items-center justify-center relative overflow-hidden">
                            <img
                                src={image.previewUrl}
                                alt={image.originalFile.name}
                                className="max-h-full max-w-full object-contain"
                            />

                            {/* Progress Overlay */}
                            {image.isCompressing && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                                    <div className="w-2/3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${image.progress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-3">{Math.round(image.progress)}% COMPRESSING</span>
                                </div>
                            )}
                        </div>

                        {/* File Info */}
                        <div className="p-6 space-y-4">
                            <p className="text-sm font-bold text-text truncate" title={image.originalFile.name}>
                                {image.originalFile.name}
                            </p>

                            <div className="flex justify-between items-center text-xs">
                                <div className="space-y-1.5">
                                    <div className="text-text-muted flex items-center gap-2">
                                        <span className="text-xs">Original:</span>
                                        <span className="font-bold text-text">{formatFileSize(image.originalFile.size)}</span>
                                    </div>
                                    {image.compressedFile && (
                                        <div className="text-primary flex items-center gap-2">
                                            <span className="text-xs">Optimized:</span>
                                            <span className="font-bold">{formatFileSize(image.compressedFile.size)}</span>
                                        </div>
                                    )}
                                </div>

                                {image.compressedFile && (
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black">
                                            -{Math.round(((image.originalFile.size - image.compressedFile.size) / image.originalFile.size) * 100)}%
                                        </span>
                                        <button
                                            onClick={() => onDownloadSingle(image.compressedFile!, `compressed_${image.originalFile.name}`)}
                                            className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 transition-all font-bold"
                                            title="Download this image"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Batch Download Button */}
            {allCompressed && !anyCompressing && compressedFiles.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <DownloadButton files={compressedFiles} isBatch={compressedFiles.length > 1} />
                </motion.div>
            )}

            {/* Summary Stats */}
            {allCompressed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center"
                >
                    <p className="text-green-400 font-semibold">
                        ✨ All {images.length} image{images.length > 1 ? 's' : ''} compressed successfully!
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                        Total saved: {formatFileSize(
                            images.reduce((acc, img) =>
                                acc + (img.originalFile.size - (img.compressedFile?.size || 0)), 0
                            )
                        )}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};
