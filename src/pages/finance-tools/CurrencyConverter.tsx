import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Repeat, Globe, TrendingUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getFlag = (code: string) => {
    // Handling special cases and converting ISO codes to Emoji Flags
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

// Comprehensive Global Currency Dictionary
const WORLD_CURRENCIES: Record<string, string> = {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
    INR: 'Indian Rupee', AUD: 'Australian Dollar', CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc', CNY: 'Chinese Yuan', NPR: 'Nepalese Rupee',
    AED: 'UAE Dirham', AFN: 'Afghan Afghani', ALL: 'Albanian Lek',
    AMD: 'Armenian Dram', ANG: 'Netherlands Antillean Guilder',
    AOA: 'Angolan Kwanza', ARS: 'Argentine Peso', AWG: 'Aruban Florin',
    AZN: 'Azerbaijani Manat', BAM: 'Bosnia-Herzegovina Convertible Mark',
    BBD: 'Barbadian Dollar', BDT: 'Bangladeshi Taka', BGN: 'Bulgarian Lev',
    BHD: 'Bahraini Dinar', BIF: 'Burundian Franc', BMD: 'Bermudan Dollar',
    BND: 'Brunei Dollar', BOB: 'Bolivian Boliviano', BRL: 'Brazilian Real',
    BSD: 'Bahamian Dollar', BTN: 'Bhutanese Ngultrum', BWP: 'Botswanan Pula',
    BYN: 'Belarusian Ruble', BZD: 'Belize Dollar', CDF: 'Congolese Franc',
    CLP: 'Chilean Peso', COP: 'Colombian Peso', CRC: 'Costa Rican ColÃ³n',
    CUP: 'Cuban Peso', CVE: 'Cape Verdean Escudo', CZK: 'Czech Koruna',
    DJF: 'Djiboutian Franc', DKK: 'Danish Krone', DOP: 'Dominican Peso',
    DZD: 'Algerian Dinar', EGP: 'Egyptian Pound', ERN: 'Eritrean Nakfa',
    ETB: 'Ethiopian Birr', FJD: 'Fijian Dollar', FKP: 'Falkland Islands Pound',
    FOK: 'Faroese KrÃ³na', GEL: 'Georgian Lari', GGP: 'Guernsey Pound',
    GHS: 'Ghanaian Cedi', GIP: 'Gibraltar Pound', GMD: 'Gambian Dalasi',
    GNF: 'Guinean Franc', GTQ: 'Guatemalan Quetzal', GYD: 'Guyanese Dollar',
    HKD: 'Hong Kong Dollar', HNL: 'Honduran Lempira', HRK: 'Croatian Kuna',
    HTG: 'Haitian Gourde', HUF: 'Hungarian Forint', IDR: 'Indonesian Rupiah',
    ILS: 'Israeli New Shekel', IMP: 'Isle of Man Pound', IQD: 'Iraqi Dinar',
    IRR: 'Iranian Rial', ISK: 'Icelandic KrÃ³na', JEP: 'Jersey Pound',
    JMD: 'Jamaican Dollar', JOD: 'Jordanian Dinar', KES: 'Kenyan Shilling',
    KGS: 'Kyrgystani Som', KHR: 'Cambodian Riel', KID: 'Kiribati Dollar',
    KMF: 'Comorian Franc', KRW: 'South Korean Won', KWD: 'Kuwaiti Dinar',
    KYD: 'Cayman Islands Dollar', KZT: 'Kazakhstani Tenge', LAK: 'Laotian Kip',
    LBP: 'Lebanese Pound', LKR: 'Sri Lankan Rupee', LRD: 'Liberian Dollar',
    LSL: 'Lesotho Loti', LYD: 'Libyan Dinar', MAD: 'Moroccan Dirham',
    MDL: 'Moldovan Leu', MGA: 'Malagasy Ariary', MKD: 'Macedonian Denar',
    MMK: 'Myanmar Kyat', MNT: 'Mongolian Tugrik', MOP: 'Macanese Pataca',
    MRU: 'Mauritanian Ouguiya', MUR: 'Mauritian Rupee', MVR: 'Maldivian Rufiyaa',
    MWK: 'Malawian Kwacha', MXN: 'Mexican Peso', MYR: 'Malaysian Ringgit',
    MZN: 'Mozambican Metical', NAD: 'Namibian Dollar', NGN: 'Nigerian Naira',
    NIO: 'Nicaraguan CÃ³rdoba', NOK: 'Norwegian Krone', NZD: 'New Zealand Dollar',
    OMR: 'Oman Rial', PAB: 'Panamanian Balboa', PEN: 'Peruvian Sol',
    PGK: 'Papua New Guinean Kina', PHP: 'Philippine Peso', PKR: 'Pakistani Rupee',
    PLN: 'Polish Zloty', PYG: 'Paraguayan Guarani', QAR: 'Qatari Rial',
    RON: 'Romanian Leu', RSD: 'Serbian Dinar', RUB: 'Russian Ruble',
    RWF: 'Rwanda Franc', SAR: 'Saudi Riyal', SBD: 'Solomon Islands Dollar',
    SCR: 'Seychellois Rupee', SDG: 'Sudanese Pound', SEK: 'Swedish Krona',
    SGD: 'Singapore Dollar', SHP: 'St. Helena Pound', SLE: 'Sierra Leonean Leone',
    SLL: 'Sierra Leonean Leone', SOS: 'Somali Shilling', SRD: 'Surinamese Dollar',
    SSP: 'South Sudanese Pound', STN: 'SÃ£o TomÃ© and PrÃ­ncipe Dobra',
    SYP: 'Syrian Pound', SZL: 'Swazi Lilangeni', THB: 'Thai Baht',
    TJS: 'Tajikistani Somoni', TMT: 'Turkmenistani Manat', TND: 'Tunisian Dinar',
    TOP: 'Tongan PaÊ»anga', TRY: 'Turkish Lira', TTD: 'Trinidad and Tobago Dollar',
    TVD: 'Tuvaluan Dollar', TWD: 'New Taiwan Dollar', TZS: 'Tanzanian Shilling',
    UAH: 'Ukrainian Hryvnia', UGX: 'Ugandan Shilling', UYU: 'Uruguayan Peso',
    UZS: 'Uzbekistani Som', VES: 'Venezuelan BolÃ­var', VND: 'Vietnamese Dong',
    VUV: 'Vanuatu Vatu', WST: 'Samoan Tala', XAF: 'Central African CFA Franc',
    XCD: 'East Caribbean Dollar', XDR: 'Special Drawing Rights',
    XOF: 'West African CFA Franc', XPF: 'CFP Franc', YER: 'Yemeni Rial',
    ZAR: 'South African Rand', ZMW: 'Zambian Kwacha', ZWL: 'Zimbabwean Dollar'
};

/**
 * OFFLINE exchange-rate table (1 USD = X units) - reference snapshot.
 * Runs 100% in the browser: no network, no API, works with zero internet.
 */
const OFFLINE_USD_RATES: Record<string, number> = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.0, INR: 83.3,
    AUD: 1.52, CAD: 1.36, CHF: 0.90, CNY: 7.23, NPR: 133.2,
    AED: 3.67, AFN: 72.5, ALL: 94.5, AMD: 396.0, ANG: 1.79,
    AOA: 832.0, ARS: 860.0, AWG: 1.79, AZN: 1.70, BAM: 1.81,
    BBD: 2.0, BDT: 109.8, BGN: 1.81, BHD: 0.376, BIF: 2870.0,
    BMD: 1.0, BND: 1.34, BOB: 6.91, BRL: 5.05, BSD: 1.0,
    BTN: 83.3, BWP: 13.7, BYN: 3.27, BZD: 2.02, CDF: 2780.0,
    CLP: 945.0, COP: 3900.0, CRC: 508.0, CUP: 24.0, CVE: 100.8,
    CZK: 23.3, DJF: 177.7, DKK: 6.87, DOP: 58.8, DZD: 134.5,
    EGP: 47.8, ERN: 15.0, ETB: 57.2, FJD: 2.26, FKP: 0.79,
    FOK: 6.87, GEL: 2.68, GGP: 0.79, GHS: 13.1, GIP: 0.79,
    GMD: 67.8, GNF: 8580.0, GTQ: 7.77, GYD: 209.0, HKD: 7.82,
    HNL: 24.7, HRK: 6.93, HTG: 132.0, HUF: 360.0, IDR: 15750.0,
    ILS: 3.68, IMP: 0.79, IQD: 1310.0, IRR: 42000.0, ISK: 138.0,
    JEP: 0.79, JMD: 155.0, JOD: 0.709, KES: 131.0, KGS: 89.3,
    KHR: 4080.0, KID: 1.52, KMF: 453.0, KRW: 1345.0, KWD: 0.307,
    KYD: 0.83, KZT: 450.0, LAK: 20900.0, LBP: 89500.0, LKR: 305.0,
    LRD: 193.0, LSL: 18.6, LYD: 4.85, MAD: 10.0, MDL: 17.7,
    MGA: 4480.0, MKD: 56.6, MMK: 2100.0, MNT: 3420.0, MOP: 8.05,
    MRU: 39.6, MUR: 46.3, MVR: 15.4, MWK: 1710.0, MXN: 16.9,
    MYR: 4.73, MZN: 63.9, NAD: 18.6, NGN: 1450.0, NIO: 36.8,
    NOK: 10.6, NZD: 1.64, OMR: 0.385, PAB: 1.0, PEN: 3.72,
    PGK: 3.78, PHP: 56.2, PKR: 278.0, PLN: 3.96, PYG: 7300.0,
    QAR: 3.64, RON: 4.58, RSD: 108.0, RUB: 92.0, RWF: 1300.0,
    SAR: 3.75, SBD: 8.45, SCR: 13.5, SDG: 601.0, SEK: 10.4,
    SGD: 1.34, SHP: 0.79, SLE: 22.7, SLL: 22700.0, SOS: 571.0,
    SRD: 34.5, SSP: 1300.0, STN: 22.6, SYP: 13000.0, SZL: 18.6,
    THB: 36.1, TJS: 10.9, TMT: 3.50, TND: 3.12, TOP: 2.36,
    TRY: 32.0, TTD: 6.78, TVD: 1.52, TWD: 31.9, TZS: 2550.0,
    UAH: 39.1, UGX: 3890.0, UYU: 39.0, UZS: 12450.0, VES: 36.3,
    VND: 24800.0, VUV: 118.5, WST: 2.73, XAF: 604.0, XCD: 2.70,
    XDR: 0.75, XOF: 604.0, XPF: 110.0, YER: 250.3, ZAR: 18.6,
    ZMW: 25.6, ZWL: 5570.0
};

