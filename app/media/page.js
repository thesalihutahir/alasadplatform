"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MediaPage() {
    
    // Media Categories Configuration
    const categories = [
        {
            id: 'videos',
            title: 'Videos',
            subtitle: 'Lectures & Events',
            link: '/media/videos',
            image: '/hero.jpg', // Placeholder: Video thumbnail/Camera
            icon: '/mediaicon.svg' // You might want specific icons later like 'videoicon.svg'
        },
        {
            id: 'audios',
            title: 'Audios',
            subtitle: 'Sermons & Tafsir',
            link: '/media/audios',
            image: '/hero.jpg', // Placeholder: Microphone/Waveform
            icon: '/mediaicon.svg' 
        },
        {
            id: 'podcasts',
            title: 'Podcasts',
            subtitle: 'Discussions',
            link: '/media/podcasts',
            image: '/hero.jpg', // Placeholder: Studio setting
            icon: '/mediaicon.svg'
        },
        {
            id: 'ebooks',
            title: 'eBooks',
            subtitle: 'Publications',
            link: '/media/ebooks',
            image: '/hero.jpg', // Placeholder: Bookshelf/Paper
            icon: '/mediaicon.svg'
        },
        {
            id: 'gallery',
            title: 'Gallery',
            subtitle: 'Photos & Moments',
            link: '/media/gallery',
            image: '/hero.jpg', // Placeholder: Photo collage
            icon: '/mediaicon.svg'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" // Placeholder: Library or Recording studio image
                            alt="Media Library Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-20 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-3 drop-shadow-sm">
                            Media & Resources
                        </h1>
                        <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                        <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                            Access our archive of knowledge, lectures, and publications. Designed to inspire and educate.
                        </p>
                    </div>
                </section>

                {/* 2. CATEGORY GRID */}
                <section className="px-6 mb-12">
                    <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 text-left">
                        Browse Archive
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <Link 
                                key={cat.id} 
                                href={cat.link}
                                className={`group relative rounded-2xl overflow-hidden shadow-md aspect-square ${cat.id === 'gallery' ? 'col-span-2 aspect-[2.5/1]' : ''}`}
                            >
                                {/* Background Image */}
                                <Image
                                    src={cat.image}
                                    alt={cat.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-brand-brown-dark/60 group-hover:bg-brand-brown-dark/50 transition-colors"></div>

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                                    <div className="w-10 h-10 mb-2 relative opacity-80 group-hover:opacity-100 transition-opacity">
                                         {/* Note: Using generic media icon for now, ideally use specific ones */}
                                        <Image src={cat.icon} alt="Icon" fill className="object-contain invert brightness-0" /> 
                                    </div>
                                    <h3 className="font-agency text-xl text-white tracking-wide">
                                        {cat.title}
                                    </h3>
                                    <p className="font-lato text-[10px] text-white/80 uppercase tracking-widest mt-1">
                                        {cat.subtitle}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 3. FEATURED / LATEST UPLOAD */}
                <section className="px-6">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="font-agency text-2xl text-brand-brown-dark">
                            Latest Release
                        </h2>
                    </div>

                    <div className="bg-brand-sand rounded-2xl overflow-hidden shadow-lg border border-brand-gold/20">
                        {/* Video Preview Area */}
                        <div className="relative w-full aspect-video bg-black">
                             <iframe
                                className="absolute inset-0 w-full h-full"
                                src="https://www.youtube.com/embed/BYdCnmAgvhs?rel=0&modestbranding=1"
                                title="Featured Lecture"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        
                        {/* Info Area */}
                        <div className="p-5">
                            <span className="inline-block px-2 py-1 bg-brand-gold text-white text-[10px] font-bold uppercase rounded mb-3">
                                New Video
                            </span>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-2">
                                Understanding the Rights of Neighbors
                            </h3>
                            <p className="font-lato text-sm text-brand-brown line-clamp-2 mb-4">
                                A profound discussion by Sheikh Muneer Ja'afar on the importance of community cohesion and social welfare in Islam.
                            </p>
                            <Link href="/media/videos" className="text-brand-gold font-bold text-xs uppercase tracking-widest flex items-center hover:underline">
                                Watch Full Series <span className="ml-1">→</span>
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
