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
    BookOpen, PlaySquare, ScrollText, HeartHandshake, // NEW ICONS
    Mic, MapPin, GraduationCap, HandHeart, Lightbulb
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
                // Queries
                const articlesQuery = query(collection(db, 'articles'), where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(3));
                const newsQuery = query(collection(db, 'news'), where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(3));
                const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(1));
                const podcastsQuery = query(collection(db, 'podcasts'), orderBy('createdAt', 'desc'), limit(1));
                const audiosQuery = query(collection(db, 'audios'), orderBy('createdAt', 'desc'), limit(3));
                const programQuery = query(collection(db, 'programs'), where('status', '==', 'Active'), orderBy('createdAt', 'desc'), limit(1));
                const eventsQuery = query(collection(db, 'events'), where('status', '==', 'Upcoming'), orderBy('date', 'asc'), limit(3));

                // Execute
                const [articlesSnap, newsSnap, videosSnap, podcastsSnap, audiosSnap, programSnap, eventsSnap] = await Promise.all([
                    getDocs(articlesQuery), getDocs(newsQuery), getDocs(videosQuery), getDocs(podcastsQuery), getDocs(audiosQuery), getDocs(programQuery), getDocs(eventsQuery)
                ]);

                // Process Mixed Updates
                const articlesData = articlesSnap.docs.map(doc => ({ id: doc.id, type: 'article', displayCategory: 'Article', image: doc.data().featuredImage, date: doc.data().createdAt, ...doc.data() }));
                const newsData = newsSnap.docs.map(doc => ({ id: doc.id, type: 'news', displayCategory: 'News', title: doc.data().headline, excerpt: doc.data().shortDescription, image: doc.data().featuredImage, date: doc.data().createdAt, ...doc.data() }));
                
                setLatestUpdates([...articlesData, ...newsData].sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)).slice(0, 3));
                
                if (!videosSnap.empty) setLatestVideo({ id: videosSnap.docs[0].id, ...videosSnap.docs[0].data() });
                if (!podcastsSnap.empty) setLatestPodcast({ id: podcastsSnap.docs[0].id, ...podcastsSnap.docs[0].data() });
                setLatestAudios(audiosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                if (!programSnap.empty) setFeaturedProgram({ id: programSnap.docs[0].id, ...programSnap.docs[0].data() });
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
    const getDir = (text) => text && /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
    const formatDayMonth = (ts) => {
        const d = ts?.seconds ? new Date(ts.seconds * 1000) : new Date();
        return { day: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() };
    };
    const formatSimpleDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const getYouTubeId = (url) => url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2];

    const handleDownload = (e, url) => {
        e.preventDefault();
        e.stopPropagation();
        if (url) window.open(url, '_blank');
    };

    // --- REUSABLE COMPONENTS ---
    const SectionHeader = ({ title, link, linkText = "View All" }) => (
        <div className="flex justify-between items-end mb-10 pb-4 border-b border-gray-100">
            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">{title}</h2>
            <Link href={link} className="group flex items-center gap-2 text-xs md:text-sm font-bold text-brand-gold uppercase tracking-widest hover:text-brand-brown-dark transition-colors">
                {linkText} 
                <span className="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-all">
                    <ArrowRight className="w-3 h-3" />
                </span>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            {showSplash && (
                <div className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-700 ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-full max-w-md p-8"><LogoReveal /></div>
                </div>
            )}
            <Header />
            <main className="flex-grow">
                {/* 1. HERO */}
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

                {/* 2. ICON NAV (Glassmorphism & New Icons) */}
                <section className="py-8 md:py-16 px-6 relative z-20 -mt-6 md:-mt-0">
                     <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-4 gap-3 md:gap-12 justify-items-center">
                            {[
                                { link: '/programs', label: 'Programs', icon: BookOpen },
                                { link: '/media', label: 'Media', icon: PlaySquare },
                                { link: '/blogs', label: 'Blogs', icon: ScrollText },
                                { link: '/about', label: 'About', icon: HeartHandshake },
                            ].map((nav, i) => (
                                <Link key={i} href={nav.link} className="flex flex-col items-center group cursor-pointer">
                                    {/* Glassmorphic Circle */}
                                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-brand-sand/60 backdrop-blur-md border border-white/40 flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-gold group-hover:border-brand-gold shadow-sm">
                                        <nav.icon className="w-6 h-6 md:w-9 md:h-9 text-brand-brown-dark group-hover:text-white transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <span className="font-agency text-sm md:text-lg text-brand-brown-dark tracking-wide group-hover:text-brand-gold transition-colors">{nav.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
                {/* 3. LATEST UPDATES */}
                <section className="py-12 md:py-20 px-6 bg-brand-sand/30">
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader title="Latest Updates" link="/blogs" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {loading ? [1,2,3].map(i=><div key={i} className="h-96 bg-white rounded-2xl animate-pulse"/>) : 
                            latestUpdates.map((item) => {
                                const dateObj = formatDayMonth(item.date);
                                const isNews = item.type === 'news';
                                const readUrl = isNews ? `/blogs/news` : `/blogs/read/${item.id}?type=${item.type}`;
                                
                                return (
                                    <div key={item.id} className={`flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border-t-4 ${isNews ? 'border-t-brand-gold' : 'border-t-brand-brown'}`}>
                                        <Link href={readUrl} className="block relative w-full h-52 overflow-hidden bg-gray-100">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-agency text-lg bg-gray-50">Al-Asad Foundation</div>
                                            )}
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm text-center min-w-[50px]">
                                                <span className="block font-bold text-lg leading-none text-brand-brown-dark">{dateObj.day}</span>
                                                <span className="block text-[10px] font-bold text-brand-gold uppercase">{dateObj.month}</span>
                                            </div>
                                        </Link>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${isNews ? 'bg-brand-gold/10 text-brand-gold' : 'bg-brand-brown/10 text-brand-brown'}`}>
                                                    {item.category || item.displayCategory}
                                                </span>
                                            </div>
                                            <h3 className={`text-xl font-bold text-brand-brown-dark mb-3 leading-tight group-hover:text-brand-gold transition-colors ${getDir(item.title) === 'rtl' ? 'font-tajawal text-right' : 'font-agency text-left'}`} dir={getDir(item.title)}>
                                                {item.title}
                                            </h3>
                                            <p className={`text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-grow ${getDir(item.excerpt) === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`} dir={getDir(item.excerpt)}>
                                                {item.excerpt}
                                            </p>
                                            <Link href={readUrl} className="inline-flex items-center text-xs font-bold text-brand-brown-dark uppercase tracking-widest group-hover:underline decoration-brand-gold underline-offset-4">
                                                Read More <ArrowRight className="w-3 h-3 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 4. ACTIVE PROGRAM (Heading Updated, Card Preserved) */}
                <section className="py-12 px-6 bg-white border-b border-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader title="Active Program" link="/programs" />
                        
                        {loading ? <div className="w-full h-80 bg-gray-100 rounded-3xl animate-pulse"/> : 
                        featuredProgram ? (
                            <div className="relative rounded-3xl overflow-hidden shadow-xl group h-[500px]">
                                <Image src={featuredProgram.coverImage || "/hero.jpg"} alt={featuredProgram.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                <div className="relative z-10 p-8 md:p-16 flex flex-col h-full justify-end max-w-4xl">
                                    <span className="inline-block px-4 py-1.5 bg-brand-gold text-white text-xs font-bold uppercase rounded-full mb-4 w-fit">{featuredProgram.category}</span>
                                    <h3 className={`text-4xl md:text-6xl text-white mb-6 leading-tight ${getDir(featuredProgram.title) === 'rtl' ? 'font-tajawal font-bold text-right' : 'font-agency text-left'}`}>{featuredProgram.title}</h3>
                                    <p className={`text-white/90 text-base md:text-xl mb-10 leading-relaxed max-w-2xl line-clamp-3 ${getDir(featuredProgram.excerpt) === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`}>{featuredProgram.excerpt}</p>
                                    <Link href={`/programs/${featuredProgram.id}`} className="px-8 py-4 bg-white text-brand-brown-dark font-bold rounded-full hover:bg-brand-gold hover:text-white transition-all w-fit shadow-lg">View Program Details</Link>
                                </div>
                            </div>
                        ) : <div className="text-center py-10 bg-gray-50 rounded-3xl"><p className="text-gray-400">No active programs found.</p></div>}
                    </div>
                </section>

                {/* 5. MEDIA (Enhanced Cards) */}
                <section className="py-16 px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <SectionHeader title="Latest Media" link="/media" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Video Card */}
                                    {latestVideo ? (
                                        <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-t-red-500 h-full">
                                            <div className="relative aspect-video bg-black group">
                                                {latestVideo.thumbnail && <Image src={latestVideo.thumbnail} alt={latestVideo.title} fill className="object-cover opacity-90 group-hover:opacity-100" />}
                                                <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors"><Play className="w-6 h-6 text-white fill-current" /></div></div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-grow">
                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Video</span>
                                                <h3 className={`text-xl font-bold text-brand-brown-dark mb-2 line-clamp-2 ${getDir(latestVideo.title) === 'rtl' ? 'font-tajawal text-right' : 'font-agency text-left'}`}>{latestVideo.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{latestVideo.description}</p>
                                                <Link href={`/media/videos/${latestVideo.id}`} className="text-xs font-bold text-brand-brown-dark uppercase tracking-widest hover:text-red-500 transition-colors">Watch Now</Link>
                                            </div>
                                        </div>
                                    ) : <div className="h-64 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">No Video</div>}

                                    {/* Podcast Card */}
                                    {latestPodcast ? (
                                        <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-t-blue-500 h-full">
                                            <div className="relative aspect-video bg-gray-900 group">
                                                {latestPodcast.thumbnail && <Image src={latestPodcast.thumbnail} alt={latestPodcast.title} fill className="object-cover opacity-80 group-hover:opacity-100" />}
                                                <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors"><Mic className="w-6 h-6 text-white" /></div></div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-grow">
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Podcast</span>
                                                <h3 className={`text-xl font-bold text-brand-brown-dark mb-2 line-clamp-2 ${getDir(latestPodcast.title) === 'rtl' ? 'font-tajawal text-right' : 'font-agency text-left'}`}>{latestPodcast.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{latestPodcast.description}</p>
                                                <Link href={`/media/podcasts/play/${latestPodcast.id}`} className="text-xs font-bold text-brand-brown-dark uppercase tracking-widest hover:text-blue-500 transition-colors">Listen Now</Link>
                                            </div>
                                        </div>
                                    ) : <div className="h-64 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">No Podcast</div>}
                                </div>
                            </div>

                            {/* Audio List (Clickable Download) */}
                            <div className="lg:col-span-1">
                                <SectionHeader title="Latest Audio" link="/media/audios" />
                                <div className="space-y-4">
                                    {latestAudios.map((audio) => (
                                        <div key={audio.id} className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors flex-shrink-0">
                                                <Play className="w-5 h-5 fill-current" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                {audio.series && <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wide block mb-0.5">{audio.series}</span>}
                                                <h4 className={`text-lg font-bold text-brand-brown-dark truncate ${getDir(audio.title) === 'rtl' ? 'font-tajawal text-right' : 'font-agency text-left'}`}>{audio.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{audio.category || "Audio"}</span>
                                                    {audio.fileSize && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{audio.fileSize}</span>}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => handleDownload(e, audio.audioUrl)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-brand-gold hover:bg-brand-gold/10 rounded-full transition-all z-10"
                                                title="Download Audio"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <Link href={`/media/audios/play/${audio.id}`} className="absolute inset-0 z-0" aria-label="Play Audio" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* 6. UPCOMING EVENTS */}
                <section className="py-16 md:py-24 px-6 bg-brand-sand/20">
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader title="Upcoming Events" link="/events" />
                        <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible">
                            {loading ? [1,2,3].map(i=><div key={i} className="h-64 bg-white rounded-2xl animate-pulse"/>) : 
                            upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                                <div key={event.id} className="min-w-[300px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full group">
                                    <div className="bg-brand-brown-dark text-white text-center py-3 font-agency text-lg tracking-widest group-hover:bg-brand-gold transition-colors">
                                        {formatSimpleDate(event.date).toUpperCase()}
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow text-center">
                                        <h3 className={`text-2xl font-bold text-brand-brown-dark mb-4 line-clamp-2 ${getDir(event.title) === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>{event.title}</h3>
                                        <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed flex-grow">{event.description}</p>
                                        <div className="pt-4 border-t border-gray-100 w-full flex justify-center">
                                            <span className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/5 px-4 py-2 rounded-full">
                                                <MapPin className="w-3 h-3" /> {event.location ? event.location.split(' ')[0] : 'Location'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : <div className="col-span-3 text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">No upcoming events found.</div>}
                        </div>
                    </div>
                </section>

                {/* 7. MISSION & VISION (Cards Style) */}
                <section className="relative py-20 px-6 bg-brand-gold overflow-hidden">
                    <div className="absolute inset-0 mix-blend-overlay opacity-20"><Image src="/images/chairman/sheikh1.webp" alt="Background" fill className="object-cover" /></div>
                    <div className="relative z-10 max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center md:text-left hover:bg-white/15 transition-all">
                                <h2 className="font-agency text-3xl text-white mb-4">Vision Statement</h2>
                                <p className="font-lato text-base md:text-lg text-white/90 leading-relaxed">To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center md:text-left hover:bg-white/15 transition-all">
                                <h2 className="font-agency text-3xl text-white mb-4">Mission Statement</h2>
                                <p className="font-lato text-base md:text-lg text-white/90 leading-relaxed">Expanding access to knowledge through Qur'an-centered and community driven education.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. QUOTE */}
                <section className="py-16 px-6 text-center bg-white">
                    <div className="max-w-3xl mx-auto bg-white border border-brand-gold/20 rounded-3xl shadow-sm p-10 relative overflow-hidden">
                        <div className="absolute top-4 left-4 text-6xl text-brand-sand/60 font-serif leading-none">“</div>
                        <div className="absolute bottom-4 right-4 text-6xl text-brand-sand/60 font-serif leading-none">”</div>
                        <div className="relative z-10">
                            <h2 className="font-arabic text-3xl md:text-4xl text-brand-gold leading-relaxed mb-4 drop-shadow-sm dir-rtl">قل هل يستوي الذين يعلمون والذين لا يعلمون</h2>
                            <p className="font-agency text-xl text-brand-brown-dark/90 uppercase tracking-wider mb-2">"Say, 'Are those who know equal to those who do not know?'"</p>
                            <p className="font-lato text-brand-brown/60 text-xs italic">— The Holy Qur'an, Surah Az-Zumar (39:9)</p>
                        </div>
                    </div>
                </section>

                {/* 9. NEWSLETTER */}
                <section className="py-20 px-6 bg-brand-brown-dark text-white text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                        <h2 className="font-agency text-4xl mb-4">Stay Connected</h2>
                        <p className="font-lato text-white/80 text-lg mb-8 max-w-xl mx-auto">Subscribe to our newsletter to receive updates on lectures, community programs, and opportunities to get involved.</p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input type="email" placeholder="Enter your email address" className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white/20 transition-all text-base" />
                            <button type="button" className="px-10 py-4 rounded-full bg-brand-gold text-white font-bold text-base uppercase tracking-wider hover:bg-white hover:text-brand-brown-dark transition-colors shadow-lg">Subscribe</button>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
