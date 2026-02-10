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
import { Play, Calendar, Share2, ListVideo, ArrowRight, ChevronDown, ChevronUp, Film } from 'lucide-react';

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

            <main className="flex-grow">
                
                {/* 1. CINEMATIC PLAYER HERO */}
                <div className="relative w-full bg-[#0A0A0A] overflow-hidden">
                    {/* Ambient Glow Effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-brand-brown-dark/20 blur-[150px] rounded-full pointer-events-none opacity-50"></div>
                    
                    <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12 py-8 lg:py-12 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Main Player (Span 8) */}
                            <div className="lg:col-span-8 xl:col-span-9">
                                <div className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative z-10 border border-white/10 ring-1 ring-white/5 group">
                                    <iframe 
                                        src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`} 
                                        title={video.title}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>

                            {/* Desktop Sidebar: Up Next (Span 4) - Styled as Glass Card */}
                            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6 h-full">
                                <div className="h-full bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col">
                                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                                        <p className="text-xs font-bold text-brand-gold uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Play className="w-3 h-3 fill-current" /> Up Next
                                        </p>
                                    </div>

                                    {nextVideo ? (
                                        <Link href={`/media/videos/${nextVideo.id}`} className="group block flex-grow">
                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 bg-black/50 border border-white/10 shadow-lg">
                                                <Image 
                                                    src={nextVideo.thumbnail || "/fallback.webp"} 
                                                    alt={nextVideo.title} 
                                                    fill 
                                                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-brand-gold group-hover:border-brand-gold transition-all duration-300 shadow-xl">
                                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-white font-agency text-2xl lg:text-3xl leading-none mb-3 group-hover:text-brand-gold transition-colors">
                                                {nextVideo.title}
                                            </h3>
                                            
                                            {/* Mini Meta for Next Video */}
                                            <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-white/40">
                                                <span>{formatDate(nextVideo.date)}</span>
                                                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                                <span>{nextVideo.category}</span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex-grow flex flex-col items-center justify-center text-center opacity-50">
                                            <Film className="w-8 h-8 text-white mb-3" />
                                            <p className="text-white text-xs max-w-[150px]">You are watching the latest upload.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. INFO & LIST SECTION */}
                <div className="max-w-[1800px] mx-auto w-full px-4 md:px-8 lg:px-12 py-12 lg:py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        
                        {/* LEFT: INFO BLOCK (Span 8) */}
                        <div className="lg:col-span-8 xl:col-span-9">
                            <div dir={dir}>
                                {/* Meta Strip */}
                                <div className="flex flex-wrap items-center gap-4 mb-6" dir="ltr">
                                    <span className="px-3 py-1 bg-brand-brown-dark text-white text-[10px] font-bold uppercase rounded-full tracking-wider">
                                        {video.category}
                                    </span>
                                    {video.playlist && (
                                        <div className="flex items-center gap-2 text-brand-gold text-[10px] font-bold uppercase tracking-wider border border-brand-gold/20 px-3 py-1 rounded-full">
                                            <ListVideo className="w-3 h-3" /> 
                                            <span className="truncate max-w-[200px]" title={video.playlist}>
                                                {video.playlist}
                                            </span>
                                        </div>
                                    )}
                                    <div className="w-px h-4 bg-gray-200 hidden sm:block"></div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <Calendar className="w-3 h-3" /> {formatDate(video.date)}
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-brand-brown-dark mb-8 leading-[1.1] ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {video.title}
                                </h1>

                                {/* Actions & Description */}
                                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row gap-10 items-start">
                                    <div className="flex-grow">
                                        <div className={`prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line max-w-none ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                            {video.description}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 sticky top-24" dir="ltr">
                                        <button 
                                            onClick={handleShare} 
                                            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white border border-gray-200 text-sm font-bold text-brand-brown-dark hover:bg-brand-brown-dark hover:text-white hover:border-brand-brown-dark transition-all shadow-sm hover:shadow-lg"
                                        >
                                            <Share2 className="w-4 h-4" /> Share Video
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: RELATED LIST (Span 4) */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-10">
                            
                            {/* Mobile Up Next (Visible only on small screens) */}
                            <div className="lg:hidden">
                                {nextVideo && (
                                    <div className="bg-brand-brown-dark text-white p-5 rounded-2xl relative overflow-hidden shadow-lg">
                                        <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Play className="w-3 h-3 fill-current" /> Up Next
                                        </p>
                                        <Link href={`/media/videos/${nextVideo.id}`} className="flex gap-4 items-center group">
                                            <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0 border border-white/10">
                                                <Image src={nextVideo.thumbnail || "/fallback.webp"} alt={nextVideo.title} fill className="object-cover opacity-90 group-hover:opacity-100" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-agency text-xl leading-none line-clamp-2 mb-1 group-hover:text-brand-gold transition-colors">{nextVideo.title}</h4>
                                                <span className="text-[10px] text-white/50">Tap to watch</span>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Related List - Clean Section */}
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                                    <h3 className="font-agency text-2xl text-brand-brown-dark">
                                        {video.playlist ? "More from Series" : "Related Videos"}
                                    </h3>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {relatedVideos.length > 0 ? (
                                        relatedVideos.map((rel) => {
                                            const isExpanded = expandedIds.has(rel.id);
                                            return (
                                                <Link 
                                                    key={rel.id} 
                                                    href={`/media/videos/${rel.id}`}
                                                    className="group relative flex items-start gap-4 p-3 rounded-2xl border border-gray-100 bg-white hover:border-brand-gold/30 hover:shadow-md transition-all duration-300"
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