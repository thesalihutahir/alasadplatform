"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PodcastsPage() {
    
    // Mock Data for Podcasts
    const episodes = [
        {
            id: 1,
            title: "Navigating Challenges as Muslim Youth",
            series: "The Young Believer",
            ep: "EP 05",
            date: "20 Dec 2024",
            duration: "35:00",
            cover: "/hero.jpg", // Podcast Art
        },
        {
            id: 2,
            title: "Business Ethics in the 21st Century",
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
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" 
                            alt="Podcasts Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-20 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-3 drop-shadow-sm">
                            Podcasts
                        </h1>
                        <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                        <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                            Engaging discussions on contemporary issues through the lens of Islam.
                        </p>
                    </div>
                </section>

                {/* 2. LATEST EPISODE CARD (Featured) */}
                <section className="px-6 mb-8">
                    <div className="bg-brand-brown-dark rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        
                        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border-2 border-brand-gold/50">
                             <Image src="/hero.jpg" alt="Featured Podcast" fill className="object-cover" />
                        </div>
                        
                        <div className="text-center md:text-left relative z-10">
                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                                Latest Release
                            </span>
                            <h2 className="font-agency text-2xl mt-1 mb-2">
                                The Young Believer: EP 06
                            </h2>
                            <p className="font-lato text-xs text-white/70 mb-4 line-clamp-2">
                                Sheikh Muneer discusses the impact of social media on spiritual health.
                            </p>
                            <button className="px-6 py-2 bg-brand-gold text-white font-bold text-xs rounded-full uppercase tracking-wider hover:bg-white hover:text-brand-gold transition-colors">
                                Listen Now
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. EPISODE LIST */}
                <section className="px-6 space-y-4">
                    <h3 className="font-agency text-xl text-brand-brown-dark mb-4">
                        Recent Episodes
                    </h3>
                    
                    {episodes.map((ep) => (
                        <div key={ep.id} className="group bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md hover:border-brand-gold/30">
                            
                            {/* Square Thumbnail (Album Art style) */}
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-brand-sand">
                                <Image src={ep.cover} alt={ep.title} fill className="object-cover" />
                                {/* Play Overlay */}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-bold text-white bg-brand-brown px-2 py-0.5 rounded-full">
                                        {ep.ep}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-lato">
                                        {ep.duration}
                                    </span>
                                </div>
                                
                                <h4 className="font-agency text-lg text-brand-brown-dark leading-none truncate mb-1">
                                    {ep.title}
                                </h4>
                                <p className="text-xs text-brand-gold font-bold uppercase tracking-wide">
                                    {ep.series}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

            </main>

            <Footer />
        </div>
    );
}
