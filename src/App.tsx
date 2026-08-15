import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CategoryTools } from './pages/CategoryTools';
import { ImageCompressor } from './pages/image-tools/ImageCompressor';
import { GifCompressor } from './pages/image-tools/GifCompressor';
import { WatermarkAdder } from './pages/image-tools/WatermarkAdder';
import { ColorPaletteExtractor } from './pages/image-tools/ColorPaletteExtractor';
import { PdfCompressor } from './pages/pdf-tools/PdfCompressor';
import { WordConverter } from './pages/pdf-tools/WordConverter';
import { WordToPdf } from './pages/pdf-tools/WordToPdf';
import { PdfEditor } from './pages/pdf-tools/PdfEditor';
import { PdfToImage } from './pages/pdf-tools/PdfToImage';
import { JsonFormatter } from './pages/dev-tools/JsonFormatter';
import { TextCaseConverter } from './pages/dev-tools/TextCaseConverter';
import { PasswordStrength } from './pages/dev-tools/PasswordStrength';
import { Base64Converter } from './pages/dev-tools/Base64Converter';
import { ColorConverter } from './pages/dev-tools/ColorConverter';
import { MetaTagGenerator } from './pages/seo-tools/MetaTagGenerator';
import { KeywordDensity } from './pages/seo-tools/KeywordDensity';
import { KeywordCompetition } from './pages/seo-tools/KeywordCompetition';
import { CaptionGenerator } from './pages/social-tools/CaptionGenerator';
import { PercentageCalculator } from './pages/finance-tools/PercentageCalculator';
import { InterestCalculator } from './pages/finance-tools/InterestCalculator';
import { EmiCalculator } from './pages/finance-tools/EmiCalculator';
import { CurrencyConverter } from './pages/finance-tools/CurrencyConverter';
import { AgeCalculator } from './pages/unit-tools/AgeCalculator';
import { BmiCalculator } from './pages/unit-tools/BmiCalculator';
import { DateDifference } from './pages/unit-tools/DateDifference';
import { TimeZoneConverter } from './pages/unit-tools/TimeZoneConverter';
import { UnitConverter } from './pages/unit-tools/UnitConverter';
import { SpeedConverter } from './pages/unit-tools/SpeedConverter';

function App() {
    return (
        <>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/category/:categoryId" element={<CategoryTools />} />

                        {/* Image Tools */}
                        <Route path="/image-tools/compress" element={<ImageCompressor />} />
                        <Route path="/image-tools/gif-compressor" element={<GifCompressor />} />
                        <Route path="/image-tools/resize" element={<ImageCompressor />} />
                        <Route path="/image-tools/png-to-jpg" element={<ImageCompressor />} />
                        <Route path="/image-tools/watermark-adder" element={<WatermarkAdder />} />
                        <Route path="/image-tools/palette" element={<ColorPaletteExtractor />} />

                        {/* PDF Tools */}
                        <Route path="/pdf-tools/compress" element={<PdfCompressor />} />
                        <Route path="/pdf-tools/pdf-to-word" element={<WordConverter />} />
                        <Route path="/pdf-tools/word-to-pdf" element={<WordToPdf />} />
                        <Route path="/pdf-tools/editor" element={<PdfEditor />} />
                        <Route path="/pdf-tools/to-image" element={<PdfToImage />} />

                        {/* Video Tools - Placeholder for now */}
                        <Route path="/video-tools/compress" element={<div className="text-center py-20 text-text-muted">Video tools coming soon...</div>} />

                        {/* Text Tools */}
                        <Route path="/text-tools/case" element={<TextCaseConverter />} />

                        {/* Dev Tools */}
                        <Route path="/dev-tools/password-strength" element={<PasswordStrength />} />
                        <Route path="/dev-tools/json" element={<JsonFormatter />} />
                        <Route path="/dev-tools/base64" element={<Base64Converter />} />
                        <Route path="/dev-tools/color" element={<ColorConverter />} />

                        {/* SEO Tools */}
                        <Route path="/seo-tools/meta" element={<MetaTagGenerator />} />
                        <Route path="/seo-tools/keywords" element={<KeywordDensity />} />
                        <Route path="/seo-tools/competition" element={<KeywordCompetition />} />

                        {/* Social Tools */}
                        <Route path="/social-tools/captions" element={<CaptionGenerator />} />

                        {/* Finance Tools */}
                        <Route path="/finance-tools/percentage" element={<PercentageCalculator />} />
                        <Route path="/finance-tools/interest" element={<InterestCalculator />} />
                        <Route path="/finance-tools/emi" element={<EmiCalculator />} />
                        <Route path="/finance-tools/currency" element={<CurrencyConverter />} />

                        {/* Unit & Time Tools */}
                        <Route path="/unit-tools/age" element={<AgeCalculator />} />
                        <Route path="/unit-tools/bmi" element={<BmiCalculator />} />
                        <Route path="/unit-tools/date-diff" element={<DateDifference />} />
                        <Route path="/unit-tools/timezone" element={<TimeZoneConverter />} />
                        <Route path="/unit-tools/units" element={<UnitConverter />} />
                        <Route path="/unit-tools/speed" element={<SpeedConverter />} />

                        {/* 404 */}
                        <Route path="*" element={<div className="text-center py-20 text-text-muted text-xl font-bold">404 - Page not found</div>} />
                    </Routes>
                    <Navbar />
                </Layout>
            </Router>
            <Toaster
                position="bottom-center"
                toastOptions={{
                    style: { background: '#1e1e2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
                    success: { iconTheme: { primary: '#a78bfa', secondary: '#fff' } },
                }}
            />
        </>
    );
}

export default App;
