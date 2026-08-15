import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ComparisonSliderProps {
    originalUrl: string;
    compressedUrl: string;
    originalSize: number;
    compressedSize: number;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
    originalUrl,
    compressedUrl,
    originalSize,
    compressedSize,
}) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    };

    const handleMouseDown = () => setIsDragging(true);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);

    return (
        <div className="bg-surface rounded-3xl overflow-hidden border border-white/5 p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-text">Before/After Comparison</h3>
                <span className="text-sm text-green-400 font-bold">-{savings}% size</span>
            </div>

            <div
                ref={containerRef}
                className="relative aspect-video rounded-xl overflow-hidden bg-black/20 cursor-ew-resize select-none"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Compressed Image (Background) */}
                <div className="absolute inset-0">
                    <img
                        src={compressedUrl}
                        alt="Compressed"
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                        COMPRESSED
                    </div>
                </div>

                {/* Original Image (Foreground with clip) */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <img
                        src={originalUrl}
                        alt="Original"
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-black">
                        ORIGINAL
                    </div>
                </div>

                {/* Slider Line */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                    style={{ left: `${sliderPosition}%` }}
                >
                    {/* Slider Handle */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="flex space-x-0.5">
                            <div className="w-0.5 h-4 bg-gray-600 rounded"></div>
                            <div className="w-0.5 h-4 bg-gray-600 rounded"></div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="text-xs text-text-muted text-center">
                Drag the slider to compare image quality
            </div>
        </div>
    );
};
