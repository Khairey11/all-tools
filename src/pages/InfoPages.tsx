import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Mail } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export const About: React.FC = () => (
    <div className="max-w-3xl mx-auto py-4 animate-fade-in text-text">
        <SeoHead title="About All Tools - 47 Free Browser-Based Utilities" description="All Tools provides 47 free online utilities that run entirely in your browser. No uploads, no sign-up, complete privacy." />
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3"><Info className="w-8 h-8 text-primary" /> About All Tools</h1>

        <div className="space-y-5 text-sm text-text-muted leading-relaxed mt-8">
            <p><strong className="text-text">All Tools</strong> is a collection of 47 free online utilities built around one principle: <strong className="text-text">your data should never leave your device</strong>.</p>
            <p>Unlike most online tool websites that upload your files to their servers for processing, every tool here - image compression, PDF conversion, video processing, QR generation, calculators - runs entirely inside your web browser using modern technology like WebAssembly and Canvas APIs.</p>
            <h2 className="text-lg font-black text-text pt-2">Why it matters</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-text">Privacy:</strong> Your documents, photos and videos are never uploaded anywhere.</li>
                <li><strong className="text-text">Speed:</strong> No upload/download round-trips - processing starts instantly.</li>
                <li><strong className="text-text">Free forever:</strong> No server costs per file means no limits and no fees.</li>
                <li><strong className="text-text">Works offline:</strong> Once loaded, most tools keep working without internet.</li>
            </ul>
            <h2 className="text-lg font-black text-text pt-2">The collection</h2>
            <p>From everyday needs (PDF to Word, image compression, QR codes, EMI calculator) to specialized utilities (Nepali date converter, GIF compression, video tools) - each tool is built to do one job perfectly.</p>
            <p>Have a suggestion for a new tool? <Link to="/contact" className="text-primary underline">Tell us</Link> - the collection grows based on what users need.</p>
        </div>
    </div>
);

export const Contact: React.FC = () => (
    <div className="max-w-3xl mx-auto py-4 animate-fade-in text-text">
        <SeoHead title="Contact All Tools" description="Get in touch with the All Tools team - feedback, bug reports, tool suggestions and partnership inquiries." />
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3"><Mail className="w-8 h-8 text-primary" /> Contact Us</h1>

        <div className="space-y-6 text-sm text-text-muted leading-relaxed mt-8">
            <p>We would love to hear from you. Whether you found a bug, have a tool suggestion, or want to say hi - reach out:</p>
            <div className="bg-surface/30 border border-white/5 rounded-2xl p-6 space-y-3">
                <p><strong className="text-text">General & feedback:</strong> hello@all-tools.app</p>
                <p><strong className="text-text">Bug reports:</strong> Please include the tool name, what you entered, and what happened.</p>
                <p><strong className="text-text">Tool suggestions:</strong> Tell us what you need and why existing tools do not solve it.</p>
            </div>
            <p>We typically respond within 2-3 business days.</p>
            <p>Also see our <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link> and <Link to="/terms" className="text-primary underline">Terms of Service</Link>.</p>
        </div>
    </div>
);