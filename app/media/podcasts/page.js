"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { Play, Headphones, Clock, Calendar, Mic, Loader2, Filter, Globe, ChevronRight } from 'lucide-react';

export default function PodcastsPage() {

    // --- STATE ---
    const [allEpisodes, setAllEpisodes] = useState([]);
    const [allShows, setAllShows] = useState([]);
    
    // Filtered Data
    const [filteredEpisodes, setFilteredEpisodes] = useState([]);
    const [filteredShows, setFilteredShows] = useState([]);
    const [featuredEpisode, setFeaturedEpisode] = useState(null);

    const [loading, setLoading] = useState(true);
    const [activeLang, setActiveLang] = useState('English'); // Default Language
    const [visibleCount, setVisibleCount] = useState(6);

    const languages = ["English", "Hausa", "Arabic"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch All Shows
                const qShows = query(collection(db, "podcast_shows"), orderBy("createdAt", "desc"));
                const showSnapshot = await getDocs(qShows);
                const fetchedShows = showSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllShows(fetchedShows);

                // 2. Fetch All Episodes
                const qEpisodes = query(collection(db, "podcasts"), orderBy("date", "desc"));
                const epSnapshot = await getDocs(qEpisodes);
                const fetchedEpisodes = epSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllEpisodes(fetchedEpisodes);

            } catch (error) {
                console.error("Error fetching podcasts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- FILTER LOGIC ---
    useEffect(() => {
        // 1. Filter Shows by Language
        const langShows = allShows.filter(show => show.category === activeLang);
        setFilteredShows(langShows);

        // 2. Filter Episodes by Language
        const langEpisodes = allEpisodes.filter(ep => ep.category === activeLang);
        setFilteredEpisodes(langEpisodes);

        // 3. Set Featured (Newest of the filtered list)
        if (langEpisodes.length > 0) {
            setFeaturedEpisode(langEpisodes[0]);
        } else {
            setFeaturedEpisode(null);
        }

        // Reset visibility
        setVisibleCount(6);

    }, [activeLang, allShows, allEpisodes]);

    // --- HELPER: Format Date ---
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Calculate Grid List (Skip the featured one to avoid duplicate)
    const gridEpisodes = featuredEpisode 
        ? filteredEpisodes.filter(ep => ep.id !== featuredEpisode.id).slice(0, visibleCount) 
        : [];

    return (
        <div className="min-h-screen flex flex-col bg-brand-sand font-lato">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Podcasts
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Engaging discussions on contemporary issues, spirituality, and lifestyle through the lens of Islam.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <>
                        {/* 2. LANGUAGE FILTER */}
                        <section className="px-6 md:px-12 lg:px-24 mb-10 max-w-7xl mx-auto">
                            <div className="flex justify-center">
                                <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 flex gap-2">
                                    {languages.map((lang) => (
                                        <button 
                                            key={lang} 
                                            onClick={() => setActiveLang(lang)}
                                            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                                                activeLang === lang 
                                                ? 'bg-brand-brown-dark text-white shadow-md' 
                                                : 'bg-transparent text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 3. SHOWS CAROUSEL */}
                        {filteredShows.length > 0 && (
                            <section className="px-6 md:px-12 lg:px-24 mb-12 md:mb-20 max-w-7xl mx-auto">
                                <div className="flex justify-between items-end mb-6">
                                    <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark">
                                        {activeLang} Series
                                    </h2>
                                    <Link href="/media/podcasts/shows" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-gold transition-colors flex items-center gap-1">
                                        View All <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x">
                                    {filteredShows.map((show) => (
                                        <Link 
                                            key={show.id} 
                                            href={`/media/podcasts/shows/${show.id}`}
                                            className="snap-center min-w-[160px] md:min-w-[200px] group cursor-pointer"
                                        >
                                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all bg-gray-200 border border-transparent group-hover:border-brand-gold/30">
                                                <Image 
                                                    src={show.cover || "/fallback.webp"} 
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
                                            <div className="mt-3 text-center">
                                                <h3 className="font-agency text-lg text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors truncate">
                                                    {show.title}
                                                </h3>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide truncate">
                                                    {show.host}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 4. FEATURED EPISODE */}
                        {featuredEpisode && (
                            <section className="px-6 md:px-12 lg:px-24 mb-16 max-w-7xl mx-auto">
                                <div className="bg-brand-brown-dark rounded-3xl p-6 md:p-12 text-white flex flex-col md:flex-row items-center gap-8 md:gap-12 shadow-2xl relative overflow-hidden">
                                    {/* Background pattern */}
                                    <div className="absolute top-0 right-0 w-40 h-40 md:w-80 md:h-80 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                                    {/* Large Art */}
                                    <div className="relative w-full md:w-1/3 aspect-square flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-gold/20 bg-black">
                                        <Image src={featuredEpisode.thumbnail || "/fallback.webp"} alt={featuredEpisode.title} fill className="object-cover" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="text-center md:text-left relative z-10 flex-grow" dir={activeLang === 'Arabic' ? 'rtl' : 'ltr'}>
                                        <span className="inline-block px-3 py-1 bg-brand-gold text-white text-[10px] md:text-xs font-bold uppercase rounded-md mb-4 shadow-sm">
                                            Latest Release
                                        </span>
                                        <h2 className={`font-agency text-3xl md:text-5xl mb-4 leading-tight ${activeLang === 'Arabic' ? 'font-tajawal font-bold' : ''}`}>
                                            {featuredEpisode.title}
                                        </h2>
                                        <p className={`font-lato text-sm md:text-lg text-white/70 mb-8 leading-relaxed line-clamp-3 ${activeLang === 'Arabic' ? 'font-arabic' : ''}`}>
                                            {featuredEpisode.description || "Tune in to our latest discussion on this topic..."}
                                        </p>
                                        <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                                            <Link 
                                                href={`/media/podcasts/play/${featuredEpisode.id}`}
                                                className="px-8 py-3 bg-white text-brand-brown-dark font-bold text-sm rounded-full uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-all shadow-lg flex items-center gap-2"
                                            >
                                                <Play className="w-4 h-4 fill-current" /> Listen Now
                                            </Link>
                                            <span className="text-xs text-white/50 font-lato flex items-center gap-1">
                                                <Mic className="w-3 h-3" /> {featuredEpisode.show} • S{featuredEpisode.season || 1}:E{featuredEpisode.episodeNumber || 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 5. EPISODES GRID */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                            <h3 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-8 border-b border-gray-200 pb-2">
                                Recent Episodes
                            </h3>

                            {gridEpisodes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gridEpisodes.map((ep) => (
                                        <Link 
                                            href={`/media/podcasts/play/${ep.id}`}
                                            key={ep.id} 
                                            className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-lg hover:border-brand-gold/30 transition-all"
                                        >
                                            {/* Square Thumbnail */}
                                            <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                                <Image 
                                                    src={ep.thumbnail || "/fallback.webp"} 
                                                    alt={ep.title} 
                                                    fill 
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="w-6 h-6 text-white fill-current" />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow min-w-0" dir={activeLang === 'Arabic' ? 'rtl' : 'ltr'}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[9px] font-bold text-white bg-brand-brown px-2 py-0.5 rounded-full">
                                                        EP {ep.episodeNumber || '0'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold truncate">
                                                        {ep.show}
                                                    </span>
                                                </div>

                                                <h4 className={`text-base md:text-lg text-brand-brown-dark leading-tight mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors ${activeLang === 'Arabic' ? 'font-tajawal font-bold' : 'font-agency'}`}>
                                                    {ep.title}
                                                </h4>

                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {formatDate(ep.date)}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Headphones className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No additional episodes found.</p>
                                </div>
                            )}
                        </section>

                        {/* 6. LOAD MORE */}
                        {filteredEpisodes.length > visibleCount && (
                            <section className="py-12 text-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 6)}
                                    className="px-8 py-3 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-sm hover:bg-brand-brown-dark hover:text-white transition-colors shadow-sm"
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
