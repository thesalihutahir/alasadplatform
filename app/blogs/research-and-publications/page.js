"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ResearchPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-grow pb-16">
                
                {/* HERO */}
                <section className="w-full relative bg-white mb-8">
                    <div className="relative w-full aspect-[3/1]">
                        <Image src="/hero.jpg" alt="Research" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white"></div>
                    </div>
                    <div className="relative -mt-16 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark">Research</h1>
                        <p className="font-lato text-xs text-brand-brown">Scholarly Papers & Analysis</p>
                    </div>
                </section>

                {/* PAPERS LIST */}
                <section className="px-6 space-y-4">
                    {[1, 2].map((item) => (
                        <div key={item} className="bg-white border-l-4 border-brand-brown-dark rounded-r-xl shadow-md p-5 hover:bg-brand-sand/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] font-bold text-white bg-brand-gold px-2 py-0.5 rounded">
                                    JURISPRUDENCE
                                </span>
                                <span className="text-[9px] text-gray-400">PDF Available</span>
                            </div>
                            
                            <h3 className="font-agency text-xl text-brand-brown-dark leading-tight mb-2">
                                Analysis of Zakat Distribution in Northern Nigeria
                            </h3>
                            
                            <p className="font-lato text-xs text-brand-brown italic mb-3">
                                Abstract: This paper examines the challenges and solutions for effective Zakat management...
                            </p>
                            
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 relative overflow-hidden">
                                     <Image src="/hero.jpg" alt="Author" fill className="object-cover" />
                                </div>
                                <span className="text-[10px] font-bold text-brand-brown-dark">Sheikh Muneer Ja'afar</span>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
            <Footer />
        </div>
    );
}
