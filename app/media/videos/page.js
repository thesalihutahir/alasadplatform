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
import { Play, ListVideo, Clock, Filter, Loader2, ArrowUpDown, Search, X, ChevronRight, Calendar, Film } from 'lucide-react';

export default function VideosPage() {

    // --- STATE ---
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [activeFilter, setActiveFilter] = useState("All Videos");
    const [searchTerm, setSearchTerm] = useState("");
    const [visibleCount, setVisibleCount] = useState(9); // Show 9 initially

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

                // 3. CALCULATE REAL COUNTS (Robust: ID -> Title Match)
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
    // --- FILTER & SORT LOGIC ---
    const filteredVideos = videos.filter(video => {
        const matchesCategory = activeFilter === "All Videos" || video.category === activeFilter;
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Sorting by Manual Date
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

                {/* 1. HERO SECTION (Premium Redesign) */}
                <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden bg-brand-brown-dark mb-16">
                    <Image
                        src="/images/heroes/media-videos-hero.webp" 
                        alt="Video Archive Hero"
                        fill
                        className="object-cover object-center opacity-40 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-transparent to-transparent"></div>
                    
                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-brand-gold text-xs font-bold uppercase tracking-widest mb-6">
                            <Film className="w-4 h-4" /> Digital Archive
                        </div>
                        <h1 className="font-agency text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-none drop-shadow-2xl">
                            Video Library
                        </h1>
                        <p className="font-lato text-white/80 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
                            Watch lectures, sermons, and event highlights from Al-Asad Education Foundation. Explore our curated series and latest uploads.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <>
                        {/* 2. PLAYLISTS / SERIES SECTION (Cleaner & Luxurious) */}
                        {playlists.length > 0 && (
                            <section className="px-6 md:px-12 lg:px-24 mb-20 max-w-7xl mx-auto">
                                <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-4">
                                    <div>
                                        <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-2 block">Curated Series</span>
                                        <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">
                                            Featured Playlists
                                        </h2>
                                    </div>
                                    <Link 
                                        href="/media/videos/playlists" 
                                        className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-brown-dark hover:text-brand-gold transition-colors group"
                                    >
                                        View All Series <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>

                                <div className="flex overflow-x-auto gap-6 pb-6 md:grid md:grid-cols-3 scrollbar-hide snap-x">
                                    {playlists
                                        .sort((a, b) => b.count - a.count) 
                                        .slice(0, 3)
                                        .map((playlist) => (
                                        <Link 
                                            key={playlist.id} 
                                            href={`/media/videos/playlists/${playlist.id}`} 
                                            className="snap-center min-w-[280px] md:min-w-0 group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 aspect-[16/10]"
                                        >
                                            <Image 
                                                src={playlist.cover || "/fallback.webp"} 
                                                alt={playlist.title} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                            
                                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                                                <ListVideo className="w-3 h-3" /> {playlist.count}
                                            </div>

                                            <div className="absolute bottom-0 left-0 w-full p-6 text-white" dir={getDir(playlist.title)}>
                                                <h3 className={`font-agency text-2xl md:text-3xl leading-none mb-1 group-hover:text-brand-gold transition-colors line-clamp-1 ${getDir(playlist.title) === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                                    {playlist.title}
                                                </h3>
                                                <p className="text-xs text-white/70 uppercase tracking-widest font-bold">
                                                    {getDir(playlist.title) === 'rtl' ? 'عرض السلسلة' : 'View Series'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="md:hidden mt-4 text-center">
                                     <Link href="/media/videos/playlists" className="text-sm font-bold text-brand-gold uppercase tracking-widest">View All Series</Link>
                                </div>
                            </section>
                        )}

                        {/* 3. CONTROL BAR (Unified Search & Filter) */}
                        <section className="px-6 md:px-12 lg:px-24 mb-12 max-w-7xl mx-auto relative z-20">
                            <div className="bg-white p-2 rounded-full shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto">
                                {/* Search */}
                                <div className="relative w-full md:flex-grow group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-100 p-1.5 rounded-full text-gray-400 group-focus-within:text-brand-gold group-focus-within:bg-brand-gold/10 transition-colors">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Search lectures, topics..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-10 py-3 bg-transparent rounded-full text-sm font-medium focus:outline-none placeholder-gray-400 text-brand-brown-dark"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Divider (Desktop) */}
                                <div className="hidden md:block w-px h-8 bg-gray-200"></div>

                                {/* Filters */}
                                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide p-1 md:p-0">
                                    {filters.map((filter) => (
                                        <button 
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                                activeFilter === filter 
                                                ? 'bg-brand-brown-dark text-white shadow-md' 
                                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-brand-brown-dark'
                                            }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                        {/* 4. ALL VIDEOS GRID (Slim & Modern) */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                             <div className="flex flex-row items-center justify-between gap-4 mb-8">
                                <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                    Recent Uploads
                                </h2>

                                <button 
                                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-brand-gold hover:text-brand-brown-dark transition-all shadow-sm flex-shrink-0"
                                >
                                    <ArrowUpDown className="w-3 h-3" />
                                    <span className="hidden sm:inline">Sort: </span>
                                    {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                                </button>
                            </div>

                            {visibleVideos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {visibleVideos.map((video) => {
                                        const dir = getDir(video.title);
                                        return (
                                            <Link 
                                                key={video.id} 
                                                href={`/media/videos/${video.id}`} 
                                                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-gold/20 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
                                            >
                                                {/* Thumbnail */}
                                                <div className="relative w-full aspect-video bg-black overflow-hidden">
                                                    <Image
                                                        src={video.thumbnail || "/fallback.webp"}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white shadow-lg">
                                                            <Play className="w-6 h-6 fill-current ml-1" />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Duration Badge (Mocked or Real if available) */}
                                                    {video.duration && (
                                                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                                                            {video.duration}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-6 flex flex-col flex-grow" dir={dir}>
                                                    <div className="flex justify-between items-start mb-3" dir="ltr">
                                                        <span className="inline-block px-2 py-0.5 bg-brand-sand/50 text-brand-brown-dark text-[10px] font-bold uppercase tracking-wider rounded border border-brand-gold/10">
                                                            {video.category}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(video.date)}
                                                        </div>
                                                    </div>

                                                    <h3 className={`font-agency text-xl md:text-2xl text-brand-brown-dark leading-tight mb-3 group-hover:text-brand-gold transition-colors line-clamp-2 ${dir === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                                        {video.title}
                                                    </h3>

                                                    {video.description && (
                                                        <p className={`text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-grow ${dir === 'rtl' ? 'font-arabic' : 'font-lato'}`}>
                                                            {video.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-brand-sand/10 rounded-3xl border-2 border-dashed border-brand-gold/20">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                        <Search className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <h3 className="font-agency text-xl text-gray-500">No videos found</h3>
                                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                </div>
                            )}
                        </section>

                        {/* 5. LOAD MORE */}
                        {visibleCount < sortedVideos.length && (
                            <section className="py-16 text-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 6)}
                                    className="px-10 py-3 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-agency text-lg hover:bg-brand-brown-dark hover:text-white hover:border-brand-brown-dark transition-all shadow-sm hover:shadow-lg uppercase tracking-wider"
                                >
                                    Load More Videos
                                </button>
                            </section>
                        )}
                    </>
                )}

            </main>

            <Footer />
        </div>
    );
}
