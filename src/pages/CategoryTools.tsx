import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { tools } from '../data/tools';

export const CategoryTools: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    const category = tools.find(t => t.id === categoryId);

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <h1 className="text-4xl font-black">Category Not Found</h1>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2 text-primary font-bold hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-12 py-8 animate-fade-in">
            <header className="space-y-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-secondary/50 hover:bg-secondary border border-secondary rounded-2xl transition-all inline-flex items-center space-x-2 mb-4 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-text" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text">Back</span>
                </button>

                <div className="flex items-center space-x-6">
                    <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-2xl shadow-primary/10`}>
                        {React.cloneElement(category.icon as React.ReactElement, { className: 'w-10 h-10' })}
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-text">{category.category}</h1>
                        <p className="text-lg text-text-muted mt-2">Explore our collection of professional {category.category.toLowerCase()}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, idx) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * idx }}
                    >
                        <button
                            onClick={() => navigate(item.path)}
                            className="w-full text-left p-8 rounded-[2.5rem] bg-surface/80 backdrop-blur-xl border border-secondary hover:border-primary/30 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                {React.cloneElement(item.icon as React.ReactElement, { className: 'w-24 h-24' })}
                            </div>

                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors text-text">{item.name}</h3>
                            <p className="text-sm text-text-muted leading-relaxed flex-grow">{item.desc}</p>

                            <div className="mt-8 flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                                <span>Launch Tool</span>
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </button>
                    </motion.div>
                ))}
            </div>

            <section className="bg-secondary/50 rounded-[3rem] p-12 text-center border border-secondary mt-16">
                <h3 className="text-xl font-bold mb-2 text-text">Need a different tool?</h3>
                <p className="text-text-muted text-sm mb-8">We're constantly adding new utilities to help your workflow.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20 tracking-widest uppercase text-xs"
                >
                    View All Categories
                </button>
            </section>
        </div>
    );
};
