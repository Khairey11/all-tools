import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Globe } from 'lucide-react';

const TIMEZONES = [
    { label: 'UTC (GMT)', value: 'UTC' },
    { label: 'New York (EST/EDT)', value: 'America/New_York' },
    { label: 'London (GMT/BST)', value: 'Europe/London' },
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Dubai (GST)', value: 'Asia/Dubai' },
    { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
    { label: 'New Delhi (IST)', value: 'Asia/Kolkata' },
    { label: 'Paris (CET)', value: 'Europe/Paris' },
    { label: 'Hong Kong (HKT)', value: 'Asia/Hong_Kong' },
    { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
    { label: 'Los Angeles (PST)', value: 'America/Los_Angeles' },
    { label: 'Berlin (CET)', value: 'Europe/Berlin' },
    { label: 'Sao Paulo (BRT)', value: 'America/Sao_Paulo' },
    { label: 'Johannesburg (SAST)', value: 'Africa/Johannesburg' },
];

export const TimeZoneConverter: React.FC = () => {
    const navigate = useNavigate();
    const [sourceTime, setSourceTime] = useState(new Date().toISOString().slice(0, 16));

    const [targetZone, setTargetZone] = useState('UTC');
    const [convertedTime, setConvertedTime] = useState('');

    useEffect(() => {
        try {
            const date = new Date(sourceTime);
            const targetTimeStr = date.toLocaleString('en-US', {
                timeZone: targetZone,
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            setConvertedTime(targetTimeStr);
        } catch {
            setConvertedTime('Invalid input');
        }
    }, [sourceTime, targetZone]);

    return (
        <div className="space-y-8 py-4 animate-fade-in text-text">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/category/unit-tools')}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Time Zone Converter</h1>
                    <p className="text-sm text-text-muted">Convert time between different global time zones</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto w-full">
                <div className="bg-surface/50 border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">From (Your Local/Source Time)</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-black focus:border-primary/50 focus:outline-none transition-all [color-scheme:dark]"
                                    value={sourceTime}
                                    onChange={(e) => setSourceTime(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Target Time Zone</label>
                                <div className="relative">
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-50" />
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pl-16 text-xl font-black focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
                                        value={targetZone}
                                        onChange={(e) => setTargetZone(e.target.value)}
                                    >
                                        {TIMEZONES.map(tz => (
                                            <option key={tz.value} value={tz.value} className="bg-surface">{tz.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center items-center p-12 bg-primary/5 rounded-[3rem] border border-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Clock className="w-48 h-48" />
                            </div>
                            <div className="text-center space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Converted Local Time</span>
                                <div className="text-4xl md:text-5xl font-black text-white leading-tight">
                                    {convertedTime}
                                </div>
                                <div className="inline-block px-4 py-2 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                    {targetZone.split('/').pop()?.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
