"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AudiosPage() {
    
    // Mock Data for Audios
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
        }
    ];

    const filters = ["All Audios", "Tafsir", "Khutbah", "Fiqh", "Seerah"];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-6">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" // Placeholder: Microphone or abstract sound wave image
                            alt="Audio Library Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-20 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-3 drop-shadow-sm">
                            Audio Library
                        </h1>
                        <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                        <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                            Listen to sermons, tafsir, and educational series on the go.
                        </p>
                    </div>
                </section>

                {/* 2. FILTER BAR */}
                <section className="px-6 mb-8">
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                        {filters.map((filter, index) => (
                            <button 
                                key={index}
                                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                                    index === 0 
                                    ? 'bg-brand-gold text-white shadow-md' 
                                    : 'bg-brand-sand text-brand-brown-dark hover:bg-brand-gold/10'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 3. AUDIO LIST */}
                <section className="px-6 space-y-4">
                    {audios.map((audio) => (
                        <div key={audio.id} className="group bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                            
                            {/* Play Icon / Visual */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-sand text-brand-gold flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>

                            {/* Content */}
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                                        {audio.category}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-lato">
                                        {audio.duration}
                                    </span>
                                </div>
                                
                                <h3 className="font-agency text-lg text-brand-brown-dark leading-tight truncate pr-2">
                                    {audio.title}
                                </h3>
                                
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-[10px] text-gray-500 font-lato">
                                        {audio.date}
                                    </p>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <p className="text-[10px] text-gray-500 font-lato">
                                        {audio.size}
                                    </p>
                                </div>
                            </div>

                            {/* Download/Action Icon (Optional) */}
                            <div className="flex-shrink-0 text-gray-300 hover:text-brand-brown-dark cursor-pointer">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>

                        </div>
                    ))}
                </section>

                {/* 4. LOAD MORE */}
                <section className="py-8 text-center">
                    <button className="px-6 py-3 border-2 border-brand-sand text-brand-brown-dark rounded-full font-agency text-sm hover:bg-brand-sand transition-colors">
                        Load More Audios
                    </button>
                </section>

            </main>

            <Footer />
        </div>
    );
}
