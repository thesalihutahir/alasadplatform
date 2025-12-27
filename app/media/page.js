"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Play, Mic, Video, BookOpen, Camera, Headphones, ArrowRight, Loader2 } from 'lucide-react';

export default function MediaPage() {
    // State to handle Video Facade & Data
    const [playVideo, setPlayVideo] = useState(false);
    const [latestVideo, setLatestVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Media Categories Configuration (Static Navigation)
    const categories = [
        {
            id: 'videos',
            title: 'Videos',
            subtitle: 'Lectures & Events',
            link: '/media/videos',
            image: '/images/heroes/media-videos-hero.webp',
            icon: Video
        },
        {
            id: 'audios',
            title: 'Audios',
            subtitle: 'Sermons & Tafsir',
            link: '/media/audios',
            image: '/images/heroes/media-audios-hero.webp',
            icon: Mic 
        },
        {
            id: 'podcasts',
            title: 'Podcasts',
            subtitle: 'Discussions',
            link: '/media/podcasts',
            image: '/images/heroes/media-podcasts-hero.webp',
            icon: Headphones
        },
        {
            id: 'ebooks',
            title: 'eBooks',
            subtitle: 'Publications',
            link: '/media/ebooks',
            image: '/images/heroes/media-ebooks-hero.webp',
            icon: BookOpen
        },
        {
            id: 'gallery',
            title: 'Gallery',
            subtitle: 'Photos & Moments',
            link: '/media/gallery',
            image: '/images/heroes/media-gallery-hero.webp',
            icon: Camera
        }
    ];

    // --- FETCH LATEST VIDEO ---
    useEffect(() => {
        const fetchLatestVideo = async () => {
            try {
                const q = query(
                    collection(db, "videos"), 
                    orderBy("createdAt", "desc"), 
                    limit(1)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const docData = snapshot.docs[0].data();
                    setLatestVideo({ id: snapshot.docs[0].id, ...docData });
                }
            } catch (error) {
                console.error("Error fetching latest video:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestVideo();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-overview-hero.webp" 
                            alt="Media Library Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Media & Resources
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Access our archive of knowledge, lectures, and publications. Designed to inspire, educate, and preserve our heritage.
                        </p>
                    </div>
                </section>

                {/* 2. CATEGORY GRID */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark mb-8 text-left border-b border-gray-100 pb-4">
                        Browse Archive
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Link 
                                    key={cat.id} 
                                    href={cat.link}
                                    className={`group relative rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-2 hover:shadow-2xl 
                                        ${cat.id === 'gallery' ? 'col-span-2 md:col-span-1 aspect-[2.5/1] md:aspect-[4/5]' : 'aspect-square md:aspect-[4/5]'}`}
                                >
                                    {/* Background Image */}
                                    <Image
                                        src={cat.image}
                                        alt={cat.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-brand-brown-dark/70 group-hover:bg-brand-brown-dark/50 transition-colors backdrop-blur-[1px] group-hover:backdrop-blur-none"></div>

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-12 h-12 mb-3 relative opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110 bg-white/10 rounded-full p-2.5">
                                            <Icon className="w-full h-full text-white" />
                                        </div>
                                        <h3 className="font-agency text-2xl md:text-3xl text-white tracking-wide">
                                            {cat.title}
                                        </h3>
                                        <p className="font-lato text-[10px] md:text-xs text-white/80 uppercase tracking-widest mt-2 border-t border-white/20 pt-2 w-1/2 mx-auto">
                                            {cat.subtitle}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* 3. FEATURED / LATEST UPLOAD */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                    </div>
                ) : latestVideo && (
                    <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-6 md:mb-8">
                            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">
                                Latest Release
                            </h2>
                        </div>

                        <div className="bg-brand-sand rounded-3xl overflow-hidden shadow-xl border border-brand-gold/20 flex flex-col md:flex-row">
                            {/* Video Preview Area (Left on Desktop) */}
                            <div className="relative w-full md:w-2/3 aspect-video bg-black group">
                                {!playVideo ? (
                                    <button 
                                        onClick={() => setPlayVideo(true)}
                                        className="absolute inset-0 w-full h-full relative"
                                    >
                                        <Image 
                                            src={latestVideo.thumbnail || "/fallback.webp"} 
                                            alt={latestVideo.title} 
                                            fill 
                                            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-300 shadow-lg border border-white/50">
                                                <Play className="w-6 h-6 md:w-10 md:h-10 text-white fill-current ml-1" />
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${latestVideo.videoId}?rel=0&modestbranding=1&autoplay=1`}
                                        title={latestVideo.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                )}
                            </div>

                            {/* Info Area (Right on Desktop) */}
                            <div className="p-6 md:p-10 md:w-1/3 flex flex-col justify-center bg-white md:bg-brand-sand">
                                <span className="inline-block px-3 py-1 bg-brand-gold text-white text-[10px] md:text-xs font-bold uppercase rounded-md shadow-sm w-fit mb-4">
                                    {latestVideo.category || "New Video"}
                                </span>
                                <h3 className="font-agency text-2xl md:text-4xl text-brand-brown-dark mb-4 leading-tight">
                                    {latestVideo.title}
                                </h3>
                                <p className="font-lato text-sm md:text-base text-brand-brown line-clamp-3 md:line-clamp-none mb-8 leading-relaxed">
                                    {latestVideo.description || "Watch our latest lecture."}
                                </p>
                                <Link 
                                    href="/media/videos" 
                                    className="inline-flex items-center text-brand-gold font-bold text-xs md:text-sm uppercase tracking-widest hover:underline group"
                                >
                                    Watch Full Series <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

            </main>

            <Footer />
        </div>
    );
}