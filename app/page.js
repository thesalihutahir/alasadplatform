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
    GraduationCap, HandHeart, Lightbulb, Mic
} from 'lucide-react'; 

export default function HomePage() {
    // --- UI State ---
    const [showSplash, setShowSplash] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    
    // --- Data State ---
    const [latestUpdates, setLatestUpdates] = useState([]);
    const [latestAudios, setLatestAudios] = useState([]);
    const [latestVideo, setLatestVideo] = useState(null);
    const [latestPodcast, setLatestPodcast] = useState(null);
    const [featuredProgram, setFeaturedProgram] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. Splash Screen Timer ---
    useEffect(() => {
        const timer1 = setTimeout(() => setFadeOut(true), 3500);
        const timer2 = setTimeout(() => setShowSplash(false), 4200);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // --- 2. Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // A) Updates (Articles & News)
                // Note: Based on upload page, 'articles' has 'status' and 'createdAt'. 'news' has 'status' and 'createdAt'.
                const articlesQuery = query(collection(db, 'articles'), where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(3));
                const newsQuery = query(collection(db, 'news'), where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(3));
                
                // B) Media (Videos, Podcasts, Audios)
                const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(1));
                const podcastsQuery = query(collection(db, 'podcasts'), orderBy('createdAt', 'desc'), limit(1));
                // Note: Audios upload page doesn't seem to have a 'status' field in formData, assuming all are valid or check your rules
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
                // Mapping based on upload page fields: 'featuredImage' is the image field for both
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
                    title: doc.data().headline, // News uses 'headline'
                    excerpt: doc.data().shortDescription, // News uses 'shortDescription'
                    image: doc.data().featuredImage,
                    date: doc.data().createdAt,
                    ...doc.data()
                }));

                // Combine & Sort
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

    // Helper: Format Date
    const formatDayMonth = (timestamp) => {
        if (!timestamp) return { day: '01', month: 'JAN' };
        // Handle Firestore Timestamp vs Date String
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

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            
            {/* --- SPLASH SCREEN --- */}
            {showSplash && (
                <div className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-700 ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
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
                
                {/* 3. MOBILE ACTION */}
                <section className="md:hidden py-2 px-8 flex justify-center pb-8">
                    <Link href="/get-involved/donate" className="w-full max-w-xs py-3 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">Make a Donation</Link>
                </section>

                {/* 4. LATEST UPDATES (Dynamic Articles + News) */}
                <section className="py-12 md:py-20 px-6 bg-brand-sand/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-8 md:mb-12">
                            <h2 className="font-agency text-2xl md:text-5xl text-brand-brown-dark">Latest Updates</h2>
                            <Link href="/blogs" className="text-xs md:text-sm font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />)
                            ) : latestUpdates.length > 0 ? (
                                latestUpdates.map((item) => {
                                    const dateObj = formatDayMonth(item.date);
                                    // Construct Link: Articles go to read page, News to general news or specific? Assuming /blogs/read logic works for both if ID is valid
                                    const readUrl = item.type === 'news' ? `/blogs/news` : `/blogs/read/${item.id}`; // Simple fallback
                                    
                                    return (
                                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md group border border-transparent hover:border-brand-gold/20 transition-all hover:shadow-xl flex flex-col h-full">
                                            <Link href={readUrl} className="block flex-grow">
                                                <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-200">
                                                    {item.image ? (
                                                        <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-agency">No Image</div>
                                                    )}
                                                    <div className="absolute top-0 left-0 bg-brand-gold text-white py-1 px-3 rounded-br-lg font-agency text-sm z-10 shadow-sm uppercase">
                                                        {dateObj.day} {dateObj.month}
                                                    </div>
                                                </div>
                                                <div className="p-6 flex flex-col h-full">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="font-lato text-[10px] font-bold text-brand-gold uppercase tracking-wider bg-brand-gold/10 px-2 py-0.5 rounded-full">
                                                            {item.category || item.displayCategory || "Update"}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-agency text-xl md:text-2xl text-brand-brown-dark mb-3 leading-tight group-hover:text-brand-gold transition-colors line-clamp-2">
                                                        {item.title}
                                                    </h3>
                                                    <p className="font-lato text-sm text-brand-brown line-clamp-3 leading-relaxed opacity-80 mb-4 flex-grow">
                                                        {item.excerpt || "Click to read more details..."}
                                                    </p>
                                                    <span className="inline-flex items-center text-xs font-bold text-brand-brown-dark uppercase tracking-widest group-hover:text-brand-gold transition-colors mt-auto">
                                                        Read Full Story <ArrowRight className="w-3 h-3 ml-1" />
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="col-span-3 text-center text-gray-400 font-agency text-xl">No updates available at the moment.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* 5. LATEST PROGRAM (Dynamic) */}
                <section className="py-12 px-6 bg-white border-b border-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="font-agency text-2xl md:text-5xl text-brand-brown-dark">Active Program</h2>
                            <Link href="/programs" className="text-xs md:text-sm font-bold text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
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
                                    <h3 className="font-agency text-3xl md:text-5xl text-white mb-4 leading-tight">{featuredProgram.title}</h3>
                                    <p className="font-lato text-white/90 text-sm md:text-lg mb-8 leading-relaxed max-w-xl">{featuredProgram.excerpt}</p>
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
                    </div>
                </section>

                {/* 6. MEDIA PREVIEWS (Dynamic Video & Podcast Split) */}
                <section className="py-12 md:py-20 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            
                            {/* LEFT: LATEST VIDEO & PODCAST (Side by Side) */}
                            <div className="lg:col-span-2 flex flex-col gap-8">
                                <div className="flex justify-between items-end">
                                    <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">Latest Media</h2>
                                    <Link href="/media" className="lg:hidden text-xs font-bold text-brand-gold uppercase tracking-widest">View All</Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                    {/* 1. Latest Video */}
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                                        {latestVideo ? (
                                            <>
                                                <div className="relative aspect-video bg-black group">
                                                    <Link href={`/media/videos/${latestVideo.id}`} className="absolute inset-0">
                                                        {latestVideo.thumbnail && (
                                                            <Image src={latestVideo.thumbnail} alt={latestVideo.title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-brand-gold transition-colors">
                                                                <Play className="w-5 h-5 text-white fill-current" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                                <div className="p-5 flex-grow flex flex-col">
                                                    <span className="text-[10px] font-bold text-brand-gold uppercase mb-2">Latest Video</span>
                                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-tight line-clamp-2">{latestVideo.title}</h3>
                                                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-grow">{latestVideo.description}</p>
                                                    <Link href="/media/videos" className="text-xs font-bold text-brand-brown-dark hover:text-brand-gold transition-colors flex items-center gap-1">Watch More <ChevronRight className="w-3 h-3"/></Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 p-8 text-center">No videos yet</div>
                                        )}
                                    </div>

                                    {/* 2. Latest Podcast */}
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                                        {latestPodcast ? (
                                            <>
                                                <div className="relative aspect-video bg-gray-900 group">
                                                    <Link href={`/media/podcasts/play/${latestPodcast.id}`} className="absolute inset-0">
                                                        {latestPodcast.thumbnail && (
                                                            <Image src={latestPodcast.thumbnail} alt={latestPodcast.title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                                <Mic className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                                <div className="p-5 flex-grow flex flex-col">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase mb-2">Latest Podcast</span>
                                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-tight line-clamp-2">{latestPodcast.title}</h3>
                                                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-grow">{latestPodcast.description}</p>
                                                    <Link href="/media/podcasts" className="text-xs font-bold text-brand-brown-dark hover:text-brand-gold transition-colors flex items-center gap-1">Listen to Series <ChevronRight className="w-3 h-3"/></Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 p-8 text-center">No podcasts yet</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: LATEST AUDIOS (Dynamic) */}
                            <div className="lg:col-span-1">
                                <div className="flex justify-between items-end mb-6 mt-8 lg:mt-0">
                                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">Latest Audios</h2>
                                    <Link href="/media/audios" className="text-xs md:text-sm font-bold text-brand-gold uppercase tracking-widest hover:underline">View Library</Link>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        [1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)
                                    ) : latestAudios.length > 0 ? (
                                        latestAudios.map((audio) => (
                                            <div key={audio.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg group">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-gold text-white flex items-center justify-center shadow-sm cursor-pointer group-hover:bg-brand-brown-dark transition-colors">
                                                    <Play className="w-5 h-5 ml-1 fill-current" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{audio.category || "Audio"}</span>
                                                    </div>
                                                    <h3 className="font-agency text-lg text-brand-brown-dark leading-tight truncate group-hover:text-brand-gold transition-colors">{audio.title}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        {audio.fileSize && (
                                                            <p className="text-[10px] text-gray-500 font-lato">{audio.fileSize}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 text-gray-300 hover:text-brand-gold cursor-pointer transition-colors px-1">
                                                    <Download className="w-5 h-5" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 font-lato text-sm">No recent audios found.</p>
                                    )}
                                    <div className="hidden lg:block pt-4">
                                        <Link href="/media/audios" className="block w-full py-3 text-center border-2 border-brand-brown-dark/10 text-brand-brown-dark font-agency text-lg rounded-xl hover:bg-brand-brown-dark hover:text-white transition-colors">Explore Audio Playlists</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 7. UPCOMING EVENTS (Dynamic) */}
                        <div className="mt-16 md:mt-24">
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="font-agency text-2xl md:text-5xl text-brand-brown-dark">Upcoming Events</h2>
                            </div>
                            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="min-w-[280px] h-64 bg-gray-100 rounded-2xl animate-pulse"></div>)
                                ) : upcomingEvents.length > 0 ? (
                                    upcomingEvents.map(event => (
                                        <div key={event.id} className="min-w-[280px] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col group hover:shadow-xl transition-all">
                                            <div className="bg-brand-brown-dark text-white text-center py-2 font-agency text-lg tracking-widest group-hover:bg-brand-gold transition-colors">
                                                {formatSimpleDate(event.date).toUpperCase()}
                                            </div>
                                            <div className="p-8 flex-grow flex flex-col justify-center text-center bg-brand-sand/10 group-hover:bg-brand-sand/30 transition-colors">
                                                <h3 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-3 line-clamp-2">{event.title}</h3>
                                                <p className="font-lato text-sm text-brand-brown mb-6 px-4 line-clamp-3">{event.description}</p>
                                                <div className="mt-auto">
                                                    <span className="text-xs font-bold text-brand-gold uppercase tracking-widest border border-brand-gold/30 rounded-full px-6 py-2 mx-auto">
                                                        {event.location ? event.location.split(' ')[0] : 'View Details'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-12 bg-gray-50 rounded-2xl">
                                        <p className="text-gray-400">No upcoming events scheduled at this time.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* PARTNERS */}
                        <div className="mt-16 pt-10 border-t border-gray-100">
                             <p className="text-center font-lato text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted Partners & Collaborators</p>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="w-12 h-12 rounded-full border-2 border-brand-brown-dark/30 bg-brand-sand/20"></div>
                                <div className="w-24 h-8 border-2 border-brand-brown-dark/30 bg-brand-sand/20 rounded"></div>
                                <div className="w-10 h-10 border-2 border-brand-brown-dark/30 bg-brand-sand/20 transform rotate-45"></div>
                                <div className="w-24 h-8 border-2 border-brand-brown-dark/30 bg-brand-sand/20 rounded"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. VISION AND MISSION & 9. QUOTE & 10. NEWSLETTER (Preserved) */}
                <section className="relative py-16 md:py-24 px-6 bg-brand-gold overflow-hidden">
                    <div className="absolute inset-0 mix-blend-overlay">
                        <Image src="/images/chairman/sheikh1.webp" alt="Background pattern overlay" fill className="object-cover opacity-20" />
                    </div>
                    <div className="relative z-10 max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="text-center md:text-left md:border-r md:border-white/20 md:pr-12">
                                <h2 className="font-agency text-2xl md:text-4xl text-white/90 mb-4">Vision Statement</h2>
                                <p className="font-lato text-lg md:text-xl leading-relaxed text-white">To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.</p>
                            </div>
                            <div className="text-center md:text-left md:pl-4">
                                <h2 className="font-agency text-2xl md:text-4xl text-white/90 mb-4">Mission Statement</h2>
                                <p className="font-lato text-lg md:text-xl leading-relaxed text-white">Expanding access to knowledge through Qur'an-centered and community driven education.</p>
                            </div>
                        </div>
                        <div className="mt-16 max-w-4xl mx-auto">
                            <div className="grid grid-cols-3 gap-8">
                                <div className="flex flex-col items-center group">
                                    <div className="w-16 h-16 md:w-24 md:h-24 mb-4 bg-white/10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"><GraduationCap className="w-8 h-8 md:w-12 md:h-12 text-white" strokeWidth={1.5} /></div>
                                    <span className="font-agency text-sm md:text-lg text-white tracking-wide leading-tight text-center">Educational<br/> Support</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <div className="w-16 h-16 md:w-24 md:h-24 mb-4 bg-white/10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"><HandHeart className="w-8 h-8 md:w-12 md:h-12 text-white" strokeWidth={1.5} /></div>
                                    <span className="font-agency text-sm md:text-lg text-white tracking-wide leading-tight text-center">Community<br/> Development</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <div className="w-16 h-16 md:w-24 md:h-24 mb-4 bg-white/10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"><Lightbulb className="w-8 h-8 md:w-12 md:h-12 text-white" strokeWidth={1.5} /></div>
                                    <span className="font-agency text-sm md:text-lg text-white tracking-wide leading-tight text-center">Training &<br/> Innovation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-16 px-6 text-center bg-white">
                    <div className="max-w-3xl mx-auto bg-white border border-brand-gold/20 rounded-2xl shadow-sm p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-4 left-4 text-6xl text-brand-sand/60 font-serif leading-none">“</div>
                        <div className="absolute bottom-4 right-4 text-6xl text-brand-sand/60 font-serif leading-none">”</div>
                        <div className="relative z-10">
                            <h2 className="font-arabic text-3xl md:text-5xl text-brand-gold leading-relaxed mb-6 drop-shadow-sm dir-rtl">
                                قل هل يستوي الذين يعلمون والذين لا يعلمون
                            </h2>
                            <p className="font-agency text-lg md:text-2xl text-brand-brown-dark/90 uppercase tracking-wider mb-2">"Say, 'Are those who know equal to those who do not know?'"</p>
                            <p className="font-lato text-brand-brown/70 text-xs md:text-sm italic">— The Holy Qur'an, Surah Az-Zumar (39:9)</p>
                        </div>
                    </div>
                    <div className="mt-8">
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
