"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ArticlesPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-grow pb-16">
                
                {/* HERO */}
                <section className="w-full relative bg-white mb-8">
                    <div className="relative w-full aspect-[3/1]">
                        <Image src="/hero.jpg" alt="Articles" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white"></div>
                    </div>
                    <div className="relative -mt-16 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark">Articles</h1>
                        <p className="font-lato text-xs text-brand-brown">Reflections & Knowledge</p>
                    </div>
                </section>

                {/* ARTICLE LIST */}
                <section className="px-6 space-y-8">
                    {[1, 2, 3, 4].map((item) => (
                        <article key={item} className="group border-b border-gray-100 pb-8 last:border-0">
                            {/* Meta */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold text-white bg-brand-brown px-2 py-0.5 rounded-full">
                                    Spirituality
                                </span>
                                <span className="text-[10px] text-gray-400">5 min read</span>
                            </div>
                            
                            {/* Title */}
                            <h2 className="font-agency text-2xl text-brand-brown-dark leading-tight mb-3 group-hover:text-brand-gold transition-colors cursor-pointer">
                                The Importance of Sincerity (Ikhlas) in Daily Actions
                            </h2>
                            
                            {/* Excerpt */}
                            <p className="font-lato text-sm text-brand-brown/80 leading-relaxed mb-4 line-clamp-3">
                                Sincerity is the soul of every deed. Without it, actions are like a body without a soul. In this article, we explore how to cultivate Ikhlas...
                            </p>
                            
                            {/* Read More */}
                            <div className="flex items-center text-brand-gold font-bold text-xs uppercase tracking-widest cursor-pointer">
                                Read Article <span className="ml-1">→</span>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
            <Footer />
        </div>
    );
}
