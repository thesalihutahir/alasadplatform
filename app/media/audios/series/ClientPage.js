"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Search, Mic, Layers, ArrowRight, ListMusic, X } from 'lucide-react';

export default function AllSeriesPage() {
    const [allSeries, setAllSeries] = useState([]);
    const [filteredSeries, setFilteredSeries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeLang, setActiveLang] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const languages = ['All', 'English', 'Hausa', 'Arabic'];

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const q = query(collection(db, 'audio_series'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const fetchedSeries = snapshot.docs.map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }));
                setAllSeries(fetchedSeries);
                setFilteredSeries(fetchedSeries);
            } catch (error) {
                console.error('Error fetching series:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
    }, []);

    useEffect(() => {
        let results = allSeries;

        if (activeLang !== 'All') {
            results = results.filter((series) => series.category === activeLang);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter((series) =>
                (series.title || '').toLowerCase().includes(term) ||
                (series.host && series.host.toLowerCase().includes(term)) ||
                (series.description && series.description.toLowerCase().includes(term))
            );
        }

        setFilteredSeries(results);
    }, [activeLang, searchTerm, allSeries]);

    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            <Header />

            <main className="flex-grow pb-24">
                <section className="relative h-[220px] w-full overflow-hidden bg-brand-brown-dark mb-12">
                    <Image
                        src="/images/heroes/media-audios-hero.webp"
                        alt="Audio Series"
                        fill
                        className="object-cover object-center opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Layers className="w-3 h-3" /> Audio Series
                        </div>
                        <h1 className="font-agency text-4xl md:text-5xl text-white mb-2 leading-none">Series & Playlists</h1>
                        <p className="font-lato text-white/60 text-sm md:text-base max-w-xl">Collections of sermons, Tafsir, and lectures organized for deep, continuous learning.</p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
                        <section className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-12">
                            <div className="w-full lg:w-[280px] lg:sticky lg:top-24 flex-shrink-0 space-y-8">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Search</h3>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-gold transition-colors" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Find a series or speaker..."
                                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-sm"
                                        />
                                        {searchTerm && (
                                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Clear search">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Filter By</h3>
                                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => setActiveLang(lang)}
                                                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-bold text-left transition-all flex items-center justify-between group flex-shrink-0 whitespace-nowrap ${
                                                    activeLang === lang
                                                        ? 'bg-brand-brown-dark text-white shadow-md'
                                                        : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark'
                                                }`}
                                            >
                                                {lang}
                                                {activeLang === lang && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold hidden lg:block"></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow w-full">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <h2 className="font-agency text-2xl text-brand-brown-dark">Series</h2>
                                </div>

                                {filteredSeries.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                        {filteredSeries.map((series) => {
                                            const dir = getDir(series.title);
                                            return (
                                                <Link
                                                    key={series.id}
                                                    href={`/media/audios/series/${series.id}`}
                                                    className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:border-brand-gold/40 hover:shadow-lg hover:shadow-brand-sand/10 transition-all duration-300 h-full"
                                                >
                                                    <div className="relative aspect-[16/8] sm:aspect-[4/3] bg-gray-100 overflow-hidden border-b border-gray-50">
                                                        <Image
                                                            src={series.cover || '/fallback.webp'}
                                                            alt={series.title}
                                                            fill
                                                            className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>

                                                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2">
                                                            <span className="px-2 py-1 bg-black/55 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold uppercase tracking-wider text-brand-gold">
                                                                {series.category || 'Series'}
                                                            </span>
                                                            {series.host && (
                                                                <span className="px-2 py-1 bg-black/55 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold text-white flex items-center gap-1 max-w-[120px]">
                                                                    <Mic className="w-3 h-3 text-brand-gold flex-shrink-0" />
                                                                    <span className="truncate">{series.host}</span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <div className="w-11 h-11 rounded-full bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                                <ListMusic className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-2.5 md:p-3.5 flex flex-col flex-grow" dir={dir}>
                                                        <h3 className={`text-base md:text-lg font-bold text-brand-brown-dark leading-snug mb-2 group-hover:text-brand-gold transition-colors ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                            {series.title}
                                                        </h3>

                                                        <p className={`text-xs text-gray-400 line-clamp-2 mb-4 flex-grow ${getDir(series.description || '') === 'rtl' ? 'font-arabic' : ''}`}>
                                                            {series.description || 'No description available.'}
                                                        </p>

                                                        <div className="mt-auto pt-1.5 flex items-center justify-between border-t border-gray-50" dir="ltr">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-brown-dark transition-colors">View Series</span>
                                                            <ArrowRight className={`w-3.5 h-3.5 text-gray-300 group-hover:text-brand-gold transition-colors duration-300 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-300">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-agency text-lg text-gray-500">No series found</h3>
                                        <p className="text-xs text-gray-400 mt-1">Try clearing filters or search terms.</p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setActiveLang('All');
                                            }}
                                            className="mt-4 text-xs font-bold text-brand-gold hover:underline"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
