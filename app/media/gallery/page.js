"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GalleryPage() {
    
    // Mock Data for Gallery Images
    // Note: In a real app, we would use a 'Masonry' library, but for this design 
    // we will use CSS columns which works perfectly for simple masonry.
    const photos = [
        { id: 1, src: "/hero.jpg", alt: "Sheikh leading prayer", height: "h-64" },
        { id: 2, src: "/hero.jpg", alt: "Community gathering", height: "h-48" },
        { id: 3, src: "/hero.jpg", alt: "Student graduation", height: "h-72" },
        { id: 4, src: "/hero.jpg", alt: "Food distribution", height: "h-56" },
        { id: 5, src: "/hero.jpg", alt: "Mosque construction", height: "h-64" },
        { id: 6, src: "/hero.jpg", alt: "Ramadan lecture", height: "h-48" },
        { id: 7, src: "/hero.jpg", alt: "Youth workshop", height: "h-80" },
        { id: 8, src: "/hero.jpg", alt: "Eid celebration", height: "h-56" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" 
                            alt="Gallery Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-20 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-3 drop-shadow-sm">
                            Photo Gallery
                        </h1>
                        <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                        <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                            Visual moments from our journey in serving the community and spreading knowledge.
                        </p>
                    </div>
                </section>

                {/* 2. GALLERY GRID (CSS COLUMNS) */}
                <section className="px-4">
                    {/* Columns: 2 on mobile, 3 on tablet, 4 on desktop */}
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative w-full break-inside-avoid rounded-2xl overflow-hidden shadow-md group">
                                {/* Random heights simulated by aspect ratio or class in real data */}
                                <div className={`relative w-full ${photo.height}`}>
                                    <Image
                                        src={photo.src}
                                        alt={photo.alt}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-brand-brown-dark/0 group-hover:bg-brand-brown-dark/40 transition-colors duration-300"></div>
                                    
                                    {/* Caption on Hover */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                                        <p className="text-white font-agency text-lg leading-none">
                                            {photo.alt}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. CTA */}
                <section className="mt-12 text-center px-6">
                    <p className="font-lato text-sm text-brand-brown mb-4">
                        Follow us on social media for daily updates.
                    </p>
                    <div className="flex justify-center gap-4">
                        {/* Simple Social Icons Placeholder */}
                        <div className="w-10 h-10 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-colors cursor-pointer">
                            <span className="font-agency font-bold">Fb</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-colors cursor-pointer">
                            <span className="font-agency font-bold">Ig</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-colors cursor-pointer">
                            <span className="font-agency font-bold">X</span>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
