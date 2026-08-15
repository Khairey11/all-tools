import React from 'react';
import { Layers } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <div className="text-center space-y-4 animate-slide-up">
            <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="p-3 bg-white rounded-2xl border border-secondary shadow-xl shadow-primary/10">
                    <Layers className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-text to-text/60 bg-clip-text text-transparent">
                    OptiPik
                </h1>
            </div>
            <p className="text-lg text-text-muted max-w-lg mx-auto leading-relaxed">
                Premium client-side image compression. Secure, fast, and high quality.
            </p>
        </div>
    );
};
