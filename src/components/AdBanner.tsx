import React from 'react';

interface AdBannerProps {
    slot?: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    className?: string;
    demo?: boolean; // For showing the placeholder visually during dev
}

export const AdBanner: React.FC<AdBannerProps> = ({
    slot = "1234567890",
    format = "auto",
    className = "",
    demo = true
}) => {
    // This is a placeholder for Google AdSense
    // When ready, you would replace the demo visuals with the actual <ins> tag script

    // Silence unused variable warning for future props
    console.debug('Ad Slot Ready:', slot, format);

    return (
        <div className={`w-full overflow-hidden my-6 ${className}`}>
            {/* 
                GOOGLE ADSENSE CODE WOULD GO HERE 
                For example:
                <ins className="adsbygoogle"
                     style={{ display: 'block' }}
                     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                     data-ad-slot={slot}
                     data-ad-format={format}
                     data-full-width-responsive="true"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            */}

            {demo && (
                <div className="w-full h-32 bg-white/5 border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center text-text-muted select-none group hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Advertisement Space</span>
                    <span className="text-[9px] opacity-50">Google AdSense Placeholder</span>
                </div>
            )}
        </div>
    );
};
