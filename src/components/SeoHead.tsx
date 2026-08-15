import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getToolSeo, SITE } from '../data/seo-content';

interface SeoHeadProps {
    /** Tool path like '/video-tools/compress', or omit for site-wide. */
    path?: string;
    /** Override title for non-tool pages (category pages, policy pages). */
    title?: string;
    description?: string;
}

/** Renders full head tags + JSON-LD structured data for a route. */
export const SeoHead: React.FC<SeoHeadProps> = ({ path, title, description }) => {
    const seo = path ? getToolSeo(path) : null;
    const pageTitle = title ?? seo?.title ?? `${SITE.name} - 47 Free Online Tools That Run In Your Browser`;
    const pageDesc = description ?? seo?.description ?? SITE.description;
    const canonical = `${SITE.url}${path && path !== '/' ? path : ''}`;

    const jsonLd: Record<string, unknown>[] = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE.name,
            url: SITE.url,
        },
    ];

    if (seo) {
        jsonLd.push(
            {
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: seo.title.split('|')[0].trim(),
                url: canonical,
                description: seo.description,
                applicationCategory: 'UtilityApplication',
                operatingSystem: 'Any (Web Browser)',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
            {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: seo.faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
            },
            {
                '@context': 'https://schema.org',
                '@type': 'HowTo',
                name: seo.title.split('|')[0].trim(),
                step: seo.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
            }
        );
    }

    return (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDesc} />
            <link rel="canonical" href={canonical} />
            <meta name="keywords" content={seo?.keywords.join(', ')} />

            <meta property="og:type" content="website" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDesc} />
            <meta property="og:url" content={canonical} />
            <meta property="og:site_name" content={SITE.name} />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDesc} />

            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
    );
};