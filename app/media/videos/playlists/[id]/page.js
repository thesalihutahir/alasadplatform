"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Play, Calendar, ChevronRight, ListVideo, ArrowLeft, Film } from 'lucide-react';

export default function PlaylistViewPage() {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // 1. Fetch Playlist Info
                const playlistRef = doc(db, "video_playlists", id);
                const playlistSnap = await getDoc(playlistRef);

                if (playlistSnap.exists()) {
                    const plData = playlistSnap.data();
                    setPlaylist({ id: playlistSnap.id, ...plData });

                    // 2. Fetch Videos in this Playlist
                    const q = query(
                        collection(db, "videos"),
                        where("playlist", "==", plData.title),
                        orderBy("createdAt", "desc") 
                    );

                    const videoSnaps = await getDocs(q);
                    const fetchedVideos = videoSnaps.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // 3. Smart Sort: Newest Recorded Date First (Descending)
                    const sortedVideos = fetchedVideos.sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                    });

                    setVideos(sortedVideos);
                }
            } catch (error) {
                console.error("Error fetching playlist data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Helpers
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
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

    if (!playlist) return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center p-10 text-center">
                <ListVideo className="w-16 h-16 text-gray-200 mb-4" />
                <h1 className="text-2xl font-bold text-gray-400">Playlist Not Found</h1>
                <Link href="/media/videos/playlists" className="mt-4 text-brand-gold hover:underline">Browse all playlists</Link>
            </div>
            <Footer />
        </div>
    );

    const dir = getDir(playlist.title);
    
    // Logic for "Start Watching":
    // If videos are sorted Descending (Newest First), the Last item is the Oldest (Episode 1).
    const oldestVideoId = videos.length > 0 ? videos[videos.length - 1].id : null;

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">
                {/* 1. CINEMATIC PLAYLIST HERO */}
                <div className="relative w-full bg-brand-brown-dark pt-12 pb-32 lg:pb-48 px-4 overflow-hidden">
                    {/* Ambient Blurred Cover */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-soft-light">
                        <Image 
                            src={playlist.cover || "/fallback.webp"} 
                            alt="" 
                            fill 
                            className="object-cover blur-[80px] scale-110"
                        />
                    </div>
                    {/* Ambient Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="max-w-[1200px] mx-auto relative z-10">
                        {/* Navigation Row */}
                        <div className="mb-8">
                            <Link href="/media/videos/playlists" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Series
                            </Link>
                        </div>

                        {/* Hero Content (Cover + Info) */}
                        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start" dir={dir}>
                            {/* Playlist Cover */}
                            <div className="w-48 md:w-64 lg:w-72 flex-shrink-0">
                                <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                    <Image 
                                        src={playlist.cover || "/fallback.webp"} 
                                        alt={playlist.title} 
                                        fill 
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                </div>
                            </div>

                            {/* Details Stack */}
                            <div className="flex-grow text-center md:text-left flex flex-col items-center md:items-start">
                                {/* "PLAYLISTS" Loop Label */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <Film className="w-3 h-3" /> Playlists
                                </div>

                                <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-md ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {playlist.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6 text-[10px] font-bold uppercase tracking-wider" dir="ltr">
                                    <span className="bg-brand-gold text-brand-brown-dark px-3 py-1 rounded-full">
                                        {playlist.category}
                                    </span>
                                    <span className="text-white/60 flex items-center gap-1.5">
                                        <ListVideo className="w-3.5 h-3.5" /> {videos.length} Episodes
                                    </span>
                                </div>

                                <p className={`text-white/70 text-sm md:text-base max-w-2xl leading-relaxed mb-8 ${getDir(playlist.description || "") === 'rtl' ? 'font-arabic' : 'font-lato'}`} dir={getDir(playlist.description || "")}>
                                    {playlist.description || "Browse all episodes in this series below. Episodes are listed from newest to oldest."}
                                </p>

                                {/* Action */}
                                {oldestVideoId && (
                                    <Link 
                                        href={`/media/videos/${oldestVideoId}`} 
                                        className="inline-flex items-center gap-3 bg-brand-gold text-brand-brown-dark px-8 py-3.5 rounded-full font-bold hover:bg-white transition-all shadow-lg hover:shadow-brand-gold/20" 
                                        dir="ltr"
                                    >
                                        <Play className="w-4 h-4 fill-current" /> Start Watching
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. OVERLAPPING EPISODE LIST */}
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-20 -mt-20 lg:-mt-32">
                    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 min-h-[400px]">
                        
                        {/* List Header */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                            <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark flex items-center gap-3">
                                <ListVideo className="w-5 h-5 text-brand-gold" /> Episodes
                            </h2>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                                Newest First
                            </span>
                        </div>

                        {/* List Rows */}
                        {videos.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {videos.map((video, index) => {
                                    const episodeNumber = videos.length - index; 
                                    return (
                                        <Link 
                                            key={video.id} 
                                            href={`/media/videos/${video.id}`}
                                            className="group flex flex-row gap-4 bg-white p-3 rounded-2xl border border-gray-100 hover:border-brand-gold/30 hover:shadow-md hover:bg-brand-sand/10 transition-all items-center"
                                        >
                                            {/* Numbering (Desktop) */}
                                            <div className="hidden md:flex flex-col items-center justify-center w-12 h-12 text-gray-300 font-agency text-xl font-bold group-hover:text-brand-gold transition-colors flex-shrink-0">
                                                {episodeNumber}
                                            </div>

                                            {/* Thumbnail (Slim Library Row Style) */}
                                            <div className="relative w-32 md:w-40 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 border border-gray-50 shadow-sm">
                                                <Image 
                                                    src={video.thumbnail || "/fallback.webp"} 
                                                    alt={video.title} 
                                                    fill 
                                                    className="object-cover opacity-90 group-hover:opacity-100 scale-105 group-hover:scale-110 transition-transform duration-700"
                                                />
                                                {/* Mobile Episode Badge inside thumb */}
                                                <div className="md:hidden absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                                    Ep {episodeNumber}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow min-w-0 py-1" dir={getDir(video.title)}>
                                                <h3 className={`text-sm md:text-base font-bold text-brand-brown-dark leading-tight mb-1.5 group-hover:text-brand-gold transition-colors line-clamp-2 ${getDir(video.title) === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                    {video.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider" dir="ltr">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {formatDate(video.date)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Icon (Desktop) */}
                                            <div className="hidden sm:flex flex-shrink-0 self-center pr-2">
                                                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all">
                                                    <ChevronRight className={`w-4 h-4 ${getDir(video.title) === 'rtl' ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-300 border border-gray-100">
                                    <ListVideo className="w-6 h-6" />
                                </div>
                                <h3 className="font-agency text-xl text-gray-500 mb-1">No Episodes Yet</h3>
                                <p className="text-xs text-gray-400">Videos uploaded to this playlist will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
