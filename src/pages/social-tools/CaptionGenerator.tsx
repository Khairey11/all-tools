import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Copy, Check, Zap, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORM_CONFIGS: Record<string, { name: string, hashtagLimit: number, tone: string }> = {
    tiktok: { name: 'TikTok', hashtagLimit: 8, tone: 'Viral & Punchy' },
    instagram: { name: 'Instagram', hashtagLimit: 20, tone: 'Aesthetic & Visual' },
    youtube: { name: 'YouTube', hashtagLimit: 15, tone: 'Descriptive & SEO' },
    facebook: { name: 'Facebook', hashtagLimit: 10, tone: 'Community & Story' }
};

const INTENTS = {
    promo: { keywords: ['sale', 'offer', 'discount', '%', 'buy', 'shop', 'deal', 'price', 'off', 'order'], emoji: '🔥🛍️', tone: 'Urgent' },
    new: { keywords: ['launch', 'new', 'announcing', 'introducing', 'fresh', 'update', 'feature', 'started', 'live'], emoji: '🚀🆕', tone: 'Exciting' },
    festive: { keywords: ['puja', 'festival', 'celebration', 'happy', 'wishes', 'bless', 'joy', 'diwali', 'dashain', 'special'], emoji: '✨🙏', tone: 'Warm' },
    food: { keywords: ['eat', 'food', 'taste', 'delicious', 'yummy', 'recipe', 'cook', 'meal', 'dine', 'burger', 'pizza', 'cafe'], emoji: '🤤🍔', tone: 'Craving' },
    service: { keywords: ['repair', 'fix', 'maintain', 'install', 'service', 'expert', 'pro', 'help', 'clean'], emoji: '🛠️✅', tone: 'Professional' },
    tech: { keywords: ['ai', 'app', 'code', 'software', 'tech', 'digital', 'crypto', 'web'], emoji: '💻⚡', tone: 'Futuristic' },
    travel: { keywords: ['travel', 'trip', 'visit', 'explore', 'nature', 'adventure', 'vacation'], emoji: '✈️🌍', tone: 'Adventurous' }
};

const SUBJECT_FLAVORS: Record<string, string[]> = {
    promo: ['unbeatable prices', 'exclusive access', 'savings you can feel', 'limited stock remaining', 'unfiltered value'],
    new: ['game-changing innovation', 'the next big thing', 'redefining excellence', 'freshly dropped', 'unveiling the future'],
    festive: ['moments of harmony', 'radiant smiles', 'prosperous vibes', 'heartfelt connections', 'cozy festive magic'],
    food: ['bursting with flavor', 'melt-in-your-mouth textures', 'handcrafted with love', 'the ultimate treat', 'finding magic in the mundane'],
    service: ['stress-free solutions', 'results you can count on', 'precision and care', 'maximum efficiency', 'human-centric expertise'],
    tech: ['cutting-edge performance', 'seamless integration', 'smart living', 'high-speed efficiency', 'digital-first mindset'],
    travel: ['unforgettable memories', 'hidden gems', 'escaping the ordinary', 'nature at its finest', 'soft era exploration'],
    general: ['excellence in detail', 'moments that matter', 'simply the best', 'premium quality', 'authentic storytelling']
};

const SCENARIO_MIXINS: Record<string, { hook: string, vibes: string[] }> = {
    authentic: {
        hook: "Real talk: ",
        vibes: ["No filters, just results.", "Keeping it 100% real.", "Behind the scenes of our process."]
    },
    cozy: {
        hook: "Current mood: ✨ ",
        vibes: ["Finding peace in the small things.", "Creating a safe space for you.", "Soft era energy."]
    },
    nostalgic: {
        hook: "Take a trip back... 📼 ",
        vibes: ["Vintage feels, modern quality.", "That classic energy you love.", "Bringing back the good old days."]
    },
    humorous: {
        hook: "Can we just talk about... 😂 ",
        vibes: ["Living rent-free in our heads.", "It's the [P] for me.", "Not us obsessing over this."]
    }
};

