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
import { Play, Calendar, ListVideo, ArrowLeft, Film, ChevronDown, ChevronUp, ArrowUpRight, ArrowUpDown, Share2, Search, X } from 'lucide-react';

export default function PlaylistViewPage() {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [visibleCount, setVisibleCount] = useState(10);
    const [expandedIds, setExpandedIds] = useState(new Set());

    // MICRO FEEDBACK STATE
    const [sortBump, setSortBump] = useState(false);

    const handleSortToggle = () => {
        setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
        setSortBump(true);
        setTimeout(() => setSortBump(false), 220);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const playlistRef = doc(db, "video_playlists", id);
                const playlistSnap = await getDoc(playlistRef);

                if (playlistSnap.exists()) {
                    const plData = playlistSnap.data();
                    setPlaylist({ id: playlistSnap.id, ...plData });

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

    const handleShare = async () => {
        try {
            if (typeof window === 'undefined') return;
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({
                    title: playlist?.title || 'Playlist',
                    url
                });
            } else {
                await navigator.clipboard.writeText(url);
            }
        } catch (e) {
            console.error("Share failed:", e);
        }
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

    if (!playlist) return null;

    const dir = getDir(playlist.title);

    const filteredVideos = videos.filter(v =>
        v.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedVideos = [...filteredVideos].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const visibleVideos = sortedVideos.slice(0, visibleCount);
return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">

                <div className="max-w-[1400px] mx-auto px-4 md:px-8">

                    {/* Search + Sort Row */}
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">

                        <div className="relative flex-grow">
                            <Search className="absolute w-4 h-4 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search episodes..."
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleSortToggle}
                            className={`flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border shadow-sm transition-all ${
                                sortOrder === 'desc'
                                    ? 'bg-brand-brown-dark text-white border-brand-brown-dark'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-brand-brown-dark hover:text-brand-brown-dark'
                            }`}
                        >
                            <ArrowUpDown className={`w-4 h-4 transition-transform duration-200 ${sortBump ? 'scale-125' : 'scale-100'}`} />
                            <span className="hidden sm:inline">
                                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                            </span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-brand-gold/50 transition-all shadow-sm"
                        >
                            <Share2 className="w-4 h-4 text-brand-brown-dark" />
                        </button>

                    </div>

                    {/* Episodes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visibleVideos.map((video) => {
                            const isExpanded = expandedIds.has(video.id);
                            return (
                                <Link
                                    key={video.id}
                                    href={`/media/videos/${video.id}`}
                                    className="group flex items-start gap-4 p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-brand-gold/20 transition-all bg-white"
                                >
                                    <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-black">
                                        <Image
                                            src={video.thumbnail || "/fallback.webp"}
                                            alt={video.title}
                                            fill
                                            className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                                        />
                                    </div>

                                    <div className="flex-grow min-w-0" dir={getDir(video.title)}>
                                        <h4 className={`text-sm font-bold ${isExpanded ? '' : 'line-clamp-2'}`}>
                                            {video.title}
                                        </h4>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}