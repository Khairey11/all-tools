import React from 'react';
import { AdBanner } from './AdBanner';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-text flex selection:bg-primary selection:text-white relative">
            <div className="pl-20 lg:pl-64 w-full min-h-screen py-10 px-6 sm:px-10 lg:px-16 transition-all duration-500">
                <div className="w-full max-w-7xl mx-auto space-y-12 relative">
                    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                        <div className="absolute -top-[10%] left-[10%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
                        <div className="absolute top-[40%] right-[5%] w-[30rem] h-[30rem] bg-primary/3 rounded-full blur-[120px]" />
                        <div className="absolute -bottom-[10%] left-[30%] w-[35rem] h-[35rem] bg-indigo-500/3 rounded-full blur-[130px]" />
                    </div>
                    {children}
                </div>
            </div>

            {/* Fixed Bottom-Right Ad */}
            <div className="fixed bottom-4 right-4 z-40 hidden 2xl:block w-80">
                <AdBanner slot="fixed-bottom-right" className="shadow-2xl border border-white/20 bg-surface/80 backdrop-blur-xl" />
            </div>
        </div>
    );
};
