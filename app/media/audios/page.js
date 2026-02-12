// Split 1/2
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import {
    ArrowUpDown,
    Calendar,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    Download,
    Headphones,
    ListMusic,
    Play,
    Search,
    X
} from 'lucide-react';

export default function AudiosPage() {
    const [allAudios, setAllAudios] = useState([]);
    const [allSeries, setAllSeries] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeLang, setActiveLang] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [visibleCount, setVisibleCount] = useState(6);

    // UI State for Card Expansion
    const [expandedIds, setExpandedIds] = useState(new Set());

    const languages = ['All', 'English', 'Hausa', 'Arabic'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const qAudios = query(collection(db, 'audios'), orderBy('createdAt', 'desc'));
                const audiosSnapshot = await getDocs(qAudios);
                const fetchedAudios = audiosSnapshot.docs.map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }));
                setAllAudios(fetchedAudios);

                const qSeries = query(collection(db, 'audio_series'), orderBy('createdAt', 'desc'));
                const seriesSnapshot = await getDocs(qSeries);
                const fetchedSeries = seriesSnapshot.docs.map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }));
                setAllSeries(fetchedSeries);
            } catch (error) {
                console.error('Error fetching audio data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setVisibleCount(6);
    }, [activeLang, searchTerm, sortOrder]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

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

    const filteredSeries = useMemo(
        () => allSeries.filter((series) => activeLang === 'All' || series.category === activeLang),
        [allSeries, activeLang]
    );

    const matchingAudios = useMemo(() => {
        return allAudios.filter((audio) => {
            const matchesCategory = activeLang === 'All' || audio.category === activeLang;
            const matchesSearch = (audio.title || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [allAudios, activeLang, searchTerm]);

    const sortedAudios = useMemo(() => {
        return [...matchingAudios].sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [matchingAudios, sortOrder]);

    const seriesCounts = useMemo(() => {
        return allAudios.reduce((acc, audio) => {
            if (!audio.series) return acc;
            acc[audio.series] = (acc[audio.series] || 0) + 1;
            return acc;
        }, {});
    }, [allAudios]);

    const visibleAudios = sortedAudios.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-20">
                {/* 1. HERO SECTION */}
                <section className="relative h-[220px] w-full overflow-hidden bg-brand-brown-dark mb-12">
                    <Image
                        src="/images/heroes/media-audios-hero.webp"
                        alt="Audio Library"
                        fill
                        className="object-cover object-center opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Headphones className="w-3 h-3" /> Audio Archive
                        </div>
                        <h1 className="font-agency text-4xl md:text-5xl text-white mb-2 leading-none">Audio Library</h1>
                        <p className="font-lato text-white/60 text-sm md:text-base max-w-xl">
                            Listen to sermons, tafsir, and educational series on the go.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <>
                        {/* 2. SERIES SHELF */}
                        {filteredSeries.length > 0 && (
                            <section className="px-6 md:px-12 lg:px-24 mb-16 border-b border-gray-100 pb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-agency text-2xl text-brand-brown-dark">Featured Series</h2>
                                    <Link
                                        href="/media/audios/series"
                                        className="text-xs font-bold text-gray-500 hover:text-brand-gold transition-colors flex items-center gap-1"
                                    >
                                        View All <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide snap-x">
                                    {filteredSeries.slice(0, 5).map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/media/audios/series/${item.id}`}
                                            className="snap-center flex-shrink-0 w-[160px] group"
                                        >
                                            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-3 border border-gray-100 group-hover:border-brand-gold/30 transition-all">
                                                <Image
                                                    src={item.cover || '/fallback.webp'}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                                                    <ListMusic className="w-3 h-3 text-brand-gold" />
                                                    {seriesCounts[item.title] || 0}
                                                </div>
                                            </div>
                                            <h3
                                                className={`font-bold text-sm text-brand-brown-dark leading-tight line-clamp-2 group-hover:text-brand-gold transition-colors ${getDir(item.title) === 'rtl' ? 'font-tajawal' : ''}`}
                                                dir={getDir(item.title)}
                                            >
                                                {item.title}
                                            </h3>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3. CONTROL BAR */}
                        <section className="px-6 md:px-12 lg:px-24 mb-12 flex flex-col lg:flex-row gap-12 items-start">
                            {/* LEFT RAIL */}
                            <div className="w-full lg:w-[280px] lg:sticky lg:top-24 flex-shrink-0 space-y-8">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Search</h3>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-gold transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Find an audio..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-sm"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
// Split 2/2
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
                            {/* RIGHT: RESULTS LIST */}
                            <div className="flex-grow w-full">
                                {/* Header Row */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <h2 className="font-agency text-2xl text-brand-brown-dark">Recent Uploads</h2>
                                    <button
                                        onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-brand-brown-dark transition-colors"
                                    >
                                        <ArrowUpDown className="w-3 h-3" />
                                        {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                                    </button>
                                </div>

                                {/* LIST ROWS */}
                                {visibleAudios.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {visibleAudios.map((audio) => {
                                            const dir = getDir(audio.title);
                                            const isExpanded = expandedIds.has(audio.id);
                                            return (
                                                <Link
                                                    key={audio.id}
                                                    href={`/media/audios/play/${audio.id}`}
                                                    className="group relative flex items-start gap-4 p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 bg-white"
                                                >
                                                    <div className="relative w-32 aspect-square rounded-lg overflow-hidden bg-black flex-shrink-0 border border-gray-50">
                                                        <Image
                                                            src={audio.thumbnail || '/fallback.webp'}
                                                            alt={audio.title}
                                                            fill
                                                            className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/10">
                                                                <Play className="w-3 h-3 fill-current ml-0.5" />
                                                            </div>
                                                        </div>
                                                        {audio.fileSize && (
                                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 rounded flex items-center gap-1">
                                                                <Clock className="w-2.5 h-2.5" /> {audio.fileSize}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-grow min-w-0 py-0.5" dir={dir}>
                                                        <div className="flex flex-wrap items-center gap-2 mb-1" dir="ltr">
                                                            <span className="text-[9px] font-bold text-brand-gold border border-brand-gold/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                {audio.category}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" /> {formatDate(audio.date)}
                                                            </span>
                                                        </div>

                                                        <div className="relative pr-6">
                                                            <h4
                                                                className={`text-sm md:text-base font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${dir === 'rtl' ? 'font-tajawal' : 'font-lato'}`}
                                                            >
                                                                {audio.title}
                                                            </h4>

                                                            <button
                                                                onClick={(e) => toggleExpand(e, audio.id)}
                                                                className="absolute right-0 top-0 p-1 text-gray-300 hover:text-brand-gold transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (!audio.audioUrl) return;
                                                            const proxyUrl = `/api/download?url=${encodeURIComponent(audio.audioUrl)}&name=${encodeURIComponent(`${audio.title || 'audio'}.mp3`)}`;
                                                            window.location.assign(proxyUrl);
                                                        }}
                                                        className="self-center p-2.5 rounded-full border border-gray-100 text-gray-400 hover:text-brand-brown-dark hover:border-brand-gold/40 transition-colors"
                                                        title="Download"
                                                        aria-label="Download audio"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-300">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-agency text-lg text-gray-500">No audio tracks found</h3>
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

                                {/* FOOTER STATUS & LOAD MORE */}
                                <div className="py-10 text-center space-y-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Showing {visibleAudios.length} of {matchingAudios.length} Audios
                                    </p>
                                    {visibleCount < sortedAudios.length && (
                                        <button
                                            onClick={() => setVisibleCount((prev) => prev + 6)}
                                            className="px-8 py-2.5 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-xs hover:border-brand-brown-dark transition-all uppercase tracking-wider shadow-sm"
                                        >
                                            Load More Audios
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
