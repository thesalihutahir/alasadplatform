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
                
                {/* 1. AMBIENT CINEMA HERO */}
                <div className="relative w-full bg-[#050505] overflow-hidden pt-8 pb-12 lg:py-16">
                    {/* Ambient Background (Blurred Thumbnail Loop) */}
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                        <Image 
                            src={video.thumbnail || "/fallback.webp"} 
                            alt="" 
                            fill 
                            className="object-cover blur-[100px] scale-110 saturate-150"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>

                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                        {/* Glassmorphic Player Container */}
                        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 md:p-4 shadow-2xl">
                            <div className="w-full bg-black rounded-[1.5rem] overflow-hidden aspect-video relative shadow-inner ring-1 ring-white/5">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`} 
                                    title={video.title}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CONTENT GRID */}
                <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        
                        {/* LEFT: INFO CARD (Subtle & Clean) */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm" dir={dir}>
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
                                        <Calendar className="w-3.5 h-3.5" /> {formatDate(video.date)}
                                    </span>
                                </div>

                                {/* Minimalist Title */}
                                <h1 className={`text-3xl font-bold text-brand-brown-dark mb-6 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {video.title}
                                </h1>

                                {/* Description */}
                                <div className={`prose prose-gray max-w-none text-sm md:text-base leading-relaxed text-gray-600 border-t border-gray-50 pt-6 ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                    {video.description}
                                </div>

                                {/* Share Action */}
                                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end" dir="ltr">
                                    <button 
                                        onClick={handleShare} 
                                        className="text-xs font-bold text-gray-400 hover:text-brand-gold flex items-center gap-2 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" /> Share This Video
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: SIDEBAR (Up Next & Related) */}
                        <div className="lg:col-span-4 space-y-8">
                            
                            {/* Up Next Card */}
                            {nextVideo && (
                                <div className="bg-brand-brown-dark text-white p-6 rounded-3xl relative overflow-hidden shadow-xl">
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <Play className="w-20 h-20" />
                                    </div>
                                    <p className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-4">Up Next</p>
                                    
                                    <Link href={`/media/videos/${nextVideo.id}`} className="group block relative z-10">
                                        <div className="flex gap-4 items-start">
                                            <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black/30 flex-shrink-0 border border-white/10">
                                                <Image src={nextVideo.thumbnail || "/fallback.webp"} alt={nextVideo.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div>
                                                <h4 className="font-agency text-lg leading-tight line-clamp-2 group-hover:text-brand-gold transition-colors">{nextVideo.title}</h4>
                                                <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-white/50 group-hover:text-white transition-colors">
                                                    Play Now <ArrowRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* Related Videos List */}
                            <div>
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-5 px-1">
                                    {video.playlist ? "Series Content" : "Related"}
                                </h3>

                                <div className="flex flex-col gap-3">
                                    {relatedVideos.length > 0 ? (
                                        relatedVideos.map((rel) => {
                                            const isExpanded = expandedIds.has(rel.id);
                                            return (
                                                <Link 
                                                    key={rel.id} 
                                                    href={`/media/videos/${rel.id}`}
                                                    className="group relative flex items-start gap-3 p-2 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300"
                                                >
                                                    {/* Consistent Thumbnail Style */}
                                                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 border border-gray-100">
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
                                        <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl">
                                            <p className="text-xs text-gray-400">No related videos found.</p>
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