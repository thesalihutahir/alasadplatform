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
import { Play, Calendar, ListVideo, ArrowLeft, Film, ChevronDown, ChevronUp, ArrowUpRight, ArrowUpDown } from 'lucide-react';

export default function PlaylistViewPage() {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Sort Order State ('desc' = Newest Date Recorded First)
    const [sortOrder, setSortOrder] = useState('desc');
    const [visibleCount, setVisibleCount] = useState(10); // Added for Load More functionality

    // Expand state for detail page related cards
    const [expandedIds, setExpandedIds] = useState(new Set());

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

                    // We initially fetch and set, sorting will be handled by derived state
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
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    const toggleExpand = (e, videoId) => {
        e.preventDefault(); 
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(videoId)) next.delete(videoId);
            else next.add(videoId);
            return next;
        });
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
    
    // Sort logic derived from state
    const sortedVideos = [...videos].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const visibleVideos = sortedVideos.slice(0, visibleCount);

    // Logic for "Start Watching":
    // The "Start Watching" should ideally be the oldest video (first episode chronologically)
    const oldestVideoSorted = [...videos].sort((a, b) => new Date(a.date) - new Date(b.date));
    const oldestVideoId = oldestVideoSorted.length > 0 ? oldestVideoSorted[0].id : null;

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">
                
                {/* 1. GLASSMORPHIC HEADER */}
                <div className="relative w-full pt-10 pb-32 lg:pt-16 lg:pb-48 overflow-hidden bg-brand-brown-dark">
                    {/* Ambient Blurred Background */}
                    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-soft-light opacity-50">
                        <Image 
                            src={playlist.cover || "/fallback.webp"} 
                            alt="" 
                            fill 
                            className="object-cover blur-[80px] scale-120"
                        />
                    </div>
                    {/* Subtle Overlay Picture */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <Image
                            src={playlist.cover || "/fallback.webp"}
                            alt=""
                            fill
                            className="object-cover opacity-20 mix-blend-overlay scale-115 saturate-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-brand-brown-dark/50 to-transparent"></div>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>

                    <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 relative z-10">
                        {/* Navigation Row */}
                        <div className="mb-8">
                            <Link href="/media/videos/playlists" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Series
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Overlapping Playlist Info Card */}
                <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 relative z-20 -mt-24 lg:-mt-36 mb-12">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-10 lg:p-12 relative overflow-hidden lg:overflow-visible" dir={dir}>
                        
                        {/* Card Background Decoration (Contained within border radius) */}
                        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none z-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sand/30 rounded-full blur-[80px]"></div>
                        </div>

                        <div className="flex flex-col gap-8 lg:gap-10 items-center relative z-10">
                            
                            {/* Playlist Cover (Landscape, Overlapping upwards) */}
                            {/* UPDATED: Removed lg:-mt-24 to keep the mobile -mt-24 overlap */}
                            <div className="w-full sm:w-[400px] lg:w-[600px] flex-shrink-0 -mt-20 lg:-mt-32">
                                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white border border-gray-100 bg-gray-50">
                                    <Image 
                                        src={playlist.cover || "/fallback.webp"} 
                                        alt={playlist.title} 
                                        fill 
                                        className="object-cover object-center"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Details Stack */}
                            <div className="flex-grow flex flex-col items-center text-center pt-2 w-full max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <Film className="w-3 h-3" /> Playlist
                                </div>

                                <h1 className={`text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-brand-brown-dark mb-4 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {playlist.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-[10px] font-bold uppercase tracking-wider" dir="ltr">
                                    <span className="bg-brand-brown-dark text-white px-3 py-1 rounded-md">
                                        {playlist.category}
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                                        <ListVideo className="w-3 h-3" /> {videos.length} Episodes
                                    </span>
                                </div>

                                {/* UPDATED: Adjusted mobile text alignment (lg:text-center forces desktop to center) */}
                                <p className={`text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed mb-8 w-full lg:text-center ${getDir(playlist.description || "") === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`} dir={getDir(playlist.description || "")}>
                                    {playlist.description || "Browse all episodes in this series below. Episodes are listed from newest to oldest."}
                                </p>

                                {/* Action */}
                                {oldestVideoId && (
                                    <Link 
                                        href={`/media/videos/${oldestVideoId}`} 
                                        className="inline-flex items-center gap-3 bg-brand-gold text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group" 
                                        dir="ltr"
                                    >
                                        <Play className="w-4 h-4 fill-current" /> Start Watching Series
                                        <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. EPISODE LIST (Matching Videos Library Style) */}
                <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 md:px-8">
                    
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                        <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark flex items-center gap-3">
                            <ListVideo className="w-6 h-6 text-brand-gold" /> Episodes
                        </h2>
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border shadow-sm transition-all ${
                                sortOrder === 'desc' 
                                ? 'bg-brand-brown-dark text-white border-brand-brown-dark' 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-brand-brown-dark hover:text-brand-brown-dark'
                            }`}
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                        </button>
                    </div>

                    {visibleVideos.length > 0 ? (
                        <div className="flex flex-col gap-4 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
                                {visibleVideos.map((video) => {
                                    const isExpanded = expandedIds.has(video.id);
                                    return (
                                        <Link 
                                            key={video.id} 
                                            href={`/media/videos/${video.id}`} 
                                            className="group relative flex items-start gap-4 p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 bg-white"
                                        >
                                            {/* Thumbnail (Rectangular 16:9, Zoomed) */}
                                            <div className="relative w-32 md:w-40 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 border border-gray-50">
                                                <Image
                                                    src={video.thumbnail || "/fallback.webp"}
                                                    alt={video.title}
                                                    fill
                                                    className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700" 
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
                                            <div className="flex-grow min-w-0 py-0.5" dir={getDir(video.title)}>
                                                <div className="flex flex-wrap items-center gap-2 mb-1" dir="ltr">
                                                    <span className="text-[9px] font-bold text-brand-gold border border-brand-gold/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                        {video.category}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {formatDate(video.date)}
                                                    </span>
                                                </div>

                                                <div className="relative pr-6">
                                                    <h4 className={`text-sm md:text-base lg:text-lg font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${getDir(video.title) === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                        {video.title}
                                                    </h4>

                                                    {/* Expand Button */}
                                                    <button 
                                                        onClick={(e) => toggleExpand(e, video.id)}
                                                        className="absolute right-0 top-0 p-1 text-gray-300 hover:text-brand-gold transition-colors"
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-300">
                                <ListVideo className="w-8 h-8" />
                            </div>
                            <h3 className="font-agency text-xl text-gray-500 mb-1">No Episodes Yet</h3>
                            <p className="text-sm text-gray-400">Videos uploaded to this playlist will appear here.</p>
                        </div>
                    )}

                    {/* Footer Status & Load More */}
                    {sortedVideos.length > 0 && (
                        <div className="py-10 text-center space-y-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Showing {visibleVideos.length} of {sortedVideos.length} Episodes
                            </p>
                            {visibleCount < sortedVideos.length && (
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 10)}
                                    className="px-8 py-2.5 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-xs hover:border-brand-brown-dark transition-all uppercase tracking-wider shadow-sm"
                                >
                                    Load More Videos
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </main>

            <Footer />
        </div>
    );
}
