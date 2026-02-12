"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { ListVideo, Layers, Search, X, ArrowRight, ChevronDown, ChevronUp, ArrowUpDown, PlayCircle } from 'lucide-react';

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [expandedIds, setExpandedIds] = useState(new Set());
    const [visibleCount, setVisibleCount] = useState(15);

    const [sortOrder, setSortOrder] = useState('desc');

    const filters = ['All', 'English', 'Hausa', 'Arabic'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const qPlaylists = query(collection(db, 'video_playlists'), orderBy('createdAt', 'desc'));
                const plSnap = await getDocs(qPlaylists);
                let fetchedPlaylists = plSnap.docs.map((docItem) => ({
                    id: docItem.id,
                    ...docItem.data()
                }));

                const qVideos = query(collection(db, 'videos'));
                const vidSnap = await getDocs(qVideos);
                const fetchedVideos = vidSnap.docs.map((docItem) => docItem.data());

                fetchedPlaylists = fetchedPlaylists.map((playlist) => {
                    const realCount = fetchedVideos.filter((video) => video.playlist === playlist.title).length;
                    return { ...playlist, count: realCount };
                });

                setPlaylists(fetchedPlaylists);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getDir = (text) => /[\u0600-\u06FF]/.test(text || '') ? 'rtl' : 'ltr';

    const toggleExpand = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredPlaylists = playlists.filter((playlist) => {
        const matchesCategory = activeFilter === 'All' || playlist.category === activeFilter;
        const matchesSearch = (playlist.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedPlaylists = sortOrder === 'desc' ? filteredPlaylists : [...filteredPlaylists].reverse();
    const visiblePlaylists = sortedPlaylists.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            <Header />

            <main className="flex-grow pb-24">
                <section className="relative h-[220px] w-full overflow-hidden bg-brand-brown-dark mb-12">
                    <Image
                        src="/images/heroes/media-videos-hero.webp"
                        alt="Video Playlists"
                        fill
                        className="object-cover object-center opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Layers className="w-3 h-3" /> Playlists
                        </div>
                        <h1 className="font-agency text-4xl md:text-5xl text-white mb-2 leading-none">Series & Collections</h1>
                        <p className="font-lato text-white/60 text-sm md:text-base max-w-xl">Curated lectures, Tafsir, and seminars organized by topic.</p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
                        <section className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-12">
                            <div className="w-full lg:w-[280px] lg:sticky lg:top-24 flex-shrink-0 space-y-8">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Search</h3>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-gold transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Find a collection..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-sm"
                                        />
                                        {searchTerm && (
                                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Filter By</h3>
                                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                                        {filters.map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => {
                                                    setActiveFilter(filter);
                                                    setVisibleCount(15);
                                                }}
                                                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-bold text-left transition-all flex items-center justify-between group flex-shrink-0 whitespace-nowrap ${
                                                    activeFilter === filter
                                                        ? 'bg-brand-brown-dark text-white shadow-md'
                                                        : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-brand-brown-dark'
                                                }`}
                                            >
                                                {filter}
                                                {activeFilter === filter && <div className="w-1.5 h-1.5 rounded-full bg-brand-gold hidden lg:block"></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow w-full">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <h2 className="font-agency text-2xl text-brand-brown-dark">Collections</h2>
                                    <button
                                        onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-brand-brown-dark transition-colors"
                                    >
                                        <ArrowUpDown className="w-3 h-3" />
                                        {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                                    </button>
                                </div>

                                {visiblePlaylists.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                            {visiblePlaylists.map((playlist) => {
                                                const isExpanded = expandedIds.has(playlist.id);
                                                const dir = getDir(playlist.title);

                                                return (
                                                    <Link
                                                        key={playlist.id}
                                                        href={`/media/videos/playlists/${playlist.id}`}
                                                        className="group flex flex-col bg-white rounded-[1.25rem] overflow-hidden border border-gray-100 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-sand/10 transition-all duration-300 h-full"
                                                    >
                                                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden border-b border-gray-50">
                                                            <Image
                                                                src={playlist.cover || '/fallback.webp'}
                                                                alt={playlist.title}
                                                                fill
                                                                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>

                                                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2">
                                                                <span className="px-2 py-1 bg-black/55 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold uppercase tracking-wider text-brand-gold">
                                                                    {playlist.category || 'Playlist'}
                                                                </span>
                                                                <span className="px-2 py-1 bg-black/55 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold text-white flex items-center gap-1">
                                                                    <ListVideo className="w-3 h-3 text-brand-gold" /> {playlist.count}
                                                                </span>
                                                            </div>

                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                <div className="w-11 h-11 rounded-full bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                                    <PlayCircle className="w-5 h-5" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-3 md:p-4 flex flex-col flex-grow" dir={dir}>
                                                            <div className="relative pr-6 mb-3">
                                                                <h3 className={`text-base md:text-lg font-bold text-brand-brown-dark leading-snug group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                                    {playlist.title}
                                                                </h3>
                                                                <button
                                                                    onClick={(e) => toggleExpand(e, playlist.id)}
                                                                    className="absolute right-0 top-0 p-1 -mt-1 -mr-1 text-gray-300 hover:text-brand-gold transition-colors"
                                                                >
                                                                    {isExpanded ? <ChevronUp className="w-3 h-3 md:w-4 md:h-4" /> : <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />}
                                                                </button>
                                                            </div>

                                                            <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50" dir="ltr">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-brown-dark transition-colors">View Collection</span>
                                                                <ArrowRight className={`w-3.5 h-3.5 text-gray-300 group-hover:text-brand-gold transition-colors duration-300 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        <div className="py-12 text-center space-y-4">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {visiblePlaylists.length} of {sortedPlaylists.length} Playlists</p>
                                            {visibleCount < sortedPlaylists.length && (
                                                <button
                                                    onClick={() => setVisibleCount((prev) => prev + 10)}
                                                    className="px-8 py-2.5 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-xs hover:border-brand-brown-dark transition-all uppercase tracking-wider shadow-sm"
                                                >
                                                    Load More Playlists
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-300">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-agency text-lg text-gray-500">No Playlists found</h3>
                                        <p className="text-xs text-gray-400 mt-1">Try clearing filters or search terms.</p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setActiveFilter('All');
                                                setVisibleCount(15);
                                            }}
                                            className="mt-4 text-xs font-bold text-brand-gold hover:underline"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
