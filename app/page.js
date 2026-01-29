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

import { 
    Play, ArrowRight, Calendar, Clock, ChevronRight,
    ClipboardList, MonitorPlay, Newspaper, Users,
    GraduationCap, HandHeart, Lightbulb, MapPin
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
    const [loadingData, setLoadingData] = useState(true);

    // --- 1. Splash Screen Timer ---
    useEffect(() => {
        const timer1 = setTimeout(() => setFadeOut(true), 3500);
        const timer2 = setTimeout(() => setShowSplash(false), 4200);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // --- 2. Data Fetching (Parallel) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // A) Fetch Latest 3 Published Blogs
                const blogsPromise = getDocs(query(
                    collection(db, 'blogs'),
                    where('status', '==', 'published'),
                    orderBy('publishedAt', 'desc'),
                    limit(3)
                ));

                // B) Fetch Latest 3 Published Audios
                const audiosPromise = getDocs(query(
                    collection(db, 'audios'),
                    where('status', '==', 'published'),
                    orderBy('date', 'desc'),
                    limit(3)
                ));

                // C) Fetch Latest 1 Published Video
                const videoPromise = getDocs(query(
                    collection(db, 'videos'),
                    where('status', '==', 'published'),
                    orderBy('publishedAt', 'desc'),
                    limit(1)
                ));

                // D) Fetch Upcoming Events (Assuming 'date' is the field)
                // We order by date ascending to show the nearest upcoming event first
                const eventsPromise = getDocs(query(
                    collection(db, 'events'),
                    where('status', '==', 'published'),
                    orderBy('date', 'asc'), 
                    limit(3)
                ));

                const [blogsSnap, audiosSnap, videoSnap, eventsSnap] = await Promise.all([
                    blogsPromise, audiosPromise, videoPromise, eventsPromise
                ]);

                // Set Data
                setLatestUpdates(blogsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLatestAudios(audiosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                
                if (!videoSnap.empty) {
                    setLatestVideo({ id: videoSnap.docs[0].id, ...videoSnap.docs[0].data() });
                }

                setUpcomingEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    // Helper to format dates
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-brand-sand/20 font-lato text-brand-brown-dark overflow-x-hidden">
            
            {/* SPLASH SCREEN */}
            {showSplash && (
                <div className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-700 ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-full max-w-md p-8"><LogoReveal /></div>
                </div>
            )}

            <Header />

            <main className="flex-grow">
                
                {/* 1. HERO SECTION (PRESERVED AS REQUESTED) */}
                <section className="w-full relative bg-white h-[60vh] md:h-[80vh] min-h-[500px]">
                    <div className="relative w-full h-full">
                        <Image src="/images/heroes/home-main-hero.webp" alt="Al-Asad Education Foundation" fill className="object-cover object-top" priority />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/90 md:via-black/50 md:to-transparent"></div>
                        <div className="absolute inset-0 flex items-end md:items-center justify-center md:justify-start px-6 md:px-16 lg:px-24 pb-12 md:pb-0 z-10">
                            <div className="text-center md:text-left max-w-3xl">
                                <p className="font-lato text-white md:text-brand-gold text-sm md:text-xl font-bold uppercase tracking-widest mb-2 drop-shadow-md">Welcome to <br /> Al-Asad Education Foundation</p>
                                <h1 className="font-agency text-4xl md:text-7xl lg:text-8xl text-brand-gold md:text-white leading-none drop-shadow-md mb-6">Where Education <br /><span className="text-brand-gold md:text-brand-gold">Creates Impact</span></h1>
                                <div className="hidden md:flex gap-4 mt-6">
                                    <Link href="/get-involved/donate" className="px-8 py-3 bg-brand-gold text-white font-agency text-xl rounded-full shadow-lg hover:bg-white hover:text-brand-brown-dark transition-all">Donate Now</Link>
                                    <Link href="/about" className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white text-white font-agency text-xl rounded-full hover:bg-white hover:text-brand-brown-dark transition-all">Learn More</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SOLID ICON NAVIGATION */}
                <section className="py-10 md:py-16 px-6 relative z-20 -mt-8 md:-mt-0">
                     <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-4 gap-4 md:gap-12 justify-items-center bg-white md:bg-transparent p-6 rounded-2xl shadow-xl md:shadow-none md:p-0">
                            {[
                                { link: "/programs", icon: ClipboardList, label: "Programs" },
                                { link: "/media", icon: MonitorPlay, label: "Media" },
                                { link: "/blogs", icon: Newspaper, label: "Blogs" },
                                { link: "/about", icon: Users, label: "About" }
                            ].map((item, idx) => (
                                <Link key={idx} href={item.link} className="flex flex-col items-center group cursor-pointer w-full">
                                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-brand-sand flex items-center justify-center mb-4 transition-all duration-500 group-hover:bg-brand-gold group-hover:-translate-y-2 group-hover:shadow-2xl shadow-sm border border-brand-brown/5">
                                        {/* Added fill-current to mimic solid icons */}
                                        <item.icon 
                                            className="w-8 h-8 md:w-10 md:h-10 text-brand-brown-dark group-hover:text-white transition-colors fill-current" 
                                            strokeWidth={0} // Remove stroke to rely on fill
                                        />
                                    </div>
                                    <span className="font-agency text-base md:text-xl text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors font-bold uppercase">
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
                
                <section className="md:hidden py-2 px-8 flex justify-center pb-8">
                    <Link href="/get-involved/donate" className="w-full max-w-xs py-4 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 shadow-brand-gold/30">Make a Donation</Link>
                </section>
{/* 3. LATEST UPDATES (Dynamic) */}
                <section className="py-16 md:py-24 px-8 md:px-12 lg:px-24 bg-white/50">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex justify-between items-end mb-10 md:mb-16 border-b border-gray-200 pb-4">
                            <h2 className="font-agency text-3xl md:text-6xl text-brand-brown-dark">Latest Updates</h2>
                            <Link href="/blogs" className="text-xs md:text-sm font-bold text-brand-gold uppercase tracking-widest hover:text-brand-brown-dark transition-colors flex items-center gap-2">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                            {loadingData ? (
                                [1, 2, 3].map(i => <div key={i} className="bg-gray-100 rounded-3xl h-96 animate-pulse"></div>)
                            ) : latestUpdates.length > 0 ? (
                                latestUpdates.map((item) => (
                                    <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group flex flex-col h-full border border-gray-50">
                                        <Link href={`/blogs/read/${item.id}`} className="block flex-grow flex flex-col h-full">
                                            <div className="relative w-full h-56 md:h-64 overflow-hidden bg-gray-200">
                                                {item.coverImage ? (
                                                    <Image src={item.coverImage} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <Image src="/fallback.webp" alt="No Image" fill className="object-cover opacity-50" />
                                                )}
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-white/90 backdrop-blur text-brand-brown-dark py-1 px-4 rounded-full font-agency text-sm tracking-wide shadow-sm">
                                                        {item.category || "News"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-8 flex flex-col flex-grow">
                                                <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-wider mb-3">
                                                    <Calendar className="w-3 h-3" /> {item.publishedAt ? formatDate(item.publishedAt) : "Recent"}
                                                </div>
                                                <h3 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-4 leading-none group-hover:text-brand-gold transition-colors line-clamp-2">
                                                    {item.title}
                                                </h3>
                                                <p className="font-lato text-brand-brown line-clamp-3 leading-relaxed opacity-80 mb-6 flex-grow">
                                                    {item.excerpt || "Click to read full story..."}
                                                </p>
                                                <span className="inline-flex items-center text-xs font-bold text-brand-brown-dark uppercase tracking-widest group-hover:underline decoration-brand-gold underline-offset-4 transition-all mt-auto">
                                                    Read Full Story <ArrowRight className="w-3 h-3 ml-2" />
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <p className="font-agency text-xl">No updates available at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4. MEDIA & EVENTS (Fully Dynamic) */}
                <section className="py-16 md:py-24 px-8 md:px-12 lg:px-24 bg-white">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-16">
                            
                            {/* VIDEO (Dynamic) - Spans 7 cols */}
                            <div className="xl:col-span-7 flex flex-col">
                                <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                                    <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">Latest Video</h2>
                                </div>
                                
                                {loadingData ? (
                                    <div className="w-full aspect-video bg-gray-100 rounded-3xl animate-pulse"></div>
                                ) : latestVideo ? (
                                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white flex-grow flex flex-col relative group">
                                        <div className="relative w-full aspect-video bg-black">
                                            {!playVideo ? (
                                                <button onClick={() => setPlayVideo(true)} className="absolute inset-0 w-full h-full relative group cursor-pointer">
                                                    {/* Fallback thumbnail logic */}
                                                    <Image 
                                                        src={latestVideo.thumbnail || `https://img.youtube.com/vi/${latestVideo.youtubeId}/maxresdefault.jpg`} 
                                                        alt="Video Thumbnail" 
                                                        fill 
                                                        className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" 
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-20 h-20 bg-brand-gold/90 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-brand-gold/20 backdrop-blur-sm">
                                                            <Play className="w-8 h-8 fill-current ml-1" />
                                                        </div>
                                                    </div>
                                                </button>
                                            ) : (
                                                <iframe 
                                                    className="absolute inset-0 w-full h-full" 
                                                    src={`https://www.youtube.com/embed/${latestVideo.youtubeId}?autoplay=1&rel=0`} 
                                                    title={latestVideo.title} 
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                    allowFullScreen
                                                ></iframe>
                                            )}
                                        </div>
                                        <div className="p-8 bg-brand-brown-dark text-white">
                                            <h3 className="font-agency text-2xl md:text-4xl mb-2">{latestVideo.title}</h3>
                                            <p className="font-lato text-white/70 line-clamp-2">{latestVideo.description || "Watch our latest lecture."}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full aspect-video bg-gray-50 rounded-3xl flex items-center justify-center border border-dashed border-gray-200">
                                        <p className="font-agency text-gray-400 text-xl">No videos published yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* EVENTS & AUDIOS SIDEBAR (Dynamic) - Spans 5 cols */}
                            <div className="xl:col-span-5 flex flex-col gap-10">
                                
                                {/* A) UPCOMING EVENTS */}
                                <div>
                                    <div className="flex justify-between items-end mb-6">
                                        <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">Upcoming Events</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {loadingData ? (
                                            [1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>)
                                        ) : upcomingEvents.length > 0 ? (
                                            upcomingEvents.map((event) => (
                                                <div key={event.id} className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-brand-gold hover:shadow-lg transition-all flex gap-4 group cursor-pointer">
                                                    <div className="flex flex-col items-center justify-center px-4 bg-brand-sand/30 rounded-xl text-brand-brown-dark min-w-[80px]">
                                                        <span className="font-agency text-3xl font-bold leading-none">
                                                            {event.date?.toDate ? event.date.toDate().getDate() : '—'}
                                                        </span>
                                                        <span className="text-xs font-bold uppercase tracking-widest">
                                                            {event.date?.toDate ? event.date.toDate().toLocaleString('default', { month: 'short' }) : 'Pending'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h3 className="font-agency text-xl text-brand-brown-dark leading-tight mb-1 group-hover:text-brand-gold transition-colors">
                                                            {event.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-lato mt-2">
                                                            {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
                                                            {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                                                <p className="font-agency text-gray-400 text-lg">No upcoming events scheduled.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* B) LATEST AUDIOS */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-end mb-6">
                                        <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">Recent Audio</h2>
                                        <Link href="/media/audios" className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">Full Library</Link>
                                    </div>
                                    <div className="space-y-3">
                                        {loadingData ? (
                                            [1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"></div>)
                                        ) : latestAudios.length > 0 ? (
                                            latestAudios.map((audio) => (
                                                <Link href={`/media/audios/play/${audio.id}`} key={audio.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:bg-brand-brown-dark hover:text-white group">
                                                    <div className="w-10 h-10 rounded-full bg-brand-sand flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-agency text-lg leading-none mb-1 truncate">{audio.title}</h4>
                                                        <p className="text-xs opacity-60 font-lato flex items-center gap-2">
                                                            <span>{audio.category || "General"}</span> • <span>{audio.duration || "Audio"}</span>
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-center text-gray-400 py-4 text-sm">No recent audios found.</div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
{/* 5. REDESIGNED ARABIC QUOTE SECTION */}
                <section className="py-24 px-6 text-center bg-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gold via-transparent to-transparent"></div>
                    <div className="max-w-5xl mx-auto relative z-10">
                        <div className="mb-12">
                            {/* Futuristic / Minimalist Arabic Quote */}
                            <h2 className="font-arabic text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark leading-[1.6] md:leading-[1.8] drop-shadow-sm mb-6 px-4" dir="rtl">
                                قل هل يستوي الذين يعلمون والذين لا يعلمون
                            </h2>
                            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto mb-8 rounded-full opacity-50"></div>
                            <p className="font-agency text-xl md:text-3xl text-brand-brown-dark/80 uppercase tracking-widest">
                                "Say, 'Are those who know equal to those who do not know?'"
                            </p>
                            <p className="font-lato text-brand-brown/60 text-sm mt-3 uppercase tracking-wider">
                                Surah Az-Zumar (39:9)
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. VISION & MISSION (Refined) */}
                <section className="relative py-20 md:py-32 px-8 md:px-12 lg:px-24 bg-brand-gold overflow-hidden">
                    <div className="absolute inset-0 mix-blend-overlay">
                        <Image src="/images/chairman/sheikh1.webp" alt="Background pattern overlay" fill className="object-cover opacity-10 grayscale" />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div className="text-center md:text-left md:border-r md:border-white/20 md:pr-16">
                                <h2 className="font-agency text-3xl md:text-5xl text-white mb-6">Vision Statement</h2>
                                <p className="font-lato text-xl md:text-2xl leading-relaxed text-white/90 font-light">
                                    To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
                                </p>
                            </div>
                            <div className="text-center md:text-left md:pl-8">
                                <h2 className="font-agency text-3xl md:text-5xl text-white mb-6">Mission Statement</h2>
                                <p className="font-lato text-xl md:text-2xl leading-relaxed text-white/90 font-light">
                                    Expanding access to knowledge through Qur'an-centered and community driven education.
                                </p>
                            </div>
                        </div>

                        {/* Animated Stats/Icons */}
                        <div className="mt-24 max-w-5xl mx-auto border-t border-white/20 pt-16">
                            <div className="grid grid-cols-3 gap-8">
                                <div className="flex flex-col items-center group cursor-default">
                                    <div className="w-20 h-20 md:w-28 md:h-28 mb-6 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                        <GraduationCap className="w-10 h-10 md:w-14 md:h-14 text-white group-hover:text-brand-gold transition-colors duration-300" strokeWidth={1.5} />
                                    </div>
                                    <span className="font-agency text-lg md:text-2xl text-white tracking-wide text-center uppercase opacity-80 group-hover:opacity-100">Educational<br/> Support</span>
                                </div>
                                <div className="flex flex-col items-center group cursor-default">
                                    <div className="w-20 h-20 md:w-28 md:h-28 mb-6 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                        <HandHeart className="w-10 h-10 md:w-14 md:h-14 text-white group-hover:text-brand-gold transition-colors duration-300" strokeWidth={1.5} />
                                    </div>
                                    <span className="font-agency text-lg md:text-2xl text-white tracking-wide text-center uppercase opacity-80 group-hover:opacity-100">Community<br/> Development</span>
                                </div>
                                <div className="flex flex-col items-center group cursor-default">
                                    <div className="w-20 h-20 md:w-28 md:h-28 mb-6 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                        <Lightbulb className="w-10 h-10 md:w-14 md:h-14 text-white group-hover:text-brand-gold transition-colors duration-300" strokeWidth={1.5} />
                                    </div>
                                    <span className="font-agency text-lg md:text-2xl text-white tracking-wide text-center uppercase opacity-80 group-hover:opacity-100">Training &<br/> Innovation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. NEWSLETTER / CONNECT */}
                <section className="py-20 md:py-32 px-8 md:px-12 lg:px-24 bg-brand-brown-dark text-white text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-gold rounded-full mix-blend-overlay filter blur-[120px] opacity-10"></div>
                    
                    <div className="max-w-3xl mx-auto relative z-10">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                            <svg className="w-10 h-10 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h2 className="font-agency text-4xl md:text-7xl mb-6 tracking-tight">Stay Connected</h2>
                        <p className="font-lato text-white/70 text-lg md:text-xl mb-12 leading-relaxed">
                            Subscribe to our newsletter to receive updates on lectures, community programs, and opportunities to get involved.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative group">
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="flex-grow px-8 py-5 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white/10 transition-all backdrop-blur-sm" 
                            />
                            <button 
                                type="button" 
                                className="px-10 py-5 rounded-full bg-brand-gold text-white font-agency text-xl hover:bg-white hover:text-brand-brown-dark transition-all shadow-xl shadow-brand-gold/20 hover:shadow-white/20 whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                        <p className="text-xs text-white/30 mt-8 uppercase tracking-widest">No spam, ever. Unsubscribe anytime.</p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
