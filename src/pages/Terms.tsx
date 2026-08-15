import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export const Terms: React.FC = () => (
    <div className="max-w-3xl mx-auto py-4 animate-fade-in text-text">
        <SeoHead title="Terms of Service | All Tools" description="Terms for using All Tools - 47 free browser-based utilities. Fair use, no warranties, privacy-first processing." />
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3"><FileText className="w-8 h-8 text-primary" /> Terms of Service</h1>
        <p className="text-xs text-text-muted mb-8">Last updated: August 2026</p>

        <div className="space-y-6 text-sm text-text-muted leading-relaxed">
            <section>
                <h2 className="text-lg font-black text-text mb-2">1. Acceptance of terms</h2>
                <p>By accessing All Tools you agree to these terms. If you do not agree, please do not use the website.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">2. Free use of tools</h2>
                <p>All tools on this website are provided free of charge for personal and commercial use. No account is required. We may add, change or remove tools at any time.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">3. Acceptable use</h2>
                <p>You agree NOT to: (a) use the tools for any illegal purpose; (b) process content you do not have rights to; (c) attempt to disrupt, overload or reverse-engineer the website; (d) use automated scrapers that degrade service for others.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">4. No warranty</h2>
                <p>The tools are provided "as is" without warranties of any kind. While we test carefully, we cannot guarantee that every conversion or calculation is perfect for every input. Always verify important results (financial calculations, health estimates, legal documents) independently.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">5. Limitation of liability</h2>
                <p>All Tools and its operators shall not be liable for any damages arising from the use or inability to use this website or its tools.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">6. Your content</h2>
                <p>Since all processing happens locally in your browser, we never take possession of your files. You remain the sole owner of anything you process with our tools.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">7. Advertising</h2>
                <p>The website may display third-party advertisements. We are not responsible for the content of advertisements or advertised products.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">8. Contact</h2>
                <p>Questions about these terms? <Link to="/contact" className="text-primary underline">Contact us</Link>.</p>
            </section>
        </div>
    </div>
);