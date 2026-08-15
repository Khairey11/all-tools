import React from 'react';
import { Download, Check, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { downloadFile, downloadAsZip } from '../utils/format';

interface DownloadButtonProps {
    files: File[];
    isBatch?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ files, isBatch = false }) => {
    const [downloaded, setDownloaded] = React.useState(false);

    const handleDownload = () => {
        if (isBatch && files.length > 1) {
            downloadAsZip(files);
        } else if (files.length === 1) {
            downloadFile(files[0], `compressed_${files[0].name}`);
        }

        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className={`
        w-full py-4 px-6 rounded-2xl font-semibold text-white shadow-lg shadow-primary/20
        flex items-center justify-center space-x-2 transition-all duration-300
        ${downloaded ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary-hover'}
      `}
        >
            {downloaded ? (
                <>
                    <Check className="w-5 h-5" />
                    <span>Saved!</span>
                </>
            ) : isBatch && files.length > 1 ? (
                <>
                    <Package className="w-5 h-5" />
                    <span>Download All ({files.length} images)</span>
                </>
            ) : (
                <>
                    <Download className="w-5 h-5" />
                    <span>Download Compressed Image</span>
                </>
            )}
        </motion.button>
    );
};
