"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import {
    Play, Mic, Calendar, Search, ArrowLeft,
    Share2, Check, ListMusic, ChevronDown, ChevronUp, ArrowUpRight, ArrowUpDown, X, Headphones
} from 'lucide-react';

export default function ViewShowPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    // --- STATE ---
    const [show, setShow] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search, sort, pagination, expand
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // desc = Newest first
    const [visibleCount, setVisibleCount] = useState(10);
    const [expandedIds, setExpandedIds] = useState(new Set());

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // 1. Fetch Show Details
                const showDocRef = doc(db, "podcast_shows", id);
                const showSnap = await getDoc(showDocRef);

                if (showSnap.exists()) {
                    const showData = { id: showSnap.id, ...showSnap.data() };
                    setShow(showData);

                    // 2. Fetch Episodes for this Show
                    const qEpisodes = query(
                        collection(db, "podcasts"),
                        where("show", "==", showData.title),
                        orderBy("date", "desc")
                    );

                    const epSnapshot = await getDocs(qEpisodes);
                    const fetchedEpisodes = epSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setEpisodes(fetchedEpisodes);
                } else {
                    console.error("Show not found");
                    router.push('/media/podcasts/shows');
                }
            } catch (error) {
                console.error("Error fetching show data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    // --- HELPERS ---
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

    const toggleExpand = (e, epId) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(epId)) next.delete(epId);
            else next.add(epId);
            return next;
        });
    };

    const handleShare = async () => {
        try {
            if (typeof window === 'undefined') return;
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({
                    title: show?.title || 'Podcast Show',
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
            }
        } catch (e) {
            console.error("Share failed:", e);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <div className="flex-grow flex items-center justify-center">
                <Loader size="lg" />
            </div>
            <Footer />
        </div>
    );

    if (!show) return null;

    const isArabic = show.category === 'Arabic';
    const dir = getDir(show.title);

    // Filter by search (derived)
    const filteredEpisodes = episodes.filter(ep => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const t = (ep.title || "").toLowerCase();
        const d = (ep.description || "").toLowerCase();
        return t.includes(term) || d.includes(term);
    });

    // Sort derived from state (by date)
    const sortedEpisodes = [...filteredEpisodes].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const visibleEpisodes = sortedEpisodes.slice(0, visibleCount);

    // Oldest episode for "Start Listening"
    const oldestEpisodeSorted = [...episodes].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    const oldestEpisodeId = oldestEpisodeSorted.length > 0 ? oldestEpisodeSorted[0].id : null;

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">

                {/* 1. GLASS PODCAST HEADER */}
                <div className="relative w-full pt-10 pb-32 lg:pt-16 lg:pb-48 overflow-hidden bg-brand-brown-dark">
                    {/* Ambient Blurred Background */}
                    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-soft-light opacity-50">
                        <Image
                            src={show.cover || "/fallback.webp"}
                            alt=""
                            fill
                            className="object-cover blur-[80px] scale-120"
                        />
                    </div>

                    {/* Subtle Overlay Picture */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <Image
                            src={show.cover || "/fallback.webp"}
                            alt=""
                            fill
                            className="object-cover opacity-20 mix-blend-overlay scale-115 saturate-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-brand-brown-dark/50 to-transparent"></div>
                    </div>

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>

                    <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 relative z-10">
                        {/* Navigation Row */}
                        <div className="mb-8">
                            <Link href="/media/podcasts/shows" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Shows
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Overlapping Show Info Card */}
                <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 relative z-20 -mt-24 lg:-mt-36 mb-12">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-10 lg:p-12 relative" dir={dir}>

                        {/* Card Background Decoration */}
                        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none z-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sand/30 rounded-full blur-[80px]"></div>
                        </div>

                        <div className="flex flex-col gap-8 lg:gap-10 items-center relative z-10">

                            {/* Cover (Podcast vibe: square artwork) */}
                            <div className="w-full sm:w-[360px] lg:w-[420px] flex-shrink-0 -mt-20 lg:-mt-32">
                                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white border border-gray-100 bg-gray-50">
                                    <Image
                                        src={show.cover || "/fallback.webp"}
                                        alt={show.title}
                                        fill
                                        className="object-cover object-center"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Details Stack */}
                            <div className="flex-grow flex flex-col items-center text-center pt-2 w-full max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <Headphones className="w-3 h-3" /> Podcast Show
                                </div>

                                <h1 className={`text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-brand-brown-dark mb-4 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {show.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-[10px] font-bold uppercase tracking-wider" dir="ltr">
                                    <span className="bg-brand-brown-dark text-white px-3 py-1 rounded-md">
                                        {show.category} Series
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                                        <ListMusic className="w-3 h-3" /> {episodes.length} Episodes
                                    </span>
                                    {show.host && (
                                        <span className="text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                                            <Mic className="w-3 h-3" /> {show.host}
                                        </span>
                                    )}
                                </div>

                                <p className={`text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed mb-8 w-full lg:text-center ${getDir(show.description || "") === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`} dir={getDir(show.description || "")}>
                                    {show.description || "Browse all episodes in this show below. Episodes can be sorted newest or oldest."}
                                </p>

                                {/* Actions */}
                                <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 w-full`} dir="ltr">
                                    {oldestEpisodeId && (
                                        <Link
                                            href={`/media/podcasts/play/${oldestEpisodeId}`}
                                            className="inline-flex items-center justify-center gap-3 bg-brand-gold text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group w-full sm:w-auto"
                                        >
                                            <Play className="w-4 h-4 fill-current" /> Start Listening
                                            <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleShare}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm w-full sm:w-auto bg-white border border-gray-200 text-brand-brown-dark hover:border-brand-gold/50"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. EPISODE LIST */}
                <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 md:px-8">

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-4 border-b border-gray-100">
                        <div>
                            <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark flex items-center gap-3">
                                <ListMusic className="w-6 h-6 text-brand-gold" /> Episodes
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                Use search, sort, and expand titles as needed.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                            {/* Search */}
                            <div className="relative w-full sm:w-72">
                                <Search className={`absolute w-4 h-4 text-gray-400 top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'}`} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setVisibleCount(10);
                                    }}
                                    placeholder={isArabic ? "بحث في الحلقات..." : "Search episodes..."}
                                    className={`w-full ${isArabic ? 'pr-10 pl-10 text-right font-arabic' : 'pl-10 pr-10'} py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-sm`}
                                    dir={isArabic ? 'rtl' : 'ltr'}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors ${isArabic ? 'left-3' : 'right-3'}`}
                                        aria-label="Clear search"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Sort */}
                            <button
                                onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                                className={`flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border shadow-sm transition-all w-full sm:w-auto ${
                                    sortOrder === 'desc'
                                        ? 'bg-brand-brown-dark text-white border-brand-brown-dark'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-brand-brown-dark hover:text-brand-brown-dark'
                                }`}
                                dir="ltr"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                            </button>
                        </div>
                    </div>

                    {visibleEpisodes.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
                                {visibleEpisodes.map((ep) => {
                                    const isExpanded = expandedIds.has(ep.id);
                                    const epDir = getDir(ep.title);

                                    return (
                                        <Link
                                            key={ep.id}
                                            href={`/media/podcasts/play/${ep.id}`}
                                            className="group relative flex items-start gap-4 p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 bg-white"
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative w-32 md:w-40 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 border border-gray-50">
                                                <Image
                                                    src={ep.thumbnail || "/fallback.webp"}
                                                    alt={ep.title}
                                                    fill
                                                    className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
                                                        <Play className="w-3 h-3 fill-current ml-0.5" />
                                                    </div>
                                                </div>
                                                {ep.duration && (
                                                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 rounded">
                                                        {ep.duration}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-grow min-w-0 py-0.5" dir={epDir}>
                                                <div className="flex flex-wrap items-center gap-2 mb-1" dir="ltr">
                                                    {ep.category && (
                                                        <span className="text-[9px] font-bold text-brand-gold border border-brand-gold/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                            {ep.category}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {formatDate(ep.date)}
                                                    </span>
                                                </div>

                                                <div className="relative pr-6">
                                                    <h4 className={`text-sm md:text-base lg:text-lg font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${epDir === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                        {ep.title}
                                                    </h4>

                                                    {/* Expand Button */}
                                                    <button
                                                        onClick={(e) => toggleExpand(e, ep.id)}
                                                        className="absolute right-0 top-0 p-1 text-gray-300 hover:text-brand-gold transition-colors"
                                                        aria-label={isExpanded ? "Collapse" : "Expand"}
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Footer Status & Load More */}
                            {sortedEpisodes.length > 0 && (
                                <div className="py-10 text-center space-y-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Showing {visibleEpisodes.length} of {sortedEpisodes.length} Episodes
                                    </p>
                                    {visibleCount < sortedEpisodes.length && (
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 10)}
                                            className="px-8 py-2.5 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-xs hover:border-brand-brown-dark transition-all uppercase tracking-wider shadow-sm"
                                        >
                                            Load More Episodes
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-300">
                                <ListMusic className="w-8 h-8" />
                            </div>
                            <h3 className="font-agency text-xl text-gray-500 mb-1">No Episodes Found</h3>
                            <p className="text-sm text-gray-400">Try clearing search terms, or check back later.</p>
                        </div>
                    )}
                </div>

            </main>
            <Footer />
        </div>
    );
}