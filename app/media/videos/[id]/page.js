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
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Play, Calendar, Share2, ListVideo, ArrowRight, ChevronDown, ChevronUp, Film, Clock } from 'lucide-react';

export default function WatchVideoPage() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [nextVideo, setNextVideo] = useState(null); 
    const [loading, setLoading] = useState(true);
    
    // Expand state for detail page related cards
    const [expandedIds, setExpandedIds] = useState(new Set());

    // --- FETCH DATA (UNCHANGED) ---
    useEffect(() => {
        const fetchVideoData = async () => {
            if (!id) return;
            setLoading(true);

            try {
                // 1. Fetch Main Video
                const docRef = doc(db, "videos", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const videoData = { id: docSnap.id, ...docSnap.data() };
                    setVideo(videoData);

                    // 2. Determine "Next" or "Related" Logic
                    const videosRef = collection(db, "videos");
                    let q;

                    if (videoData.playlist) {
                        q = query(
                            videosRef, 
                            where("playlist", "==", videoData.playlist)
                        );

                        const snap = await getDocs(q);
                        let playlistVideos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                        // Sort Chronologically
                        playlistVideos.sort((a, b) => new Date(a.date) - new Date(b.date));

                        // Find current index
                        const currentIndex = playlistVideos.findIndex(v => v.id === id);

                        // Determine Next Video
                        if (currentIndex !== -1 && currentIndex < playlistVideos.length - 1) {
                            setNextVideo(playlistVideos[currentIndex + 1]); 
                        } else {
                            setNextVideo(null); 
                        }

                        setRelatedVideos(playlistVideos.filter(v => v.id !== id).slice(0, 4));

                    } else {
                        q = query(
                            videosRef, 
                            where("category", "==", videoData.category), 
                            orderBy("createdAt", "desc"), 
                            limit(5)
                        );

                        const snap = await getDocs(q);
                        const related = snap.docs
                            .map(d => ({ id: d.id, ...d.data() }))
                            .filter(v => v.id !== id);

                        setRelatedVideos(related);
                    }
                }
            } catch (error) {
                console.error("Error fetching video:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideoData();
    }, [id]);

    // --- HELPERS (UNCHANGED) ---
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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: video?.title,
                url: window.location.href
            }).catch(console.error);
        } else {
            alert("Share URL copied to clipboard!");
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const toggleExpand = (e, id) => {
        e.preventDefault(); 
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <div className="flex-grow flex items-center justify-center">
                <Loader size="lg" />
            </div>
            <Footer />
        </div>
    );

    if (!video) return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <h2 className="text-2xl font-bold text-gray-400">Video Not Found</h2>
                <Link href="/media/videos" className="mt-4 text-brand-gold hover:underline">Return to Library</Link>
            </div>
            <Footer />
        </div>
    );

    const dir = getDir(video.title);

    return (
        <div className="min-h-screen flex flex-col bg-[#0f0e0d] font-lato text-white">
            <Header />

            <main className="flex-grow pt-6 pb-20">
                
                {/* AMBIENT BACKGROUND & LAYOUT */}
                <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 relative">
                    
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/70 rounded-full blur-[150px] pointer-events-none -z-10"></div>
                    <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-brand-brown-dark/70 rounded-full blur-[100px] pointer-events-none -z-10"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* --- LEFT COLUMN: PLAYER & INFO (Span 8) --- */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* Player Container */}
                            <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/30 group">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`} 
                                    title={video.title}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Video Info Card - Floating Glass Style */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8" dir={dir}>
                                {/* Header Row */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6" dir="ltr">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-3 py-1 bg-brand-gold text-brand-brown-dark text-[10px] font-bold uppercase rounded-full tracking-wider shadow-lg shadow-brand-gold/20">
                                            {video.category}
                                        </span>
                                        {video.playlist && (
                                            <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                                                <ListVideo className="w-3 h-3" /> 
                                                <span className="truncate max-w-[200px]" title={video.playlist}>
                                                    {video.playlist}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-white/40 text-xs font-bold">
                                            <Calendar className="w-3.5 h-3.5" /> {formatDate(video.date)}
                                        </div>
                                        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                                        <button 
                                            onClick={handleShare} 
                                            className="flex items-center gap-2 text-brand-gold hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                                        >
                                            <Share2 className="w-4 h-4" /> Share
                                        </button>
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className={`text-2xl md:text-4xl font-bold text-white mb-6 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {video.title}
                                </h1>

                                {/* Description */}
                                <div className={`prose prose-invert prose-sm md:prose-base max-w-none text-white/70 leading-relaxed whitespace-pre-line border-t border-white/5 pt-6 ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                    {video.description}
                                </div>
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN: SIDEBAR (Span 4) --- */}
                        <div className="lg:col-span-4 space-y-6">
                            
                            {/* Up Next - Futuristic Card */}
                            {nextVideo && (
                                <div className="bg-gradient-to-br from-brand-brown-dark to-black border border-white/10 p-1 rounded-3xl shadow-2xl relative overflow-hidden group">
                                    {/* Animated Glow Border Effect */}
                                    <div className="absolute inset-0 bg-brand-gold/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    
                                    <div className="bg-[#1a1816] rounded-[1.3rem] p-5 relative z-10 h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Up Next</p>
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></div>
                                        </div>
                                        
                                        <Link href={`/media/videos/${nextVideo.id}`} className="block group/link">
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black border border-white/5">
                                                <Image 
                                                    src={nextVideo.thumbnail || "/fallback.webp"} 
                                                    alt={nextVideo.title} 
                                                    fill 
                                                    className="object-cover opacity-80 group-hover/link:opacity-100 transition-opacity duration-500"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-10 h-10 bg-brand-gold/20 backdrop-blur-md rounded-full flex items-center justify-center text-brand-gold border border-brand-gold/50 group-hover/link:scale-110 transition-transform">
                                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" /> 5:20
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-white font-agency text-xl leading-snug line-clamp-2 mb-2 group-hover/link:text-brand-gold transition-colors">
                                                {nextVideo.title}
                                            </h3>
                                            <p className="text-xs text-white/40 line-clamp-1">{nextVideo.category}</p>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Related Videos List - Matching Slim Card Style */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-5 px-1">
                                    <h3 className="font-agency text-lg text-white">
                                        {video.playlist ? "More From This Series" : "Related Videos"}
                                    </h3>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {relatedVideos.length > 0 ? (
                                        relatedVideos.map((rel) => {
                                            const isExpanded = expandedIds.has(rel.id);
                                            return (
                                                <Link 
                                                    key={rel.id} 
                                                    href={`/media/videos/${rel.id}`}
                                                    className="group relative flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
                                                >
                                                    {/* Thumbnail (Rectangular, Zoomed) */}
                                                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10 shadow-sm">
                                                        <Image 
                                                            src={rel.thumbnail || "/fallback.webp"} 
                                                            alt={rel.title} 
                                                            fill 
                                                            className="object-cover opacity-80 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-6 h-6 bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white">
                                                                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-grow min-w-0 py-0.5" dir={getDir(rel.title)}>
                                                        <div className="relative pr-6">
                                                            <h4 className={`text-sm font-bold text-white/90 leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${getDir(rel.title) === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                                {rel.title}
                                                            </h4>
                                                            <button 
                                                                onClick={(e) => toggleExpand(e, rel.id)}
                                                                className="absolute right-0 top-0 p-0.5 text-white/30 hover:text-brand-gold transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider" dir="ltr">{formatDate(rel.date)}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="p-6 text-center text-white/30 text-sm">
                                            No related videos found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}