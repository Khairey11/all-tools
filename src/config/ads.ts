/**
 * ─────────────────────────────────────────────────────────────
 *  AD CONTROL PANEL - you decide where ads appear.
 *
 *  1. After AdSense approval, paste your publisher ID below
 *     (looks like "ca-pub-1234567890123456") and ads go live
 *     in every enabled position automatically.
 *  2. Flip any position's `enabled` to false to remove it
 *     site-wide instantly.
 *  3. Optionally map each position to a real AdSense ad unit
 *     slot ID (from your AdSense dashboard) to track earnings
 *     per position.
 * ─────────────────────────────────────────────────────────────
 */
export const AD_CONFIG = {
    /** Paste your AdSense publisher ID here when approved. Empty = no ads shown. */
    publisherId: '',

    /** Master switch - set false to disable every ad instantly. */
    enabled: true,

    /** Show the dashed "Advertisement Space" placeholder during development. */
    showPlaceholderInDev: true,

    /** Per-position control. slotId = your AdSense ad unit ID (optional). */
    positions: {
        'home-hero-ad':              { enabled: true,  label: 'Home - below hero' },
        'sidebar-ad-1':              { enabled: true,  label: 'Sidebar (desktop)' },
        'fixed-bottom-right':        { enabled: true,  label: 'Fixed bottom-right (2xl screens)' },
        'tool-footer-ad':            { enabled: true,  label: 'Below every tool' },
        'tool-results-ad':           { enabled: true,  label: 'Below tool results' },
        'pdf-editor-upload':         { enabled: true,  label: 'PDF Editor - upload state' },
        'pdf-editor-bottom':         { enabled: true,  label: 'PDF Editor - bottom' },
        'pdf-to-img-upload':         { enabled: true,  label: 'PDF to Image - upload state' },
        'pdf-to-img-results':        { enabled: true,  label: 'PDF to Image - results' },
        'palette-extractor-footer':  { enabled: true,  label: 'Palette Extractor - bottom' },
    } as Record<string, { enabled: boolean; label?: string; slotId?: string }>,
};

/** True when real ads should render (config on + publisher ID set + production). */
export function adsActive(): boolean {
    return (
        AD_CONFIG.enabled &&
        !!AD_CONFIG.publisherId &&
        import.meta.env.PROD
    );
}