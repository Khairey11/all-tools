import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CategoryTools } from './pages/CategoryTools';
import { SeoHead } from './components/SeoHead';
import { SeoContent } from './components/SeoContent';
import { AdBanner } from './components/AdBanner';
import { CookieConsent, ErrorBoundary } from './components/SystemComponents';
import { getToolSeo } from './data/seo-content';

/* ── Route-level code splitting: each tool loads only when visited ── */
const ImageCompressor = lazy(() => import('./pages/image-tools/ImageCompressor').then((m) => ({ default: m.ImageCompressor })));
const GifCompressor = lazy(() => import('./pages/image-tools/GifCompressor').then((m) => ({ default: m.GifCompressor })));
const ImageResizer = lazy(() => import('./pages/image-tools/ImageResizer').then((m) => ({ default: m.ImageResizer })));
const ImageFormatConverter = lazy(() => import('./pages/image-tools/ImageFormatConverter').then((m) => ({ default: m.ImageFormatConverter })));
const WatermarkAdder = lazy(() => import('./pages/image-tools/WatermarkAdder').then((m) => ({ default: m.WatermarkAdder })));
const ColorPaletteExtractor = lazy(() => import('./pages/image-tools/ColorPaletteExtractor').then((m) => ({ default: m.ColorPaletteExtractor })));

const VideoCompressor = lazy(() => import('./pages/video-tools/VideoCompressor').then((m) => ({ default: m.VideoCompressor })));
const VideoToGif = lazy(() => import('./pages/video-tools/VideoToGif').then((m) => ({ default: m.VideoToGif })));

const QrGenerator = lazy(() => import('./pages/generator-tools/QrGenerator').then((m) => ({ default: m.QrGenerator })));

const CalorieCalculator = lazy(() => import('./pages/health-tools/CalorieCalculator').then((m) => ({ default: m.CalorieCalculator })));
const WaterIntake = lazy(() => import('./pages/health-tools/WaterIntake').then((m) => ({ default: m.WaterIntake })));
const SleepCycle = lazy(() => import('./pages/health-tools/SleepCycle').then((m) => ({ default: m.SleepCycle })));

const PomodoroTimer = lazy(() => import('./pages/productivity-tools/PomodoroTimer').then((m) => ({ default: m.PomodoroTimer })));

const PdfCompressor = lazy(() => import('./pages/pdf-tools/PdfCompressor').then((m) => ({ default: m.PdfCompressor })));
const WordConverter = lazy(() => import('./pages/pdf-tools/WordConverter').then((m) => ({ default: m.WordConverter })));
const WordToPdf = lazy(() => import('./pages/pdf-tools/WordToPdf').then((m) => ({ default: m.WordToPdf })));
const PdfEditor = lazy(() => import('./pages/pdf-tools/PdfEditor').then((m) => ({ default: m.PdfEditor })));
const PdfToImage = lazy(() => import('./pages/pdf-tools/PdfToImage').then((m) => ({ default: m.PdfToImage })));

const TextCaseConverter = lazy(() => import('./pages/dev-tools/TextCaseConverter').then((m) => ({ default: m.TextCaseConverter })));
const PasswordStrength = lazy(() => import('./pages/dev-tools/PasswordStrength').then((m) => ({ default: m.PasswordStrength })));
const Base64Converter = lazy(() => import('./pages/dev-tools/Base64Converter').then((m) => ({ default: m.Base64Converter })));
const ColorConverter = lazy(() => import('./pages/dev-tools/ColorConverter').then((m) => ({ default: m.ColorConverter })));
const JsonFormatter = lazy(() => import('./pages/dev-tools/JsonFormatter').then((m) => ({ default: m.JsonFormatter })));
const PasswordGenerator = lazy(() => import('./pages/dev-tools/PasswordGenerator').then((m) => ({ default: m.PasswordGenerator })));
const HashGenerator = lazy(() => import('./pages/dev-tools/HashGenerator').then((m) => ({ default: m.HashGenerator })));

