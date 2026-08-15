import React, { useEffect, useRef } from 'react';
import { AD_CONFIG, adsActive } from '../config/ads';

interface AdBannerProps {
    /** Position key from AD_CONFIG.positions - controls enable/disable per slot. */
    slot?: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    className?: string;
}

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

/**
 * Google AdSense banner. Behaviour is fully controlled by src/config/ads.ts:
 *  - No publisher ID  -> nothing rendered in production (placeholder in dev only)
 *  - Position disabled in config -> nothing rendered
 *  - Publisher ID set -> real responsive AdSense unit with the position's slotId
 */
export const AdBanner: React.FC<AdBannerProps> = ({
    slot = 'tool-footer-ad',
    format = 'auto',
    className = '',
}) => {
    const insRef = useRef<HTMLModElement | null>(null);
    const position = AD_CONFIG.positions[slot];
    const isEnabled = AD_CONFIG.enabled && position?.enabled !== false;
    const live = adsActive() && isEnabled;

    // Push the ad to AdSense after mount (required for dynamically rendered <ins>).
    useEffect(() => {
        if (!live || !insRef.current) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // AdSense script not loaded yet - it will process on its own init.
        }
    }, [live]);

    // Disabled position or production-without-ID: render nothing at all.
    if (!isEnabled) return null;
    if (!live) {
        // Development placeholder (config-gated).
        return AD_CONFIG.showPlaceholderInDev && !import.meta.env.PROD ? (
            <div className={`w-full overflow-hidden my-6 ${className}`}>
                <div
                    className="w-full h-32 bg-white/5 border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center text-text-muted select-none"
                    aria-hidden="true"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Advertisement Space</span>
                    <span className="text-[9px] opacity-50">{position?.label ?? slot}</span>
                </div>
            </div>
        ) : null;
    }

    // Live AdSense unit.
    return (
        <div className={`w-full overflow-hidden my-6 ${className}`}>
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: 'block', minHeight: 100 }}
                data-ad-client={AD_CONFIG.publisherId}
                data-ad-slot={position?.slotId ?? ''}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
};