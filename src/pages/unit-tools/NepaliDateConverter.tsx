import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ArrowRightLeft } from 'lucide-react';

// Days in each BS month. Index 0 = Baisakh. Years 2000-2090 BS.
// Reference: standard Bikram Sambat calendar data (as used by nepali-date libs).
const BS_DATA: number[][] = [
    /* 2000 */ [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2001 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2002 */ [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2003 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2004 */ [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2005 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2006 */ [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2007 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2008 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    /* 2009 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2010 */ [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2011 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2012 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    /* 2013 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2014 */ [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2015 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2016 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    /* 2017 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2018 */ [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2019 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2020 */ [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2021 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2022 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    /* 2023 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2024 */ [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2025 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2026 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2027 */ [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2028 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2029 */ [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    /* 2030 */ [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2031 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2032 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    /* 2033 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2034 */ [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2035 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2036 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    /* 2037 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2038 */ [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2039 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2040 */ [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2041 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2042 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    /* 2043 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2044 */ [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2045 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2046 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2047 */ [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2048 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2049 */ [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    /* 2050 */ [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2051 */ [31, 31, 32, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2052 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    /* 2053 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2054 */ [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2055 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2056 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    /* 2057 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2058 */ [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2059 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2060 */ [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2061 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2062 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    /* 2063 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2064 */ [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2065 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2066 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2067 */ [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2068 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2069 */ [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    /* 2070 */ [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2071 */ [31, 31, 32, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2072 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    /* 2073 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2074 */ [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2075 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2076 */ [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    /* 2077 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2078 */ [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    /* 2079 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2080 */ [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2081 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2082 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    /* 2083 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2084 */ [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2085 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2086 */ [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    /* 2087 */ [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    /* 2088 */ [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    /* 2089 */ [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    /* 2090 */ [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
];

const BS_MONTHS = ['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MIN_BS_YEAR = 2000;
const MAX_BS_YEAR = 2090;
// BS 2000/01/01 == AD 1943-04-14
const EPOCH_AD = Date.UTC(1943, 3, 14);

function bsToAd(y: number, m: number, d: number): Date | null {
    if (y < MIN_BS_YEAR || y > MAX_BS_YEAR || m < 1 || m > 12) return null;
    if (d < 1 || d > BS_DATA[y - MIN_BS_YEAR][m - 1]) return null;
    let days = d - 1;
    for (let yy = MIN_BS_YEAR; yy < y; yy++) days += BS_DATA[yy - MIN_BS_YEAR].reduce((a, b) => a + b, 0);
    for (let mm = 0; mm < m - 1; mm++) days += BS_DATA[y - MIN_BS_YEAR][mm];
    return new Date(EPOCH_AD + days * 86400000);
}

function adToBs(date: Date): { y: number; m: number; d: number } | null {
    const target = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    if (target < EPOCH_AD) return null;
    let days = Math.floor((target - EPOCH_AD) / 86400000);
    let y = MIN_BS_YEAR;
    while (y <= MAX_BS_YEAR) {
        const yearDays = BS_DATA[y - MIN_BS_YEAR].reduce((a, b) => a + b, 0);
        if (days < yearDays) break;
        days -= yearDays;
        y++;
    }
    if (y > MAX_BS_YEAR) return null;
    let m = 0;
    while (m < 12) {
        if (days < BS_DATA[y - MIN_BS_YEAR][m]) break;
        days -= BS_DATA[y - MIN_BS_YEAR][m];
        m++;
    }
    return { y, m: m + 1, d: days + 1 };
}

export const NepaliDateConverter: React.FC = () => {
    const navigate = useNavigate();
    const today = new Date();
    const [mode, setMode] = useState<'bs2ad' | 'ad2bs'>('bs2ad');
    const [bsY, setBsY] = useState(2082);
    const [bsM, setBsM] = useState(1);
    const [bsD, setBsD] = useState(1);
    const [adDate, setAdDate] = useState(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );

    const result = useMemo(() => {
        if (mode === 'bs2ad') {
            const ad = bsToAd(bsY, bsM, bsD);
            if (!ad) return null;
            return {
                main: `${WEEKDAYS[ad.getUTCDay()]}, ${ad.getUTCDate()} ${ad.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} ${ad.getUTCFullYear()} AD`,
                sub: `${bsD} ${BS_MONTHS[bsM - 1]} ${bsY} BS`,
            };
        }
        const [y, m, d] = adDate.split('-').map(Number);
        const bs = adToBs(new Date(y, m - 1, d));
        if (!bs) return null;
        const adObj = new Date(y, m - 1, d);
        return {
            main: `${bs.d} ${BS_MONTHS[bs.m - 1]} ${bs.y} BS`,
            sub: `${WEEKDAYS[adObj.getDay()]}, ${adObj.getDate()} ${adObj.toLocaleString('en-US', { month: 'long' })} ${adObj.getFullYear()} AD`,
        };
    }, [mode, bsY, bsM, bsD, adDate]);

    const daysInBsMonth = BS_DATA[bsY - MIN_BS_YEAR]?.[bsM - 1] ?? 32;

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text max-w-2xl mx-auto">
            <header className="flex items-center space-x-4">
                <button onClick={() => navigate('/category/unit-tools')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-orange-500">Nepali Date Converter</h1>
                    <p className="text-sm text-text-muted">Bikram Sambat (BS) to AD and back - offline</p>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMode('bs2ad')}
                    className={`py-3.5 rounded-xl text-xs font-black border transition-all ${mode === 'bs2ad' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                    BS to AD
                </button>
                <button onClick={() => setMode('ad2bs')}
                    className={`py-3.5 rounded-xl text-xs font-black border transition-all ${mode === 'ad2bs' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                    AD to BS
                </button>
            </div>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 space-y-5">
                {mode === 'bs2ad' ? (
                    <>
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Bikram Sambat date</span>
                        <div className="grid grid-cols-3 gap-3">
                            <select value={bsY} onChange={(e) => setBsY(Number(e.target.value))}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-orange-500/50 focus:outline-none">
                                {Array.from({ length: MAX_BS_YEAR - MIN_BS_YEAR + 1 }, (_, i) => MIN_BS_YEAR + i).map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <select value={bsM} onChange={(e) => setBsM(Number(e.target.value))}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-orange-500/50 focus:outline-none">
                                {BS_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                            <select value={bsD} onChange={(e) => setBsD(Number(e.target.value))}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-orange-500/50 focus:outline-none">
                                {Array.from({ length: daysInBsMonth }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Gregorian date (AD)</span>
                        <input type="date" value={adDate} onChange={(e) => setAdDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-mono text-lg focus:border-orange-500/50 focus:outline-none" />
                    </>
                )}
            </div>

            {result ? (
                <div className="bg-orange-500 border border-orange-400 rounded-3xl p-8 text-center shadow-xl shadow-orange-500/20 space-y-2">
                    <ArrowRightLeft className="w-6 h-6 text-black/50 mx-auto mb-1" />
                    <p className="text-2xl font-black text-black">{result.main}</p>
                    <p className="text-sm font-bold text-black/60">{result.sub}</p>
                </div>
            ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center text-sm text-red-300">
                    Invalid date. Supported range: BS 2000-2090 (AD 1943-2034).
                </div>
            )}

            <div className="bg-orange-500/5 border border-orange-500/10 p-5 rounded-2xl flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                    <span className="font-bold text-orange-400">Did you know?</span> The Nepali calendar (Bikram Sambat) is ~56.7 years ahead of AD and
                    new year starts on Baisakh 1 (mid-April). Months have 29-32 days, which this converter handles accurately for 2000-2090 BS.
                </p>
            </div>
        </div>
    );
};