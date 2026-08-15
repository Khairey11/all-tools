/* eslint-disable no-undef */
/**
 * Generates public/sitemap.xml, public/robots.txt and public/ads.txt
 * by reading the actual routes from src/App.tsx and categories from
 * src/data/tools.tsx. Run automatically after every build.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://all-tools-lake.vercel.app';

const appSrc = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');
const toolsSrc = readFileSync(resolve(root, 'src/data/tools.tsx'), 'utf8');

// Tool + info routes from <Route path="..." />
const routeMatches = [...appSrc.matchAll(/path="(\/[^"]*)"/g)].map((m) => m[1]);
const toolRoutes = [...new Set(routeMatches)].filter((r) => r !== '/' && r !== '*');

// Category routes from id: '...' in tools.tsx
const categoryIds = [...toolsSrc.matchAll(/id:\s*'([a-z-]+)'/g)].map((m) => m[1]);
const categoryRoutes = [...new Set(categoryIds)].map((id) => `/category/${id}`);

const allRoutes = ['/', ...categoryRoutes, ...toolRoutes];

// ── sitemap.xml ──
const today = new Date().toISOString().slice(0, 10);
const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    allRoutes
        .map((r) => `  <url><loc>${SITE_URL}${r === '/' ? '' : r}</loc><lastmod>${today}</lastmod></url>`)
        .join('\n') +
    '\n</urlset>\n';

if (!existsSync(resolve(root, 'public'))) mkdirSync(resolve(root, 'public'));
writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap);
writeFileSync(
    resolve(root, 'public/robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);
// ads.txt placeholder - replace PUB_ID after AdSense approval
writeFileSync(
    resolve(root, 'public/ads.txt'),
    '# Replace PUB_ID with your AdSense publisher ID after approval\n# google.com, PUB_ID, DIRECT, f08c47fec0942fa0\n'
);

console.log(`SEO files generated: ${allRoutes.length} URLs in sitemap, robots.txt + ads.txt written.`);