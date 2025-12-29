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
import { ListVideo, PlayCircle, Loader2 } from 'lucide-react';

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
                // Note: This fetches all videos to count them correctly.
                // For a very large app, a cloud function counter is better, but this is fine for now.
                const qVideos = query(collection(db, "videos")); 
                const vidSnap = await getDocs(qVideos);
                const fetchedVideos = vidSnap.docs.map(doc => doc.data());

                // 3. Calculate Counts Dynamically
                fetchedPlaylists = fetchedPlaylists.map(playlist => {
                    const realCount = fetchedVideos.filter(v => v.playlist === playlist.title).length;
                    return { ...playlist, count: realCount }; // Override static count
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
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">
                
                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-brand-brown-dark mb-12 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <Image 
                            src="/images/heroes/media-videos-hero.webp" 
                            alt="Background" 
                            fill 
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark to-transparent"></div>

                    <div className="relative z-10 container mx-auto px-6 py-20 text-center">
                        <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-4 py-1.5 rounded-full mb-6 border border-brand-gold/30">
                            <ListVideo className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Curated Series</span>
                        </div>
                        <h1 className="font-agency text-5xl md:text-7xl text-white mb-4">
                            Video Playlists
                        </h1>
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg font-lato">
                            Explore comprehensive collections of lectures, Tafsir, and seminars organized by topic and language.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <div className="container mx-auto px-6 md:px-12">
                        
                        {/* 2. FILTER BAR */}
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                                        activeFilter === filter
                                        ? 'bg-brand-gold text-white shadow-lg scale-105'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* 3. PLAYLIST GRID */}
                        {filteredPlaylists.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPlaylists.map((playlist) => (
                                    <Link 
                                        key={playlist.id} 
                                        href={`/media/videos/playlists/${playlist.id}`}
                                        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="relative aspect-[16/10] bg-gray-200">
                                            <Image 
                                                src={playlist.cover || "/fallback.webp"} 
                                                alt={playlist.title} 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                                                    <PlayCircle className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                {/* Display Dynamic Count Here */}
                                                <ListVideo className="w-3 h-3" /> {playlist.count} Videos
                                            </div>
                                        </div>
                                        <div className="p-6" dir={getDir(playlist.title)}>
                                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest block mb-2" dir="ltr">
                                                {playlist.category}
                                            </span>
                                            <h3 className={`text-xl font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${getDir(playlist.title) === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                {playlist.title}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <ListVideo className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>No playlists found in this category.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
