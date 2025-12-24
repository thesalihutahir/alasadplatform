"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Play, ArrowRight, Calendar, Clock, Download, ChevronRight } from 'lucide-react'; 

export default function HomePage() {
    // State to handle Video Facade
    const [playVideo, setPlayVideo] = useState(false);

    // Mock Data for Updates
    const updates = [1, 2, 3]; 

    // Mock Data for Latest Audios
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
                <section className="w-full relative bg-white h-[60vh] md:h-[80vh] min-h-[500px]">
                    <div className="relative w-full h-full">
                        <Image
                            src="/images/heroes/home-main-hero.webp"
                            alt="Al-Asad Education Foundation"
                            fill
                            className="object-cover object-top"
                            priority
                        />
                        
                        {/* Perfected Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/90 md:via-black/50 md:to-transparent"></div>

                        <div className="absolute inset-0 flex items-end md:items-center justify-center md:justify-start px-6 md:px-16 lg:px-24 pb-12 md:pb-0 z-10">
                            <div className="text-center md:text-left max-w-3xl">
                                <p className="font-lato text-white md:text-brand-gold text-sm md:text-xl font-bold uppercase tracking-widest mb-2 drop-shadow-md">
                                    Welcome to <br />
Al-Asad Education Foundation
                                </p>
                                <h1 className="font-agency text-4xl md:text-7xl lg:text-8xl text-brand-gold md:text-white leading-none drop-shadow-md mb-6">
                                    Where Education <br />
                                    <span className="text-brand-gold md:text-brand-gold">Creates Impact</span>
                                </h1>
                                <div className="hidden md:flex gap-4 mt-6">
                                    <Link
                                        href="/get-involved/donate"
                                        className="px-8 py-3 bg-brand-gold text-white font-agency text-xl rounded-full shadow-lg hover:bg-white hover:text-brand-brown-dark transition-all"
                                    >
                                        Donate Now
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white text-white font-agency text-xl rounded-full hover:bg-white hover:text-brand-brown-dark transition-all"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* 2. ICON NAVIGATION MENU */}
                <section className="py-8 md:py-16 px-6 bg-white relative z-20 -mt-6 md:-mt-0 rounded-t-3xl md:rounded-none">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-4 gap-4 md:gap-12 justify-items-center">
                            <Link href="/programs" className="flex flex-col items-center group cursor-pointer">
                                <div className="w-14 h-14 md:w-20 md:h-20 relative mb-3 transition-transform group-hover:scale-110">
                                    <Image src="/images/menu/nav-programs-icon.webp" alt="Programs" fill className="object-contain drop-shadow-sm" />
                                </div>
                                <span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">Programs</span>
                            </Link>
                            <Link href="/media" className="flex flex-col items-center group cursor-pointer">
                                <div className="w-14 h-14 md:w-20 md:h-20 relative mb-3 transition-transform group-hover:scale-110">
                                    <Image src="/images/menu/nav-media-icon.webp" alt="Media" fill className="object-contain drop-shadow-sm" />
                                </div>
                                <span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">Media</span>
                            </Link>
                            <Link href="/blogs" className="flex flex-col items-center group cursor-pointer">
                                <div className="w-14 h-14 md:w-20 md:h-20 relative mb-3 transition-transform group-hover:scale-110">
                                    <Image src="/images/menu/nav-blogs-icon.webp" alt="Blogs" fill className="object-contain drop-shadow-sm" />
                                </div>
                                <span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">Blogs</span>
                            </Link>
                            <Link href="/about" className="flex flex-col items-center group cursor-pointer">
                                <div className="w-14 h-14 md:w-20 md:h-20 relative mb-3 transition-transform group-hover:scale-110">
                                    <Image src="/images/menu/nav-about-icon.webp" alt="About" fill className="object-contain drop-shadow-sm" />
                                </div>
                                <span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">About</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 3. ACTION BUTTONS (Mobile Only - Desktop has them in Hero) */}
                <section className="md:hidden py-2 px-8 flex justify-center pb-8">
                    <Link
                        href="/get-involved/donate"
                        className="w-full max-w-xs py-3 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        Make a Donation
                    </Link>
                </section>

                {/* 4. LATEST UPDATES */}
                <section className="py-12 md:py-20 px-6 bg-brand-sand/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-8 md:mb-12">
                            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">Latest Updates</h2>
                            <Link href="/blogs" className="text-xs md:text-sm font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Responsive Grid: 1 Col Mobile -> 3 Cols Desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {updates.map((item, index) => (
                                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md group border border-transparent hover:border-brand-gold/20 transition-all hover:shadow-xl flex flex-col h-full">
                                    <Link href="/blogs/updates" className="block flex-grow">
                                        <div className="relative w-full h-48 md:h-56 overflow-hidden">
                                            <Image
                                                src="/hero.jpg" 
                                                alt="Latest Update"
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-0 left-0 bg-brand-gold text-white py-1 px-3 rounded-br-lg font-agency text-sm z-10 shadow-sm">
                                                20 DEC
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col h-full">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="font-lato text-[10px] font-bold text-brand-gold uppercase tracking-wider bg-brand-gold/10 px-2 py-0.5 rounded-full">Education</span>
                                            </div>

                                            <h3 className="font-agency text-xl md:text-2xl text-brand-brown-dark mb-3 leading-tight group-hover:text-brand-gold transition-colors">
                                                Students of Ma'ahad celebrate Qur'an memorization
                                            </h3>

                                            <p className="font-lato text-sm text-brand-brown line-clamp-3 leading-relaxed opacity-80 mb-4 flex-grow">
                                                Ma'ahad Sheikh Shareef Ibrahim Saleh Al-Hussaini celebrated over 30 students who memorized the Holy Qur'an this year.
                                            </p>

                                            <span className="inline-flex items-center text-xs font-bold text-brand-brown-dark uppercase tracking-widest group-hover:text-brand-gold transition-colors mt-auto">
                                                Read Full Story <ArrowRight className="w-3 h-3 ml-1" />
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. MEDIA PREVIEWS (SPLIT LAYOUT ON DESKTOP) */}
                <section className="py-12 md:py-20 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Grid Wrapper for Video + Audio */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            
                            {/* LEFT: LATEST VIDEO (Takes 2 Cols on Desktop) */}
                            <div className="lg:col-span-2 flex flex-col">
                                <div className="flex justify-between items-end mb-6">
                                    <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">Latest Video</h2>
                                </div>

                                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex-grow flex flex-col">
                                    {/* Video Player */}
                                    <div className="relative w-full aspect-video bg-black group">
                                        {!playVideo ? (
                                            <button 
                                                onClick={() => setPlayVideo(true)}
                                                className="absolute inset-0 w-full h-full relative"
                                            >
                                                <Image 
                                                    src="/hero.jpg" 
                                                    alt="Video Thumbnail" 
                                                    fill 
                                                    className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-300 shadow-lg border border-white/50">
                                                        <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-current" />
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

                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="inline-block px-3 py-1 bg-brand-gold text-white text-[10px] md:text-xs font-bold uppercase rounded shadow-sm">
                                                New Video
                                            </span>
                                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> 25 Mins
                                            </span>
                                        </div>
                                        <h3 className="font-agency text-2xl md:text-4xl text-brand-brown-dark mb-3 leading-tight">
                                            Understanding the Rights of Neighbors
                                        </h3>
                                        <p className="font-lato text-sm md:text-base text-brand-brown mb-6 leading-relaxed max-w-2xl">
                                            A profound discussion by Sheikh Muneer Ja'afar on the importance of community cohesion and social welfare in Islam.
                                        </p>
                                        <Link href="/media/videos" className="inline-flex items-center text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">
                                            Watch Full Series <ChevronRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: LATEST AUDIOS (Takes 1 Col on Desktop) */}
                            <div className="lg:col-span-1">
                                <div className="flex justify-between items-end mb-6 mt-8 lg:mt-0">
                                    <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark">Latest Audios</h2>
                                    <Link href="/media/audios" className="text-xs md:text-sm font-bold text-brand-gold uppercase tracking-widest hover:underline">View Library</Link>
                                </div>

                                <div className="space-y-4">
                                    {latestAudios.map((audio) => (
                                        <div key={audio.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg group">
                                            
                                            {/* Play Button */}
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-gold text-white flex items-center justify-center shadow-sm cursor-pointer group-hover:bg-brand-brown-dark transition-colors">
                                                <Play className="w-5 h-5 ml-1 fill-current" />
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
                                                
                                                <h3 className="font-agency text-lg text-brand-brown-dark leading-tight truncate group-hover:text-brand-gold transition-colors">
                                                    {audio.title}
                                                </h3>
                                                
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-[10px] text-gray-500 font-lato flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {audio.date}
                                                    </p>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <p className="text-[10px] text-gray-500 font-lato">
                                                        {audio.size}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Download Icon */}
                                            <div className="flex-shrink-0 text-gray-300 hover:text-brand-gold cursor-pointer transition-colors px-1">
                                                <Download className="w-5 h-5" />
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Desktop Call to Action for Audios */}
                                    <div className="hidden lg:block pt-4">
                                        <Link href="/media/audios" className="block w-full py-3 text-center border-2 border-brand-brown-dark/10 text-brand-brown-dark font-agency text-lg rounded-xl hover:bg-brand-brown-dark hover:text-white transition-colors">
                                            Explore Audio Playlists
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UPCOMING EVENTS */}
                        <div className="mt-16 md:mt-24">
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">Upcoming Events</h2>
                            </div>

                            {/* Mobile: Scroll | Desktop: Grid */}
                            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
                                {/* Event Card 1 */}
                                <div className="min-w-[280px] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col group hover:shadow-xl transition-all">
                                    <div className="bg-brand-brown-dark text-white text-center py-2 font-agency text-lg tracking-widest group-hover:bg-brand-gold transition-colors">
                                        RAMADAN 2025
                                    </div>
                                    <div className="p-8 flex-grow flex flex-col justify-center text-center bg-brand-sand/10 group-hover:bg-brand-sand/30 transition-colors">
                                        <h3 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-3">
                                            Annual Tafsir
                                        </h3>
                                        <p className="font-lato text-sm text-brand-brown mb-6 px-4">
                                            Join us for the daily commentary of the Holy Qur'an during the blessed month.
                                        </p>
                                        <span className="text-xs font-bold text-brand-gold uppercase tracking-widest border border-brand-gold/30 rounded-full px-6 py-2 mx-auto">
                                            Coming Soon
                                        </span>
                                    </div>
                                </div>
                                {/* Placeholder Event 2 (For Desktop Layout) */}
                                <div className="hidden md:flex min-w-[280px] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex-col group hover:shadow-xl transition-all opacity-70">
                                     <div className="bg-gray-200 text-gray-500 text-center py-2 font-agency text-lg tracking-widest">
                                        SHAWWAL 2025
                                    </div>
                                    <div className="p-8 flex-grow flex flex-col justify-center text-center bg-gray-50">
                                        <h3 className="font-agency text-2xl md:text-3xl text-gray-400 mb-3">
                                            Community Eid Fest
                                        </h3>
                                        <p className="font-lato text-sm text-gray-400 mb-6 px-4">
                                            Annual gathering for the Ummah to celebrate Eid.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* PARTNERS & AFFILIATIONS */}
                        <div className="mt-16 pt-10 border-t border-gray-100">
                             <p className="text-center font-lato text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                                Trusted Partners & Collaborators
                            </p>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="w-12 h-12 rounded-full border-2 border-brand-brown-dark/30 bg-brand-sand/20"></div>
                                <div className="w-24 h-8 border-2 border-brand-brown-dark/30 bg-brand-sand/20 rounded"></div>
                                <div className="w-10 h-10 border-2 border-brand-brown-dark/30 bg-brand-sand/20 transform rotate-45"></div>
                                <div className="w-24 h-8 border-2 border-brand-brown-dark/30 bg-brand-sand/20 rounded"></div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 6. VISION AND MISSION (Updated for Desktop Grid) */}
                <section className="relative py-16 md:py-24 px-6 bg-brand-gold overflow-hidden">
                    <div className="absolute inset-0 mix-blend-overlay">
                        <Image 
                            src="/images/chairman/sheikh1.webp" 
                            alt="Background pattern overlay" 
                            fill 
                            className="object-cover opacity-20" 
                        />
                    </div>
                    
                    <div className="relative z-10 max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            
                            {/* Vision (Left) */}
                            <div className="text-center md:text-left md:border-r md:border-white/20 md:pr-12">
                                <h2 className="font-agency text-2xl md:text-4xl text-white/90 mb-4">Vision Statement</h2>
                                <p className="font-lato text-lg md:text-xl leading-relaxed text-white">
                                    To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
                                </p>
                            </div>

                            {/* Mission (Right) */}
                            <div className="text-center md:text-left md:pl-4">
                                <h2 className="font-agency text-2xl md:text-4xl text-white/90 mb-4">Mission Statement</h2>
                                <p className="font-lato text-lg md:text-xl leading-relaxed text-white">
                                    Expanding access to knowledge through Qur'an-centered and community driven education.
                                </p>
                            </div>
                        </div>

                        {/* Center Icons (Full Width Row) */}
                        <div className="mt-16 max-w-4xl mx-auto">
                            <div className="grid grid-cols-3 gap-8">
                                <div className="flex flex-col items-center group">
                                    <div className="w-16 h-16 md:w-24 md:h-24 relative mb-4 bg-white/10 rounded-full p-4 transition-transform group-hover:scale-110">
                                        <Image src="/educationalsupporticon.svg" alt="Educational Support" fill className="object-contain p-3" />
                                    </div>
                                    <span className="font-agency text-sm md:text-lg text-white tracking-wide leading-tight text-center">Educational<br/> Support</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <div className="w-16 h-16 md:w-24 md:h-24 relative mb-4 bg-white/10 rounded-full p-4 transition-transform group-hover:scale-110">
                                        <Image src="/communitydevelopmenticon.svg" alt="Community Development" fill className="object-contain p-3" />
                                    </div>
                                    <span className="font-agency text-sm md:text-lg text-white tracking-wide leading-tight text-center">Community<br/> Development</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <div className="w-16 h-16 md:w-24 md:h-24 relative mb-4 bg-white/10 rounded-full p-4 transition-transform group-hover:scale-110">
                                        <Image src="/trainingandinnovationicon.svg" alt="Training & Innovation" fill className="object-contain p-3" />
                                    </div>
                                    <span className="font-agency text-sm md:text-lg text-white tracking-wide leading-tight text-center">Training &<br/> Innovation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. ARABIC QUOTE */}
                <section className="py-20 px-6 text-center bg-white">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative w-full h-24 md:h-32 mb-8 opacity-80">
                            <Image
                                src="/ilmquote.svg"
                                alt="Arabic Quote about Knowledge"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h2 className="font-agency text-2xl md:text-4xl text-brand-gold leading-tight">
                            Join us in building a future shaped by knowledge and faith.
                        </h2>
                    </div>
                </section>

                {/* 8. NEWSLETTER SUBSCRIPTION */}
                <section className="py-16 md:py-24 px-6 bg-brand-brown-dark text-white text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        
                        <h2 className="font-agency text-3xl md:text-5xl mb-4">
                            Stay Connected
                        </h2>
                        <p className="font-lato text-white/80 text-sm md:text-lg mb-10 leading-relaxed max-w-xl mx-auto">
                            Subscribe to our newsletter to receive updates on lectures, community programs, and opportunities to get involved.
                        </p>

                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white/20 transition-all text-sm md:text-base"
                            />
                            <button 
                                type="button" 
                                className="px-10 py-4 rounded-full bg-brand-gold text-white font-bold text-sm md:text-base uppercase tracking-wider hover:bg-white hover:text-brand-brown-dark transition-colors shadow-lg whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                        <p className="text-[10px] text-white/40 mt-6">
                            We respect your privacy. No spam, ever.
                        </p>
                    </div>
                </section>


            </main>

            <Footer />
        </div>
    );
}
