"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { Play, ListVideo, Clock, Filter, Loader2, ArrowUpDown, Search, X, ChevronRight, Calendar, ArrowRight, Film, ChevronDown, ChevronUp } from 'lucide-react';

export default function VideosPage() {

    // --- STATE ---
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [activeFilter, setActiveFilter] = useState("All Videos");
    const [searchTerm, setSearchTerm] = useState("");
    const [visibleCount, setVisibleCount] = useState(9); 

    // UI State for Card Expansion
    const [expandedIds, setExpandedIds] = useState(new Set());

    // Sort Order State ('desc' = Newest Date Recorded First)
    const [sortOrder, setSortOrder] = useState('desc');

    const filters = ["All Videos", "English", "Hausa", "Arabic"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Videos (Safety Limit 100)
                const qVideos = query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(100));
                const videoSnapshot = await getDocs(qVideos);
                const fetchedVideos = videoSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setVideos(fetchedVideos);

                // 2. Fetch Playlists
                const qPlaylists = query(collection(db, "video_playlists"), orderBy("createdAt", "desc"));
                const playlistSnapshot = await getDocs(qPlaylists);
                let fetchedPlaylists = playlistSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 3. CALCULATE REAL COUNTS
                fetchedPlaylists = fetchedPlaylists.map(playlist => {
                    const realCount = fetchedVideos.filter(v => 
                        v.playlistId === playlist.id || v.playlist === playlist.title
                    ).length;
                    return { ...playlist, count: realCount };
                });

                setPlaylists(fetchedPlaylists);

            } catch (error) {
                console.error("Error fetching media:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const toggleExpand = (e, id) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    // --- FILTER & SORT LOGIC ---
    const filteredVideos = videos.filter(video => {
        const matchesCategory = activeFilter === "All Videos" || video.category === activeFilter;
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedVideos = [...filteredVideos].sort((a, b) => {
        const dateA = new Date(a.date || 0); 
        const dateB = new Date(b.date || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const visibleVideos = sortedVideos.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-20">

                {/* 1. HERO SECTION */}
                <section className="relative h-[220px] w-full overflow-hidden bg-brand-brown-dark mb-12">
                    <Image
                        src="/images/heroes/media-videos-hero.webp" 
                        alt="Video Archive"
                        fill
                        className="object-cover object-center opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Film className="w-3 h-3" /> Digital Archive
                        </div>
                        <h1 className="font-agency text-4xl md:text-5xl text-white mb-2 leading-none">
                            Video Library
                        </h1>
                        <p className="font-lato text-white/60 text-sm md:text-base max-w-xl">
                            Curated lectures, sermons, and event highlights.
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
                        {playlists.length > 0 && (
                            <section className="px-6 md:px-12 lg:px-24 mb-16 border-b border-gray-100 pb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-agency text-2xl text-brand-brown-dark">
                                        Featured Series
                                    </h2>
                                    <Link 
                                        href="/media/videos/playlists" 
                                        className="text-xs font-bold text-gray-500 hover:text-brand-gold transition-colors flex items-center gap-1"
                                    >
                                        View All <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide snap-x">
                                    {playlists
                                        .sort((a, b) => b.count - a.count) 
                                        .slice(0, 5)
                                        .map((playlist) => (
                                        <Link 
                                            key={playlist.id} 
                                            href={`/media/videos/playlists/${playlist.id}`} 
                                            className="snap-center flex-shrink-0 w-[160px] group"
                                        >
                                            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-3 border border-gray-100 group-hover:border-brand-gold/30 transition-all">
                                                <Image 
                                                    src={playlist.cover || "/fallback.webp"} 
                                                    alt={playlist.title} 
                                                    fill 
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <ListVideo className="w-3 h-3" /> {playlist.count}
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-sm text-brand-brown-dark leading-tight line-clamp-2 group-hover:text-brand-gold transition-colors" dir={getDir(playlist.title)}>
                                                {playlist.title}
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
                                            placeholder="Find a video..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-sm"
                                        />
                                        {searchTerm && (
                                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Filter By</h3>
                                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                                        {filters.map((filter) => (
                                            <button 
                                                key={filter}
                                                onClick={() => setActiveFilter(filter)}
                                                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-bold text-left transition-all flex items-center justify-between group flex-shrink-0 whitespace-nowrap ${
                                                    activeFilter === filter 
                                                    ? 'bg-brand-brown-dark text-white shadow-md' 
                                                    : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark'
                                                }`}
                                            >
                                                {filter}
                                                {activeFilter === filter && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold hidden lg:block"></div>}
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
                                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-brand-brown-dark transition-colors"
                                    >
                                        <ArrowUpDown className="w-3 h-3" />
                                        {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                                    </button>
                                </div>

                                {/* LIST ROWS */}
                                {visibleVideos.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {visibleVideos.map((video) => {
                                            const dir = getDir(video.title);
                                            const isExpanded = expandedIds.has(video.id);
                                            return (
                                                <Link 
                                                    key={video.id} 
                                                    href={`/media/videos/${video.id}`} 
                                                    className="group relative flex items-start gap-4 p-3 rounded-2xl bg-white border border-gray-100 hover:border-brand-gold/30 hover:bg-brand-sand/10 transition-all duration-300"
                                                >
                                                    {/* Thumbnail (Square) with Increased Zoom */}
                                                    <div className="relative w-24 md:w-32 aspect-square flex-shrink-0 bg-black rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                        <Image
                                                            src={video.thumbnail || "/fallback.webp"}
                                                            alt={video.title}
                                                            fill
                                                            className="object-cover object-center scale-120 group-hover:scale-135 transition-transform duration-700" 
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
                                                                <Play className="w-3 h-3 fill-current ml-0.5" />
                                                            </div>
                                                        </div>
                                                        {video.duration && (
                                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 rounded">
                                                                {video.duration}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info Stack */}
                                                    <div className="flex-grow min-w-0 py-1 flex flex-col justify-between h-full" dir={dir}>
                                                        <div>
                                                            {/* Meta Row */}
                                                            <div className="flex flex-wrap items-center gap-2 mb-2" dir="ltr">
                                                                <span className="text-[9px] font-bold text-brand-gold border border-brand-gold/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                    {video.category}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    {formatDate(video.date)}
                                                                </span>
                                                            </div>

                                                            {/* Title with Expand Logic */}
                                                            <div className="relative pr-6">
                                                                <h3 className={`font-agency text-lg md:text-xl text-brand-brown-dark leading-snug group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${dir === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                                                    {video.title}
                                                                </h3>
                                                                
                                                                {/* Expand Button */}
                                                                <button 
                                                                    onClick={(e) => toggleExpand(e, video.id)}
                                                                    className="absolute right-0 top-0 p-1 text-gray-300 hover:text-brand-gold transition-colors"
                                                                >
                                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                </button>
                                                            </div>
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
                                        <h3 className="font-agency text-lg text-gray-500">No videos found</h3>
                                        <p className="text-xs text-gray-400 mt-1">Try clearing filters or search terms.</p>
                                        <button 
                                            onClick={() => {setSearchTerm(''); setActiveFilter('All Videos');}}
                                            className="mt-4 text-xs font-bold text-brand-gold hover:underline"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}

                                {/* FOOTER STATUS & LOAD MORE */}
                                <div className="py-10 text-center space-y-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Showing {visibleVideos.length} of {filteredVideos.length} Videos
                                    </p>
                                    {visibleCount < sortedVideos.length && (
                                        <button 
                                            onClick={() => setVisibleCount(prev => prev + 6)}
                                            className="px-8 py-2.5 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-xs hover:border-brand-brown-dark transition-all uppercase tracking-wider shadow-sm"
                                        >
                                            Load More Videos
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
