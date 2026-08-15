import { tools, ToolGroup, ToolItem } from './tools';

export const SITE = {
    name: 'All Tools',
    url: 'https://all-tools-lake.vercel.app',
    description: '47 free online tools that run 100% in your browser. Compress images, convert PDFs & Word, edit videos, generate QR codes - no uploads, no sign-up, no limits.',
};

export interface ToolSeo {
    title: string;
    description: string;
    intro: string;
    steps: string[];
    faqs: { q: string; a: string }[];
    keywords: string[];
}

/** High-value overrides for the tools with the most search volume. */
const OVERRIDES: Record<string, Partial<ToolSeo>> = {
    '/image-tools/compress': {
        title: 'Compress Image Online Free - Reduce JPG & PNG Size Without Losing Quality',
        description: 'Free online image compressor. Reduce JPG, PNG & WebP file size up to 90% without visible quality loss. No upload - images are compressed locally in your browser.',
        intro: 'Compress JPG, PNG and WebP images directly in your browser. Our image compressor reduces file size by up to 90% while keeping visual quality - and because everything runs locally on your device, your photos are never uploaded to any server.',
        keywords: ['compress image', 'reduce image size', 'compress jpg', 'compress png', 'image compressor online'],
    },
    '/pdf-tools/pdf-to-word': {
        title: 'PDF to Word Converter Free - Edit PDF Text in DOCX Online',
        description: 'Convert PDF to editable Word (DOCX) files free. Extract text and headings from any PDF instantly. 100% private - files never leave your browser.',
        intro: 'Convert PDF documents into fully editable Word files. Text, paragraphs and headings are extracted and rebuilt as a proper DOCX you can edit in Microsoft Word or Google Docs - all processed locally for complete privacy.',
        keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word free', 'pdf converter'],
    },
    '/pdf-tools/word-to-pdf': {
        title: 'Word to PDF Converter Free - DOCX to PDF Online Instantly',
        description: 'Convert Word documents (DOCX) to PDF online for free. Keeps headings and formatting. Files are converted in your browser - nothing is uploaded.',
        intro: 'Turn Word documents into shareable PDFs in seconds. Your DOCX is parsed and rendered to a clean, portable PDF with headings and paragraphs preserved - entirely on your device.',
        keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf free'],
    },
    '/video-tools/compress': {
        title: 'Video Compressor Online Free - Compress MP4 in Your Browser',
        description: 'Compress MP4, WebM and MOV videos online for free. Adjust quality, resolution and audio - processing happens on your device, your video is never uploaded.',
        intro: 'Shrink large video files without uploading them anywhere. Choose your quality level and resolution, and our browser-based compressor (powered by WebAssembly ffmpeg) does the rest - privately, on your own device.',
        keywords: ['compress video', 'video compressor online', 'compress mp4', 'reduce video size'],
    },
    '/video-tools/to-gif': {
        title: 'Video to GIF Converter Free - Make GIFs from MP4 Clips Online',
        description: 'Convert video clips to animated GIFs free. Trim any section, choose size and FPS. Everything runs in your browser - no upload, no watermark.',
        intro: 'Create perfect GIFs from any video. Trim the exact section you want, pick the width and frame rate, and download a high-quality animated GIF - all processed locally with no watermarks.',
        keywords: ['video to gif', 'mp4 to gif', 'convert video to gif', 'gif maker'],
    },
    '/generator-tools/qr': {
        title: 'QR Code Generator Free - Create QR Codes for WiFi, Links & Contacts',
        description: 'Free QR code generator. Make QR codes for websites, WiFi passwords, phone numbers and contact cards. Custom colors, instant PNG download, works offline.',
        intro: 'Generate QR codes for any purpose - website links, WiFi credentials, contact cards, phone numbers and more. Customize colors, download as PNG, and generate unlimited codes completely free.',
        keywords: ['qr code generator', 'free qr code', 'wifi qr code', 'create qr code'],
    },
    '/unit-tools/nepali-date': {
        title: 'Nepali Date Converter - BS to AD & AD to BS (Bikram Sambat)',
        description: 'Convert Nepali dates (Bikram Sambat) to English (AD) and back. Accurate BS calendar data for 2000-2090. Works offline in your browser.',
        intro: 'Convert dates between the Nepali Bikram Sambat calendar and the Gregorian (AD) calendar. Our converter uses complete BS calendar data from 2000-2090 for accurate results every time.',
        keywords: ['nepali date converter', 'bs to ad', 'ad to bs', 'bikram sambat converter', 'nepali calendar'],
    },
    '/dev-tools/password-generator': {
        title: 'Strong Password Generator Free - Secure Random Passwords',
        description: 'Generate strong, secure passwords instantly. Cryptographically secure randomness, custom length and character sets, strength meter. Free and private.',
        intro: "Create uncrackable passwords using your browser's cryptographic random generator. Choose length and character sets, avoid ambiguous characters, and check strength - passwords are generated on your device only and never transmitted.",
        keywords: ['password generator', 'strong password', 'random password generator', 'secure password'],
    },
    '/finance-tools/emi': {
        title: 'EMI Calculator Free - Monthly Loan Payment Calculator',
        description: 'Calculate EMI (Equated Monthly Installment) for home, car and personal loans. See total interest and payment schedule instantly.',
        intro: 'Plan any loan with precision. Enter the amount, interest rate and tenure to get your monthly EMI, total interest payable and total payment - instantly, with a full breakdown.',
        keywords: ['emi calculator', 'loan calculator', 'monthly payment calculator', 'home loan emi'],
    },
    '/unit-tools/bmi': {
        title: 'BMI Calculator Free - Check Your Body Mass Index',
        description: 'Calculate your Body Mass Index (BMI) instantly. Find out if you are underweight, normal, overweight or obese based on WHO standards.',
        intro: 'Check your Body Mass Index in seconds. Enter your height and weight to see your BMI, your WHO weight category, and your healthy weight range.',
        keywords: ['bmi calculator', 'body mass index', 'bmi chart', 'healthy weight calculator'],
    },
    '/text-tools/word-count': {
        title: 'Word Counter Free - Count Words, Characters & Reading Time',
        description: 'Free online word counter. Count words, characters, sentences, paragraphs and estimated reading time as you type. Perfect for essays, tweets and SEO.',
        intro: 'Live word and character counting as you type. See sentence and paragraph counts, reading time, speaking time and social media limit trackers - ideal for essays, blog posts and tweets.',
        keywords: ['word counter', 'word count', 'character counter', 'count words online'],
    },
    '/health-tools/calorie': {
        title: 'Calorie Calculator Free - Daily Intake & TDEE with Macros',
        description: 'Calculate how many calories you need daily to lose, maintain or gain weight. TDEE, BMR and macro breakdown using the Mifflin-St Jeor formula.',
        intro: 'Find your exact daily calorie target. We calculate your BMR and TDEE with the scientifically validated Mifflin-St Jeor equation, then adjust for your goal - complete with protein, carb and fat macro targets.',
        keywords: ['calorie calculator', 'tdee calculator', 'how many calories should i eat', 'bmr calculator'],
    },
};

