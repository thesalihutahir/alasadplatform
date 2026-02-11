"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { ListVideo, PlayCircle, Loader2, Layers, ChevronRight, Search, X, ArrowRight, Film } from 'lucide-react';

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");

    // Match the Admin Upload Categories
    const filters = ["All", "English", "Hausa", "Arabic"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Playlists
                const qPlaylists = query(collection(db, "video_playlists"), orderBy("createdAt", "desc"));
                const plSnap = await getDocs(qPlaylists);
                let fetchedPlaylists = plSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 2. Fetch ALL Videos (to count)
                const qVideos = query(collection(db, "videos")); 
                const vidSnap = await getDocs(qVideos);
                const fetchedVideos = vidSnap.docs.map(doc => doc.data());

                // 3. Calculate Counts Dynamically
                fetchedPlaylists = fetchedPlaylists.map(playlist => {
                    const realCount = fetchedVideos.filter(v => v.playlist === playlist.title).length;
                    return { ...playlist, count: realCount };
                });

                setPlaylists(fetchedPlaylists);

            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper: RTL Detection
    const getDir = (text) => /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';

    // Filter Logic
    const filteredPlaylists = activeFilter === "All" 
        ? playlists 
        : playlists.filter(p => p.category === activeFilter);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            <Header />

            <main className="flex-grow pb-24">

                {/* 1. COMPACT HERO BAND */}
                <section className="relative h-[220px] w-full overflow-hidden bg-brand-brown-dark mb-12">
                    <Image
                        src="/images/heroes/media-videos-hero.webp" 
                        alt="Video Playlists"
                        fill
                        className="object-cover object-center opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Layers className="w-3 h-3" /> Playlists
                        </div>
                        <h1 className="font-agency text-4xl md:text-5xl text-white mb-2 leading-none">
                            Series & Collections
                        </h1>
                        <p className="font-lato text-white/60 text-sm md:text-base max-w-xl">
                            Curated lectures, Tafsir, and seminars organized by topic.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">

                        {/* 2. REFINED FILTER BAR */}
                        <div className="flex justify-center mb-12">
                            <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1 bg-gray-50 border border-gray-100 rounded-xl w-full md:w-auto">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-5 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                                            activeFilter === filter
                                            ? 'bg-brand-brown-dark text-white shadow-sm'
                                            : 'text-gray-500 hover:text-brand-brown-dark hover:bg-white'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. PLAYLIST GRID (Slimmer & Smaller Cards) */}
                        {filteredPlaylists.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {filteredPlaylists.map((playlist) => (
                                    <Link 
                                        key={playlist.id} 
                                        href={`/media/videos/playlists/${playlist.id}`}
                                        className="group flex flex-col bg-white rounded-[1.25rem] overflow-hidden border border-gray-100 hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-sand/10 transition-all duration-300 h-full"
                                    >
                                        {/* Image Area - Kept 16:10 but container restricts overall size */}
                                        <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden border-b border-gray-50">
                                            <Image 
                                                src={playlist.cover || "/fallback.webp"} 
                                                alt={playlist.title} 
                                                fill 
                                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            />
                                            {/* Minimal Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                                            {/* Category Pill */}
                                            <div className="absolute top-2 left-2">
                                                <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-md border border-white/10 rounded text-[8px] font-bold uppercase tracking-wider text-brand-gold">
                                                    {playlist.category}
                                                </span>
                                            </div>

                                            {/* Count Badge */}
                                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-1 rounded flex items-center gap-1 border border-white/10">
                                                <ListVideo className="w-2.5 h-2.5 text-brand-gold" /> 
                                                {playlist.count}
                                            </div>
                                        </div>

                                        {/* Content Area - Reduced Padding and Font Sizes */}
                                        <div className="p-3 md:p-4 flex flex-col flex-grow" dir={getDir(playlist.title)}>
                                            <h3 className={`text-base md:text-lg font-bold text-brand-brown-dark leading-snug group-hover:text-brand-gold transition-colors mb-2 line-clamp-2 ${getDir(playlist.title) === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                {playlist.title}
                                            </h3>

                                            {/* Minimalist CTA */}
                                            <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-brown-dark transition-colors">
                                                    {getDir(playlist.title) === 'rtl' ? 'عرض السلسلة' : 'View'}
                                                </span>
                                                <ArrowRight className={`w-3 h-3 text-gray-300 group-hover:text-brand-gold transition-colors duration-300 ${getDir(playlist.title) === 'rtl' ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            /* Premium Empty State */
                            <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-3xl border border-gray-100 text-center max-w-2xl mx-auto">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 text-gray-300">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <h3 className="font-agency text-2xl text-gray-500 mb-2">No Collections Found</h3>
                                <p className="text-sm text-gray-400 font-lato">
                                    There are currently no playlists available for the selected language.
                                </p>
                                <button 
                                    onClick={() => setActiveFilter('All')}
                                    className="mt-6 text-xs font-bold text-brand-gold hover:text-brand-brown-dark transition-colors uppercase tracking-wider"
                                >
                                    View All Playlists
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
