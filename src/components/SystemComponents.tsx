import React, { Component, ErrorInfo, useState } from 'react';
import { Cookie, X, AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ───────────────────────── Cookie Consent (GDPR/ePrivacy) ───────────────────────── */

export const CookieConsent: React.FC = () => {
    const [visible, setVisible] = useState(() => {
        try { return localStorage.getItem('cookie-consent') === null; } catch { return false; }
    });

    const decide = (choice: 'all' | 'essential') => {
        try { localStorage.setItem('cookie-consent', choice); } catch { /* storage blocked */ }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 animate-fade-in">
            <div className="bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-start gap-3">
                    <Cookie className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-3 flex-1">
                        <p className="text-xs text-text-muted leading-relaxed">
                            We use cookies for ads and analytics. All tool processing happens on your device and is never affected.
                            See our <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => decide('all')}
                                className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                Accept all
                            </button>
                            <button onClick={() => decide('essential')}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted">
                                Essential only
                            </button>
                        </div>
                    </div>
                    <button onClick={() => decide('essential')} className="p-1 text-text-muted hover:text-text" aria-label="Close">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ───────────────────────── Error Boundary (reliability) ───────────────────────── */

interface ErrorBoundaryProps { children: React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Tool crashed, contained by boundary:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center p-8">
                    <div className="max-w-md text-center space-y-5">
                        <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-black text-text">Something went wrong</h2>
                        <p className="text-sm text-text-muted">
                            This tool hit an unexpected error. Your files are safe - everything runs locally.
                            Try reloading or head back to the homepage.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => window.location.reload()}
                                className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Reload
                            </button>
                            <Link to="/"
                                className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 text-text">
                                <Home className="w-4 h-4" /> Home
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}