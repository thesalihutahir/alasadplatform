"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function EbooksPage() {
    
    // Mock Data for eBooks
    const books = [
        {
            id: 1,
            title: "The Light of the Qur'an",
            author: "Sheikh Muneer Ja'afar",
            language: "English",
            size: "2.5 MB",
            cover: "/hero.jpg", // Placeholder for Book Cover
        },
        {
            id: 2,
            title: "Kitab At-Tawheed (Hausa)",
            author: "Sheikh Muneer Ja'afar",
            language: "Hausa",
            size: "1.8 MB",
            cover: "/hero.jpg", 
        },
        {
            id: 3,
            title: "Guide to Daily Adhkar",
            author: "Al-Asad Publications",
            language: "Arabic/Eng",
            size: "4.0 MB",
            cover: "/hero.jpg", 
        },
        {
            id: 4,
            title: "Understanding Zakat",
            author: "Sheikh Muneer Ja'afar",
            language: "English",
            size: "1.2 MB",
            cover: "/hero.jpg", 
        },
    ];

    const filters = ["All Books", "English", "Hausa", "Arabic", "Research Papers"];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-6">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" 
                            alt="eBooks Library Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-20 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-3 drop-shadow-sm">
                            eBooks & Publications
                        </h1>
                        <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                        <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                            Read and download scholarly articles, books, and pamphlets.
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

                {/* 3. BOOK GRID */}
                <section className="px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {books.map((book) => (
                            <div key={book.id} className="group flex flex-col items-start">
                                {/* Book Cover Card */}
                                <div className="relative w-full aspect-[2/3] bg-brand-sand rounded-xl overflow-hidden shadow-md mb-3 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                                    <Image
                                        src={book.cover}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Hover Overlay with Download Icon */}
                                    <div className="absolute inset-0 bg-brand-brown-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-brown-dark">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* Language Badge */}
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                        {book.language}
                                    </div>
                                </div>

                                {/* Book Info */}
                                <h3 className="font-agency text-lg text-brand-brown-dark leading-tight mb-1 group-hover:text-brand-gold transition-colors">
                                    {book.title}
                                </h3>
                                <p className="font-lato text-xs text-brand-brown mb-2">
                                    {book.author}
                                </p>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                    PDF • {book.size}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
