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
import { Play, Calendar, Share2, ListVideo, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

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
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-20">
                {/* 1. CINEMATIC PLAYER SECTION */}
                <div className="w-full bg-brand-brown-dark py-8 lg:py-12 px-4 lg:px-12">
                    <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Player Column */}
                        <div className="lg:col-span-2">
                            <div className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video relative z-10 border border-white/10">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`} 
                                    title={video.title}
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>

                        {/* Sidebar: Next Video (Desktop) */}
                        <div className="hidden lg:block lg:col-span-1 space-y-6">
                            {nextVideo ? (
                                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                                    <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Play className="w-3 h-3 fill-current" /> Up Next
                                    </p>
                                    <Link href={`/media/videos/${nextVideo.id}`} className="group block">
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-black/50">
                                            <Image 
                                                src={nextVideo.thumbnail || "/fallback.webp"} 
                                                alt={nextVideo.title} 
                                                fill 
                                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-brand-gold transition-colors">
                                            {nextVideo.title}
                                        </h3>
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                                    <p className="text-white/60 text-sm">You're watching the latest in this series.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. INFO & RELATED CONTENT */}
                <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* LEFT: INFO */}
                    <div className="lg:col-span-2">
                        <div dir={dir}>
                            {/* Meta & Share */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6" dir="ltr">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1 bg-brand-sand/30 text-brand-brown-dark text-[10px] font-bold uppercase rounded-full tracking-wider border border-brand-gold/20">
                                        {video.category}
                                    </span>
                                    {video.playlist && (
                                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <ListVideo className="w-3 h-3" /> 
                                            <span className="truncate max-w-[200px]" title={video.playlist}>
                                                {video.playlist}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleShare} 
                                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-gold transition-colors"
                                >
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>

                            <h1 className={`text-2xl md:text-4xl font-bold text-brand-brown-dark mb-4 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                {video.title}
                            </h1>

                            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold mb-8 pb-8 border-b border-gray-100" dir="ltr">
                                <Calendar className="w-4 h-4 text-brand-gold" /> {formatDate(video.date)}
                            </div>

                            <div className={`prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                {video.description}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: RELATED LIST (Mobile Up Next + Related) */}
                    <div className="space-y-8">
                        {/* Mobile Up Next (Visible only on small screens) */}
                        <div className="lg:hidden">
                            {nextVideo && (
                                <div className="bg-brand-brown-dark text-white p-6 rounded-2xl relative overflow-hidden">
                                    <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">Up Next</p>
                                    <Link href={`/media/videos/${nextVideo.id}`} className="flex gap-4 items-center">
                                        <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                                            <Image src={nextVideo.thumbnail || "/fallback.webp"} alt={nextVideo.title} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold leading-tight line-clamp-2">{nextVideo.title}</h4>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Related List - Updated Style */}
                        <div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-6 px-1">
                                {video.playlist ? "More from this Series" : "Related Videos"}
                            </h3>

                            <div className="flex flex-col gap-4">
                                {relatedVideos.length > 0 ? (
                                    relatedVideos.map((rel) => {
                                        const isExpanded = expandedIds.has(rel.id);
                                        return (
                                            <Link 
                                                key={rel.id} 
                                                href={`/media/videos/${rel.id}`}
                                                className="group relative flex items-start gap-4 p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 bg-white"
                                            >
                                                <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 border border-gray-50">
                                                    <Image 
                                                        src={rel.thumbnail || "/fallback.webp"} 
                                                        alt={rel.title} 
                                                        fill 
                                                        className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
                                                            <Play className="w-3 h-3 fill-current ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-grow min-w-0 py-0.5" dir={getDir(rel.title)}>
                                                    <p className="text-[10px] text-gray-400 mb-1" dir="ltr">{formatDate(rel.date)}</p>
                                                    
                                                    <div className="relative pr-6">
                                                        <h4 className={`text-sm font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${getDir(rel.title) === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
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
                                    <p className="text-sm text-gray-400 px-2">No related videos found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}
