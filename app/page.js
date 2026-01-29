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
    Play, ArrowRight, Calendar, Clock, Download, ChevronRight,
    ClipboardList, MonitorPlay, Newspaper, Users, MapPin,
    GraduationCap, HandHeart, Lightbulb, Mic, Layers
} from 'lucide-react'; 

export default function HomePage() {
    // --- UI State ---
    const [showSplash, setShowSplash] = useState(false); // Default to false, check logic first
    const [fadeOut, setFadeOut] = useState(false);
    
    // --- Data State ---
    const [latestUpdates, setLatestUpdates] = useState([]);
    const [latestAudios, setLatestAudios] = useState([]);
    const [latestVideo, setLatestVideo] = useState(null);
    const [latestPodcast, setLatestPodcast] = useState(null);
    const [featuredProgram, setFeaturedProgram] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. Smart Splash Logic ---
    useEffect(() => {
        const checkSplashLogic = () => {
            const lastActive = localStorage.getItem('lastActiveTime');
            const sessionActive = sessionStorage.getItem('sessionActive');
            const now = Date.now();
            const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

            let shouldShow = false;

            // Scenario A: First time in this tab session
            if (!sessionActive) {
                shouldShow = true;
                sessionStorage.setItem('sessionActive', 'true');
            } 
            // Scenario B: Inactivity timeout exceeded
            else if (lastActive && (now - parseInt(lastActive) > INACTIVITY_LIMIT)) {
                shouldShow = true;
            }

            // Update activity timestamp
            localStorage.setItem('lastActiveTime', now.toString());

            if (shouldShow) {
                setShowSplash(true);
                const timer1 = setTimeout(() => setFadeOut(true), 3500);
                const timer2 = setTimeout(() => setShowSplash(false), 4200);
                return () => { clearTimeout(timer1); clearTimeout(timer2); };
            }
        };

        // Run check
        checkSplashLogic();

        // Add activity listener to update timestamp
        const updateActivity = () => localStorage.setItem('lastActiveTime', Date.now().toString());
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);
        
        return () => {
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('scroll', updateActivity);
        };
    }, []);

    // --- 2. Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // A) Updates (Articles & News)
                const articlesQuery = query(collection(db, 'articles'), where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(3));
                const newsQuery = query(collection(db, 'news'), where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(3));
                
                // B) Media 
                const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(1));
                const podcastsQuery = query(collection(db, 'podcasts'), orderBy('createdAt', 'desc'), limit(1));
                const audiosQuery = query(collection(db, 'audios'), orderBy('createdAt', 'desc'), limit(3));

                // C) Programs (Active)
                const programQuery = query(collection(db, 'programs'), where('status', '==', 'Active'), orderBy('createdAt', 'desc'), limit(1));

                // D) Events
                const eventsQuery = query(collection(db, 'events'), where('status', '==', 'Upcoming'), orderBy('date', 'asc'), limit(3));

                // Execute all fetches
                const [articlesSnap, newsSnap, videosSnap, podcastsSnap, audiosSnap, programSnap, eventsSnap] = await Promise.all([
                    getDocs(articlesQuery),
                    getDocs(newsQuery),
                    getDocs(videosQuery),
                    getDocs(podcastsQuery),
                    getDocs(audiosQuery),
                    getDocs(programQuery),
                    getDocs(eventsQuery)
                ]);

                // --- PROCESS UPDATES ---
                const articlesData = articlesSnap.docs.map(doc => ({
                    id: doc.id,
                    type: 'article', 
                    displayCategory: 'Article',
                    image: doc.data().featuredImage, 
                    date: doc.data().createdAt,
                    ...doc.data()
                }));

                const newsData = newsSnap.docs.map(doc => ({
                    id: doc.id,
                    type: 'news', 
                    displayCategory: 'News',
                    title: doc.data().headline, 
                    excerpt: doc.data().shortDescription, 
                    image: doc.data().featuredImage,
                    date: doc.data().createdAt,
                    ...doc.data()
                }));

                const combinedUpdates = [...articlesData, ...newsData]
                    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))
                    .slice(0, 3);
                setLatestUpdates(combinedUpdates);

                // --- PROCESS MEDIA ---
                if (!videosSnap.empty) setLatestVideo({ id: videosSnap.docs[0].id, ...videosSnap.docs[0].data() });
                if (!podcastsSnap.empty) setLatestPodcast({ id: podcastsSnap.docs[0].id, ...podcastsSnap.docs[0].data() });
                setLatestAudios(audiosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // --- PROCESS PROGRAM ---
                if (!programSnap.empty) setFeaturedProgram({ id: programSnap.docs[0].id, ...programSnap.docs[0].data() });

                // --- PROCESS EVENTS ---
                setUpcomingEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- HELPERS ---
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    const formatDayMonth = (timestamp) => {
        if (!timestamp) return { day: '01', month: 'JAN' };
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        };
    };

    const formatSimpleDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleDownload = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        if (url) window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            {showSplash && (
                <div className={`fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex items-center justify-center transition-opacity duration-700 ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-full max-w-md p-8"><LogoReveal /></div>
                </div>
            )}
            <Header />
            <main className="flex-grow">
                {/* 1. HERO SECTION (Static) */}
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

                {/* 2. ICON NAVIGATION */}
                <section className="py-8 md:py-16 px-6 bg-white relative z-20 -mt-6 md:-mt-0 rounded-t-3xl md:rounded-none">
                     <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-4 gap-3 md:gap-12 justify-items-center">
                            <Link href="/programs" className="flex flex-col items-center group cursor-pointer"><div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#F0E4D4] flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-gold shadow-sm"><ClipboardList className="w-7 h-7 md:w-10 md:h-10 text-brand-brown-dark group-hover:text-white transition-colors" strokeWidth={1.5} /></div><span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">Programs</span></Link>
                            <Link href="/media" className="flex flex-col items-center group cursor-pointer"><div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#F0E4D4] flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-gold shadow-sm"><MonitorPlay className="w-7 h-7 md:w-10 md:h-10 text-brand-brown-dark group-hover:text-white transition-colors" strokeWidth={1.5} /></div><span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">Media</span></Link>
                            <Link href="/blogs" className="flex flex-col items-center group cursor-pointer"><div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#F0E4D4] flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-gold shadow-sm"><Newspaper className="w-7 h-7 md:w-10 md:h-10 text-brand-brown-dark group-hover:text-white transition-colors" strokeWidth={1.5} /></div><span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">Blogs</span></Link>
                            <Link href="/about" className="flex flex-col items-center group cursor-pointer"><div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#F0E4D4] flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-gold shadow-sm"><Users className="w-7 h-7 md:w-10 md:h-10 text-brand-brown-dark group-hover:text-white transition-colors" strokeWidth={1.5} /></div><span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">About</span></Link>
                        </div>
                    </div>
                </section>
                
                <section className="md:hidden py-2 px-8 flex justify-center pb-8">
                    <Link href="/get-involved/donate" className="w-full max-w-xs py-3 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">Make a Donation</Link>
                </section>

                {/* 4. LATEST UPDATES */}
                <section className="py-12 md:py-20 px-6 bg-brand-sand/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 border-b border-brand-brown-dark/5 pb-4">
                            <h2 className="font-agency text-3xl text-brand-brown-dark tracking-wide">Latest Updates</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />)
                            ) : latestUpdates.length > 0 ? (
                                latestUpdates.map((item) => {
                                    const dateObj = formatDayMonth(item.date);
                                    const readUrl = item.type === 'news' ? `/blogs/news` : `/blogs/read/${item.id}?type=${item.type}`;
                                    const titleDir = getDir(item.title);
                                    const excerptDir = getDir(item.excerpt);
                                    
                                    return (
                                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
                                            <Link href={readUrl} className="block flex-grow flex flex-col">
                                                <div className="relative w-full h-52 overflow-hidden">
                                                    {item.image ? (
                                                        <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-agency">No Image</div>
                                                    )}
                                                    {/* Badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <span className="bg-brand-brown-dark/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
                                                            {item.category || item.displayCategory || "Update"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-6 flex flex-col flex-grow">
                                                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                                                        <Calendar className="w-3 h-3" /> 
                                                        <span>{dateObj.day} {dateObj.month}</span>
                                                    </div>
                                                    
                                                    <h3 className={`text-xl font-bold text-brand-brown-dark mb-3 leading-tight group-hover:text-brand-gold transition-colors ${titleDir === 'rtl' ? 'font-tajawal text-right' : 'font-agency text-left'}`} dir={titleDir}>
                                                        {item.title}
                                                    </h3>
                                                    
                                                    <p className={`text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4 flex-grow ${excerptDir === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`} dir={excerptDir}>
                                                        {item.excerpt || "Click to read more details..."}
                                                    </p>
                                                    
                                                    <div className="mt-auto border-t border-gray-50 pt-4">
                                                        <span className="inline-flex items-center text-xs font-bold text-brand-gold uppercase tracking-widest group-hover:underline">
                                                            Read More <ArrowRight className="w-3 h-3 ml-1" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="col-span-3 text-center text-gray-400 font-agency text-xl">No updates available at the moment.</p>
                            )}
                        </div>

                        {/* Full Width View All Button */}
                        <Link href="/blogs" className="block w-full py-4 rounded-xl border border-dashed border-brand-brown-dark/20 text-center text-brand-brown-dark font-agency text-lg hover:bg-white hover:border-solid hover:shadow-md transition-all">
                            View All Updates
                        </Link>
                    </div>
                </section>
                {/* 5. LATEST PROGRAM (Heading Update Only) */}
                <section className="py-12 px-6 bg-white border-b border-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 border-b border-brand-brown-dark/5 pb-4 flex justify-between items-end">
                            <h2 className="font-agency text-3xl text-brand-brown-dark tracking-wide">Active Program</h2>
                        </div>
                        {loading ? (
                            <div className="w-full h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
                        ) : featuredProgram ? (
                            <div className="relative rounded-3xl overflow-hidden shadow-xl group">
                                <div className="absolute inset-0">
                                    <Image src={featuredProgram.coverImage || "/hero.jpg"} alt={featuredProgram.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
                                </div>
                                <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-end md:justify-center max-w-3xl">
                                    <span className="inline-block px-3 py-1 bg-brand-gold text-white text-[10px] md:text-xs font-bold uppercase rounded shadow-sm w-fit mb-4">
                                        {featuredProgram.category}
                                    </span>
                                    <h3 className={`text-3xl md:text-5xl text-white mb-4 leading-tight ${getDir(featuredProgram.title) === 'rtl' ? 'font-tajawal font-bold text-right' : 'font-agency text-left'}`} dir={getDir(featuredProgram.title)}>
                                        {featuredProgram.title}
                                    </h3>
                                    <p className={`text-white/90 text-sm md:text-lg mb-8 leading-relaxed max-w-xl ${getDir(featuredProgram.excerpt) === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`} dir={getDir(featuredProgram.excerpt)}>
                                        {featuredProgram.excerpt}
                                    </p>
                                    <Link href={`/programs/${featuredProgram.id}`} className="px-8 py-3 bg-white text-brand-brown-dark font-bold rounded-full hover:bg-brand-gold hover:text-white transition-all w-fit">
                                        View Program Details
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-3xl">
                                <p className="text-gray-400">No active programs found.</p>
                            </div>
                        )}
                        <Link href="/programs" className="block w-full mt-8 py-4 rounded-xl border border-dashed border-brand-brown-dark/20 text-center text-brand-brown-dark font-agency text-lg hover:bg-gray-50 hover:border-solid transition-all">
                            View All Programs
                        </Link>
                    </div>
                </section>

                {/* 6. MEDIA PREVIEWS */}
                <section className="py-12 md:py-20 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 border-b border-brand-brown-dark/5 pb-4">
                            <h2 className="font-agency text-3xl text-brand-brown-dark tracking-wide">Latest Media</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* LEFT: Video & Podcast Cards */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 1. Video Card */}
                                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
                                    {latestVideo ? (
                                        <>
                                            <div className="relative aspect-video bg-black">
                                                <Link href={`/media/videos/${latestVideo.id}`} className="block w-full h-full relative">
                                                    {latestVideo.thumbnail && (
                                                        <Image src={latestVideo.thumbnail} alt={latestVideo.title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                    <div className="absolute top-3 left-3 z-10">
                                                        <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1">
                                                            <Play className="w-3 h-3 fill-current" /> Video
                                                        </span>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-brand-gold transition-colors shadow-lg border border-white/30">
                                                            <Play className="w-6 h-6 text-white fill-current ml-1" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="p-6 flex flex-col flex-grow">
                                                <h3 className={`text-xl font-bold text-brand-brown-dark mb-3 leading-tight ${getDir(latestVideo.title) === 'rtl' ? 'font-tajawal text-right' : 'font-agency text-left'}`} dir={getDir(latestVideo.title)}>
                                                    {latestVideo.title}
                                                </h3>
                                                <p className={`text-sm text-gray-600 line-clamp-2 mb-4 flex-grow ${getDir(latestVideo.description) === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`} dir={getDir(latestVideo.description)}>
                                                    {latestVideo.description}
                                                </p>
                                                <Link href={`/media/videos/${latestVideo.id}`} className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1 mt-auto">Watch Now <ChevronRight className="w-3 h-3"/></Link>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 p-8">No videos yet</div>
                                    )}
                                </div>

                                {/* 2. Podcast Card */}
                                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
                                    {latestPodcast ? (
                                        <>
                                            <div className="relative aspect-video bg-gray-900">
                                                <Link href={`/media/podcasts/play/${latestPodcast.id}`} className="block w-full h-full relative">
                                                    {latestPodcast.thumbnail && (
                                                        <Image src={latestPodcast.thumbnail} alt={latestPodcast.title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                    <div className="absolute top-3 left-3 z-10">
                                                        <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1">
                                                            <Mic className="w-3 h-3" /> Podcast
                                                        </span>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-brand-gold transition-colors shadow-lg border border-white/30">
                                                            <Mic className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                            <div className="p-6 flex flex-col flex-grow">
                                                <h3 className={`text-xl font-bold text-brand-brown-dark mb-3 leading-tight ${getDir(latestPodcast.title) === 'rtl' ? 'font-tajawal text-right' : 'font-agency text-left'}`} dir={getDir(latestPodcast.title)}>
                                                    {latestPodcast.title}
                                                </h3>
                                                <p className={`text-sm text-gray-600 line-clamp-2 mb-4 flex-grow ${getDir(latestPodcast.description) === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`} dir={getDir(latestPodcast.description)}>
                                                    {latestPodcast.description}
                                                </p>
                                                <Link href={`/media/podcasts/play/${latestPodcast.id}`} className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1 mt-auto">Listen Now <ChevronRight className="w-3 h-3"/></Link>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 p-8">No podcasts yet</div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT: Audio List (Improved) */}
                            <div className="lg:col-span-1 flex flex-col h-full">
                                <div className="bg-brand-sand/30 rounded-2xl p-6 border border-brand-gold/10 h-full flex flex-col">
                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-brand-gold rounded-full"></div> Latest Audios
                                    </h3>
                                    <div className="space-y-4 flex-grow">
                                        {loading ? (
                                            [1, 2].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)
                                        ) : latestAudios.length > 0 ? (
                                            latestAudios.map((audio) => (
                                                <Link 
                                                    href={`/media/audios/play/${audio.id}`} 
                                                    key={audio.id} 
                                                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-brand-gold/30 hover:shadow-md transition-all flex items-center gap-3 group relative"
                                                >
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                        <Play className="w-4 h-4 fill-current" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        {audio.series && (
                                                            <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider truncate mb-0.5">{audio.series}</p>
                                                        )}
                                                        <h4 className={`text-sm font-bold text-brand-brown-dark leading-tight truncate ${getDir(audio.title) === 'rtl' ? 'font-tajawal text-right' : 'font-lato text-left'}`} dir={getDir(audio.title)}>
                                                            {audio.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 rounded">{audio.duration || "N/A"}</span>
                                                            {audio.fileSize && <span className="text-[10px] text-gray-400">{audio.fileSize}</span>}
                                                        </div>
                                                    </div>
                                                    {/* Direct Download Button */}
                                                    {audio.audioUrl && (
                                                        <button 
                                                            onClick={(e) => handleDownload(e, audio.audioUrl)}
                                                            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-brown-dark hover:text-white transition-colors z-20"
                                                            title="Download MP3"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm text-center py-4">No audios available.</p>
                                        )}
                                    </div>
                                    <Link href="/media/audios" className="mt-6 block w-full py-3 bg-white border border-gray-200 text-brand-brown-dark font-bold text-xs uppercase tracking-widest text-center rounded-xl hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-colors">
                                        Open Audio Library
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Full Width Media View All */}
                        <Link href="/media" className="block w-full mt-8 py-4 rounded-xl border border-dashed border-brand-brown-dark/20 text-center text-brand-brown-dark font-agency text-lg hover:bg-gray-50 hover:border-solid transition-all">
                            View All Media Resources
                        </Link>
                    </div>
                </section>

                {/* 7. UPCOMING EVENTS */}
                <section className="py-12 md:py-20 px-6 bg-brand-sand/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 border-b border-brand-brown-dark/5 pb-4">
                            <h2 className="font-agency text-3xl text-brand-brown-dark tracking-wide">Upcoming Events</h2>
                        </div>
                        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="min-w-[280px] h-64 bg-gray-100 rounded-2xl animate-pulse"></div>)
                            ) : upcomingEvents.length > 0 ? (
                                upcomingEvents.map(event => (
                                    <div key={event.id} className="min-w-[280px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 flex flex-col transition-all">
                                        <div className="bg-brand-brown-dark text-white text-center py-3 font-agency text-xl tracking-widest">
                                            {formatSimpleDate(event.date).toUpperCase()}
                                        </div>
                                        <div className="p-8 flex-grow flex flex-col justify-center text-center">
                                            <h3 className={`text-2xl text-brand-brown-dark mb-3 line-clamp-2 ${getDir(event.title) === 'rtl' ? 'font-tajawal font-bold' : 'font-agency'}`} dir={getDir(event.title)}>
                                                {event.title}
                                            </h3>
                                            <div className="w-12 h-1 bg-brand-gold/30 mx-auto mb-4 rounded-full"></div>
                                            <p className={`text-sm text-gray-500 mb-6 px-2 line-clamp-3 ${getDir(event.description) === 'rtl' ? 'font-arabic' : 'font-lato'}`} dir={getDir(event.description)}>
                                                {event.description}
                                            </p>
                                            <div className="mt-auto">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-gold uppercase tracking-widest border border-brand-gold/30 rounded-full px-4 py-2 mx-auto">
                                                    <MapPin className="w-3 h-3" /> {event.location ? event.location.split(' ')[0] : 'View Details'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400">No events scheduled at this time.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                {/* 8. VISION AND MISSION (Glassmorphic + Fluid Icons) */}
                <section className="relative py-20 px-6 bg-brand-gold overflow-hidden">
                    <div className="absolute inset-0 mix-blend-overlay">
                        <Image src="/images/chairman/sheikh1.webp" alt="Background pattern overlay" fill className="object-cover opacity-20" />
                    </div>
                    <div className="relative z-10 max-w-6xl mx-auto">
                        
                        {/* Cards Container - Glass Effect */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            {/* Vision Card */}
                            <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/20 transform hover:-translate-y-1 transition-transform duration-300">
                                <h2 className="font-agency text-3xl text-white mb-4 flex items-center gap-3">
                                    <span className="w-8 h-1 bg-white/50 rounded-full"></span> Vision
                                </h2>
                                <p className="font-lato text-lg leading-relaxed text-white/90">
                                    To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
                                </p>
                            </div>

                            {/* Mission Card */}
                            <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/20 transform hover:-translate-y-1 transition-transform duration-300">
                                <h2 className="font-agency text-3xl text-white mb-4 flex items-center gap-3">
                                    <span className="w-8 h-1 bg-white/50 rounded-full"></span> Mission
                                </h2>
                                <p className="font-lato text-lg leading-relaxed text-white/90">
                                    Expanding access to knowledge through Qur'an-centered and community driven education that nurtures both mind and soul.
                                </p>
                            </div>
                        </div>

                        {/* Responsive Fluid Icons Layout */}
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
                            <Link href="/programs/educational-support" className="flex flex-col items-center group cursor-pointer w-24 md:w-32">
                                <div className="w-16 h-16 md:w-20 md:h-20 mb-3 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-brand-gold text-white border border-white/30 shadow-lg">
                                    <GraduationCap className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} />
                                </div>
                                <span className="font-agency text-xs md:text-sm text-white tracking-wide text-center uppercase font-bold opacity-80 group-hover:opacity-100">Educational<br/> Support</span>
                            </Link>

                            <Link href="/programs/community-development" className="flex flex-col items-center group cursor-pointer w-24 md:w-32">
                                <div className="w-16 h-16 md:w-20 md:h-20 mb-3 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-brand-gold text-white border border-white/30 shadow-lg">
                                    <HandHeart className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} />
                                </div>
                                <span className="font-agency text-xs md:text-sm text-white tracking-wide text-center uppercase font-bold opacity-80 group-hover:opacity-100">Community<br/> Development</span>
                            </Link>

                            <Link href="/programs/training-and-innovation" className="flex flex-col items-center group cursor-pointer w-24 md:w-32">
                                <div className="w-16 h-16 md:w-20 md:h-20 mb-3 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-brand-gold text-white border border-white/30 shadow-lg">
                                    <Lightbulb className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.5} />
                                </div>
                                <span className="font-agency text-xs md:text-sm text-white tracking-wide text-center uppercase font-bold opacity-80 group-hover:opacity-100">Training &<br/> Innovation</span>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="py-16 px-6 text-center bg-white">
                    <div className="max-w-3xl mx-auto bg-white border border-brand-gold/20 rounded-3xl shadow-sm p-10 md:p-14 relative overflow-hidden">
                        <div className="absolute top-6 left-6 text-6xl text-brand-sand/60 font-serif leading-none">“</div>
                        <div className="absolute bottom-6 right-6 text-6xl text-brand-sand/60 font-serif leading-none">”</div>
                        <div className="relative z-10">
                            <h2 className="font-arabic text-3xl md:text-5xl text-brand-gold leading-relaxed mb-6 drop-shadow-sm dir-rtl">
                                قل هل يستوي الذين يعلمون والذين لا يعلمون
                            </h2>
                            <p className="font-agency text-lg md:text-2xl text-brand-brown-dark/90 uppercase tracking-wider mb-3">"Say, 'Are those who know equal to those who do not know?'"</p>
                            <div className="w-16 h-0.5 bg-brand-gold/30 mx-auto mb-3"></div>
                            <p className="font-lato text-brand-brown/70 text-xs md:text-sm italic">— The Holy Qur'an, Surah Az-Zumar (39:9)</p>
                        </div>
                    </div>
                    <div className="mt-12">
                        <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark leading-tight max-w-3xl mx-auto">Join us in building a future shaped by knowledge and faith.</h2>
                    </div>
                </section>

                <section className="py-16 md:py-24 px-6 bg-brand-brown-dark text-white text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold">
                            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h2 className="font-agency text-3xl md:text-5xl mb-4">Stay Connected</h2>
                        <p className="font-lato text-white/80 text-sm md:text-lg mb-10 leading-relaxed max-w-xl mx-auto">Subscribe to our newsletter to receive updates on lectures, community programs, and opportunities to get involved.</p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input type="email" placeholder="Enter your email address" className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white/20 transition-all text-sm md:text-base" />
                            <button type="button" className="px-10 py-4 rounded-full bg-brand-gold text-white font-bold text-sm md:text-base uppercase tracking-wider hover:bg-white hover:text-brand-brown-dark transition-colors shadow-lg whitespace-nowrap">Subscribe</button>
                        </form>
                        <p className="text-[10px] text-white/40 mt-6">We respect your privacy. No spam, ever.</p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