const generateNativeCaption = (platform: string, rawPrompt: string, brand: string, scenario: string, seed: number) => {
    const p = rawPrompt.replace(/create a caption (about|for)|i want a caption (about|for)|caption|about\s/gi, '').trim();
    if (!p) return { caption: '', hashtags: [], analysis: null };

    // 1. Semantic Analysis
    const lowerP = p.toLowerCase();
    let detectedIntent: keyof typeof INTENTS | 'general' = 'general';
    for (const [key, config] of Object.entries(INTENTS)) {
        if (config.keywords.some(k => lowerP.includes(k))) {
            detectedIntent = key as keyof typeof INTENTS;
            break;
        }
    }

    const cleanP = p.charAt(0).toUpperCase() + p.slice(1);
    const brandName = brand || 'Our team';
    const flavors = SUBJECT_FLAVORS[detectedIntent] || SUBJECT_FLAVORS.general;
    const f = (i: number) => flavors[(seed + i) % flavors.length];
    const e = (detectedIntent !== 'general' ? INTENTS[detectedIntent].emoji : '✨🌟');

    // Scenario Mixins
    const scenarioKey = scenario.toLowerCase();
    const mixin = SCENARIO_MIXINS[scenarioKey] || null;

    const analysis = {
        intent: detectedIntent.toUpperCase(),
        tone: detectedIntent !== 'general' ? INTENTS[detectedIntent].tone : 'Engaging',
        context: f(0),
        persona: scenario || 'Standard'
    };

    // 2. High-Relevance Composition with Brand Awareness
    let captions: string[] = [];
    const baseHook = mixin ? mixin.hook : '';
    const scenarioVibe = mixin ? mixin.vibes[seed % mixin.vibes.length] : f(1);

    if (platform === 'facebook') {
        captions = [
            `💎 ${baseHook}${brandName} presents: ${cleanP}!\n\nWe're bringing you ${f(0)} with a focus on ${scenarioVibe}. At ${brandName}, we believe that quality is more than just a promise—it's an experience. ${e}\n\nWhy chooses us?\n✨ Premium Standards\n✨ Community Driven\n✨ ${f(2).charAt(0).toUpperCase() + f(2).slice(1)}\n\n👇 Drop a "❤️" if you're ready for ${f(0)}!`,
            `Stop scrolling! 🛑 ${brandName} is changing the game for ${p}.\n\n${cleanP} isn't just about the results; it's about ${f(0)}. ${mixin ? mixin.vibes[0] : f(1)}\n\n📍 Visit ${brandName} today and see why we're the best in class!\n\nTag a friend who needs this in their life! 👇`
        ];
    } else if (platform === 'instagram') {
        captions = [
            `✨ ${baseHook}${cleanP} by ${brandName} ✨\n\nFocusing on ${scenarioVibe} today. ${f(0)} is the energy we're bringing to 2026. ${e}\n\n.\n.\n#${brandName.replace(/\s/g, '')} #vibes #2026`,
            `${cleanP}: ${brandName}'s take on ${f(0)} ${e}\n\n${scenarioVibe} Living for the details that make ${p} so special.\n\nDouble tap if you agree! ❤️`
        ];
    } else if (platform === 'tiktok') {
        captions = [
            `POV: You found ${brandName}'s secret to ${p} 🤫\n\nIt's giving ${scenarioVibe}! ${e}\n\nWait for the end for a surprise! 💀\n\n#${brandName.replace(/\s/g, '')} #fyp #viral`,
            `This is your sign to stop sleeping on ${brandName}. ⚡️\n\n${baseHook}${cleanP} is literally ${f(0)}. ${e}\n\nTag your bestie! 👇`
        ];
    } else {
        captions = [
            `TITLE: ${cleanP} | The ${brandName} Strategy 🎬\n\nExploring ${p} through the lens of ${brandName}. We dive into ${f(1)} and why it matters. ${e}\n\n🔔 Subscribe to ${brandName} for more!`,
            `How ${brandName} handles ${p}: ${f(0)}. \n\nWatch till the end to see the results! 🚀`
        ];
    }

    const selectedCaption = captions[seed % captions.length];

    // 3. Smart Hashtags
    const hashtags = new Set<string>();
    if (brand) hashtags.add(brand.replace(/\s/g, ''));
    p.split(/\s+/).forEach(w => { if (w.length > 3) hashtags.add(w.replace(/[^\w]/g, '')); });
    ['Viral', 'Trending', '2026', 'SocialEdge'].forEach(t => hashtags.add(t));
    if (detectedIntent !== 'general') hashtags.add(detectedIntent.charAt(0).toUpperCase() + detectedIntent.slice(1));

    return {
        caption: selectedCaption,
        hashtags: Array.from(hashtags).map(t => `#${t}`).slice(0, PLATFORM_CONFIGS[platform].hashtagLimit),
        analysis
    };
};

