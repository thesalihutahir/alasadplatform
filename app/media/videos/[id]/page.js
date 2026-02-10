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

    // --- FETCH DATA ---
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

    // --- HELPERS ---
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
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">
                
                {/* 1. BACKGROUND HERO LAYER */}
                <div className="relative w-full h-[450px] lg:h-[550px] bg-brand-brown-dark overflow-hidden">
                    {/* Blurred Ambient Backdrop */}
                    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-soft-light">
                        <Image 
                            src={video.thumbnail || "/fallback.webp"} 
                            alt="" 
                            fill 
                            className="object-cover blur-[100px] scale-110"
                        />
                    </div>
                    
                    {/* Header Content */}
                    <div className="relative z-10 pt-10 md:pt-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            Now Watching
                        </div>
                    </div>
                </div>

                {/* 2. OVERLAPPING CONTENT LAYER */}
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 relative z-20 -mt-[320px] lg:-mt-[400px]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        
                        {/* LEFT COLUMN: PLAYER & INFO (Span 8) */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* THE PLAYER (Hero Overlap) */}
                            <div className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl shadow-brand-brown-dark/50 aspect-video relative ring-1 ring-white/10 group">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`} 
                                    title={video.title}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* VIDEO INFO CARD (Subtle & Clean) */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100" dir={dir}>
                                {/* Meta Row */}
                                <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-bold uppercase tracking-wider" dir="ltr">
                                    <span className="text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">
                                        {video.category}
                                    </span>
                                    {video.playlist && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-500 flex items-center gap-1.5">
                                                <ListVideo className="w-3 h-3" /> {video.playlist}
                                            </span>
                                        </>
                                    )}
                                    <span className="text-gray-300 ml-auto flex items-center gap-2 normal-case font-medium">
                                        <Clock className="w-3.5 h-3.5" /> {formatDate(video.date)}
                                    </span>
                                </div>

                                {/* Minimalist Title */}
                                <h1 className={`text-2xl md:text-3xl font-bold text-brand-brown-dark mb-4 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {video.title}
                                </h1>

                                {/* Description */}
                                <div className={`prose prose-gray max-w-none text-sm md:text-base leading-relaxed text-gray-600 border-t border-gray-50 pt-6 mt-6 ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                    {video.description}
                                </div>

                                {/* Share Action */}
                                <div className="mt-8 pt-4 flex justify-end" dir="ltr">
                                    <button 
                                        onClick={handleShare} 
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-bold text-gray-600 hover:text-white hover:bg-brand-brown-dark hover:border-brand-brown-dark transition-all"
                                    >
                                        <Share2 className="w-3.5 h-3.5" /> Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: SIDEBAR (Span 4) */}
                        <div className="lg:col-span-4 space-y-8">
                            
                            {/* Up Next Card (Floating Glass Effect) */}
                            {nextVideo ? (
                                <div className="bg-brand-brown-dark/95 backdrop-blur-md text-white p-6 rounded-3xl relative overflow-hidden shadow-2xl border border-white/10">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Play className="w-3 h-3 fill-current" /> Up Next
                                        </p>
                                        
                                        <Link href={`/media/videos/${nextVideo.id}`} className="block group">
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black/40 border border-white/5">
                                                <Image 
                                                    src={nextVideo.thumbnail || "/fallback.webp"} 
                                                    alt={nextVideo.title} 
                                                    fill 
                                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-white font-agency text-xl leading-snug line-clamp-2 mb-2 group-hover:text-brand-gold transition-colors">
                                                {nextVideo.title}
                                            </h3>
                                            <p className="text-xs text-white/40 line-clamp-1">From Series: {nextVideo.playlist || video.category}</p>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-brand-brown-dark/90 backdrop-blur border border-white/10 p-8 rounded-3xl text-center flex flex-col items-center justify-center min-h-[200px]">
                                    <Film className="w-8 h-8 text-white/20 mb-3" />
                                    <p className="text-white/60 text-xs">You are watching the latest upload.</p>
                                </div>
                            )}

                            {/* Related Videos List - Unchanged Card Markup */}
                            <div>
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-5 px-1 border-l-4 border-brand-gold pl-3">
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
                                                    className="group relative flex items-start gap-4 p-3 rounded-2xl bg-white border border-gray-100 hover:border-brand-gold/30 hover:bg-brand-sand/10 transition-all duration-300"
                                                >
                                                    {/* Thumbnail (Rectangular, Zoomed) */}
                                                    <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 border border-gray-50 shadow-sm">
                                                        <Image 
                                                            src={rel.thumbnail || "/fallback.webp"} 
                                                            alt={rel.title} 
                                                            fill 
                                                            className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20">
                                                                <Play className="w-3 h-3 fill-current ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-grow min-w-0 py-0.5" dir={getDir(rel.title)}>
                                                        <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider" dir="ltr">{formatDate(rel.date)}</p>
                                                        
                                                        <div className="relative pr-6">
                                                            <h4 className={`text-sm md:text-base font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${getDir(rel.title) === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                                {rel.title}
                                                            </h4>
                                                            <button 
                                                                onClick={(e) => toggleExpand(e, rel.id)}
                                                                className="absolute right-0 top-0 p-1 text-gray-300 hover:text-brand-gold transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-sm text-gray-400">No related videos found.</p>
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