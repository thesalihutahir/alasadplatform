"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Play, ListVideo, Clock, Filter, Loader2, ArrowUpDown, Search, X, ChevronRight } from 'lucide-react';

export default function VideosPage() {

    // --- STATE ---
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Search
    const [activeFilter, setActiveFilter] = useState("All Videos");
    const [searchTerm, setSearchTerm] = useState("");
    const [visibleCount, setVisibleCount] = useState(6);
    
    // Sort Order State ('desc' = Newest Date Recorded First)
    const [sortOrder, setSortOrder] = useState('desc');

    const filters = ["All Videos", "English", "Hausa", "Arabic"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Videos
                const qVideos = query(collection(db, "videos"), orderBy("createdAt", "desc"));
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
                    const realCount = fetchedVideos.filter(v => v.playlist === playlist.title).length;
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

    const sortedVideos = [...filteredVideos].sort((a, b) => {
        const dateA = new Date(a.date || 0); 
        const dateB = new Date(b.date || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const visibleVideos = sortedVideos.slice(0, visibleCount);
    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-12">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-videos-hero.webp" 
                            alt="Video Archive Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Video Library
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
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
                        {/* 2. PLAYLISTS / SERIES SECTION */}
                        {playlists.length > 0 && (
                            <section className="px-6 md:px-12 lg:px-24 mb-12">
                                {/* HEADER: Flex Row + Styled Button */}
                                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                        <span className="hidden sm:inline">Featured </span>Playlists
                                    </h2>
                                    <Link 
                                        href="/media/videos/playlists" 
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-widest hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all duration-300 shadow-sm"
                                    >
                                        View All <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 md:gap-8 scrollbar-hide snap-x">
                                    {playlists
                                        .sort((a, b) => b.count - a.count) 
                                        .slice(0, 3)
                                        .map((playlist) => (
                                        <Link 
                                            key={playlist.id} 
                                            href={`/media/videos/playlists/${playlist.id}`} 
                                            className="snap-center min-w-[260px] md:min-w-0 bg-brand-sand/30 rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                                        >
                                            <div className="relative w-full aspect-[16/10] bg-gray-200">
                                                <Image 
                                                    src={playlist.cover || "/fallback.webp"} 
                                                    alt={playlist.title} 
                                                    fill 
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                                        <ListVideo className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                                    <ListVideo className="w-3 h-3" /> {playlist.count} Videos
                                                </div>
                                            </div>

                                            <div className="p-4" dir={getDir(playlist.title)}>
                                                <h3 className={`font-agency text-lg md:text-xl text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors line-clamp-1 ${getDir(playlist.title) === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                                    {playlist.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">
                                                    {getDir(playlist.title) === 'rtl' ? 'عرض السلسلة ←' : 'View Full Playlist →'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3. SEARCH & FILTERS SECTION */}
                        <section className="px-6 md:px-12 lg:px-24 mb-8">
                            
                            {/* SEARCH BAR */}
                            <div className="max-w-2xl mx-auto mb-6">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-gold transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Search lectures, topics, or titles..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-all shadow-sm"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* FILTER CHIPS */}
                            <div className="flex items-center gap-2 mb-4 md:hidden">
                                <Filter className="w-4 h-4 text-brand-brown" />
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-brown">Filter Content</span>
                            </div>
                            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide md:justify-center md:flex-wrap">
                                {filters.map((filter, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                                            activeFilter === filter 
                                            ? 'bg-brand-gold text-white shadow-md transform md:scale-105' 
                                            : 'bg-brand-sand text-brand-brown-dark hover:bg-brand-gold/10 hover:text-brand-gold'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 4. ALL VIDEOS GRID */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                             {/* UPDATED HEADER: Always Row, Proper Alignment */}
                             <div className="flex flex-row items-center justify-between gap-4 mb-6 md:mb-8">
                                <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark whitespace-nowrap">
                                    Recent Uploads
                                </h2>

                                {/* SORTING BUTTON */}
                                <button 
                                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark transition-all shadow-sm whitespace-nowrap flex-shrink-0"
                                >
                                    <ArrowUpDown className="w-3 h-3" />
                                    <span className="hidden sm:inline">Sort: </span>
                                    {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                                </button>
                            </div>

                            {visibleVideos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {visibleVideos.map((video) => {
                                        const dir = getDir(video.title);
                                        return (
                                            <Link 
                                                key={video.id} 
                                                href={`/media/videos/${video.id}`} 
                                                className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:border-brand-gold/20"
                                            >
                                                {/* Thumbnail Container */}
                                                <div className="relative w-full aspect-video bg-black">
                                                    <Image
                                                        src={video.thumbnail || "/fallback.webp"}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-300 shadow-md">
                                                            <Play className="w-5 h-5 md:w-7 md:h-7 text-white fill-current ml-1" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Watch
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 flex flex-col h-full" dir={dir}>
                                                    {/* Meta Row: Category & Date */}
                                                    <div className="flex justify-between items-center mb-3" dir="ltr">
                                                        <span className="text-[10px] font-bold text-brand-brown-dark bg-brand-sand px-2 py-1 rounded uppercase tracking-wider">
                                                            {video.category}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold">
                                                            {formatDate(video.date)}
                                                        </span>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className={`font-agency text-xl md:text-2xl text-brand-brown-dark leading-tight mb-2 group-hover:text-brand-gold transition-colors ${dir === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                                        {video.title}
                                                    </h3>

                                                    {/* Description */}
                                                    {video.description && (
                                                        <p className={`text-sm text-gray-600 line-clamp-2 leading-relaxed hover:text-gray-900 transition-colors ${dir === 'rtl' ? 'font-arabic' : 'font-lato'}`}>
                                                            {video.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Play className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No videos found matching your criteria.</p>
                                </div>
                            )}
                        </section>

                        {/* 5. LOAD MORE */}
                        {visibleCount < sortedVideos.length && (
                            <section className="py-12 text-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 6)}
                                    className="px-8 py-3 border-2 border-brand-sand text-brand-brown-dark rounded-full font-agency text-lg hover:bg-brand-brown-dark hover:text-white transition-colors uppercase tracking-wide"
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
