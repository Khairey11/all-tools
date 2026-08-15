import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, XCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PasswordStrength: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: 'Very Weak', color: 'bg-red-500' });

    const checks = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
        { label: 'Contains number', met: /[0-9]/.test(password) },
        { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
    ];

    useEffect(() => {
        const score = checks.filter(c => c.met).length;
        let label = 'Very Weak';
        let color = 'bg-red-500';

        if (score === 5) { label = 'Very Strong'; color = 'bg-emerald-500'; }
        else if (score >= 4) { label = 'Strong'; color = 'bg-green-500'; }
        else if (score >= 3) { label = 'Medium'; color = 'bg-yellow-500'; }
        else if (score >= 2) { label = 'Weak'; color = 'bg-orange-500'; }

        setStrength({ score: (score / 5) * 100, label, color });
    }, [password]);

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/dev-tools')}
                    className="p-3 bg-secondary/50 hover:bg-secondary border border-secondary rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-text" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Password Strength</h1>
                    <p className="text-sm text-text-muted">Analyze your password security level</p>
                </div>
            </header>

            <div className="max-w-2xl mx-auto w-full">
                <div className="bg-white/80 border border-secondary p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="relative z-10 space-y-8">
                        <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Enter Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/30 group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full bg-secondary/30 border border-secondary/50 rounded-2xl p-6 pl-16 pr-16 text-xl font-black focus:border-primary/50 focus:outline-none transition-all placeholder:text-text-muted/20 text-text"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-all text-text-muted hover:text-text"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Strength: <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span></span>
                                <span className="text-xs font-black text-text">{Math.round(strength.score)}%</span>
                            </div>
                            <div className="h-3 bg-secondary/30 rounded-full overflow-hidden border border-secondary/50 p-[2px]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${strength.score}%` }}
                                    className={`h-full rounded-full ${strength.color} shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all duration-500`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-4">
                            {checks.map((check, i) => (
                                <div key={i} className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all duration-300 ${check.met ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-secondary/20 border-secondary/30 text-text-muted'}`}>
                                    {check.met ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-30" />}
                                    <span className="text-[11px] font-black uppercase tracking-widest">{check.label}</span>
                                </div>
                            ))}
                        </div>

                        <AnimatePresence>
                            {strength.score === 100 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center space-x-4"
                                >
                                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-emerald-600 uppercase tracking-widest">Fortress Lockdown</div>
                                        <p className="text-xs text-emerald-600/70 font-bold">This password is exceptionally secure and well-protected.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
