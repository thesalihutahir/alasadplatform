"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LogoReveal from '@/components/logo-reveal';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

import { 
    Play, ArrowRight, Calendar, Clock, Download, ChevronRight,
    ClipboardList, MonitorPlay, Newspaper, Users,
    GraduationCap, HandHeart, Lightbulb, MapPin, Loader2
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
                // A) Fetch Latest 3 Published Blogs
                const blogsQ = query(collection(db, 'blogs'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(3));
                const blogsSnap = await getDocs(blogsQ);
                setLatestUpdates(blogsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // B) Fetch Latest 2 Published Audios
                const audiosQ = query(collection(db, 'audios'), orderBy('date', 'desc'), limit(2));
                const audiosSnap = await getDocs(audiosQ);
                setLatestAudios(audiosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // C) Fetch Latest Video (Limit 1)
                const videosQ = query(collection(db, 'videos'), orderBy('date', 'desc'), limit(1));
                const videosSnap = await getDocs(videosQ);
                if (!videosSnap.empty) {
                    setLatestVideo({ id: videosSnap.docs[0].id, ...videosSnap.docs[0].data() });
                }

                // D) Fetch Upcoming Events (Future dates only)
                const today = new Date();
                // Note: Ensure 'date' field in Firestore is a Timestamp
                const eventsQ = query(collection(db, 'events'), where('date', '>=', today), orderBy('date', 'asc'), limit(3));
                const eventsSnap = await getDocs(eventsQ);
                setUpcomingEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to format timestamps
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    };

    const getDayMonth = (timestamp) => {
        if (!timestamp) return { day: '00', month: 'JAN' };
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return { 
            day: date.getDate(), 
            month: date.toLocaleString('default', { month: 'short' }).toUpperCase() 
        };
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

                {/* 1. HERO SECTION - Subtle Fade In */}
                <section className="w-full relative bg-white h-[60vh] md:h-[80vh] min-h-[500px] overflow-hidden group">
                    <div className="relative w-full h-full animate-in fade-in duration-1000">
                        <Image src="/images/heroes/home-main-hero.webp" alt="Al-Asad Education Foundation" fill className="object-cover object-top transition-transform duration-[3s] ease-in-out group-hover:scale-105" priority />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/90 md:via-black/50 md:to-transparent"></div>

                        <div className="absolute inset-0 flex items-end md:items-center justify-center md:justify-start px-6 md:px-16 lg:px-24 pb-20 md:pb-0 z-10">
                            <div className="text-center md:text-left max-w-3xl animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
                                <p className="font-lato text-white md:text-brand-gold text-sm md:text-xl font-bold uppercase tracking-[0.2em] mb-4 drop-shadow-md">
                                    Welcome to Al-Asad Foundation
                                </p>
                                <h1 className="font-agency text-5xl md:text-7xl lg:text-9xl text-brand-gold md:text-white leading-[0.9] drop-shadow-md mb-8">
                                    Where Education <br />
                                    <span className="text-white md:text-brand-gold">Creates Impact</span>
                                </h1>
                                <div className="hidden md:flex gap-4 mt-8">
                                    <Link href="/get-involved/donate" className="px-10 py-4 bg-brand-gold text-white font-agency text-xl rounded-full shadow-lg hover:bg-white hover:text-brand-brown-dark hover:scale-105 transition-all duration-300">Donate Now</Link>
                                    <Link href="/about" className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/30 text-white font-agency text-xl rounded-full hover:bg-white hover:text-brand-brown-dark hover:scale-105 transition-all duration-300">Learn More</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. REFACTORED ICON NAVIGATION (Modern Floating Dock) */}
                <section className="relative z-20 -mt-12 md:-mt-16 px-4 mb-16">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-brand-brown-dark/10 rounded-3xl p-4 md:p-6 animate-in zoom-in-95 fade-in duration-700 delay-500">
                            <div className="grid grid-cols-4 gap-2 md:gap-8 divide-x divide-gray-100">
                                {[
                                    { name: 'Programs', icon: ClipboardList, href: '/programs' },
                                    { name: 'Media', icon: MonitorPlay, href: '/media' },
                                    { name: 'Blogs', icon: Newspaper, href: '/blogs' },
                                    { name: 'About', icon: Users, href: '/about' },
                                ].map((item, idx) => (
                                    <Link key={item.name} href={item.href} className="group relative flex flex-col items-center justify-center py-2 cursor-pointer transition-all hover:-translate-y-1">
                                        <div className="absolute inset-0 bg-brand-gold/0 group-hover:bg-brand-gold/5 rounded-xl transition-colors duration-300 -z-10" />
                                        <item.icon className="w-6 h-6 md:w-8 md:h-8 text-brand-brown-dark/60 group-hover:text-brand-gold transition-colors duration-300 mb-2" strokeWidth={1.5} />
                                        <span className="font-agency text-sm md:text-lg text-brand-brown-dark group-hover:text-brand-gold transition-colors uppercase tracking-wide">
                                            {item.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mobile Action Button */}
                <section className="md:hidden px-6 mb-12 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-700">
                    <Link href="/get-involved/donate" className="block w-full py-4 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-lg shadow-brand-gold/20 active:scale-95 transition-transform">
                        Make a Donation
                    </Link>
                </section>
                {/* 3. LATEST UPDATES (Dynamic) */}
                <section className="py-16 md:py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <span className="block text-xs font-bold text-brand-gold uppercase tracking-[0.2em] mb-2">From Our Blog</span>
                                <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">Latest Updates</h2>
                            </div>
                            <Link href="/blogs" className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-brown-dark hover:text-brand-gold transition-colors uppercase tracking-widest group">
                                View All <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></div>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="bg-white/50 h-96 rounded-3xl animate-pulse" />)
                            ) : latestUpdates.length > 0 ? (
                                latestUpdates.map((item, idx) => (
                                    <Link 
                                        key={item.id} 
                                        href={`/blogs/read/${item.id}`}
                                        className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-gold/10 transition-all duration-500 flex flex-col h-full border border-gray-100"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="relative w-full h-56 overflow-hidden">
                                            <div className="absolute inset-0 bg-brand-brown-dark/10 group-hover:bg-transparent transition-colors z-10" />
                                            {item.coverImage ? (
                                                <Image src={item.coverImage} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full bg-brand-sand/50 flex items-center justify-center text-brand-brown/20"><Newspaper className="w-12 h-12" /></div>
                                            )}
                                            <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur text-brand-brown-dark text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm">
                                                {item.category || 'Update'}
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <span className="text-xs text-brand-gold font-bold mb-3 block">{formatDate(item.publishedAt)}</span>
                                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3 leading-tight group-hover:text-brand-gold transition-colors line-clamp-2">
                                                {item.title}
                                            </h3>
                                            <p className="font-lato text-sm text-gray-500 line-clamp-3 leading-relaxed mb-6 flex-grow">
                                                {item.excerpt}
                                            </p>
                                            <div className="flex items-center text-brand-brown-dark text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                                                Read Story <ArrowRight className="w-3 h-3 ml-2" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-3 py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">No updates available.</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4. MEDIA & EVENTS (Dynamic) */}
                <section className="py-16 md:py-24 px-6 bg-white border-y border-gray-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            
                            {/* VIDEO SECTION (Left - 7 cols) */}
                            <div className="lg:col-span-7 flex flex-col">
                                <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark mb-8">Latest Lecture</h2>
                                {loading ? (
                                    <div className="w-full aspect-video bg-gray-100 rounded-3xl animate-pulse" />
                                ) : latestVideo ? (
                                    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative group aspect-video">
                                        {!playVideo ? (
                                            <button onClick={() => setPlayVideo(true)} className="absolute inset-0 w-full h-full group">
                                                <Image src={latestVideo.thumbnail || "/hero.jpg"} alt={latestVideo.title} fill className="object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-300 border border-white/40">
                                                        <Play className="w-8 h-8 text-white fill-current translate-x-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent">
                                                    <h3 className="text-white font-agency text-3xl mb-2">{latestVideo.title}</h3>
                                                    <p className="text-white/70 text-sm font-lato line-clamp-1">{latestVideo.description}</p>
                                                </div>
                                            </button>
                                        ) : (
                                            <iframe 
                                                className="w-full h-full"
                                                src={`https://www.youtube.com/embed/${latestVideo.youtubeId}?autoplay=1`}
                                                title={latestVideo.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full aspect-video bg-brand-sand/30 rounded-3xl flex items-center justify-center text-gray-400 font-agency text-xl">No videos available</div>
                                )}
                            </div>

                            {/* AUDIOS & EVENTS (Right - 5 cols) */}
                            <div className="lg:col-span-5 flex flex-col gap-10">
                                
                                {/* A) Latest Audios */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-agency text-2xl text-brand-brown-dark">New Audios</h3>
                                        <Link href="/media/audios" className="text-xs font-bold text-brand-gold uppercase tracking-widest">Library</Link>
                                    </div>
                                    <div className="space-y-4">
                                        {latestAudios.length > 0 ? (
                                            latestAudios.map(audio => (
                                                <Link key={audio.id} href={`/media/audios/play/${audio.id}`} className="bg-brand-sand/30 hover:bg-white p-4 rounded-2xl flex items-center gap-4 transition-all hover:shadow-lg border border-transparent hover:border-gray-100 group">
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-brown-dark shadow-sm group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                        <Play className="w-4 h-4 fill-current ml-1" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h4 className="font-agency text-lg text-brand-brown-dark truncate">{audio.title}</h4>
                                                        <div className="flex gap-3 text-xs text-gray-400 mt-1">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(audio.date)}</span>
                                                            {audio.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {audio.duration}</span>}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-400 italic">No audio uploads yet.</div>
                                        )}
                                    </div>
                                </div>

                                {/* B) Upcoming Events */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-agency text-2xl text-brand-brown-dark">Upcoming Events</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {upcomingEvents.length > 0 ? (
                                            upcomingEvents.map(event => {
                                                const { day, month } = getDayMonth(event.date);
                                                return (
                                                    <div key={event.id} className="flex gap-5 items-start group">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-brand-brown-dark text-white rounded-2xl flex flex-col items-center justify-center leading-none shadow-lg group-hover:bg-brand-gold transition-colors duration-300">
                                                            <span className="text-2xl font-agency font-bold">{day}</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{month}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-agency text-xl text-brand-brown-dark leading-tight mb-1 group-hover:text-brand-gold transition-colors">{event.title}</h4>
                                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{event.description}</p>
                                                            {event.location && (
                                                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                                                                    <MapPin className="w-3 h-3" /> {event.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="bg-brand-sand/20 rounded-2xl p-6 text-center">
                                                <p className="text-sm text-gray-500 font-lato mb-2">No upcoming events scheduled.</p>
                                                <Link href="/blogs/updates" className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">Check past updates</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
                {/* 5. VISION & MISSION REFACTORED (Modern Bento Style) */}
                <section className="py-20 px-6 bg-brand-brown-dark relative overflow-hidden">
                    {/* Futuristic Background Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-stretch">
                            
                            {/* Vision Card */}
                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-[3rem] p-10 md:p-14 flex flex-col justify-center animate-in slide-in-from-left-10 fade-in duration-1000">
                                <div className="w-16 h-16 bg-brand-gold rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(209,118,0,0.3)]">
                                    <Lightbulb className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="font-agency text-4xl text-white mb-6">Vision Statement</h2>
                                <p className="font-lato text-xl text-white/80 leading-relaxed font-light">
                                    To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
                                </p>
                            </div>

                            {/* Mission Card */}
                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-[3rem] p-10 md:p-14 flex flex-col justify-center animate-in slide-in-from-right-10 fade-in duration-1000 delay-200">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                                    <HandHeart className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="font-agency text-4xl text-white mb-6">Mission Statement</h2>
                                <p className="font-lato text-xl text-white/80 leading-relaxed font-light">
                                    Expanding access to knowledge through Qur'an-centered and community driven education.
                                </p>
                            </div>
                        </div>

                        {/* Core Values / Icons Row */}
                        <div className="mt-12 grid grid-cols-3 gap-4">
                             {[
                                { label: "Educational Support", icon: GraduationCap },
                                { label: "Community Development", icon: Users },
                                { label: "Innovation", icon: Lightbulb }
                             ].map((val, i) => (
                                <div key={i} className="bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors cursor-default animate-in zoom-in-50 fade-in duration-700" style={{ animationDelay: `${500 + (i*100)}ms` }}>
                                    <val.icon className="w-6 h-6 text-brand-gold mb-3" />
                                    <span className="text-white/60 text-xs md:text-sm font-agency tracking-wider uppercase">{val.label}</span>
                                </div>
                             ))}
                        </div>
                    </div>
                </section>

                {/* 6. ARABIC QUOTE REFACTORED (Minimal, No Harakat, Modern Tajawal) */}
                <section className="py-24 px-6 bg-brand-sand/10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="relative inline-block py-10">
                            {/* Decorative quotes */}
                            <span className="absolute -top-4 -left-8 text-8xl font-serif text-brand-gold/20 leading-none">“</span>
                            
                            {/* Clean Arabic Text - Tajawal Font */}
                            <h2 className="font-tajawal font-bold text-4xl md:text-6xl text-brand-brown-dark leading-[1.6] mb-8 animate-in zoom-in-95 duration-1000">
                                قل هل يستوي الذين يعلمون والذين لا يعلمون
                            </h2>

                            <span className="absolute -bottom-12 -right-8 text-8xl font-serif text-brand-gold/20 leading-none">”</span>
                        </div>

                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                            <p className="font-agency text-xl md:text-2xl text-brand-brown/80 uppercase tracking-widest">
                                "Say, 'Are those who know equal to those who do not know?'"
                            </p>
                            <p className="font-lato text-sm text-gray-400 font-medium">
                                — Surah Az-Zumar (39:9)
                            </p>
                        </div>
                    </div>
                </section>

                {/* 7. NEWSLETTER */}
                <section className="py-20 px-6 bg-white text-center border-t border-gray-100">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-sand mb-6 text-brand-gold animate-bounce duration-[2000ms]">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <h2 className="font-agency text-4xl md:text-5xl text-brand-brown-dark mb-4">Stay Connected</h2>
                        <p className="font-lato text-gray-500 mb-10 max-w-lg mx-auto">
                            Join our community to receive updates on lectures, programs, and opportunities.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                className="flex-grow px-6 py-4 rounded-full bg-gray-50 border-none ring-1 ring-gray-200 text-brand-brown-dark placeholder-gray-400 focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-all outline-none"
                            />
                            <button type="button" className="px-8 py-4 rounded-full bg-brand-brown-dark text-white font-agency text-lg tracking-wide hover:bg-brand-gold transition-colors shadow-lg">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
