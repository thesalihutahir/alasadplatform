"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Play, Headphones, Clock, Calendar, Mic, Loader2, Filter } from 'lucide-react';

export default function PodcastsPage() {

    // --- STATE ---
    const [episodes, setEpisodes] = useState([]);
    const [shows, setShows] = useState([]);
    const [featuredEpisode, setFeaturedEpisode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All Shows");
    const [visibleCount, setVisibleCount] = useState(6);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Episodes
                const qEpisodes = query(collection(db, "podcasts"), orderBy("createdAt", "desc"));
                const epSnapshot = await getDocs(qEpisodes);
                const fetchedEpisodes = epSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEpisodes(fetchedEpisodes);

                if (fetchedEpisodes.length > 0) {
                    setFeaturedEpisode(fetchedEpisodes[0]); // Newest is Featured
                }

                // Fetch Shows
                const qShows = query(collection(db, "podcast_shows"), orderBy("createdAt", "desc"));
                const showSnapshot = await getDocs(qShows);
                const fetchedShows = showSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setShows(fetchedShows);

            } catch (error) {
                console.error("Error fetching podcasts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- HELPER: Format Date ---
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // --- FILTER LOGIC ---
    // If filter is active, only show episodes belonging to that show
    const listEpisodes = activeFilter === "All Shows" 
        ? episodes.slice(1) // Exclude featured if "All" is selected (optional design choice)
        : episodes.filter(ep => ep.show === activeFilter);

    const visibleEpisodes = listEpisodes.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-podcasts-hero.webp" 
                            alt="Podcasts Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Podcasts
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Engaging discussions on contemporary issues, spirituality, and lifestyle through the lens of Islam. Tune in anywhere, anytime.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* 2. BROWSE SERIES (SHOWS) */}
                        <section className="px-6 md:px-12 lg:px-24 mb-12 md:mb-20">
                            <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                                <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                    Shows & Series
                                </h2>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                                    Browse Collections
                                </span>
                            </div>

                            <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 md:gap-8 scrollbar-hide snap-x">
                                {/* "All Shows" Card */}
                                <div 
                                    onClick={() => setActiveFilter("All Shows")}
                                    className={`snap-center min-w-[140px] md:min-w-0 group cursor-pointer text-center md:text-left ${activeFilter === "All Shows" ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md bg-brand-brown-dark flex items-center justify-center text-white">
                                        <Mic className="w-10 h-10" />
                                    </div>
                                    <div className="mt-3">
                                        <h3 className="font-agency text-base md:text-lg text-brand-brown-dark leading-tight">All Episodes</h3>
                                    </div>
                                </div>

                                {shows.map((show) => (
                                    <div 
                                        key={show.id} 
                                        onClick={() => setActiveFilter(show.title)}
                                        className={`snap-center min-w-[140px] md:min-w-0 group cursor-pointer ${activeFilter === show.title ? 'opacity-100 ring-2 ring-brand-gold rounded-xl p-1' : 'opacity-100'}`}
                                    >
                                        <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all bg-gray-200">
                                            <Image 
                                                src={show.cover || "/hero.jpg"} 
                                                alt={show.title} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                                    <Headphones className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 text-center md:text-left">
                                            <h3 className="font-agency text-base md:text-lg text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors">
                                                {show.title}
                                            </h3>
                                            <p className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-wide">
                                                {show.host}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 3. LATEST EPISODE CARD (FEATURED) */}
                        {featuredEpisode && activeFilter === "All Shows" && (
                            <section className="px-6 md:px-12 lg:px-24 mb-12 md:mb-20">
                                <div className="flex justify-between items-end mb-6">
                                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                        New Release
                                    </h2>
                                </div>

                                <div className="max-w-5xl mx-auto bg-brand-brown-dark rounded-3xl p-6 md:p-12 text-white flex flex-col md:flex-row items-center gap-8 md:gap-12 shadow-2xl relative overflow-hidden">
                                    {/* Background pattern */}
                                    <div className="absolute top-0 right-0 w-40 h-40 md:w-80 md:h-80 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                                    {/* Large Art */}
                                    <div className="relative w-32 h-32 md:w-64 md:h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-gold/20 transform md:-rotate-3 transition-transform hover:rotate-0 bg-black">
                                        <Image src={featuredEpisode.thumbnail || "/hero.jpg"} alt="Featured Podcast" fill className="object-cover" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="text-center md:text-left relative z-10 flex-grow">
                                        <span className="inline-block px-3 py-1 bg-brand-gold text-white text-[10px] md:text-xs font-bold uppercase rounded-md mb-4 shadow-sm">
                                            Latest Release
                                        </span>
                                        <h2 className="font-agency text-3xl md:text-5xl mb-4 leading-tight">
                                            {featuredEpisode.title}
                                        </h2>
                                        <p className="font-lato text-sm md:text-lg text-white/70 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed line-clamp-3">
                                            {featuredEpisode.description}
                                        </p>
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            <a 
                                                href={featuredEpisode.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="px-8 py-3 bg-white text-brand-brown-dark font-bold text-sm rounded-full uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-all shadow-lg flex items-center gap-2"
                                            >
                                                <Play className="w-4 h-4 fill-current" /> Listen Now
                                            </a>
                                            <span className="text-xs text-white/50 font-lato">
                                                EP {featuredEpisode.episodeNumber || '-'} • {featuredEpisode.show}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 4. RECENT EPISODES LIST */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                            <h3 className="font-agency text-2xl md:text-4xl text-brand-brown-dark mb-6 md:mb-8 border-b border-gray-100 pb-2">
                                {activeFilter === "All Shows" ? "Recent Episodes" : `${activeFilter} Episodes`}
                            </h3>

                            {visibleEpisodes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {visibleEpisodes.map((ep) => (
                                        <a 
                                            href={ep.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            key={ep.id} 
                                            className="group bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center gap-4 md:gap-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-brand-gold/30"
                                        >
                                            {/* Square Thumbnail */}
                                            <div className="relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-brand-sand shadow-inner">
                                                <Image src={ep.thumbnail || "/hero.jpg"} alt={ep.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="w-6 h-6 text-white fill-current" />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[9px] md:text-[10px] font-bold text-white bg-brand-brown px-2 py-0.5 rounded-full">
                                                        EP {ep.episodeNumber || '0'}
                                                    </span>
                                                    <span className="text-[10px] md:text-xs text-gray-400 font-lato flex items-center gap-1">
                                                        {/* Duration not strictly available, using icon */}
                                                        <Clock className="w-3 h-3" /> Audio
                                                    </span>
                                                </div>

                                                <h4 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight truncate md:whitespace-normal mb-1 group-hover:text-brand-gold transition-colors line-clamp-1">
                                                    {ep.title}
                                                </h4>
                                                <p className="text-xs md:text-sm text-brand-gold font-bold uppercase tracking-wide flex items-center gap-1">
                                                    <Mic className="w-3 h-3" /> {ep.show}
                                                </p>
                                                
                                                <p className="hidden md:block text-xs text-gray-500 mt-2">
                                                    Published: {formatDate(ep.date)}
                                                </p>
                                            </div>
                                            
                                            {/* Mobile Date */}
                                            <div className="md:hidden flex-shrink-0 flex flex-col items-end">
                                                <Calendar className="w-4 h-4 text-gray-300 mb-1" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Headphones className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No episodes found for this selection.</p>
                                </div>
                            )}
                        </section>

                        {/* 5. LOAD MORE */}
                        {visibleCount < listEpisodes.length && (
                            <section className="py-12 text-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 6)}
                                    className="px-8 py-3 border-2 border-brand-sand text-brand-brown-dark rounded-full font-agency text-lg hover:bg-brand-brown-dark hover:text-white transition-colors uppercase tracking-wide"
                                >
                                    Load More Episodes
                                </button>
                            </section>
                        )}
                    </>
                )}

            </main>

            <Footer />
        </div>
    );
}
