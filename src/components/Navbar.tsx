import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutGrid,
    Image,
    FileText,
    Video,
    Code,
    Search,
    Share2,
    Info,
    BarChart3,
    Clock,
    Type,
    Layers,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AdBanner } from './AdBanner';

export const Navbar: React.FC = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutGrid className="w-5 h-5" /> },
        { name: 'Image Tools', path: '/category/image-tools', icon: <Image className="w-5 h-5" /> },
        { name: 'PDF Engine', path: '/category/pdf-tools', icon: <FileText className="w-5 h-5" /> },
        { name: 'Video Lab', path: '/category/video-tools', icon: <Video className="w-5 h-5" /> },
        { name: 'Editor', path: '/category/text-tools', icon: <Type className="w-5 h-5" /> },
        { name: 'Dev Studio', path: '/category/dev-tools', icon: <Code className="w-5 h-5" /> },
        { name: 'Growth/SEO', path: '/category/seo-tools', icon: <Search className="w-5 h-5" /> },
        { name: 'Social Hub', path: '/category/social-tools', icon: <Share2 className="w-5 h-5" /> },
        { name: 'Finance', path: '/category/finance-tools', icon: <BarChart3 className="w-5 h-5" /> },
        { name: 'Utility', path: '/category/unit-tools', icon: <Clock className="w-5 h-5" /> },
    ];

    return (
        <nav className="fixed left-0 top-0 h-screen w-20 lg:w-72 bg-[#f5f3ef]/80 backdrop-blur-3xl border-r border-[#e5e2dd] z-[100] flex flex-col items-center lg:items-stretch py-10 transition-all duration-700 ease-in-out">
            {/* Branding */}
            <Link to="/" className="flex items-center space-x-4 px-8 mb-16 group">
                <div className="relative">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black shadow-2xl shadow-primary/30 group-hover:rotate-[10deg] transition-all duration-500">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#f5f3ef] animate-pulse" />
                </div>
                <div className="hidden lg:block">
                    <span className="text-2xl font-black tracking-tighter text-text block leading-none">OptiPik</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1 block">Studio Pro</span>
                </div>
            </Link>

            {/* Navigation Items */}
            <div className="flex-grow flex flex-col space-y-1.5 px-4 overflow-y-auto custom-scrollbar pr-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center space-x-4 px-5 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 group/nav
                            ${isActive
                                ? 'bg-white text-primary luxury-shadow border border-secondary/50'
                                : 'text-text-muted hover:text-text hover:bg-black/[0.03]'}
                        `}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="flex-shrink-0"
                        >
                            {item.icon}
                        </motion.div>
                        <span className="hidden lg:block truncate tracking-tight">{item.name}</span>
                        <div className="ml-auto opacity-0 group-[.active]:opacity-100 transition-opacity">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                        </div>
                    </NavLink>
                ))}
            </div>

            {/* Version / Footer */}
            <div className="px-8 mt-auto border-t border-[#e5e2dd]">
                <div className="hidden lg:block">
                    <AdBanner className="mb-6 scale-90 origin-bottom" slot="sidebar-ad-1" />
                </div>
                <div className="flex items-center space-x-4 py-8">
                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-text-muted">
                        <Info className="w-5 h-5" />
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">Build Runtime</p>
                        <p className="text-xs font-bold text-text">v2.8.0-gold</p>
                    </div>
                </div>
            </div>
        </nav>
    );
};
