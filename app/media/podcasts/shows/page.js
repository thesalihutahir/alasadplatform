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
import { Search, Mic, Layers, ArrowRight, X, ChevronDown, ChevronUp, ArrowUpDown, PlayCircle } from 'lucide-react';

export default function AllShowsPage() {
    const [allShows, setAllShows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeLang, setActiveLang] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [expandedIds, setExpandedIds] = useState(new Set());
    const [visibleCount, setVisibleCount] = useState(15);

    const [sortOrder, setSortOrder] = useState('desc');

    const languages = ['All', 'English', 'Hausa', 'Arabic'];

    useEffect(() => {
        const fetchShows = async () => {
            try {
                const q = query(collection(db, 'podcast_shows'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const fetchedShows = snapshot.docs.map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }));
                setAllShows(fetchedShows);
            } catch (error) {
                console.error('Error fetching shows:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShows();
    }, []);

    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    const toggleExpand = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredShows = allShows.filter((show) => {
        const matchesLang = activeLang === 'All' || show.category === activeLang;
        const term = searchTerm.trim().toLowerCase();

        if (!term) return matchesLang;

        const title = (show.title || '').toLowerCase();
        const host = (show.host || '').toLowerCase();
        const desc = (show.description || '').toLowerCase();

        const matchesSearch = title.includes(term) || host.includes(term) || desc.includes(term);
        return matchesLang && matchesSearch;
    });

    const sortedShows = sortOrder === 'desc' ? filteredShows : [...filteredShows].reverse();
    const visibleShows = sortedShows.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            <Header />

            <main className="flex-grow pb-24">
                <section className="relative h-[220px] w-full overflow-hidden bg-brand-brown-dark mb-12">
                    <Image
                        src="/images/heroes/media-podcasts-hero.webp"
                        alt="Podcast Shows"
                        fill
                        className="object-cover object-center opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Layers className="w-3 h-3" /> Shows
                        </div>
                        <h1 className="font-agency text-4xl md:text-5xl text-white mb-2 leading-none">Series & Shows</h1>
                        <p className="font-lato text-white/60 text-sm md:text-base max-w-xl">Explore our complete collection of podcast series, organized by language and theme.</p>
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
                                            placeholder="Find a show or host..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setVisibleCount(15);
                                            }}
                                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-sm"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                                aria-label="Clear search"
                                            >
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
                                                onClick={() => {
                                                    setActiveLang(lang);
                                                    setVisibleCount(15);
                                                }}
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
                                    <h2 className="font-agency text-2xl text-brand-brown-dark">Shows</h2>
                                    <button
                                        onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-brand-brown-dark transition-colors"
                                    >
                                        <ArrowUpDown className="w-3 h-3" />
                                        {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                                    </button>
                                </div>

                                {visibleShows.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                            {visibleShows.map((show) => {
                                                const isExpanded = expandedIds.has(show.id);
                                                const dirTitle = getDir(show.title);

                                                return (
                                                    <Link
                                                        key={show.id}
                                                        href={`/media/podcasts/shows/${show.id}`}
                                                        className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:border-brand-gold/40 hover:shadow-lg hover:shadow-brand-sand/10 transition-all duration-300 h-full"
                                                    >
                                                        <div className="relative aspect-[16/8] sm:aspect-[4/3] bg-gray-100 overflow-hidden border-b border-gray-50">
                                                            <Image
                                                                src={show.cover || '/fallback.webp'}
                                                                alt={show.title}
                                                                fill
                                                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>

                                                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2">
                                                                <span className="px-2 py-1 bg-black/55 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold uppercase tracking-wider text-brand-gold">
                                                                    {show.category || 'Show'}
                                                                </span>
                                                                {show.host && (
                                                                    <span className="px-2 py-1 bg-black/55 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold text-white flex items-center gap-1 max-w-[120px]">
                                                                        <Mic className="w-3 h-3 text-brand-gold flex-shrink-0" />
                                                                        <span className="truncate">{show.host}</span>
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                <div className="w-11 h-11 rounded-full bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                                    <PlayCircle className="w-5 h-5" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-2.5 md:p-3.5 flex flex-col flex-grow" dir={dirTitle}>
                                                            <div className="relative pr-6 mb-2">
                                                                <h3 className={`text-base md:text-lg font-bold text-brand-brown-dark leading-snug group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${dirTitle === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                                    {show.title}
                                                                </h3>

                                                                <button
                                                                    onClick={(e) => toggleExpand(e, show.id)}
                                                                    className="absolute right-0 top-0 p-1 -mt-1 -mr-1 text-gray-300 hover:text-brand-gold transition-colors"
                                                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                                >
                                                                    {isExpanded ? <ChevronUp className="w-3 h-3 md:w-4 md:h-4" /> : <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />}
                                                                </button>
                                                            </div>

                                                            <div className="mt-auto pt-1.5 flex items-center justify-between border-t border-gray-50" dir="ltr">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-brown-dark transition-colors">View Show</span>
                                                                <ArrowRight className={`w-3.5 h-3.5 text-gray-300 group-hover:text-brand-gold transition-colors duration-300 ${dirTitle === 'rtl' ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        <div className="py-12 text-center space-y-4">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {visibleShows.length} of {sortedShows.length} Shows</p>
                                            {visibleCount < sortedShows.length && (
                                                <button
                                                    onClick={() => setVisibleCount((prev) => prev + 10)}
                                                    className="px-8 py-2.5 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-xs hover:border-brand-brown-dark transition-all uppercase tracking-wider shadow-sm"
                                                >
                                                    Load More Shows
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-300">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-agency text-lg text-gray-500">No shows found</h3>
                                        <p className="text-xs text-gray-400 mt-1">Try clearing filters or search terms.</p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setActiveLang('All');
                                                setVisibleCount(15);
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