const WordCounter = lazy(() => import('./pages/text-tools/WordCounter').then((m) => ({ default: m.WordCounter })));
const LoremIpsum = lazy(() => import('./pages/text-tools/LoremIpsum').then((m) => ({ default: m.LoremIpsum })));

const MetaTagGenerator = lazy(() => import('./pages/seo-tools/MetaTagGenerator').then((m) => ({ default: m.MetaTagGenerator })));
const KeywordDensity = lazy(() => import('./pages/seo-tools/KeywordDensity').then((m) => ({ default: m.KeywordDensity })));
const KeywordCompetition = lazy(() => import('./pages/seo-tools/KeywordCompetition').then((m) => ({ default: m.KeywordCompetition })));

const CaptionGenerator = lazy(() => import('./pages/social-tools/CaptionGenerator').then((m) => ({ default: m.CaptionGenerator })));

const PercentageCalculator = lazy(() => import('./pages/finance-tools/PercentageCalculator').then((m) => ({ default: m.PercentageCalculator })));
const InterestCalculator = lazy(() => import('./pages/finance-tools/InterestCalculator').then((m) => ({ default: m.InterestCalculator })));
const EmiCalculator = lazy(() => import('./pages/finance-tools/EmiCalculator').then((m) => ({ default: m.EmiCalculator })));
const CurrencyConverter = lazy(() => import('./pages/finance-tools/CurrencyConverter').then((m) => ({ default: m.CurrencyConverter })));
const TipCalculator = lazy(() => import('./pages/finance-tools/TipCalculator').then((m) => ({ default: m.TipCalculator })));
const DiscountCalculator = lazy(() => import('./pages/finance-tools/DiscountCalculator').then((m) => ({ default: m.DiscountCalculator })));

const AgeCalculator = lazy(() => import('./pages/unit-tools/AgeCalculator').then((m) => ({ default: m.AgeCalculator })));
const BmiCalculator = lazy(() => import('./pages/unit-tools/BmiCalculator').then((m) => ({ default: m.BmiCalculator })));
const DateDifference = lazy(() => import('./pages/unit-tools/DateDifference').then((m) => ({ default: m.DateDifference })));
const TimeZoneConverter = lazy(() => import('./pages/unit-tools/TimeZoneConverter').then((m) => ({ default: m.TimeZoneConverter })));
const UnitConverter = lazy(() => import('./pages/unit-tools/UnitConverter').then((m) => ({ default: m.UnitConverter })));
const SpeedConverter = lazy(() => import('./pages/unit-tools/SpeedConverter').then((m) => ({ default: m.SpeedConverter })));
const NepaliDateConverter = lazy(() => import('./pages/unit-tools/NepaliDateConverter').then((m) => ({ default: m.NepaliDateConverter })));

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })));
const About = lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/InfoPages').then((m) => ({ default: m.Contact })));

/** Loading skeleton shown while a split chunk loads. */
const PageLoader = () => (
    <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-white/10 border-t-primary rounded-full animate-spin" style={{ borderWidth: 3 }} />
    </div>
);

/**
 * Wraps a tool route: SEO head tags, error boundary, lazy chunk,
 * ad slot below the tool, and visible SEO content.
 */
function ToolRoute({ path, children }: { path: string; children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <SeoHead path={path} />
            <Suspense fallback={<PageLoader />}>
                {children}
                <AdBanner slot="tool-footer-ad" />
                <SeoContent path={path} />
            </Suspense>
        </ErrorBoundary>
    );
}

/** Sets head tags for non-tool pages (home, categories). */
function RouteHead() {
    const { pathname } = useLocation();
    if (getToolSeo(pathname)) return null; // tool pages set their own via ToolRoute
    if (pathname.startsWith('/category/')) {
        const id = pathname.replace('/category/', '');
        return <SeoHead title={`${id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} - Free Online Tools | All Tools`} description={`Browse all free ${id.replace(/-/g, ' ')} that run in your browser. No uploads, no sign-up.`} />;
    }
    return <SeoHead />;
}

