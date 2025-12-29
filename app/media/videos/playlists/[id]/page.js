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
import { Play, Clock, Calendar, ChevronRight, ListVideo, ArrowLeft } from 'lucide-react';

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
                    setVideos(fetchedVideos);
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
    
    const getDir = (text) => /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';

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

    return (
        <div className="min-h-screen flex flex-col bg-brand-sand/10 font-lato">
            <Header />

            <main className="flex-grow">
                {/* 1. PLAYLIST HEADER */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-6 py-8 md:py-16">
                        
                        {/* Breadcrumb / Back */}
                        <div className="mb-8">
                            <Link href="/media/videos/playlists" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-brown-dark transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Series
                            </Link>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                            {/* Cover Image */}
                            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
                                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
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
                                <div className="flex items-center gap-2 mb-4" dir="ltr">
                                    <span className="bg-brand-gold/10 text-brand-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {playlist.category}
                                    </span>
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        <ListVideo className="w-3 h-3" /> {videos.length} Episodes
                                    </span>
                                </div>

                                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-brand-brown-dark mb-4 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {playlist.title}
                                </h1>

                                <p className="text-gray-500 text-lg max-w-2xl mb-8" dir="ltr">
                                    Browse all episodes in this series below. Click on any episode to start watching.
                                </p>

                                {/* Quick Action */}
                                {videos.length > 0 && (
                                    <Link 
                                        href={`/media/videos/${videos[0].id}`} // Start with first/latest video
                                        className="inline-flex items-center gap-3 bg-brand-gold text-white px-8 py-3 rounded-full font-bold hover:bg-brand-brown-dark transition-colors shadow-lg group"
                                        dir="ltr"
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        Start Watching
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. EPISODE LIST */}
                <div className="container mx-auto px-6 py-12 max-w-5xl">
                    <h2 className="font-agency text-3xl text-brand-brown-dark mb-8 flex items-center gap-3">
                        <ListVideo className="w-6 h-6 text-brand-gold" />
                        Episode List
                    </h2>

                    {videos.length > 0 ? (
                        <div className="space-y-4">
                            {videos.map((video, index) => (
                                <Link 
                                    key={video.id} 
                                    href={`/media/videos/${video.id}`}
                                    className="group flex flex-col md:flex-row gap-4 md:gap-6 bg-white p-4 rounded-xl border border-gray-100 hover:border-brand-gold/30 hover:shadow-lg transition-all items-center"
                                >
                                    {/* Numbering */}
                                    <div className="hidden md:flex flex-col items-center justify-center w-12 h-12 bg-gray-50 text-gray-400 font-agency text-xl font-bold rounded-lg group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                        {videos.length - index} {/* Reverse numbering */}
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0">
                                        <Image 
                                            src={video.thumbnail || "/fallback.webp"} 
                                            alt={video.title} 
                                            fill 
                                            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow min-w-0 w-full" dir={getDir(video.title)}>
                                        <h3 className={`text-lg md:text-xl font-bold text-brand-brown-dark leading-tight mb-2 group-hover:text-brand-gold transition-colors ${getDir(video.title) === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                            {video.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-bold" dir="ltr">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {formatDate(video.date)}
                                            </span>
                                            <span className="flex items-center gap-1 text-brand-gold">
                                                <Clock className="w-3 h-3" /> Watch Now
                                            </span>
                                        </div>
                                    </div>

                                    {/* Arrow Icon */}
                                    <div className="hidden md:block text-gray-300 group-hover:text-brand-gold group-hover:translate-x-1 transition-all">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-400">No videos uploaded to this playlist yet.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