function findTool(path: string): { group: ToolGroup; item: ToolItem } | null {
    for (const group of tools) {
        const item = group.items.find((i) => i.path === path);
        if (item) return { group, item };
    }
    return null;
}

/** Generate (or override) full SEO data for any tool path. */
export function getToolSeo(path: string): ToolSeo | null {
    const found = findTool(path);
    if (!found) return null;
    const { group, item } = found;
    const override = OVERRIDES[path] ?? {};

    const name = item.name;
    const categoryName = group.category.replace(' Tools', '');

    const title = override.title ?? `${name} - Free Online ${categoryName} Tool | ${SITE.name}`;
    const description = override.description ??
        `${item.desc}. Free online ${name.toLowerCase()} that runs entirely in your browser - no uploads, no sign-up, no limits.`;
    const intro = override.intro ??
        `Use the ${name.toLowerCase()} for free. ${item.desc}. Like all ${SITE.name} tools, it runs 100% in your browser - fast, private and completely free.`;

    const steps = override.steps ?? [
        `Open the ${name.toLowerCase()} - no sign-up or installation needed.`,
        'Enter your input or upload your file.',
        'Get your result instantly - copy or download it.',
        'Everything is processed on your device - nothing is uploaded.',
    ];

    const faqs = override.faqs ?? [
        { q: `Is the ${name.toLowerCase()} really free?`, a: `Yes - completely free with no limits, no sign-up and no hidden fees. All ${SITE.name} tools are free forever.` },
        { q: 'Are my files or data uploaded to a server?', a: 'No. This tool runs entirely in your browser using modern web technology. Your files and data never leave your device.' },
        { q: 'Does it work on mobile phones?', a: 'Yes, it works on any modern device - Android, iPhone, Windows, Mac and Linux - directly in the browser.' },
        { q: 'Do I need to install anything?', a: 'No installation needed. The tool loads instantly in your browser.' },
    ];

    const keywords = override.keywords ?? [name.toLowerCase(), `${name.toLowerCase()} online`, `free ${name.toLowerCase()}`, `${name.toLowerCase()} tool`];

    return { title, description, intro, steps, faqs, keywords };
}

/** All routes for sitemap generation. */
export function getAllRoutes(): string[] {
    const routes = ['/', ...tools.map((g) => `/category/${g.id}`)];
    for (const g of tools) {
        for (const item of g.items) routes.push(item.path);
    }
    routes.push('/privacy-policy', '/terms', '/about', '/contact');
    return routes;
}