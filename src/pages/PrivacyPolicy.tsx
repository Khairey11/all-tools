import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export const PrivacyPolicy: React.FC = () => (
    <div className="max-w-3xl mx-auto py-4 animate-fade-in text-text">
        <SeoHead title="Privacy Policy | All Tools" description="How All Tools handles your data: files are processed in your browser and never uploaded. Learn about cookies and advertising." />
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3"><Shield className="w-8 h-8 text-primary" /> Privacy Policy</h1>
        <p className="text-xs text-text-muted mb-8">Last updated: August 2026</p>

        <div className="space-y-6 text-sm text-text-muted leading-relaxed">
            <section>
                <h2 className="text-lg font-black text-text mb-2">1. Your files stay on your device</h2>
                <p>All Tools is designed with privacy as the core principle. Every tool on this website (image compression, PDF conversion, video tools and more) runs <strong className="text-text">entirely inside your web browser</strong>. The files you process are <strong className="text-text">never uploaded to our servers or any third-party server</strong>. When you close the page, everything is gone.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">2. Information we do NOT collect</h2>
                <p>We do not collect, store, or process your uploaded files, tool inputs, or generated results. We do not require accounts, sign-ups, or personal information to use any tool.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">3. Cookies & advertising</h2>
                <p>This website may display advertisements served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visits to this site and/or other sites on the Internet.</p>
                <p className="mt-2">You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-primary underline" rel="noopener noreferrer" target="_blank">Google Ads Settings</a>. You can also manage cookies through the consent banner shown on this site.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">4. Local storage</h2>
                <p>We use your browser's local storage only to remember your preferences (such as cookie consent choice and currency selections). This data never leaves your device.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">5. Analytics</h2>
                <p>We may use privacy-respecting, aggregated analytics to understand which tools are most used. These statistics are anonymous and never linked to individuals.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">6. Changes to this policy</h2>
                <p>If we update this policy, the revised date above will change. Continued use of the site after changes means you accept the updated policy.</p>
            </section>
            <section>
                <h2 className="text-lg font-black text-text mb-2">7. Contact</h2>
                <p>Questions about privacy? <Link to="/contact" className="text-primary underline">Contact us</Link> anytime.</p>
            </section>
        </div>
    </div>
);