const CurrencySelector = ({ label, value, options, onChange, color }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = Object.entries(options).filter(([code, name]: any) =>
        code.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">{label}</label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold flex items-center justify-between hover:bg-white/10 transition-all group"
            >
                <div className="flex items-center space-x-3">
                    <span className="text-xl group-hover:scale-125 transition-transform">{getFlag(value)}</span>
                    <span className={`font-black tracking-tight ${color}`}>{value}</span>
                    <span className="text-text-muted text-xs truncate max-w-[120px] font-semibold hidden md:inline opacity-60">
                        {options[value] || 'Loading...'}
                    </span>
                </div>
                <Globe className="w-4 h-4 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all duration-500" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-4 bg-surface/95 border border-white/10 rounded-3xl shadow-2xl z-[120] overflow-hidden backdrop-blur-3xl"
                        >
                            <div className="p-4 border-b border-white/5 relative">
                                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search by name or code..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {filtered.length > 0 ? filtered.map(([code, name]: any) => (
                                    <button
                                        key={code}
                                        onClick={() => {
                                            onChange(code);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full text-left px-6 py-4 flex items-center space-x-4 hover:bg-primary/10 transition-all ${value === code ? 'bg-primary/20' : ''}`}
                                    >
                                        <span className="text-xl">{getFlag(code)}</span>
                                        <div className="flex flex-col">
                                            <span className={`font-black ${color}`}>{code}</span>
                                            <span className="text-[10px] text-text-muted uppercase font-bold tracking-tight">{name}</span>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="p-8 text-center text-text-muted text-xs font-bold uppercase tracking-widest">
                                        No results found for "{search}"
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export const CurrencyConverter: React.FC = () => {
    const navigate = useNavigate();

    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('NPR'); // Default to NPR as requested
    const [result, setResult] = useState(0);

    // ---- Intelligent hybrid rate sourcing ---------------------------
    // 1. LIVE   : fetch real-time rates when internet is available
    // 2. CACHED : last successful live rates (localStorage, 24h validity)
    // 3. OFFLINE: bundled reference table (always works, no internet)
    // Conversion itself ALWAYS happens locally on the user's device.
    const [rates, setRates] = useState<Record<string, number>>(() => {
        try {
            const cached = localStorage.getItem('fx_rates_cache');
            if (cached) {
                const parsed = JSON.parse(cached) as { ts: number; rates: Record<string, number> };
                const ageHrs = (Date.now() - parsed.ts) / 3_600_000;
                if (parsed.rates && ageHrs < 24) return parsed.rates;
            }
        } catch { /* fall through to offline table */ }
        return OFFLINE_USD_RATES;
    });
    const [rateSource, setRateSource] = useState<'live' | 'cached' | 'offline'>('offline');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [allCurrencies] = useState<Record<string, string>>(WORLD_CURRENCIES);

    const fetchLiveRates = async () => {
        setRefreshing(true);
        try {
            // 8s timeout so slow/hanging connections don't freeze the UI
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 8000);
            const response = await fetch('https://open.er-api.com/v6/latest/USD', { signal: ctrl.signal });
            clearTimeout(timer);
            const data = await response.json();
            if (data && data.rates && Object.keys(data.rates).length > 0) {
                setRates(data.rates);
                setRateSource('live');
                setLastUpdated(new Date().toLocaleTimeString());
                // cache for offline reuse
                try {
                    localStorage.setItem('fx_rates_cache', JSON.stringify({ ts: Date.now(), rates: data.rates }));
                } catch { /* storage full/blocked — non-fatal */ }
            }
        } catch {
            // No internet / API down — stay on current rates.
            // If we still have the pure offline table, mark it clearly.
            setRateSource((prev) => (prev === 'live' ? 'cached' : 'offline'));
        } finally {
            setRefreshing(false);
        }
    };

    // On mount: try live once (non-blocking). Cache/offline already in place.
    useEffect(() => {
        // If cache was used, show its age; then still try to refresh.
        try {
            const cached = localStorage.getItem('fx_rates_cache');
            if (cached) {
                const parsed = JSON.parse(cached) as { ts: number; rates: Record<string, number> };
                if (parsed.rates) {
                    setRateSource('cached');
                    setLastUpdated(new Date(parsed.ts).toLocaleTimeString());
                }
            }
        } catch { /* ignore */ }
        void fetchLiveRates();
    }, []);

    useEffect(() => {
        if (rates[fromCurrency] && rates[toCurrency]) {
            const fromRate = rates[fromCurrency];
            const toRate = rates[toCurrency];
            const converted = (Number(amount) / fromRate) * toRate;
            setResult(converted);
        }
    }, [amount, fromCurrency, toCurrency, rates]);

    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Global Exchange Hub</h1>
                    <p className="text-sm text-text-muted flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
                        Monitoring {Object.keys(rates).length || '...'} world markets
                    </p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto w-full">
                <div className="bg-surface/50 border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                                        <div className="absolute -top-24 -right-24 opacity-5">
                        <Globe className="w-96 h-96" />
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-8 items-end">
                        <div className="md:col-span-11 mb-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Conversion Amount</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-5xl font-black focus:border-primary/50 focus:outline-none transition-all placeholder:text-white/10 text-primary selection:bg-primary/30"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-5">
                            <CurrencySelector
                                label="From"
                                value={fromCurrency}
                                options={allCurrencies}
                                onChange={setFromCurrency}
                                color="text-amber-400"
                            />
                        </div>

                        <div className="md:col-span-1 flex justify-center pb-2">
                            <button
                                onClick={swapCurrencies}
                                className="p-4 bg-primary text-white rounded-full hover:rotate-180 transition-all duration-700 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] ring-4 ring-primary/10 active:scale-90"
                            >
                                <Repeat className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="md:col-span-5">
                            <CurrencySelector
                                label="To"
                                value={toCurrency}
                                options={allCurrencies}
                                onChange={setToCurrency}
                                color="text-emerald-400"
                            />
                        </div>

                        <div className="md:col-span-11 pt-12 text-center border-t border-white/10 mt-8">
                            <motion.div
                                key={result}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="inline-flex items-center space-x-3 text-text-muted text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 px-8 py-3 rounded-full border border-white/5 shadow-inner">
                                    <span>{Number(amount).toLocaleString()}</span>
                                    <span className="text-amber-400">{fromCurrency}</span>
                                    <span className="opacity-20">=</span>
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-0 group-hover:opacity-50 transition-all duration-1000" />
                                    <div className="relative text-7xl md:text-9xl font-black bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl selection:bg-emerald-500/20">
                                        {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        <span className="text-2xl md:text-3xl ml-4 font-black uppercase text-text-muted align-middle selection:bg-emerald-500/30">
                                            {toCurrency}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={fetchLiveRates}
                                    disabled={refreshing}
                                    title="Refresh live rates"
                                    className="flex items-center space-x-4 text-[10px] text-text-muted font-black uppercase tracking-widest bg-emerald-500/5 py-4 px-10 rounded-full border border-emerald-500/10 shadow-lg shadow-emerald-500/5 hover:bg-emerald-500/10 transition-all disabled:opacity-60"
                                >
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${rateSource === 'live' ? 'bg-emerald-500' : rateSource === 'cached' ? 'bg-amber-400' : 'bg-red-400'}`} />
                                    <span className={rateSource === 'live' ? 'text-emerald-400/80' : rateSource === 'cached' ? 'text-amber-400/80' : 'text-red-400/80'}>
                                        {refreshing ? 'Syncing…' : rateSource === 'live' ? 'Live Rates' : rateSource === 'cached' ? `Cached (saved ${lastUpdated})` : 'Offline Reference Rates'}
                                    </span>
                                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                                    <span className="opacity-40 font-bold">{refreshing ? '' : '↻ Tap to refresh'}</span>
                                </button>
                                <div className="flex items-center space-x-3 text-[10px] text-text-muted font-black uppercase tracking-[0.2em] bg-primary/5 py-4 px-10 rounded-full border border-primary/10 hover:bg-primary/10 transition-all">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <span>Smart Fallback: Live → Cached → Offline</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 p-8 rounded-[2.5rem] flex items-center space-x-6 hover:border-emerald-500/20 transition-all group">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Market Stability</div>
                            <p className="text-xs text-text-muted leading-relaxed font-medium">The {fromCurrency} vs {toCurrency} pair shows active liquidity across major trading desks.</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 p-8 rounded-[2.5rem] flex items-center space-x-6 hover:border-primary/20 transition-all group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Globe className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">Global Routing</div>
                            <p className="text-xs text-text-muted leading-relaxed font-medium">Your request is being routed through global financial hubs for a fully offline device-side conversion.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
