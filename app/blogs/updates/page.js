"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UpdatesPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-grow pb-16">
                
                {/* HERO */}
                <section className="w-full relative bg-white mb-8">
                    <div className="relative w-full aspect-[3/1]">
                        <Image src="/hero.jpg" alt="News" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white"></div>
                    </div>
                    <div className="relative -mt-16 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark">News & Updates</h1>
                        <p className="font-lato text-xs text-brand-brown">Foundation Activities</p>
                    </div>
                </section>

                {/* NEWS FEED */}
                <section className="px-6 space-y-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-brand-sand/30 rounded-xl p-4 flex gap-4 items-start shadow-sm border border-transparent hover:border-brand-gold/20 transition-all">
                            {/* Date Box */}
                            <div className="flex-shrink-0 w-14 bg-white rounded-lg flex flex-col items-center justify-center py-2 shadow-sm text-brand-brown-dark">
                                <span className="font-agency text-2xl leading-none font-bold">20</span>
                                <span className="font-lato text-[10px] uppercase font-bold text-brand-gold">DEC</span>
                            </div>
                            
                            {/* Content */}
                            <div>
                                <h3 className="font-agency text-xl text-brand-brown-dark leading-tight mb-2">
                                    Annual Qur'an Graduation Ceremony Announced
                                </h3>
                                <p className="font-lato text-xs text-brand-brown leading-relaxed mb-2">
                                    We are pleased to announce the date for the 5th annual Ma'ahad graduation. All parents are invited.
                                </p>
                                <span className="text-[10px] font-bold text-brand-brown-dark underline decoration-brand-gold">
                                    See Details
                                </span>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
            <Footer />
        </div>
    );
}
