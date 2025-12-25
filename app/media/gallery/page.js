"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image as ImageIcon, FolderOpen, MapPin, Calendar } from 'lucide-react';

export default function GalleryPage() {

    // Mock Data for "Folders" (Albums)
    const albums = [
        {
            id: 'ramadan-2024',
            title: "Ramadan Feeding 2024",
            count: 45,
            cover: "/hero.jpg",
            date: "Mar 2024"
        },
        {
            id: 'graduation-24',
            title: "Ma'ahad Graduation",
            count: 120,
            cover: "/hero.jpg",
            date: "Jan 2024"
        },
        {
            id: 'eid-fest',
            title: "Community Eid Fest",
            count: 85,
            cover: "/hero.jpg",
            date: "Apr 2024"
        },
        {
            id: 'construction',
            title: "New Center Construction",
            count: 32,
            cover: "/hero.jpg",
            date: "Ongoing"
        }
    ];

    // Mock Data for "Stream" (Individual Photos)
    const photos = [
        { id: 1, src: "/hero.jpg", alt: "Sheikh leading prayer", height: "aspect-[3/4]" },
        { id: 2, src: "/hero.jpg", alt: "Community gathering", height: "aspect-[4/3]" },
        { id: 3, src: "/hero.jpg", alt: "Student graduation", height: "aspect-[3/5]" },
        { id: 4, src: "/hero.jpg", alt: "Food distribution", height: "aspect-square" },
        { id: 5, src: "/hero.jpg", alt: "Mosque construction", height: "aspect-[4/3]" },
        { id: 6, src: "/hero.jpg", alt: "Ramadan lecture", height: "aspect-[3/4]" },
        { id: 7, src: "/hero.jpg", alt: "Youth workshop", height: "aspect-[2/3]" },
        { id: 8, src: "/hero.jpg", alt: "Eid celebration", height: "aspect-square" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-gallery-hero.webp" 
                            alt="Gallery Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Photo Gallery
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Visual moments from our journey in serving the community, spreading knowledge, and building the future.
                        </p>
                    </div>
                </section>

                {/* 2. ALBUMS / FOLDERS SECTION */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-6 md:mb-8 border-b border-gray-100 pb-2">
                        <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                            Event Albums
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                            View Collections
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {albums.map((album) => (
                            <div key={album.id} className="group cursor-pointer">
                                {/* Folder Visual (Stacked effect) */}
                                <div className="relative w-full aspect-[4/3] mb-3">
                                    {/* Background Stack Cards */}
                                    <div className="absolute top-0 left-2 right-2 bottom-2 bg-gray-200 rounded-2xl transform translate-y-2 translate-x-1 group-hover:translate-x-2 group-hover:translate-y-3 transition-transform duration-300"></div>
                                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-gray-300 rounded-2xl transform translate-y-1 translate-x-0.5 group-hover:translate-x-1 group-hover:translate-y-1.5 transition-transform duration-300"></div>
                                    
                                    {/* Main Cover Image */}
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow border-2 border-white">
                                        <Image
                                            src={album.cover}
                                            alt={album.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                        
                                        {/* Icon Badge */}
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg p-1.5 text-brand-brown-dark">
                                            <FolderOpen className="w-4 h-4" />
                                        </div>

                                        {/* Count Badge */}
                                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> {album.count}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Info */}
                                <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors">
                                    {album.title}
                                </h3>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-1 uppercase tracking-wide">
                                    {album.date}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. RECENT MOMENTS (MASONRY GRID) */}
                <section className="px-4 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark mb-6 md:mb-8 text-center md:text-left">
                        Recent Moments
                    </h2>

                    {/* CSS Columns for Masonry Effect */}
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative w-full break-inside-avoid rounded-2xl overflow-hidden shadow-md group cursor-zoom-in">
                                {/* Aspect Ratio Controlled by Class */}
                                <div className={`relative w-full ${photo.height}`}>
                                    <Image
                                        src={photo.src}
                                        alt={photo.alt}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-brand-brown-dark/0 group-hover:bg-brand-brown-dark/60 transition-colors duration-300"></div>

                                    {/* Content on Hover (Desktop) */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                                        <p className="text-white font-agency text-lg leading-none mb-1">
                                            {photo.alt}
                                        </p>
                                        <div className="flex items-center gap-1 text-white/70 text-[10px]">
                                            <MapPin className="w-3 h-3" /> 
                                            <span className="uppercase tracking-wider">Katsina</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. CTA */}
                <section className="mt-16 md:mt-24 text-center px-6 mb-8">
                    <p className="font-lato text-sm md:text-lg text-brand-brown mb-6">
                        Follow us on social media for daily updates and live coverage.
                    </p>
                    <div className="flex justify-center gap-4 md:gap-6">
                        <Link href="#" className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-all transform hover:scale-110 shadow-sm">
                            <span className="font-agency font-bold text-lg">Fb</span>
                        </Link>
                        <Link href="#" className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-all transform hover:scale-110 shadow-sm">
                            <span className="font-agency font-bold text-lg">Ig</span>
                        </Link>
                        <Link href="#" className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-all transform hover:scale-110 shadow-sm">
                            <span className="font-agency font-bold text-lg">X</span>
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
