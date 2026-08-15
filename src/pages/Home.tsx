import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Globe, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { tools } from '../data/tools';
import { AdBanner } from '../components/AdBanner';

export const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-24 py-12 animate-fade-in max-w-7xl mx-auto">
            {/* Hero Section */}
            <section className="relative group perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-[100px] -z-10 animate-pulse" />

                <div className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 border border-white luxury-shadow rounded-full text-[10px] font-black uppercase tracking-widest text-primary mb-4"
                    >
                        <Sparkles className="w-3 h-3" />
                        Next-Gen Browser Toolkit
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-gradient"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Precision Tools. <br />
                        <span className="text-text">Private by Design.</span>
                    </motion.h1>

                    <motion.p
                        className="text-xl text-text-muted max-w-2xl mx-auto font-medium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Professional grade media studio running entirely in your browser.
                        No servers, no limits, just pure performance.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-4 pt-4"
                    >
                        <button onClick={() => navigate('/category/image-tools')} className="px-8 py-4 bg-primary text-white font-black rounded-[2rem] hover:bg-primary-hover transition-all luxury-shadow flex items-center gap-2">
                            Start Exploring <ArrowRight className="w-4 h-4" />
                        </button>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="px-8 py-4 bg-white border border-secondary text-text font-black rounded-[2rem] hover:bg-secondary/50 transition-all flex items-center gap-2">
                            <Github className="w-4 h-4" /> View Source
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Ad Banner Hero */}
            <AdBanner slot="home-hero-ad" className="max-w-4xl mx-auto" />

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.map((group, groupIdx) => (
                    <motion.div
                        key={group.category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * groupIdx }}
                        className="group"
                    >
                        <div className="glass-card rounded-[3.5rem] p-10 h-full hover:border-primary/20 hover:scale-[1.02] transition-all duration-700 flex flex-col luxury-shadow relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent blur-3xl group-hover:from-primary/20 transition-all duration-700" />

                            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${group.color} flex items-center justify-center text-white mb-8 shadow-2xl relative`}>
                                {group.icon}
                            </div>

                            <div className="relative">
                                <h2 className="text-3xl font-black text-text mb-2">{group.category}</h2>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-8 opacity-60">Professional Utilities</p>
                            </div>

                            <div className="space-y-4 flex-grow relative">
                                {group.items.slice(0, 4).map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => navigate(item.path)}
                                        className="w-full text-left p-4 rounded-3xl bg-secondary/20 hover:bg-white border border-transparent hover:border-secondary transition-all group/item flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-white p-2.5 rounded-xl text-primary shadow-sm group-hover/item:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-text">{item.name}</div>
                                                <div className="text-[10px] text-text-muted mt-0.5 font-medium">{item.desc}</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate(`/category/${group.id}`)}
                                className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:gap-4 transition-all"
                            >
                                Explore Category <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Core Values Section */}
            <section className="glass-card rounded-[4rem] p-16 luxury-shadow border-white relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/[0.02] -z-10" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-center">
                    <div className="md:col-span-1 border-r border-secondary/50 pr-8">
                        <h2 className="text-4xl font-black tracking-tighter mb-4">Why OptiPik?</h2>
                        <p className="text-sm text-text-muted leading-relaxed font-medium">Built for professionals who demand speed without compromising security.</p>
                    </div>

                    <div className="space-y-4 text-center md:text-left">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg shadow-emerald-500/10">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-lg">Zero Leak Privacy</h4>
                        <p className="text-xs text-text-muted leading-relaxed font-medium">All processing is 100% client-side. Your data never touches a server.</p>
                    </div>

                    <div className="space-y-4 text-center md:text-left">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg shadow-amber-500/10">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-lg">WASM Speed</h4>
                        <p className="text-xs text-text-muted leading-relaxed font-medium">Blazing fast performance powered by the latest WebAssembly engines.</p>
                    </div>

                    <div className="space-y-4 text-center md:text-left">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg shadow-blue-500/10">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-lg">Clean Workflow</h4>
                        <p className="text-xs text-text-muted leading-relaxed font-medium">No accounts, no subscriptions, no ads. Just pure utility at your fingertips.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
