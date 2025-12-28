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
import { Play, ListVideo, Clock, Filter, X, Loader2 } from 'lucide-react';

export default function VideosPage() {

    // --- STATE ---
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All Videos");
    const [visibleCount, setVisibleCount] = useState(6);
    
    // Video Modal State
    const [selectedVideo, setSelectedVideo] = useState(null);

    const filters = ["All Videos", "Tafsir", "Lecture", "Event Highlight", "Friday Sermon (Khutbah)"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Videos
                const qVideos = query(collection(db, "videos"), orderBy("createdAt", "desc"));
                const videoSnapshot = await getDocs(qVideos);
                const fetchedVideos = videoSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setVideos(fetchedVideos);

                // Fetch Playlists
                const qPlaylists = query(collection(db, "video_playlists"), orderBy("createdAt", "desc"));
                const playlistSnapshot = await getDocs(qPlaylists);
                const fetchedPlaylists = playlistSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPlaylists(fetchedPlaylists);

            } catch (error) {
                console.error("Error fetching media:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- HELPER: Format Date ---
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // --- HELPER: Auto-Detect Arabic ---
    const getDir = (text) => {
        if (!text) return 'ltr';
        // Regex to check for Arabic characters
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // --- HELPER: Get YouTube ID ---
    const getYouTubeID = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // --- FILTER LOGIC ---
    const filteredVideos = activeFilter === "All Videos" 
        ? videos 
        : videos.filter(video => video.category === activeFilter);

    const visibleVideos = filteredVideos.slice(0, visibleCount);

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
                            Watch lectures, sermons, and event highlights from Al-Asad Foundation. Explore our curated series and latest uploads.
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
                                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                        Featured Series
                                    </h2>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                                        Curated Playlists
                                    </span>
                                </div>

                                <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 md:gap-8 scrollbar-hide snap-x">
                                    {playlists.map((playlist) => (
                                        <Link 
                                            key={playlist.id} 
                                            href={`/media/playlists/${playlist.id}`} // LINKING TO PLAYLIST PAGE
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
                                                    <ListVideo className="w-3 h-3" /> {playlist.count || 0} Videos
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

                        {/* 3. FILTER BAR */}
                        <section className="px-6 md:px-12 lg:px-24 mb-8">
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
                             <div className="flex justify-between items-end mb-6 md:mb-8">
                                <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                    Recent Uploads
                                </h2>
                            </div>

                            {visibleVideos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {visibleVideos.map((video) => {
                                        const dir = getDir(video.title); // Detect Direction
                                        return (
                                            <div 
                                                key={video.id} 
                                                onClick={() => setSelectedVideo(video)} // OPEN MODAL
                                                className="group block bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 transition-all hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                                            >
                                                {/* Thumbnail Container */}
                                                <div className="relative w-full aspect-video bg-gray-900">
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
                                                <div className="p-5" dir={dir}>
                                                    <div className="flex justify-between items-start mb-2" dir="ltr">
                                                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded">
                                                            {video.category}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-lato">
                                                            {formatDate(video.date)}
                                                        </span>
                                                    </div>

                                                    <h3 className={`font-agency text-xl md:text-2xl text-brand-brown-dark leading-tight mb-3 group-hover:text-brand-gold transition-colors line-clamp-2 ${dir === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                                        {video.title}
                                                    </h3>

                                                    <div className={`flex items-center gap-2 mt-auto ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                                        <p className="text-xs font-bold text-brand-brown group-hover:underline decoration-brand-gold/50 underline-offset-4">
                                                            {dir === 'rtl' ? 'شاهد الآن' : 'Watch Now'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
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
                        {visibleCount < filteredVideos.length && (
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

            {/* --- VIDEO MODAL --- */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl">
                        {/* Close Button */}
                        <button 
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Video Player */}
                        <div className="relative aspect-video w-full">
                            <iframe 
                                src={`https://www.youtube.com/embed/${getYouTubeID(selectedVideo.url)}?autoplay=1`} 
                                title={selectedVideo.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* Video Details (Optional below video) */}
                        <div className="p-4 bg-white md:p-6" dir={getDir(selectedVideo.title)}>
                            <h3 className={`text-xl font-bold text-gray-900 ${getDir(selectedVideo.title) === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                {selectedVideo.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1" dir="ltr">{formatDate(selectedVideo.date)}</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
