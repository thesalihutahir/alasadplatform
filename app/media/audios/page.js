"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, Download, ListMusic, Mic, Clock, Calendar, Filter } from 'lucide-react';

export default function AudiosPage() {

    // Mock Data for Audio Series (Playlists)
    const audioSeries = [
        {
            id: 'tafsir-yasin',
            title: "Tafsir Surah Yasin (Complete)",
            count: 12,
            image: "/hero.jpg", // Placeholder
        },
        {
            id: 'ramadan-reminders',
            title: "Ramadan Daily Reminders",
            count: 29,
            image: "/hero.jpg", 
        },
        {
            id: 'kitab-taharah',
            title: "Kitab At-Taharah (Purification)",
            count: 8,
            image: "/hero.jpg", 
        }
    ];

    // Mock Data for Single Audios
    const audios = [
        {
            id: 1,
            title: "Khutbah: The Rights of Neighbors",
            category: "Friday Sermon",
            date: "22 Dec 2024",
            duration: "25:00",
            size: "12MB",
            url: "#" 
        },
        {
            id: 2,
            title: "Tafsir Surah Yasin (Full Series) - Part 1",
            category: "Tafsir",
            date: "15 Dec 2024",
            duration: "55:30",
            size: "45MB",
            url: "#"
        },
        {
            id: 3,
            title: "Understanding Purification (Kitab At-Taharah)",
            category: "Fiqh Class",
            date: "10 Dec 2024",
            duration: "40:15",
            size: "32MB",
            url: "#"
        },
        {
            id: 4,
            title: "Historical Context of the Prophetic Migration",
            category: "Seerah",
            date: "01 Dec 2024",
            duration: "60:00",
            size: "50MB",
            url: "#"
        },
        {
            id: 5,
            title: "The Importance of Brotherhood",
            category: "Lecture",
            date: "28 Nov 2024",
            duration: "35:00",
            size: "18MB",
            url: "#"
        },
        {
            id: 6,
            title: "Q&A Session: General Matters",
            category: "Q&A",
            date: "20 Nov 2024",
            duration: "45:00",
            size: "22MB",
            url: "#"
        }
    ];

    const filters = ["All Audios", "Tafsir", "Khutbah", "Fiqh", "Seerah"];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-12">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-audios-hero.webp" // Placeholder
                            alt="Audio Library Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Audio Library
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Listen to sermons, tafsir, and educational series on the go. Download lectures to build your personal library of knowledge.
                        </p>
                    </div>
                </section>

                {/* 2. AUDIO SERIES (PLAYLISTS) */}
                <section className="px-6 md:px-12 lg:px-24 mb-12">
                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                        <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                            Featured Series
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                            Complete Sets
                        </span>
                    </div>

                    {/* Mobile: Horizontal Scroll | Desktop: Grid */}
                    <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 md:gap-8 scrollbar-hide snap-x">
                        {audioSeries.map((series) => (
                            <div 
                                key={series.id} 
                                className="snap-center min-w-[160px] md:min-w-0 bg-brand-sand/30 rounded-2xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                            >
                                {/* Square Artwork style for Audio */}
                                <div className="relative w-full aspect-square">
                                    <Image 
                                        src={series.image} 
                                        alt={series.title} 
                                        fill 
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-brand-brown-dark/40 flex items-center justify-center group-hover:bg-brand-brown-dark/30 transition-colors">
                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                            <ListMusic className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-agency text-base md:text-xl text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors line-clamp-2 h-10 md:h-auto">
                                        {series.title}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Mic className="w-3 h-3" /> {series.count} Episodes
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. FILTER BAR */}
                <section className="px-6 md:px-12 lg:px-24 mb-8">
                     <div className="flex items-center gap-2 mb-4 md:hidden">
                        <Filter className="w-4 h-4 text-brand-brown" />
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-brown">Filter Audio</span>
                    </div>
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide md:justify-center md:flex-wrap">
                        {filters.map((filter, index) => (
                            <button 
                                key={index}
                                className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                                    index === 0 
                                    ? 'bg-brand-gold text-white shadow-md transform md:scale-105' 
                                    : 'bg-brand-sand text-brand-brown-dark hover:bg-brand-gold/10 hover:text-brand-gold'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. AUDIO LIST (Mobile: Stack / Desktop: 2-Col Grid) */}
                <section className="px-6 md:px-12 lg:px-24 space-y-4 max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-4">
                         <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark">
                            Recent Uploads
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {audios.map((audio) => (
                            <div key={audio.id} className="group bg-white rounded-2xl p-4 md:p-6 shadow-md border border-gray-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-brand-gold/30">

                                {/* Play Icon */}
                                <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-sand text-brand-gold flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors shadow-sm">
                                    <Play className="w-5 h-5 md:w-6 md:h-6 ml-1 fill-current" />
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] md:text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded">
                                            {audio.category}
                                        </span>
                                        <span className="text-[10px] md:text-xs text-gray-400 font-lato flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {audio.duration}
                                        </span>
                                    </div>

                                    <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight truncate pr-2 group-hover:text-brand-gold transition-colors">
                                        {audio.title}
                                    </h3>

                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-[10px] md:text-xs text-gray-500 font-lato flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {audio.date}
                                        </p>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <p className="text-[10px] md:text-xs text-gray-500 font-lato">
                                            {audio.size}
                                        </p>
                                    </div>
                                </div>

                                {/* Download Action */}
                                <button className="flex-shrink-0 text-gray-300 hover:text-brand-brown-dark hover:bg-gray-100 p-2 rounded-full transition-colors" title="Download Audio">
                                    <Download className="w-5 h-5 md:w-6 md:h-6" />
                                </button>

                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. LOAD MORE */}
                <section className="py-12 text-center">
                    <button className="px-8 py-3 border-2 border-brand-sand text-brand-brown-dark rounded-full font-agency text-lg hover:bg-brand-brown-dark hover:text-white transition-colors uppercase tracking-wide">
                        Load More Audios
                    </button>
                </section>

            </main>

            <Footer />
        </div>
    );
}
