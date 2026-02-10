"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Imported Custom Player
import CustomVideoPlayer from '@/components/CustomVideoPlayer';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Play, Calendar, Share2, ListVideo, ArrowRight, ChevronDown, ChevronUp, Film } from 'lucide-react';

export default function WatchVideoPage() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [nextVideo, setNextVideo] = useState(null); 
    const [loading, setLoading] = useState(true);
    
    const [expandedIds, setExpandedIds] = useState(new Set());

    // --- FETCH DATA (UNCHANGED) ---
    useEffect(() => {
        const fetchVideoData = async () => {
            if (!id) return;
            setLoading(true);

            try {
                const docRef = doc(db, "videos", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const videoData = { id: docSnap.id, ...docSnap.data() };
                    setVideo(videoData);

                    const videosRef = collection(db, "videos");
                    let q;

                    if (videoData.playlist) {
                        q = query(videosRef, where("playlist", "==", videoData.playlist));
                        const snap = await getDocs(q);
                        let playlistVideos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        playlistVideos.sort((a, b) => new Date(a.date) - new Date(b.date));
                        const currentIndex = playlistVideos.findIndex(v => v.id === id);

                        if (currentIndex !== -1 && currentIndex < playlistVideos.length - 1) {
                            setNextVideo(playlistVideos[currentIndex + 1]); 
                        } else {
                            setNextVideo(null); 
                        }
                        setRelatedVideos(playlistVideos.filter(v => v.id !== id).slice(0, 4));
                    } else {
                        q = query(videosRef, where("category", "==", videoData.category), orderBy("createdAt", "desc"), limit(5));
                        const snap = await getDocs(q);
                        const related = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => v.id !== id);
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
            navigator.share({ title: video?.title, url: window.location.href }).catch(console.error);
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

    if (loading) return <div className="min-h-screen flex flex-col bg-white"><Header /><div className="flex-grow flex items-center justify-center"><Loader size="lg" /></div><Footer /></div>;
    if (!video) return <div className="min-h-screen flex flex-col bg-white"><Header /><div className="flex-grow flex flex-col items-center justify-center text-center p-6"><h2 className="text-2xl font-bold text-gray-400">Video Not Found</h2><Link href="/media/videos" className="mt-4 text-brand-gold hover:underline">Return to Library</Link></div><Footer /></div>;

    const dir = getDir(video.title);
return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">
                
                {/* 1. HERO BACKGROUND SECTION */}
                <div className="relative w-full bg-brand-brown-dark pt-12 pb-32 lg:pb-48 px-4 overflow-hidden">
                    {/* UPDATED: Fallback Overlay Image with Low Opacity */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/fallback.webp" // As requested
                            alt=""
                            fill
                            className="object-cover opacity-50 mix-blend-overlay scale-120 saturate-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-brand-brown-dark/80 to-transparent"></div>
                    </div>

                    {/* Ambient Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md mb-6">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Now Watching</span>
                        </div>
                    </div>
                </div>

                {/* 2. OVERLAPPING PLAYER & CONTENT */}
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 relative z-20 -mt-24 lg:-mt-40">
                    
                    {/* A) CUSTOM PLAYER WRAPPER */}
                    <div className="w-full mb-12">
                        <CustomVideoPlayer 
                            videoId={video.videoId} 
                            thumbnail={video.thumbnail} 
                            title={video.title} 
                        />
                    </div>

                    {/* B) INFO & SIDEBAR GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        
                        {/* LEFT: VIDEO INFO */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm" dir={dir}>
                                {/* Control Strip */}
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-6" dir="ltr">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-brand-brown-dark text-white text-[10px] font-bold uppercase rounded-full tracking-wider">
                                            {video.category}
                                        </span>
                                        {video.playlist && (
                                            <div className="hidden sm:flex items-center gap-2 text-brand-brown-dark/60 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-50">
                                                <ListVideo className="w-3 h-3" /> 
                                                <span className="truncate max-w-[200px]" title={video.playlist}>
                                                    {video.playlist}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                            <Calendar className="w-3.5 h-3.5" /> {formatDate(video.date)}
                                        </div>
                                        <div className="h-4 w-px bg-gray-200"></div>
                                        <button 
                                            onClick={handleShare} 
                                            className="flex items-center gap-2 text-brand-gold hover:text-brand-brown-dark transition-colors text-xs font-bold uppercase tracking-wider"
                                        >
                                            <Share2 className="w-3.5 h-3.5" /> Share
                                        </button>
                                    </div>
                                </div>

                                {/* UPDATED: Reduced Title Size (50% smaller from 5xl -> 2xl/3xl) */}
                                <h1 className={`text-xl md:text-3xl font-bold text-brand-brown-dark mb-6 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {video.title}
                                </h1>

                                {/* Description with Playlist Info */}
                                <div className={`prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed whitespace-pre-line ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                    {/* UPDATED: Added Playlist name to meta description area */}
                                    {video.playlist && (
                                        <p className="text-xs font-bold text-brand-gold mb-3 uppercase tracking-wide border-l-2 border-brand-gold pl-3">
                                            Series: {video.playlist}
                                        </p>
                                    )}
                                    {video.description}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: SIDEBAR */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Up Next */}
                            {nextVideo && (
                                <div className="bg-brand-brown-dark text-white p-6 rounded-3xl relative overflow-hidden shadow-xl ring-1 ring-white/10 group">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                        <Play className="w-24 h-24" />
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Film className="w-3 h-3" /> Up Next
                                        </p>
                                        <Link href={`/media/videos/${nextVideo.id}`} className="block group/link">
                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/5 shadow-inner">
                                                <Image 
                                                    src={nextVideo.thumbnail || "/fallback.webp"} 
                                                    alt={nextVideo.title} 
                                                    fill 
                                                    className="object-cover opacity-80 group-hover/link:opacity-100 transition-opacity duration-500"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover/link:bg-brand-gold group-hover/link:border-brand-gold group-hover/link:scale-110 transition-all duration-300 shadow-xl">
                                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="text-white font-agency text-xl leading-snug line-clamp-2 mb-2 group-hover/link:text-brand-gold transition-colors">
                                                {nextVideo.title}
                                            </h3>
                                            <p className="text-xs text-white/40 line-clamp-1">From Series: {nextVideo.playlist || video.category}</p>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Related Videos */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-6 px-1 flex items-center gap-2">
                                    {video.playlist ? "Series Content" : "Related Videos"}
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {relatedVideos.length > 0 ? (
                                        relatedVideos.map((rel) => {
                                            const isExpanded = expandedIds.has(rel.id);
                                            return (
                                                <Link 
                                                    key={rel.id} 
                                                    href={`/media/videos/${rel.id}`}
                                                    className="group relative flex items-start gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                                                >
                                                    <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 border border-gray-100 shadow-sm">
                                                        <Image 
                                                            src={rel.thumbnail || "/fallback.webp"} 
                                                            alt={rel.title} 
                                                            fill 
                                                            className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-6 h-6 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20">
                                                                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow min-w-0 py-0.5" dir={getDir(rel.title)}>
                                                        <div className="relative pr-6">
                                                            <h4 className={`text-sm font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${getDir(rel.title) === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                                {rel.title}
                                                            </h4>
                                                            <button 
                                                                onClick={(e) => toggleExpand(e, rel.id)}
                                                                className="absolute right-0 top-0 p-0.5 text-gray-300 hover:text-brand-gold transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider" dir="ltr">{formatDate(rel.date)}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-gray-400 text-xs py-4">No related videos found.</div>
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