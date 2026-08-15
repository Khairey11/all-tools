export const WORLD_CURRENCIES: Record<string, string> = {
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

export const getFlag = (code: string) => {
    try {
        const codePoints = code
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    } catch {
        return '🌐';
    }
};
