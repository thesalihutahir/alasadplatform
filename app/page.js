"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
    // State to handle Video Facade
    const [playVideo, setPlayVideo] = useState(false);

    // Mock Data for Updates
    const updates = [1, 2, 3]; 

    // Mock Data for Latest Audios (2 items as requested)
    const latestAudios = [
        {
            id: 1,
            title: "Khutbah: The Rights of Neighbors",
            category: "Friday Sermon",
            date: "22 Dec 2024",
            size: "12MB",
            duration: "25:00"
        },
        {
            id: 2,
            title: "Tafsir Surah Yasin - Part 4",
            category: "Tafsir",
            date: "15 Dec 2024",
            size: "45MB",
            duration: "55:30"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            <Header />

            <main className="flex-grow">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white">
                    <div className="relative w-full aspect-[720/400] md:aspect-[21/9]">
                        <Image
                            src="/sheikhhero.jpg"
                            alt="Al-Asad Foundation Hero"
                            fill
                            className="object-cover object-top"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white"></div>
                    </div>

                    <div className="relative -mt-20 md:-mt-32 text-center px-4 z-10 pb-2">
                        <p className="font-lato text-brand-brown text-sm md:text-lg font-medium mb-1 drop-shadow-sm">
                            Welcome to <br className="md:hidden" />
                            Al-Asad Education Foundation
                        </p>
                        <h1 className="font-agency text-3xl md:text-6xl text-brand-brown-dark leading-none drop-shadow-sm">
                            Where Education <br />
                            Creates Impact
                        </h1>
                    </div>
                </section>


                {/* 2. ICON NAVIGATION MENU */}
                <section className="py-6 px-6">
                    <div className="grid grid-cols-4 gap-4 justify-items-center">
                        <Link href="/programs" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/programsicon.svg" alt="Programs" fill className="object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark tracking-wide">Programs</span>
                        </Link>
                        <Link href="/media" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/mediaicon.svg" alt="Media" fill className="object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark tracking-wide">Media</span>
                        </Link>
                        <Link href="/blogs" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/blogsicon.svg" alt="Blogs" fill className="object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark tracking-wide">Blogs</span>
                        </Link>
                        <Link href="/about" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/abouticon.svg" alt="About" fill className="object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark tracking-wide">About</span>
                        </Link>
                    </div>
                </section>

                {/* 3. ACTION BUTTONS */}
                <section className="py-2 px-8 flex justify-center pb-8">
                    <Link
                        href="/get-involved/donate"
                        className="w-full max-w-xs py-3 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        Make a Donation
                    </Link>
                </section>

                {/* 4. LATEST UPDATES (Updated with 'Read Full Story') */}
                <section className="py-8 px-6 bg-brand-sand/30">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="font-agency text-2xl text-brand-brown-dark">Latest Updates</h2>
                        <Link href="/blogs" className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">View All</Link>
                    </div>

                    <div className="space-y-6">
                        {updates.map((item, index) => (
                            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md group border border-transparent hover:border-brand-gold/20 transition-all">
                                <Link href="/blogs/updates" className="block">
                                    <div className="relative w-full h-48 overflow-hidden">
                                        <Image
                                            src="/hero.jpg" 
                                            alt="Latest Update"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-0 left-0 bg-brand-gold text-white py-1 px-3 rounded-br-lg font-agency text-sm z-10 shadow-sm">
                                            20 DEC
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-lato text-[10px] font-bold text-brand-gold uppercase tracking-wider">Education</span>
                                        </div>

                                        <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-tight group-hover:text-brand-gold transition-colors">
                                            Students of Ma'ahad celebrate Qur'an memorization
                                        </h3>

                                        <p className="font-lato text-sm text-left text-brand-brown line-clamp-2 leading-relaxed opacity-80 mb-4">
                                            Ma'ahad Sheikh Shareef Ibrahim Saleh Al-Hussaini celebrated over 30 students who memorized the Holy Qur'an this year.
                                        </p>

                                        {/* Added "Read Full Story" Link */}
                                        <span className="inline-flex items-center text-xs font-bold text-brand-brown-dark uppercase tracking-widest group-hover:text-brand-gold transition-colors">
                                            Read Full Story <span className="ml-1">→</span>
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. MEDIA PREVIEWS (Redesigned based on Screenshots) */}
                <section className="py-12 px-6 bg-white">

                    {/* VIDEO SECTION - New "Latest Release" Card Style */}
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="font-agency text-2xl text-brand-brown-dark">Latest Release</h2>
                        </div>

                        {/* Card Container */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            
                            {/* Video Player / Facade Area */}
                            <div className="relative w-full aspect-video bg-black group">
                                {!playVideo ? (
                                    <button 
                                        onClick={() => setPlayVideo(true)}
                                        className="absolute inset-0 w-full h-full relative"
                                    >
                                        <Image 
                                            src="/hero.jpg" // Thumbnail
                                            alt="Video Thumbnail" 
                                            fill 
                                            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src="https://www.youtube.com/embed/BYdCnmAgvhs?rel=0&modestbranding=1&autoplay=1"
                                        title="Featured Lecture"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                )}
                            </div>

                            {/* Card Details Area (White background) */}
                            <div className="p-6">
                                <span className="inline-block px-2 py-1 bg-brand-gold text-white text-[10px] font-bold uppercase rounded mb-3 shadow-sm">
                                    New Video
                                </span>
                                <h3 className="font-agency text-2xl text-brand-brown-dark mb-3 leading-tight">
                                    Understanding the Rights of Neighbors
                                </h3>
                                <p className="font-lato text-sm text-brand-brown mb-5 leading-relaxed">
                                    A profound discussion by Sheikh Muneer Ja'afar on the importance of community cohesion and social welfare in Islam.
                                </p>
                                <Link href="/media/videos" className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center">
                                    Watch Full Series <span className="ml-1">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* AUDIO SECTION - New "List/Card" Style (2 Items) */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="font-agency text-2xl text-brand-brown-dark">Latest Audio</h2>
                            <Link href="/media/audios" className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">View Library</Link>
                        </div>

                        <div className="space-y-4">
                            {latestAudios.map((audio) => (
                                <div key={audio.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
                                    
                                    {/* Play Button (Orange Circle) */}
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-gold text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-brand-brown-dark transition-colors">
                                        <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>

                                    {/* Info Area */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                                                {audio.category}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-lato">
                                                {audio.duration}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-agency text-lg text-brand-brown-dark leading-tight truncate">
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

                                    {/* Download Icon */}
                                    <div className="flex-shrink-0 text-gray-300 hover:text-brand-gold cursor-pointer transition-colors px-1">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* UPCOMING EVENTS */}
                    <div className="mt-12">
                        <div className="flex justify-between items-end mb-4">
                            <h2 className="font-agency text-2xl text-brand-brown-dark">Upcoming Events</h2>
                        </div>

                        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                            {/* Event Card */}
                            <div className="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl p-0 shadow-md border border-gray-100 flex flex-col group overflow-hidden">
                                {/* Date Strip */}
                                <div className="bg-brand-brown-dark text-white text-center py-2 font-agency text-lg tracking-widest">
                                    COMING SOON
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-center text-center bg-brand-sand/10 group-hover:bg-brand-sand/30 transition-colors">
                                    <h3 className="font-agency text-2xl text-brand-brown-dark mb-2">
                                        Annual Ramadan Tafsir
                                    </h3>
                                    <p className="font-lato text-sm text-brand-brown mb-4">
                                        Join us for the daily commentary of the Holy Qur'an.
                                    </p>
                                    <span className="text-xs font-bold text-brand-gold uppercase tracking-widest border border-brand-gold/30 rounded-full px-4 py-2 mx-auto">
                                        Details Pending
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                </section>

                {/* 6. VISION AND MISSION (Unchanged) */}
                <section className="relative py-16 px-6 bg-brand-gold overflow-hidden">
                    <div className="absolute inset-0 mix-blend-overlay">
                        <Image 
                            src="/overlay.jpg" 
                            alt="Background pattern overlay" 
                            fill 
                            className="object-cover opacity-20" 
                        />
                    </div>
                    <div className="relative z-10 text-center text-white">
                        <div className="mb-8">
                            <h2 className="font-agency text-xl text-white/80 mb-3">Vision Statement</h2>
                            <p className="font-lato text-lg leading-relaxed max-w-md mx-auto">
                                To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
                            </p>
                        </div>
                        <div className="mb-10 max-w-lg mx-auto">
                            <div className="flex justify-center items-center my-6 opacity-50">
                                <div className="w-24 h-0.5 bg-white"></div>
                                <div className="mx-4 text-2xl">✦</div>
                                <div className="w-24 h-0.5 bg-white"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 relative mb-2">
                                        <Image src="/educationalsupporticon.svg" alt="Educational Support" fill className="object-contain" />
                                    </div>
                                    <span className="font-agency text-xs tracking-wide leading-tight">Educational<br className="md:hidden" /> Support</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 relative mb-2">
                                        <Image src="/communitydevelopmenticon.svg" alt="Community Development" fill className="object-contain" />
                                    </div>
                                    <span className="font-agency text-xs tracking-wide leading-tight">Community<br className="md:hidden" /> Development</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 relative mb-2">
                                        <Image src="/trainingandinnovationicon.svg" alt="Training & Innovation" fill className="object-contain" />
                                    </div>
                                    <span className="font-agency text-xs tracking-wide leading-tight">Training &<br className="md:hidden" /> Innovation</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center my-6 opacity-50">
                             <div className="w-24 h-0.5 bg-white"></div>
                             <div className="mx-4 text-2xl">✦</div>
                             <div className="w-24 h-0.5 bg-white"></div>
                        </div>
                        <div>
                            <h2 className="font-agency text-xl text-white/80 mb-3">Mission Statement</h2>
                            <p className="font-lato text-lg leading-relaxed max-w-md mx-auto">
                                Expanding access to knowledge through Qur'an-centered and community driven education.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 7. ARABIC QUOTE */}
                <section className="py-16 px-6 text-center bg-white">
                    <div className="relative w-full max-w-xs mx-auto h-24 mb-6">
                        <Image
                            src="/ilmquote.svg"
                            alt="Arabic Quote about Knowledge"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="font-agency text-xl text-brand-gold leading-tight max-w-xs mx-auto">
                        Join us in building a future shaped by knowledge and faith.
                    </h2>
                </section>

            </main>
            <Footer />
        </div>
    );
}