function App() {
    return (
        <HelmetProvider>
            <Router>
                <Layout>
                    <RouteHead />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/category/:categoryId" element={<CategoryTools />} />

                        {/* Image Tools */}
                        <Route path="/image-tools/compress" element={<ToolRoute path="/image-tools/compress"><ImageCompressor /></ToolRoute>} />
                        <Route path="/image-tools/gif-compressor" element={<ToolRoute path="/image-tools/gif-compressor"><GifCompressor /></ToolRoute>} />
                        <Route path="/image-tools/resize" element={<ToolRoute path="/image-tools/resize"><ImageResizer /></ToolRoute>} />
                        <Route path="/image-tools/png-to-jpg" element={<ToolRoute path="/image-tools/png-to-jpg"><ImageFormatConverter /></ToolRoute>} />
                        <Route path="/image-tools/watermark-adder" element={<ToolRoute path="/image-tools/watermark-adder"><WatermarkAdder /></ToolRoute>} />
                        <Route path="/image-tools/palette" element={<ToolRoute path="/image-tools/palette"><ColorPaletteExtractor /></ToolRoute>} />

                        {/* Video Tools */}
                        <Route path="/video-tools/compress" element={<ToolRoute path="/video-tools/compress"><VideoCompressor /></ToolRoute>} />
                        <Route path="/video-tools/to-gif" element={<ToolRoute path="/video-tools/to-gif"><VideoToGif /></ToolRoute>} />

                        {/* Generators */}
                        <Route path="/generator-tools/qr" element={<ToolRoute path="/generator-tools/qr"><QrGenerator /></ToolRoute>} />

                        {/* Health Tools */}
                        <Route path="/health-tools/calorie" element={<ToolRoute path="/health-tools/calorie"><CalorieCalculator /></ToolRoute>} />
                        <Route path="/health-tools/water" element={<ToolRoute path="/health-tools/water"><WaterIntake /></ToolRoute>} />
                        <Route path="/health-tools/sleep" element={<ToolRoute path="/health-tools/sleep"><SleepCycle /></ToolRoute>} />

                        {/* Productivity */}
                        <Route path="/productivity-tools/pomodoro" element={<ToolRoute path="/productivity-tools/pomodoro"><PomodoroTimer /></ToolRoute>} />

                        {/* PDF Tools */}
                        <Route path="/pdf-tools/compress" element={<ToolRoute path="/pdf-tools/compress"><PdfCompressor /></ToolRoute>} />
                        <Route path="/pdf-tools/pdf-to-word" element={<ToolRoute path="/pdf-tools/pdf-to-word"><WordConverter /></ToolRoute>} />
                        <Route path="/pdf-tools/word-to-pdf" element={<ToolRoute path="/pdf-tools/word-to-pdf"><WordToPdf /></ToolRoute>} />
                        <Route path="/pdf-tools/editor" element={<ToolRoute path="/pdf-tools/editor"><PdfEditor /></ToolRoute>} />
                        <Route path="/pdf-tools/to-image" element={<ToolRoute path="/pdf-tools/to-image"><PdfToImage /></ToolRoute>} />

                        {/* Text Tools */}
                        <Route path="/text-tools/case" element={<ToolRoute path="/text-tools/case"><TextCaseConverter /></ToolRoute>} />
                        <Route path="/text-tools/word-count" element={<ToolRoute path="/text-tools/word-count"><WordCounter /></ToolRoute>} />
                        <Route path="/text-tools/lorem" element={<ToolRoute path="/text-tools/lorem"><LoremIpsum /></ToolRoute>} />

                        {/* Dev Tools */}
                        <Route path="/dev-tools/password-strength" element={<ToolRoute path="/dev-tools/password-strength"><PasswordStrength /></ToolRoute>} />
                        <Route path="/dev-tools/json" element={<ToolRoute path="/dev-tools/json"><JsonFormatter /></ToolRoute>} />
                        <Route path="/dev-tools/base64" element={<ToolRoute path="/dev-tools/base64"><Base64Converter /></ToolRoute>} />
                        <Route path="/dev-tools/color" element={<ToolRoute path="/dev-tools/color"><ColorConverter /></ToolRoute>} />
                        <Route path="/dev-tools/password-generator" element={<ToolRoute path="/dev-tools/password-generator"><PasswordGenerator /></ToolRoute>} />
                        <Route path="/dev-tools/hash" element={<ToolRoute path="/dev-tools/hash"><HashGenerator /></ToolRoute>} />

                        {/* SEO Tools */}
                        <Route path="/seo-tools/meta" element={<ToolRoute path="/seo-tools/meta"><MetaTagGenerator /></ToolRoute>} />
                        <Route path="/seo-tools/keywords" element={<ToolRoute path="/seo-tools/keywords"><KeywordDensity /></ToolRoute>} />
                        <Route path="/seo-tools/competition" element={<ToolRoute path="/seo-tools/competition"><KeywordCompetition /></ToolRoute>} />

                        {/* Social Tools */}
                        <Route path="/social-tools/captions" element={<ToolRoute path="/social-tools/captions"><CaptionGenerator /></ToolRoute>} />

                        {/* Finance Tools */}
                        <Route path="/finance-tools/percentage" element={<ToolRoute path="/finance-tools/percentage"><PercentageCalculator /></ToolRoute>} />
                        <Route path="/finance-tools/interest" element={<ToolRoute path="/finance-tools/interest"><InterestCalculator /></ToolRoute>} />
                        <Route path="/finance-tools/emi" element={<ToolRoute path="/finance-tools/emi"><EmiCalculator /></ToolRoute>} />
                        <Route path="/finance-tools/currency" element={<ToolRoute path="/finance-tools/currency"><CurrencyConverter /></ToolRoute>} />
                        <Route path="/finance-tools/tip" element={<ToolRoute path="/finance-tools/tip"><TipCalculator /></ToolRoute>} />
                        <Route path="/finance-tools/discount" element={<ToolRoute path="/finance-tools/discount"><DiscountCalculator /></ToolRoute>} />

                        {/* Unit & Time Tools */}
                        <Route path="/unit-tools/age" element={<ToolRoute path="/unit-tools/age"><AgeCalculator /></ToolRoute>} />
                        <Route path="/unit-tools/bmi" element={<ToolRoute path="/unit-tools/bmi"><BmiCalculator /></ToolRoute>} />
                        <Route path="/unit-tools/date-diff" element={<ToolRoute path="/unit-tools/date-diff"><DateDifference /></ToolRoute>} />
                        <Route path="/unit-tools/timezone" element={<ToolRoute path="/unit-tools/timezone"><TimeZoneConverter /></ToolRoute>} />
                        <Route path="/unit-tools/units" element={<ToolRoute path="/unit-tools/units"><UnitConverter /></ToolRoute>} />
                        <Route path="/unit-tools/speed" element={<ToolRoute path="/unit-tools/speed"><SpeedConverter /></ToolRoute>} />
                        <Route path="/unit-tools/nepali-date" element={<ToolRoute path="/unit-tools/nepali-date"><NepaliDateConverter /></ToolRoute>} />

                        {/* Policy / info pages (no ads) */}
                        <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
                        <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
                        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />

                        {/* 404 */}
                        <Route path="*" element={<div className="text-center py-20 text-text-muted text-xl font-bold">404 - Page not found</div>} />
                    </Routes>
                    <Navbar />
                </Layout>
                <CookieConsent />
            </Router>
            <Toaster
                position="bottom-center"
                toastOptions={{
                    style: { background: '#1e1e2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
                    success: { iconTheme: { primary: '#a78bfa', secondary: '#fff' } },
                }}
            />
        </HelmetProvider>
    );
}

export default App;