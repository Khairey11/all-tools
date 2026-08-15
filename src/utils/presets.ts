export interface SocialMediaPreset {
    name: string;
    width: number;
    height: number;
    category: string;
    icon?: string;
}

export const socialMediaPresets: Record<string, SocialMediaPreset> = {
    'instagram-post': {
        name: 'Instagram Post (Square)',
        width: 1080,
        height: 1080,
        category: 'Instagram',
    },
    'instagram-story': {
        name: 'Instagram Story',
        width: 1080,
        height: 1920,
        category: 'Instagram',
    },
    'instagram-landscape': {
        name: 'Instagram Landscape',
        width: 1080,
        height: 566,
        category: 'Instagram',
    },
    'facebook-post': {
        name: 'Facebook Post',
        width: 1200,
        height: 630,
        category: 'Facebook',
    },
    'facebook-cover': {
        name: 'Facebook Cover',
        width: 820,
        height: 312,
        category: 'Facebook',
    },
    'twitter-post': {
        name: 'Twitter/X Post',
        width: 1200,
        height: 675,
        category: 'Twitter',
    },
    'twitter-header': {
        name: 'Twitter/X Header',
        width: 1500,
        height: 500,
        category: 'Twitter',
    },
    'linkedin-post': {
        name: 'LinkedIn Post',
        width: 1200,
        height: 627,
        category: 'LinkedIn',
    },
    'youtube-thumbnail': {
        name: 'YouTube Thumbnail',
        width: 1280,
        height: 720,
        category: 'YouTube',
    },
    'pinterest-pin': {
        name: 'Pinterest Pin',
        width: 1000,
        height: 1500,
        category: 'Pinterest',
    },
};

export type PresetKey = keyof typeof socialMediaPresets;
