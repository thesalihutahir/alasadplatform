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
import { Play, Calendar, Share2, ListVideo, ArrowRight } from 'lucide-react';

export default function WatchVideoPage() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [nextVideo, setNextVideo] = useState(null); 
    const [loading, setLoading] = useState(true);

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
                        // A. If Playlist: Fetch ALL videos in SAME playlist
                        q = query(
                            videosRef, 
                            where("playlist", "==", videoData.playlist)
                        );
                        
                        const snap = await getDocs(q);
                        let playlistVideos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

                        // SORT CHRONOLOGICALLY (Oldest First = Episode 1, 2, 3...)
                        // This ensures "Next" logic flows naturally: Ep 1 -> Ep 2
                        playlistVideos.sort((a, b) => new Date(a.date) - new Date(b.date));

                        // Find current index
                        const currentIndex = playlistVideos.findIndex(v => v.id === id);
                        
                        // Determine Next Video
                        if (currentIndex !== -1 && currentIndex < playlistVideos.length - 1) {
                            setNextVideo(playlistVideos[currentIndex + 1]); 
                        } else {
                            // If it's the last episode, maybe suggest the first one or nothing
                            setNextVideo(null); 
                        }

                        // Filter out current video for "Related" list (Show next few episodes)
                        // Ideally, show videos AFTER the current one, or just others in the series
                        setRelatedVideos(playlistVideos.filter(v => v.id !== id).slice(0, 4));

                    } else {
                        // B. No Playlist: Fetch videos of SAME Category
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
        <div className="min-h-screen flex flex-col bg-brand-sand/10 font-lato">
            <Header />

            <main className="flex-grow pt-4 pb-16 px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto w-full">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: MAIN PLAYER */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Player Container */}
                        <div className="w-full bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative z-10">
                            <iframe 
                                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`} 
                                title={video.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* Video Info */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100" dir={dir}>
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4" dir="ltr">
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase rounded-full tracking-wide">
                                        {video.category}
                                    </span>
                                    {video.playlist && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-full tracking-wide flex items-center gap-1">
                                            <ListVideo className="w-3 h-3" /> {video.playlist}
                                        </span>
                                    )}
                                </div>
                                <button onClick={handleShare} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-brown-dark transition-colors">
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>

                            <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold text-brand-brown-dark mb-3 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                {video.title}
                            </h1>

                            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold mb-6" dir="ltr">
                                <Calendar className="w-4 h-4" /> {formatDate(video.date)}
                            </div>

                            <div className={`prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                {video.description}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <div className="space-y-6">
                        
                        {/* NEXT VIDEO CARD (Only if playlist exists) */}
                        {nextVideo && (
                            <div className="bg-brand-brown-dark text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <ListVideo className="w-24 h-24" />
                                </div>
                                <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3">Up Next in Series</p>
                                
                                <Link href={`/media/videos/${nextVideo.id}`} className="block relative z-10">
                                    <h3 className="font-agency text-xl mb-2 line-clamp-2 leading-tight group-hover:text-brand-gold transition-colors">
                                        {nextVideo.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-300 group-hover:underline">
                                        Watch Next <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* RELATED LIST */}
                        <div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-4 px-2">
                                {video.playlist ? "More from this Series" : "Related Videos"}
                            </h3>
                            
                            <div className="flex flex-col gap-4">
                                {relatedVideos.length > 0 ? (
                                    relatedVideos.map((rel) => (
                                        <Link 
                                            key={rel.id} 
                                            href={`/media/videos/${rel.id}`}
                                            className="group flex gap-4 bg-white p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all items-center"
                                        >
                                            <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0">
                                                <Image 
                                                    src={rel.thumbnail || "/fallback.webp"} 
                                                    alt={rel.title} 
                                                    fill 
                                                    className="object-cover opacity-90 group-hover:opacity-100"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-white opacity-80 group-hover:scale-110 transition-transform" />
                                                </div>
                                            </div>
                                            <div className="flex-grow min-w-0" dir={getDir(rel.title)}>
                                                <h4 className={`text-sm font-bold text-brand-brown-dark leading-tight line-clamp-2 group-hover:text-brand-gold transition-colors ${getDir(rel.title) === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                    {rel.title}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 mt-1" dir="ltr">
                                                    {formatDate(rel.date)}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
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
