import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Globe } from 'lucide-react';

export const MetaTagGenerator: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [author, setAuthor] = useState('');
    const [copied, setCopied] = useState(false);

    const generateMetaTags = () => {
        return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="${author}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateMetaTags());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-amber-500">SEO Meta Tags</h1>
                    <p className="text-sm text-text-muted">Generate optimized meta tags for your website</p>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div className="bg-surface/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Site Title</label>
                                <input
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 focus:border-amber-500/50 outline-none transition-all"
                                    placeholder="Enter your website title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Meta Description</label>
                                <textarea
                                    className="w-full h-32 bg-black/20 border border-white/5 rounded-xl px-4 py-3 focus:border-amber-500/50 outline-none transition-all resize-none"
                                    placeholder="Enter a brief summary of your site..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Keywords</label>
                                <input
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 focus:border-amber-500/50 outline-none transition-all"
                                    placeholder="seo, tools, website (comma separated)"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Author</label>
                                <input
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 focus:border-amber-500/50 outline-none transition-all"
                                    placeholder="Developer Name"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Google Preview */}
                    <div className="bg-white rounded-2xl p-6 text-black shadow-xl">
                        <div className="flex items-center space-x-2 text-[#202124] text-sm mb-1">
                            <Globe className="w-3 h-3 text-gray-500" />
                            <span>https://example.com</span>
                        </div>
                        <h3 className="text-[#1a0dab] text-xl font-medium mb-1 truncate">
                            {title || 'Example Title Page'}
                        </h3>
                        <p className="text-[#4d5156] text-sm line-clamp-2">
                            {description || 'This is how your website will appear in Google search results. Start typing to see the preview update.'}
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-text-muted">Generated HTML</h4>
                            <button
                                onClick={handleCopy}
                                className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-black rounded-full font-bold text-xs hover:scale-105 transition-all"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copied ? 'Copied URL!' : 'Copy Code'}</span>
                            </button>
                        </div>
                        <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs overflow-auto h-[250px] leading-relaxed">
                            <pre className="text-amber-200/70 whitespace-pre-wrap">{generateMetaTags()}</pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
