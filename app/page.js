"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LogoReveal from '@/components/logo-reveal';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// UI Icons (Modern Set)
import { 
    Play, ArrowRight, Calendar, Clock, Download, ChevronRight,
    LayoutGrid, Disc, ScrollText, Hexagon, // New Modern Icons for Nav
    MapPin, ExternalLink
} from 'lucide-react'; 

export default function HomePage() {
    // --- UI State ---
    const [showSplash, setShowSplash] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [playVideo, setPlayVideo] = useState(false);

    // --- Data State ---
    const [latestUpdates, setLatestUpdates] = useState([]);
    const [latestAudios, setLatestAudios] = useState([]);
    const [latestVideo, setLatestVideo] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. Splash Screen Timer ---
    useEffect(() => {
        const timer1 = setTimeout(() => setFadeOut(true), 3500);
        const timer2 = setTimeout(() => setShowSplash(false), 4200);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // --- 2. Master Data Fetching ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // A) Blogs (Updates)
                const blogsQ = query(collection(db, 'blogs'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(3));
                const blogsSnap = await getDocs(blogsQ);
                setLatestUpdates(blogsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                // B) Audios
                const audiosQ = query(collection(db, 'audios'), orderBy('createdAt', 'desc'), limit(3)); // Assuming createdAt exists
                const audiosSnap = await getDocs(audiosQ);
                setLatestAudios(audiosSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                // C) Latest Video
                const videoQ = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(1));
                const videoSnap = await getDocs(videoQ);
                if (!videoSnap.empty) {
                    setLatestVideo({ id: videoSnap.docs[0].id, ...videoSnap.docs[0].data() });
                }

                // D) Events (New Collection)
                // Note: If collection doesn't exist yet, this returns empty without error in Firestore client SDK usually, 
                // but ensure security rules allow read.
                const eventsQ = query(collection(db, 'events'), orderBy('date', 'asc'), where('date', '>=', new Date().toISOString()), limit(3));
                const eventsSnap = await getDocs(eventsQ);
                setUpcomingEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                // E) Partners
                const partnersQ = query(collection(db, 'partners'), limit(8));
                const partnersSnap = await getDocs(partnersQ);
                setPartners(partnersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            } catch (error) {
                console.error("Home Data Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Helper for Date Formatting
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
    };

    return (
        <div className="min-h-screen flex flex-col bg-brand-sand/10 font-lato text-brand-brown-dark selection:bg-brand-gold selection:text-white">
            
            {/* SPLASH SCREEN */}
            {showSplash && (
                <div className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-700 ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-full max-w-md p-8"><LogoReveal /></div>
                </div>
            )}

            <Header />

            <main className="flex-grow">
                {/* 1. HERO SECTION */}
                <section className="w-full relative h-[65vh] md:h-[85vh] min-h-[600px] overflow-hidden group">
                    <div className="relative w-full h-full transform transition-transform duration-[2000ms] group-hover:scale-105">
                        <Image src="/images/heroes/home-main-hero.webp" alt="Al-Asad Education Foundation" fill className="object-cover object-top" priority />
                        {/* Advanced Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent opacity-90"></div>
                    </div>

                    <div className="absolute inset-0 flex items-end md:items-center justify-center md:justify-start px-6 md:px-16 lg:px-24 pb-20 md:pb-0 z-10">
                        <div className="text-center md:text-left max-w-4xl space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-1000">
                            <div className="inline-block px-4 py-1.5 border border-white/30 rounded-full bg-white/10 backdrop-blur-md mb-2">
                                <p className="font-lato text-white text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Welcome to Al-Asad Foundation</p>
                            </div>
                            <h1 className="font-agency text-5xl md:text-7xl lg:text-9xl text-white leading-[0.9] drop-shadow-2xl">
                                Education That <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-300">Creates Impact</span>
                            </h1>
                            
                            <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center md:justify-start">
                                <Link href="/get-involved/donate" className="px-10 py-4 bg-brand-gold text-white font-agency text-xl rounded-full shadow-[0_0_20px_rgba(209,118,0,0.4)] hover:shadow-[0_0_30px_rgba(209,118,0,0.6)] hover:bg-white hover:text-brand-brown-dark transition-all duration-300 transform hover:-translate-y-1">
                                    Donate Now
                                </Link>
                                <Link href="/about" className="px-10 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-agency text-xl rounded-full hover:bg-white hover:text-brand-brown-dark transition-all duration-300">
                                    Our Mission
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. MODERN ICON NAVIGATION (Redesigned) */}
                <section className="relative z-20 -mt-12 px-4 md:px-0">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 transform hover:scale-[1.01] transition-transform duration-500">
                            {[
                                { name: 'Programs', href: '/programs', icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { name: 'Media Hub', href: '/media', icon: Disc, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { name: 'Articles', href: '/blogs', icon: ScrollText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { name: 'Who We Are', href: '/about', icon: Hexagon, color: 'text-brand-gold', bg: 'bg-orange-50' },
                            ].map((item) => (
                                <Link key={item.name} href={item.href} className="group relative flex flex-col md:flex-row items-center md:justify-center gap-3 md:gap-4 p-4 md:py-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100">
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`} strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <span className="font-agency text-lg md:text-2xl text-brand-brown-dark group-hover:text-brand-gold transition-colors block">{item.name}</span>
                                        <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider hidden md:block group-hover:text-gray-600">Explore</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. LATEST UPDATES (Dynamic) */}
                <section className="py-20 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <span className="block text-brand-gold font-bold tracking-widest text-xs uppercase mb-2">From the Blog</span>
                                <h2 className="font-agency text-4xl md:text-6xl text-brand-brown-dark">Latest Updates</h2>
                            </div>
                            <Link href="/blogs" className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-gold uppercase tracking-widest hover:underline group">
                                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="bg-gray-200 rounded-3xl h-96 animate-pulse"></div>)
                            ) : latestUpdates.length > 0 ? (
                                latestUpdates.map((item, idx) => (
                                    <Link key={item.id} href={`/blogs/read/${item.id}`} className="group relative block h-full">
                                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                            <div className="relative h-64 overflow-hidden">
                                                <Image src={item.coverImage || '/fallback.webp'} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-brand-brown-dark py-1 px-4 rounded-full font-agency text-sm shadow-sm">
                                                    {formatDate(item.publishedAt)}
                                                </div>
                                            </div>
                                            <div className="p-8 flex flex-col flex-grow">
                                                <h3 className="font-agency text-2xl text-brand-brown-dark mb-4 leading-none group-hover:text-brand-gold transition-colors">{item.title}</h3>
                                                <p className="font-lato text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed">{item.excerpt}</p>
                                                <div className="mt-auto flex items-center text-brand-gold text-xs font-bold uppercase tracking-widest">
                                                    Read Story <ChevronRight className="w-3 h-3 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                    <p className="text-gray-400 font-agency text-xl">Updates coming soon...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                {/* 4. MEDIA & EVENTS (Dynamic) */}
                <section className="py-20 bg-brand-brown-dark text-white rounded-t-[3rem] relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        
                        {/* A. MEDIA SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
                            {/* Video Column */}
                            <div className="lg:col-span-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-1 bg-brand-gold rounded-full"></div>
                                    <h2 className="font-agency text-3xl md:text-5xl">Featured Visuals</h2>
                                </div>
                                
                                {loading ? (
                                    <div className="w-full aspect-video bg-white/5 rounded-3xl animate-pulse"></div>
                                ) : latestVideo ? (
                                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                                        {playVideo ? (
                                            <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${latestVideo.youtubeId || latestVideo.videoId}?autoplay=1`} title="Video" allow="autoplay; encrypted-media" allowFullScreen></iframe>
                                        ) : (
                                            <div className="relative w-full aspect-video cursor-pointer group" onClick={() => setPlayVideo(true)}>
                                                <Image src={`https://img.youtube.com/vi/${latestVideo.youtubeId || latestVideo.videoId}/maxresdefault.jpg`} alt="Video" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-20 h-20 bg-brand-gold/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform">
                                                        <Play className="w-8 h-8 fill-current text-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/60 to-transparent">
                                                    <h3 className="font-agency text-2xl md:text-3xl">{latestVideo.title}</h3>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full aspect-video bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                                        <p className="text-white/30 font-agency text-xl">No videos available yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Audio Column */}
                            <div className="lg:col-span-4 flex flex-col">
                                <div className="flex justify-between items-end mb-8">
                                    <h2 className="font-agency text-3xl md:text-4xl text-brand-gold">Recent Audio</h2>
                                    <Link href="/media/audios" className="text-xs font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">Listen All</Link>
                                </div>
                                <div className="space-y-4 flex-grow">
                                    {loading ? (
                                        [1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>)
                                    ) : latestAudios.length > 0 ? (
                                        latestAudios.map((audio) => (
                                            <Link key={audio.id} href={`/media/audios/play/${audio.id}`} className="block bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all border border-white/5 hover:border-brand-gold/30 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                        <Play className="w-4 h-4 fill-current" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-agency text-lg truncate text-white group-hover:text-brand-gold transition-colors">{audio.title}</h4>
                                                        <p className="text-xs text-white/40 font-lato">{audio.category || 'General'} • {audio.duration || 'Unknown'}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-white/30 text-sm italic">No recent audios found.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* B. EVENTS SECTION */}
                        <div className="border-t border-white/10 pt-16">
                            <div className="flex justify-between items-end mb-10">
                                <h2 className="font-agency text-4xl md:text-6xl text-white">Upcoming Events</h2>
                                <Link href="/contact" className="text-brand-gold text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">Inquire</Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse"></div>)
                                ) : upcomingEvents.length > 0 ? (
                                    upcomingEvents.map((event) => (
                                        <div key={event.id} className="bg-white/5 rounded-3xl p-8 border border-white/5 hover:bg-white/10 transition-colors group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="bg-brand-gold text-white px-3 py-1 rounded-lg text-center">
                                                    <span className="block text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="block text-xl font-agency leading-none">{new Date(event.date).getDate()}</span>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-brand-gold group-hover:-rotate-45 transition-all" />
                                            </div>
                                            <h3 className="font-agency text-2xl mb-2 group-hover:text-brand-gold transition-colors">{event.title}</h3>
                                            <div className="flex items-center gap-2 text-white/40 text-xs">
                                                <MapPin className="w-3 h-3" />
                                                <span>{event.location || 'Katsina, Nigeria'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 py-12 text-center border border-dashed border-white/10 rounded-3xl">
                                        <p className="text-white/40 font-agency text-xl">No upcoming events scheduled at this time.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. PARTNERS (Dynamic) */}
                <section className="py-20 bg-white px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <p className="font-lato text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-12">Trusted Partners & Collaborators</p>
                        
                        <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-70">
                            {loading ? (
                                [1, 2, 3, 4].map(i => <div key={i} className="w-24 h-12 bg-gray-100 rounded animate-pulse"></div>)
                            ) : partners.length > 0 ? (
                                partners.map(partner => (
                                    <div key={partner.id} className="relative w-32 h-16 grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110">
                                        <Image src={partner.logoUrl} alt={partner.name} fill className="object-contain" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-300 italic text-sm">Partners list updating...</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* 6. VISION QUOTE (Static - Core Brand Identity) */}
                <section className="py-24 bg-brand-sand/30 text-center px-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-tajawal text-4xl md:text-5xl text-brand-gold mb-6 leading-relaxed">
                            “قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ”
                        </h2>
                        <p className="font-agency text-xl md:text-2xl text-brand-brown-dark/80 uppercase tracking-widest">
                            "Say, 'Are those who know equal to those who do not know?'"
                        </p>
                    </div>
                </section>

                {/* 7. NEWSLETTER (Functional) */}
                <section className="py-24 bg-brand-brown-dark relative overflow-hidden text-center px-6">
                    <div className="absolute inset-0 bg-[url('/headerlogo.svg')] bg-no-repeat bg-center opacity-[0.03] scale-150"></div>
                    <div className="relative z-10 max-w-xl mx-auto">
                        <h2 className="font-agency text-4xl md:text-6xl text-white mb-6">Stay Connected</h2>
                        <p className="text-white/70 mb-10 font-lato">Join our community newsletter for updates on programs and lectures.</p>
                        <form className="flex flex-col sm:flex-row gap-3">
                            <input type="email" placeholder="Your email address" className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-brand-gold outline-none" />
                            <button type="button" className="px-8 py-4 bg-brand-gold text-white font-bold rounded-full hover:bg-white hover:text-brand-brown-dark transition-colors uppercase tracking-wider text-sm shadow-lg">Subscribe</button>
                        </form>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
