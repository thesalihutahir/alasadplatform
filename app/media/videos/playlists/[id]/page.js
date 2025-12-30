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
import { Play, Clock, Calendar, ChevronRight, ListVideo, ArrowLeft, ArrowUpRight } from 'lucide-react';

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
        <div className="min-h-screen flex flex-col bg-brand-sand/10 font-lato">
            <Header />

            <main className="flex-grow">
                {/* 1. PLAYLIST HEADER */}
                <div className="bg-white border-b border-gray-200 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-sand/50 to-transparent pointer-events-none"></div>

                    <div className="container mx-auto px-6 py-8 md:py-16 relative z-10">

                        {/* Breadcrumb / Back */}
                        <div className="mb-8">
                            <Link href="/media/videos/playlists" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-gold transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Series
                            </Link>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                            {/* Cover Image */}
                            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                    <Image 
                                        src={playlist.cover || "/fallback.webp"} 
                                        alt={playlist.title} 
                                        fill 
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-grow" dir={dir}>
                                <div className="flex flex-wrap items-center gap-3 mb-4" dir="ltr">
                                    <span className="bg-brand-gold/10 text-brand-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-brand-gold/20">
                                        {playlist.category}
                                    </span>
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        <ListVideo className="w-3 h-3" /> {videos.length} Episodes
                                    </span>
                                </div>

                                <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-brand-brown-dark mb-4 leading-tight drop-shadow-sm ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {playlist.title}
                                </h1>

                                {/* UPDATED: Uses dynamic description or falls back to default text */}
                                <p className={`text-gray-500 text-base md:text-lg max-w-2xl mb-8 leading-relaxed ${getDir(playlist.description || "") === 'rtl' ? 'font-arabic' : 'font-lato'}`} dir={getDir(playlist.description || "")}>
                                    {playlist.description || "Browse all episodes in this series below. Episodes are listed from newest to oldest."}
                                </p>

                                {/* Quick Action - Links to OLDEST Video */}
                                {oldestVideoId && (
                                    <Link 
                                        href={`/media/videos/${oldestVideoId}`} 
                                        className="inline-flex items-center gap-3 bg-brand-gold text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                                        dir="ltr"
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        Start Watching Series
                                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. EPISODE LIST */}
                <div className="container mx-auto px-6 py-12 max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="font-agency text-3xl text-brand-brown-dark flex items-center gap-3">
                            <ListVideo className="w-6 h-6 text-brand-gold" />
                            Episode List
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                            Newest First
                        </span>
                    </div>

                    {videos.length > 0 ? (
                        <div className="space-y-4">
                            {videos.map((video, index) => {
                                // Calculate "Episode Number" assuming chronological order is bottom-up
                                const episodeNumber = videos.length - index; 
                                
                                return (
                                    <Link 
                                        key={video.id} 
                                        href={`/media/videos/${video.id}`}
                                        className="group flex flex-col md:flex-row gap-4 md:gap-6 bg-white p-4 rounded-2xl border border-gray-100 hover:border-brand-gold/50 hover:shadow-lg transition-all items-center relative overflow-hidden"
                                    >
                                        {/* Mobile: Episode Badge */}
                                        <div className="md:hidden absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
                                            Ep {episodeNumber}
                                        </div>

                                        {/* Desktop: Numbering */}
                                        <div className="hidden md:flex flex-col items-center justify-center w-12 h-12 bg-gray-50 text-gray-400 font-agency text-2xl font-bold rounded-xl group-hover:bg-brand-gold group-hover:text-white transition-colors flex-shrink-0">
                                            {episodeNumber}
                                        </div>

                                        {/* Thumbnail */}
                                        <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 shadow-sm">
                                            <Image 
                                                src={video.thumbnail || "/fallback.webp"} 
                                                alt={video.title} 
                                                fill 
                                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                                </div>
                                            </div>
                                            {/* Latest Tag for the very first item */}
                                            {index === 0 && (
                                                <div className="absolute bottom-2 right-2 bg-brand-gold text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                                    Latest
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow min-w-0 w-full" dir={getDir(video.title)}>
                                            <div className="flex justify-between items-start">
                                                <h3 className={`text-lg md:text-xl font-bold text-brand-brown-dark leading-tight mb-2 group-hover:text-brand-gold transition-colors line-clamp-2 ${getDir(video.title) === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                    {video.title}
                                                </h3>
                                                {/* Desktop Arrow */}
                                                <div className="hidden md:block text-gray-300 group-hover:text-brand-gold group-hover:translate-x-1 transition-all pl-4">
                                                    <ChevronRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs text-gray-400 font-bold mt-1" dir="ltr">
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Calendar className="w-3 h-3" /> {formatDate(video.date)}
                                                </span>
                                                <span className="flex items-center gap-1 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Clock className="w-3 h-3" /> Watch Now
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                            <ListVideo className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 font-bold">No videos uploaded to this playlist yet.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