export const CaptionGenerator: React.FC = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [brand, setBrand] = useState('');
    const [scenario, setScenario] = useState('Standard');
    const [selectedPlatform, setSelectedPlatform] = useState('facebook');
    const [seed, setSeed] = useState(0);
    const [copied, setCopied] = useState(false);

    const generatedContent = useMemo(() => {
        return generateNativeCaption(selectedPlatform, prompt, brand, scenario, seed);
    }, [prompt, brand, scenario, selectedPlatform, seed]);

    const handleCopy = () => {
        const text = `${generatedContent.caption}\n\n${generatedContent.hashtags.join(' ')}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Viral Caption AI v2</h1>
                    <p className="text-sm text-text-muted">Research-backed generation based on brand identity</p>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 flex flex-col space-y-6">
                    <div className="flex bg-surface/50 p-1.5 rounded-2xl border border-white/5">
                        {Object.entries(PLATFORM_CONFIGS).map(([id, data]: [string, any]) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setSelectedPlatform(id);
                                    setSeed(0);
                                }}
                                className={`flex-grow py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${selectedPlatform === id
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-text-muted hover:text-text hover:bg-white/5'
                                    }`}
                            >
                                {data.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Brand Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Acme Studio"
                                className="bg-surface/50 border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 focus:outline-none transition-all"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Scenario/Persona</label>
                            <select
                                className="bg-surface/50 border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 focus:outline-none transition-all appearance-none cursor-pointer"
                                value={scenario}
                                onChange={(e) => setScenario(e.target.value)}
                            >
                                <option>Standard</option>
                                <option>Authentic</option>
                                <option>Cozy</option>
                                <option>Nostalgic</option>
                                <option>Humorous</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Post Description</label>
                        <textarea
                            className="w-full h-64 bg-surface/50 border border-white/5 rounded-[2rem] p-8 font-sans text-lg focus:border-primary/50 focus:outline-none resize-none transition-all shadow-inner leading-relaxed"
                            placeholder="What happens in this post?"
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                setSeed(0);
                            }}
                        />
                    </div>
                </div>

                <div className="lg:col-span-6">
                    <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-[2.5rem] p-8 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                    <span className="font-bold uppercase tracking-widest text-xs tracking-[0.2em]">Researched AI Draft</span>
                                </div>
                                {generatedContent.analysis && (
                                    <div className="flex flex-wrap items-center gap-2 animate-fade-in py-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                            AI Distilled Result
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setSeed(s => s + 1)}
                                    disabled={!prompt.trim()}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-text-muted hover:text-primary disabled:opacity-0"
                                    title="Regenerate"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    disabled={!prompt.trim()}
                                    className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-xs font-black tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-30"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span>{copied ? 'COPIED' : 'COPY ALL'}</span>
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {prompt.trim() ? (
                                <motion.div
                                    key={selectedPlatform + seed + brand + scenario}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    className="space-y-6 flex-grow"
                                >
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] min-h-[200px] shadow-inner relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                            <Sparkles className="w-12 h-12" />
                                        </div>
                                        <p className="text-xl leading-relaxed text-white font-medium whitespace-pre-wrap">
                                            {generatedContent.caption}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {generatedContent.hashtags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-xs font-bold text-primary shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex-grow flex flex-col items-center justify-center opacity-20 space-y-4">
                                    <MessageSquare className="w-16 h-16" />
                                    <p className="text-sm font-bold tracking-widest text-center max-w-[200px]">DEFINE YOUR BRAND & POST TO BEGIN</p>
                                </div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-[10px] text-text-muted/60 uppercase font-black tracking-widest">
                                    <Zap className="w-3 h-3 text-yellow-500" />
                                    <span>Tone: {PLATFORM_CONFIGS[selectedPlatform]?.tone}</span>
                                </div>
                                <div className="text-[10px] text-primary font-black uppercase tracking-widest animate-pulse">
                                    AI Optimized for Reach
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
