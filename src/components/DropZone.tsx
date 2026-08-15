import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, Images } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface DropZoneProps {
    onFilesSelected: (files: File[]) => void;
    disabled?: boolean;
    multiple?: boolean;
    accept?: Record<string, string[]>;
}

export const DropZone: React.FC<DropZoneProps> = ({
    onFilesSelected,
    disabled,
    multiple = true,
    accept = {
        'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
        'video/*': ['.mp4', '.webm', '.mov'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
}) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            onFilesSelected(acceptedFiles);
        }
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: multiple ? undefined : 1,
        disabled
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div
                {...getRootProps()}
                className={clsx(
                    "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ease-out p-12",
                    isDragActive ? "border-primary bg-primary/5" : "border-secondary bg-white hover:border-primary/50 hover:bg-secondary/30 hover:shadow-xl hover:shadow-black/5",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className={clsx(
                        "p-4 rounded-full transition-all duration-300",
                        isDragActive ? "bg-primary/20 text-primary" : "bg-secondary text-text-muted group-hover:scale-110 group-hover:text-primary"
                    )}>
                        {isDragActive ? <UploadCloud className="w-8 h-8" /> : multiple ? <Images className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                    </div>

                    <div className="space-y-1">
                        <p className="text-xl font-bold text-text">
                            {isDragActive ? "Drop it here!" : multiple ? "Drag & drop your images" : "Drag & drop your image"}
                        </p>
                        <p className="text-sm text-text-muted">
                            or click to browse from your device
                        </p>
                        {multiple && (
                            <p className="text-xs text-primary/80 pt-2 font-bold">
                                ✨ You can select multiple files at once
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2 text-[10px] text-text-muted/60 uppercase tracking-widest font-black pt-4 flex-wrap justify-center">
                        <span>PNG</span>
                        <span>•</span>
                        <span>JPG</span>
                        <span>•</span>
                        <span>WEBP</span>
                        <span>•</span>
                        <span>GIF</span>
                        <span>•</span>
                        <span>MP4</span>
                        <span>•</span>
                        <span>PDF</span>
                        <span>•</span>
                        <span>DOCX</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
