import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ListOrdered, Wrench, ChevronRight } from 'lucide-react';
import { getToolSeo } from '../data/seo-content';
import { tools } from '../data/tools';

interface SeoContentProps {
    path: string;
}

/** Visible, human-friendly SEO content rendered below every tool. */
export const SeoContent: React.FC<SeoContentProps> = ({ path }) => {
    const seo = getToolSeo(path);
    if (!seo) return null;

    // Related tools: same category first, then random others.
    const ownGroup = tools.find((g) => g.items.some((i) => i.path === path));
    const related = [
        ...(ownGroup?.items.filter((i) => i.path !== path).slice(0, 3) ?? []),
        ...tools.flatMap((g) => g.items).filter((i) => i.path !== path && !ownGroup?.items.includes(i)).slice(0, 4),
    ].slice(0, 6);

    const toolName = seo.title.split('|')[0].split(' - ')[0].trim();

    return (
        <section className="mt-16 space-y-10 text-text animate-fade-in" aria-label={`About ${toolName}`}>
            <div className="bg-surface/30 border border-white/5 rounded-3xl p-8">
                <h2 className="text-xl font-black mb-4">About the {toolName}</h2>
                <p className="text-sm text-text-muted leading-relaxed">{seo.intro}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface/30 border border-white/5 rounded-3xl p-8">
                    <h2 className="text-lg font-black mb-5 flex items-center gap-2">
                        <ListOrdered className="w-5 h-5 text-primary" /> How to use
                    </h2>
                    <ol className="space-y-3">
                        {seo.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-text-muted leading-relaxed">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center">{i + 1}</span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="bg-surface/30 border border-white/5 rounded-3xl p-8">
                    <h2 className="text-lg font-black mb-5 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" /> Frequently asked questions
                    </h2>
                    <div className="space-y-4">
                        {seo.faqs.map((faq) => (
                            <details key={faq.q} className="group">
                                <summary className="text-sm font-bold cursor-pointer list-none flex items-center justify-between gap-2 text-text">
                                    {faq.q}
                                    <ChevronRight className="w-4 h-4 shrink-0 text-text-muted transition-transform group-open:rotate-90" />
                                </summary>
                                <p className="text-sm text-text-muted leading-relaxed mt-2 pl-1">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-surface/30 border border-white/5 rounded-3xl p-8">
                <h2 className="text-lg font-black mb-5 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" /> Related free tools
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {related.map((t) => (
                        <Link key={t.path} to={t.path}
                            className="p-3 bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-xl text-center transition-all group">
                            <span className="block text-xs font-bold text-text group-hover:text-primary">{t.name}</span>
                            <span className="block text-[10px] text-text-muted mt-0.5 truncate">{t.desc}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};