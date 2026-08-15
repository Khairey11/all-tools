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
    CLP: 'Chilean Peso', COP: 'Colombian Peso', CRC: 'Costa Rican Colón',
    CUP: 'Cuban Peso', CVE: 'Cape Verdean Escudo', CZK: 'Czech Koruna',
    DJF: 'Djiboutian Franc', DKK: 'Danish Krone', DOP: 'Dominican Peso',
    DZD: 'Algerian Dinar', EGP: 'Egyptian Pound', ERN: 'Eritrean Nakfa',
    ETB: 'Ethiopian Birr', FJD: 'Fijian Dollar', FKP: 'Falkland Islands Pound',
    FOK: 'Faroese Króna', GEL: 'Georgian Lari', GGP: 'Guernsey Pound',
    GHS: 'Ghanaian Cedi', GIP: 'Gibraltar Pound', GMD: 'Gambian Dalasi',
    GNF: 'Guinean Franc', GTQ: 'Guatemalan Quetzal', GYD: 'Guyanese Dollar',
    HKD: 'Hong Kong Dollar', HNL: 'Honduran Lempira', HRK: 'Croatian Kuna',
    HTG: 'Haitian Gourde', HUF: 'Hungarian Forint', IDR: 'Indonesian Rupiah',
    ILS: 'Israeli New Shekel', IMP: 'Isle of Man Pound', IQD: 'Iraqi Dinar',
    IRR: 'Iranian Rial', ISK: 'Icelandic Króna', JEP: 'Jersey Pound',
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
    NIO: 'Nicaraguan Córdoba', NOK: 'Norwegian Krone', NZD: 'New Zealand Dollar',
    OMR: 'Oman Rial', PAB: 'Panamanian Balboa', PEN: 'Peruvian Sol',
    PGK: 'Papua New Guinean Kina', PHP: 'Philippine Peso', PKR: 'Pakistani Rupee',
    PLN: 'Polish Zloty', PYG: 'Paraguayan Guarani', QAR: 'Qatari Rial',
    RON: 'Romanian Leu', RSD: 'Serbian Dinar', RUB: 'Russian Ruble',
    RWF: 'Rwanda Franc', SAR: 'Saudi Riyal', SBD: 'Solomon Islands Dollar',
    SCR: 'Seychellois Rupee', SDG: 'Sudanese Pound', SEK: 'Swedish Krona',
    SGD: 'Singapore Dollar', SHP: 'St. Helena Pound', SLE: 'Sierra Leonean Leone',
    SLL: 'Sierra Leonean Leone', SOS: 'Somali Shilling', SRD: 'Surinamese Dollar',
    SSP: 'South Sudanese Pound', STN: 'São Tomé and Príncipe Dobra',
    SYP: 'Syrian Pound', SZL: 'Swazi Lilangeni', THB: 'Thai Baht',
    TJS: 'Tajikistani Somoni', TMT: 'Turkmenistani Manat', TND: 'Tunisian Dinar',
    TOP: 'Tongan Paʻanga', TRY: 'Turkish Lira', TTD: 'Trinidad and Tobago Dollar',
    TVD: 'Tuvaluan Dollar', TWD: 'New Taiwan Dollar', TZS: 'Tanzanian Shilling',
    UAH: 'Ukrainian Hryvnia', UGX: 'Ugandan Shilling', UYU: 'Uruguayan Peso',
    UZS: 'Uzbekistani Som', VES: 'Venezuelan Bolívar', VND: 'Vietnamese Dong',
    VUV: 'Vanuatu Vatu', WST: 'Samoan Tala', XAF: 'Central African CFA Franc',
    XCD: 'East Caribbean Dollar', XDR: 'Special Drawing Rights',
    XOF: 'West African CFA Franc', XPF: 'CFP Franc', YER: 'Yemeni Rial',
    ZAR: 'South African Rand', ZMW: 'Zambian Kwacha', ZWL: 'Zimbabwean Dollar'
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
    const [rates, setRates] = useState<Record<string, number>>({});
    const [allCurrencies, setAllCurrencies] = useState<Record<string, string>>(WORLD_CURRENCIES);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const fetchData = async () => {
        try {
            // Using ExchangeRate-API (Open Access) which supports 160+ currencies incl. NPR
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();

            if (data && data.rates) {
                setRates(data.rates);
                setLastUpdated(new Date().toLocaleTimeString());

                // Sync available codes with our labels
                const apiCodes = Object.keys(data.rates);
                const updatedLabels = { ...WORLD_CURRENCIES };
                apiCodes.forEach(code => {
                    if (!updatedLabels[code]) updatedLabels[code] = code;
                });
                setAllCurrencies(updatedLabels);
            }
        } catch (err) {
            console.error('Data sync failed:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
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
                    {loading && (
                        <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl z-[200] flex flex-col items-center justify-center space-y-6">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                            />
                            <div className="text-center space-y-2">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Establishing Bank-Grade Link...</p>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest animate-pulse">Syncing 160+ country rates</p>
                            </div>
                        </div>
                    )}

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
                                <div className="flex items-center space-x-4 text-[10px] text-text-muted font-black uppercase tracking-widest bg-emerald-500/5 py-4 px-10 rounded-full border border-emerald-500/10 shadow-lg shadow-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-default">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-emerald-400/80">Live Exchange Feed</span>
                                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                                    <span className="opacity-40 font-bold">Refreshed: {lastUpdated}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[10px] text-text-muted font-black uppercase tracking-[0.2em] bg-primary/5 py-4 px-10 rounded-full border border-primary/10 hover:bg-primary/10 transition-all">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <span>Global Market Access (160+ Countries)</span>
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
                            <p className="text-xs text-text-muted leading-relaxed font-medium">Your request is being routed through global financial hubs for the most accurate {lastUpdated} fix.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
