import React from 'react';
import {
    Image,
    FileText,
    Code,
    Search,
    Type,
    Maximize2,
    FileImage,
    Zap,
    Share2,
    MessageSquare,
    BarChart3,
    Calculator,
    Globe,
    Ruler,
    Clock,
    Activity,
    Wind,
    Shield,
    Palette,
    Layers,
    Film
} from 'lucide-react';

export interface ToolItem {
    name: string;
    desc: string;
    path: string;
    icon: React.ReactNode;
}

export interface ToolGroup {
    category: string;
    icon: React.ReactNode;
    color: string;
    items: ToolItem[];
    id: string; // Added for routing
}

export const tools: ToolGroup[] = [
    {
        id: 'image-tools',
        category: 'Image Tools',
        icon: <Image className="w-6 h-6" />,
        color: 'from-blue-500 to-cyan-400',
        items: [
            { name: 'Compress Image', desc: 'Reduce file size without quality loss', path: '/image-tools/compress', icon: <Zap className="w-4 h-4" /> },
            { name: 'GIF Compressor', desc: 'Compress animated GIFs to a target size', path: '/image-tools/gif-compressor', icon: <Film className="w-4 h-4" /> },
            { name: 'Resize Image', desc: 'Change dimensions for social media', path: '/image-tools/resize', icon: <Maximize2 className="w-4 h-4" /> },
            { name: 'PNG to JPG', desc: 'Convert formats instantly', path: '/image-tools/png-to-jpg', icon: <FileImage className="w-4 h-4" /> },
            { name: 'Watermark Adder', desc: 'Add text or logo watermarks (Bulk)', path: '/image-tools/watermark-adder', icon: <Layers className="w-4 h-4" /> },
            { name: 'Palette Extractor', desc: 'Get dominant colors from photos', path: '/image-tools/palette', icon: <Palette className="w-4 h-4" /> },
        ]
    },
    {
        id: 'pdf-tools',
        category: 'PDF Tools',
        icon: <FileText className="w-6 h-6" />,
        color: 'from-red-500 to-orange-400',
        items: [
            { name: 'Compress PDF', desc: 'Shrink PDF documents', path: '/pdf-tools/compress', icon: <Zap className="w-4 h-4" /> },
            { name: 'PDF to Word', desc: 'Convert PDF to editable Word', path: '/pdf-tools/pdf-to-word', icon: <FileText className="w-4 h-4" /> },
            { name: 'Word to PDF', desc: 'Convert Word to portable PDF', path: '/pdf-tools/word-to-pdf', icon: <FileText className="w-4 h-4" /> },
            { name: 'PDF Editor', desc: 'Rotate, reorder & delete pages', path: '/pdf-tools/editor', icon: <FileText className="w-4 h-4" /> },
            { name: 'PDF to Image', desc: 'Convert pages to JPG/PNG', path: '/pdf-tools/to-image', icon: <FileImage className="w-4 h-4" /> },
        ]
    },
    {
        id: 'dev-tools',
        category: 'Developer Tools',
        icon: <Code className="w-6 h-6" />,
        color: 'from-green-500 to-emerald-400',
        items: [
            { name: 'Password Strength', desc: 'Secure password analyzer', path: '/dev-tools/password-strength', icon: <Shield className="w-4 h-4" /> },
            { name: 'Base64 Converter', desc: 'Encode/Decode text formats', path: '/dev-tools/base64', icon: <Zap className="w-4 h-4" /> },
            { name: 'Color Converter', desc: 'HEX to RGB and back', path: '/dev-tools/color', icon: <Palette className="w-4 h-4" /> },
            { name: 'JSON Formatter', desc: 'Prettify and validate JSON', path: '/dev-tools/json', icon: <Code className="w-4 h-4" /> },
        ]
    },
    {
        id: 'text-tools',
        category: 'Text Tools',
        icon: <Type className="w-6 h-6" />,
        color: 'from-fuchsia-500 to-purple-400',
        items: [
            { name: 'Case Converter', desc: 'UPPER, lower, camel, snake, kebab', path: '/text-tools/case', icon: <Type className="w-4 h-4" /> },
        ]
    },
    {
        id: 'seo-tools',
        category: 'SEO Tools',
        icon: <Search className="w-6 h-6" />,
        color: 'from-amber-500 to-yellow-400',
        items: [
            { name: 'Meta Tag Generator', desc: 'Create SEO optimized tags', path: '/seo-tools/meta', icon: <Search className="w-4 h-4" /> },
            { name: 'Keywords Density', desc: 'Analyze content keywords', path: '/seo-tools/keywords', icon: <Search className="w-4 h-4" /> },
            { name: 'Keyword Competition', desc: 'Check SEO difficulty & volume', path: '/seo-tools/competition', icon: <BarChart3 className="w-4 h-4" /> },
        ]
    },
    {
        id: 'social-tools',
        category: 'Social Tools',
        icon: <Share2 className="w-6 h-6" />,
        color: 'from-blue-600 to-indigo-500',
        items: [
            { name: 'AI Caption Generator', desc: 'Create viral captions & hashtags', path: '/social-tools/captions', icon: <MessageSquare className="w-4 h-4" /> },
        ]
    },
    {
        id: 'finance-tools',
        category: 'Finance Tools',
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'from-emerald-500 to-teal-400',
        items: [
            { name: 'Percentage Calc', desc: 'Quick percentage & change calc', path: '/finance-tools/percentage', icon: <Zap className="w-4 h-4" /> },
            { name: 'Interest Calc', desc: 'Simple & Compound interest', path: '/finance-tools/interest', icon: <Zap className="w-4 h-4" /> },
            { name: 'EMI Calculator', desc: 'Plan your loan repayments', path: '/finance-tools/emi', icon: <Calculator className="w-4 h-4" /> },
            { name: 'Currency Conv', desc: 'Live exchange rate converter', path: '/finance-tools/currency', icon: <Globe className="w-4 h-4" /> },
        ]
    },
    {
        id: 'unit-tools',
        category: 'Units & Time',
        icon: <Clock className="w-6 h-6" />,
        color: 'from-orange-500 to-rose-400',
        items: [
            { name: 'Age Calculator', desc: 'Calculate exact age from birth date', path: '/unit-tools/age', icon: <Activity className="w-4 h-4" /> },
            { name: 'BMI Calculator', desc: 'Health & weight index calculator', path: '/unit-tools/bmi', icon: <Activity className="w-4 h-4" /> },
            { name: 'Date Difference', desc: 'Time duration between two dates', path: '/unit-tools/date-diff', icon: <Clock className="w-4 h-4" /> },
            { name: 'Time Zone', desc: 'Global time zone converter', path: '/unit-tools/timezone', icon: <Globe className="w-4 h-4" /> },
            { name: 'Unit Converter', desc: 'Length, Weight, & Temp conversion', path: '/unit-tools/units', icon: <Ruler className="w-4 h-4" /> },
            { name: 'Speed Converter', desc: 'Metric & Imperial speed units', path: '/unit-tools/speed', icon: <Wind className="w-4 h-4" /> },
        ]
    }
];
