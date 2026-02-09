"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader'; // Imported custom loader
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Play, Mic, Video, BookOpen, Camera, Headphones, ArrowRight, Library } from 'lucide-react';

export default function MediaPage() {

    // --- STATE ---
    const [latestItems, setLatestItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Media Categories Configuration
    const categories = [
        {
            id: 'videos',
            title: 'Video Library',
            subtitle: 'Lectures, Events & Series',
            link: '/media/videos',
            image: '/images/heroes/media-videos-hero.webp',
            icon: Video
        },
        {
            id: 'audios',
            title: 'Audio Archive',
            subtitle: 'Sermons, Tafsir & Recitations',
            link: '/media/audios',
            image: '/images/heroes/media-audios-hero.webp',
            icon: Mic 
        },
        {
            id: 'podcasts',
            title: 'Podcasts',
            subtitle: 'Discussions & Insights',
            link: '/media/podcasts',
            image: '/images/heroes/media-podcasts-hero.webp',
            icon: Headphones
        },
        {
            id: 'ebooks',
            title: 'Publications',
            subtitle: 'Books, Papers & Articles',
            link: '/media/ebooks',
            image: '/images/heroes/media-ebooks-hero.webp',
            icon: BookOpen
        },
        {
            id: 'gallery',
            title: 'Photo Gallery',
            subtitle: 'Moments & Memories',
            link: '/media/gallery',
            image: '/images/heroes/media-gallery-hero.webp',
            icon: Camera
        }
    ];

    // --- FETCH LATEST ITEMS ---
    useEffect(() => {
        const fetchLatestContent = async () => {
            try {
                // Define fetch logic for each type
                const fetchOne = async (colName) => {
                    const q = query(collection(db, colName), orderBy("createdAt", "desc"), limit(1));
                    const snap = await getDocs(q);
                    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
                };

                // Execute fetches (Excluding Gallery)
                const [video, audio, podcast, ebook] = await Promise.all([
                    fetchOne('videos'),
                    fetchOne('audios'),
                    fetchOne('podcasts'),
                    fetchOne('ebooks')
                ]);

                // Normalize Data Structure for Rendering
                const items = [
                    video && { ...video, type: 'Video', link: `/media/videos/${video.id}`, icon: Play },
                    audio && { ...audio, type: 'Audio', link: `/media/audios/play/${audio.id}`, icon: Mic },
                    podcast && { ...podcast, type: 'Podcast', link: `/media/podcasts/play/${podcast.id}`, icon: Headphones },
                    ebook && { ...ebook, type: 'eBook', link: `/media/ebooks/read/${ebook.id}`, icon: BookOpen }
                ].filter(Boolean); // Remove nulls

                setLatestItems(items);

            } catch (error) {
                console.error("Error fetching latest content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestContent();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            <Header />

            <main className="flex-grow pb-20">

                {/* 1. HERO SECTION (Refined) */}
                <section className="relative h-[50vh] min-h-[450px] w-full flex items-center justify-center overflow-hidden bg-brand-brown-dark mb-20">
                    <Image
                        src="/images/heroes/media-overview-hero.webp" 
                        alt="Media Library Hero"
                        fill
                        className="object-cover object-center opacity-40 mix-blend-luminosity"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-brown-dark via-brand-brown-dark/80 to-transparent"></div>

                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-brand-gold text-xs font-bold uppercase tracking-widest mb-6 shadow-lg">
                            <Library className="w-4 h-4" /> Digital Archive
                        </div>
                        <h1 className="font-agency text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-none drop-shadow-2xl">
                            Media Resources
                        </h1>
                        <p className="font-lato text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                            Access our archive of knowledge, lectures, and publications. Designed to inspire, educate, and preserve our heritage.
                        </p>
                    </div>
                </section>

                {/* 2. CATEGORY GRID (Modern Cards) */}
                <section className="px-6 md:px-12 lg:px-24 mb-24 max-w-7xl mx-auto">
                    <div className="flex items-end justify-between border-b border-gray-100 pb-4 mb-10">
                        <div>
                            <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-2 block">Browse Content</span>
                            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">
                                Library Sections
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Link 
                                    key={cat.id} 
                                    href={cat.link}
                                    className={`group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-brand-gold/30 h-64 md:h-72 ${cat.id === 'gallery' ? 'lg:col-span-2' : ''}`}
                                >
                                    {/* Background Image */}
                                    <Image
                                        src={cat.image}
                                        alt={cat.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-brand-brown-dark/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                                        <div className="flex items-center gap-4 mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors duration-300">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-agency text-3xl text-white leading-none mb-1">
                                                    {cat.title}
                                                </h3>
                                                <p className="font-lato text-xs text-white/70 uppercase tracking-widest font-bold">
                                                    {cat.subtitle}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Accent Line */}
                                        <div className="w-full h-0.5 bg-white/20 mt-6 overflow-hidden rounded-full">
                                            <div className="h-full w-full bg-brand-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* 3. LATEST RELEASES (Redesigned Slim Cards) */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : latestItems.length > 0 && (
                    <section className="px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
                        <div className="mb-8 flex items-end justify-between border-b border-gray-100 pb-4">
                            <div>
                                <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-1 block">Fresh Content</span>
                                <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark">
                                    Latest Releases
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {latestItems.map((item) => {
                                return (
                                    <Link 
                                        key={item.id} 
                                        href={item.link}
                                        className="group relative flex items-center gap-4 p-3 rounded-2xl bg-white border border-gray-100 hover:border-brand-gold/30 hover:bg-brand-sand/10 transition-all duration-300"
                                    >
                                        {/* Thumbnail (Square & Zoomed) */}
                                        <div className="relative w-20 h-20 md:w-24 md:h-24 aspect-square flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                            <Image 
                                                src={item.thumbnail || item.coverImage || item.image || "/fallback.webp"} 
                                                alt={item.title} 
                                                fill 
                                                className="object-cover object-center scale-120 group-hover:scale-125 transition-transform duration-700" 
                                            />
                                            {/* Subtle Overlay */}
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                        </div>

                                        {/* Content Stack (No Description) */}
                                        <div className="flex-grow min-w-0 flex flex-col justify-center gap-1.5 h-full">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded-md w-fit">
                                                {item.type}
                                            </span>
                                            <h3 className="font-agency text-xl text-brand-brown-dark leading-tight line-clamp-2 group-hover:text-brand-gold transition-colors">
                                                {item.title || "Untitled Content"}
                                            </h3>
                                        </div>

                                        {/* Action Icon */}
                                        <div className="flex-shrink-0 pr-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-300 group-hover:bg-brand-gold group-hover:text-white transition-all duration-300">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

            </main>

            <Footer />
        </div>
    );
}