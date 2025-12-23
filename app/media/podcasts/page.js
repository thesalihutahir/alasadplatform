"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, Headphones, Clock, Calendar, Mic } from 'lucide-react';

export default function PodcastsPage() {

    // Mock Data for Podcast Series (The "Playlists")
    const podcastSeries = [
        {
            id: 'young-believer',
            title: "The Young Believer",
            host: "Sheikh Muneer",
            count: 12,
            cover: "/hero.jpg", // Album Art
        },
        {
            id: 'faith-finance',
            title: "Faith & Finance",
            host: "Dr. Ahmed",
            count: 8,
            cover: "/hero.jpg",
        },
        {
            id: 'family-matters',
            title: "Family Matters",
            host: "Ustadha Fatima",
            count: 15,
            cover: "/hero.jpg",
        },
        {
            id: 'quran-reflections',
            title: "Qur'an Reflections",
            host: "Guest Speakers",
            count: 30,
            cover: "/hero.jpg",
        }
    ];

    // Mock Data for Recent Episodes
    const episodes = [
        {
            id: 1,
            title: "Navigating Challenges as Muslim Youth in the Digital Age",
            series: "The Young Believer",
            ep: "EP 05",
            date: "20 Dec 2024",
            duration: "35:00",
            cover: "/hero.jpg", 
        },
        {
            id: 2,
            title: "Business Ethics: Halal Investment Strategies",
            series: "Faith & Finance",
            ep: "EP 12",
            date: "12 Dec 2024",
            duration: "42:15",
            cover: "/hero.jpg",
        },
        {
            id: 3,
            title: "Marriage: Rights and Responsibilities",
            series: "Family Matters",
            ep: "EP 08",
            date: "05 Dec 2024",
            duration: "50:00",
            cover: "/hero.jpg",
        },
        {
            id: 4,
            title: "The Power of Dua in Times of Difficulty",
            series: "The Young Believer",
            ep: "EP 04",
            date: "01 Dec 2024",
            duration: "28:30",
            cover: "/hero.jpg",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" 
                            alt="Podcasts Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
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

                {/* 2. BROWSE SERIES (PLAYLISTS) */}
                <section className="px-6 md:px-12 lg:px-24 mb-12 md:mb-20">
                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                        <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                            Shows & Series
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                            Browse Collections
                        </span>
                    </div>

                    {/* Mobile: Horizontal Scroll | Desktop: 4-Col Grid */}
                    <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 md:gap-8 scrollbar-hide snap-x">
                        {podcastSeries.map((show) => (
                            <div 
                                key={show.id} 
                                className="snap-center min-w-[140px] md:min-w-0 group cursor-pointer"
                            >
                                {/* Album Art */}
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all">
                                    <Image 
                                        src={show.cover} 
                                        alt={show.title} 
                                        fill 
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                            <Headphones className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Info */}
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
                        <div className="relative w-32 h-32 md:w-64 md:h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-gold/20 transform md:-rotate-3 transition-transform hover:rotate-0">
                             <Image src="/hero.jpg" alt="Featured Podcast" fill className="object-cover" />
                        </div>

                        {/* Text Content */}
                        <div className="text-center md:text-left relative z-10 flex-grow">
                            <span className="inline-block px-3 py-1 bg-brand-gold text-white text-[10px] md:text-xs font-bold uppercase rounded-md mb-4 shadow-sm">
                                Latest Release
                            </span>
                            <h2 className="font-agency text-3xl md:text-5xl mb-4 leading-tight">
                                The Young Believer: EP 06
                            </h2>
                            <p className="font-lato text-sm md:text-lg text-white/70 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
                                Sheikh Muneer discusses the impact of social media on spiritual health, maintaining focus in a distracted world, and the etiquette of online interaction.
                            </p>
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <button className="px-8 py-3 bg-white text-brand-brown-dark font-bold text-sm rounded-full uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-all shadow-lg flex items-center gap-2">
                                    <Play className="w-4 h-4 fill-current" /> Listen Now
                                </button>
                                <span className="text-xs text-white/50 font-lato">
                                    45 Mins • Available on all platforms
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. RECENT EPISODES LIST (Mobile: Stack / Desktop: Grid) */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <h3 className="font-agency text-2xl md:text-4xl text-brand-brown-dark mb-6 md:mb-8 border-b border-gray-100 pb-2">
                        Recent Episodes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {episodes.map((ep) => (
                            <div key={ep.id} className="group bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center gap-4 md:gap-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-brand-gold/30">

                                {/* Square Thumbnail (Album Art style) */}
                                <div className="relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-brand-sand shadow-inner">
                                    <Image src={ep.cover} alt={ep.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-6 h-6 text-white fill-current" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[9px] md:text-[10px] font-bold text-white bg-brand-brown px-2 py-0.5 rounded-full">
                                            {ep.ep}
                                        </span>
                                        <span className="text-[10px] md:text-xs text-gray-400 font-lato flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {ep.duration}
                                        </span>
                                    </div>

                                    <h4 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight truncate md:whitespace-normal mb-1 group-hover:text-brand-gold transition-colors">
                                        {ep.title}
                                    </h4>
                                    <p className="text-xs md:text-sm text-brand-gold font-bold uppercase tracking-wide flex items-center gap-1">
                                        <Mic className="w-3 h-3" /> {ep.series}
                                    </p>
                                    
                                    <p className="hidden md:block text-xs text-gray-500 mt-2">
                                        Published: {ep.date}
                                    </p>
                                </div>
                                
                                {/* Mobile Date (Hidden on Desktop) */}
                                <div className="md:hidden flex-shrink-0 flex flex-col items-end">
                                    <Calendar className="w-4 h-4 text-gray-300 mb-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. LOAD MORE */}
                <section className="py-12 text-center">
                    <button className="px-8 py-3 border-2 border-brand-sand text-brand-brown-dark rounded-full font-agency text-lg hover:bg-brand-brown-dark hover:text-white transition-colors uppercase tracking-wide">
                        Load More Episodes
                    </button>
                </section>

            </main>

            <Footer />
        </div>
    );
}
