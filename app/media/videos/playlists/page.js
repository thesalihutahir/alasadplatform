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
import { ListVideo, PlayCircle, Loader2, Layers, ArrowRight, Search } from 'lucide-react';

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
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato text-brand-brown-dark">
            <Header />

            <main className="flex-grow pb-24">

                {/* 1. COMPACT HERO BAND */}
                <section className="relative h-[220px] w-full overflow-hidden bg-brand-brown-dark mb-12">
                    <Image
                        src="/images/heroes/media-videos-hero.webp" 
                        alt="Playlists Archive"
                        fill
                        className="object-cover object-center opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-transparent to-transparent"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
                        {/* Subtle Loop Label */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-3 shadow-lg">
                            <Layers className="w-3 h-3" /> Playlists
                        </div>
                        <h1 className="font-agency text-4xl md:text-5xl text-white mb-2 leading-none">
                            Series Collections
                        </h1>
                        <p className="font-lato text-white/60 text-sm md:text-base max-w-xl">
                            Curated lectures and seminars organized by topic.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">

                        {/* 2. REFINED FILTER BAR */}
                        <div className="flex justify-center mb-10">
                            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x px-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`snap-center px-5 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                                            activeFilter === filter
                                            ? 'bg-brand-brown-dark text-white shadow-md'
                                            : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark'
                                        }`}
                                    >
                                        {filter}
                                        {activeFilter === filter && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold hidden md:block"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. PLAYLIST GRID (Slimmer & Quieter) */}
                        {filteredPlaylists.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                {filteredPlaylists.map((playlist) => {
                                    const dir = getDir(playlist.title);
                                    return (
                                        <Link 
                                            key={playlist.id} 
                                            href={`/media/videos/playlists/${playlist.id}`}
                                            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-gold/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
                                        >
                                            {/* Minimal Image Area */}
                                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden border-b border-gray-50">
                                                <Image 
                                                    src={playlist.cover || "/fallback.webp"} 
                                                    alt={playlist.title} 
                                                    fill 
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                
                                                {/* Very Subtle Hover Gradient (No big play button) */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                                                {/* Top Badges (Brand Colors Only) */}
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-brand-brown-dark text-[9px] font-bold uppercase rounded-md shadow-sm border border-white/20 tracking-wider">
                                                        {playlist.category}
                                                    </span>
                                                </div>

                                                {/* Count Badge (Bottom Right) */}
                                                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/10 shadow-sm">
                                                    <ListVideo className="w-3 h-3 text-brand-gold" /> 
                                                    {playlist.count}
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-5 flex flex-col flex-grow" dir={dir}>
                                                <h3 className={`text-lg md:text-xl font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors mb-4 line-clamp-2 ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                    {playlist.title}
                                                </h3>

                                                {/* Minimal CTA */}
                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-brown-dark transition-colors">
                                                        {dir === 'rtl' ? 'مشاهدة السلسلة' : 'View Series'}
                                                    </span>
                                                    <div className={`text-gray-300 group-hover:text-brand-gold transition-colors duration-300 ${dir === 'rtl' ? 'rotate-180' : ''}`}>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Premium Empty State */
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center max-w-2xl mx-auto">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <Search className="w-6 h-6 text-gray-300" />
                                </div>
                                <h3 className="font-agency text-2xl text-gray-500 mb-2">No Series Found</h3>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto">We couldn't find any playlists in the "{activeFilter}" category. Try selecting another filter.</p>
                                <button 
                                    onClick={() => setActiveFilter('All')}
                                    className="mt-6 text-xs font-bold text-brand-gold hover:text-brand-brown-dark transition-colors uppercase tracking-widest"
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