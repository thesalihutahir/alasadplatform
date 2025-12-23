"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock, User, Tag, ChevronRight, Search, Mail } from 'lucide-react';

export default function ArticlesPage() {

    // Mock Data for Article Series (The "Playlists" of text)
    const articleSeries = [
        {
            id: 1,
            title: "The Fiqh of Prayer (Salat)",
            parts: 4,
            image: "/hero.jpg",
        },
        {
            id: 2,
            title: "Ramadan Preparation Guide",
            parts: 6,
            image: "/hero.jpg",
        },
        {
            id: 3,
            title: "Islamic Finance Basics",
            parts: 3,
            image: "/hero.jpg",
        }
    ];

    // Mock Data for Articles
    const articles = [
        {
            id: 1,
            title: "The Importance of Sincerity (Ikhlas) in Daily Actions",
            excerpt: "Sincerity is the soul of every deed. Without it, actions are like a body without a soul. In this article, we explore how to cultivate Ikhlas in a distracted world.",
            category: "Spirituality",
            author: "Sheikh Muneer",
            readTime: "5 min read",
            date: "22 Dec 2024",
            image: "/hero.jpg"
        },
        {
            id: 2,
            title: "Balancing Deen and Dunya: A Student's Perspective",
            excerpt: "How to maintain academic excellence while staying true to your spiritual obligations. Practical tips for university students.",
            category: "Lifestyle",
            author: "Dr. Ahmed",
            readTime: "8 min read",
            date: "18 Dec 2024",
            image: "/hero.jpg"
        },
        {
            id: 3,
            title: "Understanding the Rights of Neighbors in Islam",
            excerpt: "The Prophet (SAW) emphasized the rights of neighbors so much that the Companions thought they would inherit. Let's revisit these duties.",
            category: "Community",
            author: "Ustadh Ali",
            readTime: "6 min read",
            date: "10 Dec 2024",
            image: "/hero.jpg"
        },
        {
            id: 4,
            title: "The History of Islamic Scholarship in Katsina",
            excerpt: "Tracing the roots of knowledge in our region and the legacy left behind by great scholars of the past.",
            category: "History",
            author: "Research Team",
            readTime: "12 min read",
            date: "05 Dec 2024",
            image: "/hero.jpg"
        }
    ];

    const categories = ["Spirituality", "Fiqh", "History", "Community", "Lifestyle", "Family"];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />
            <main className="flex-grow pb-16">
                
                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image 
                            src="/hero.jpg" 
                            alt="Articles Hero" 
                            fill 
                            className="object-cover object-center" 
                            priority 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
                    </div>
                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Articles
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Reflections, knowledge, and insights. Deep dive into topics that matter to your faith and daily life.
                        </p>
                    </div>
                </section>

                {/* 2. FEATURED SERIES (Horizontal Scroll / Grid) */}
                <section className="px-6 md:px-12 lg:px-24 mb-12 md:mb-20 max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                        <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                            Article Series
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                            Curated Collections
                        </span>
                    </div>

                    <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 md:gap-8 scrollbar-hide snap-x">
                        {articleSeries.map((item) => (
                            <div key={item.id} className="snap-center min-w-[220px] md:min-w-0 group cursor-pointer">
                                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3">
                                    <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-brand-brown-dark/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded uppercase tracking-wider">View Series</span>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                                        {item.parts} Parts
                                    </div>
                                </div>
                                <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors">
                                    {item.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. MAIN CONTENT AREA (Grid Layout for Desktop) */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: ARTICLE LIST (Spans 8 cols) */}
                    <div className="lg:col-span-8 space-y-8 md:space-y-12">
                        <div className="flex items-center justify-between mb-4 md:mb-0">
                            <h3 className="font-agency text-2xl md:text-3xl text-brand-brown-dark">
                                Latest Reads
                            </h3>
                            {/* Mobile Search Icon (Hidden on Desktop) */}
                            <button className="lg:hidden p-2 text-gray-400">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>

                        {articles.map((item) => (
                            <article key={item.id} className="group flex flex-col md:flex-row gap-6 md:gap-8 border-b border-gray-100 pb-8 last:border-0">
                                
                                {/* Image Thumbnail (Hidden on small mobile if desired, but good to have) */}
                                <div className="relative w-full md:w-1/3 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0">
                                    <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                </div>

                                {/* Content */}
                                <div className="flex flex-col justify-center">
                                    {/* Meta */}
                                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                                        <span className="text-[10px] md:text-xs font-bold text-white bg-brand-brown px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {item.category}
                                        </span>
                                        <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {item.readTime}
                                        </span>
                                    </div>
                                    
                                    {/* Title */}
                                    <Link href="#">
                                        <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark leading-tight mb-2 md:mb-3 group-hover:text-brand-gold transition-colors cursor-pointer">
                                            {item.title}
                                        </h2>
                                    </Link>
                                    
                                    {/* Excerpt */}
                                    <p className="font-lato text-sm md:text-base text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                        {item.excerpt}
                                    </p>
                                    
                                    {/* Footer Meta */}
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                            <User className="w-3 h-3 text-brand-gold" /> {item.author}
                                        </div>
                                        <div className="flex items-center text-brand-gold font-bold text-xs uppercase tracking-widest cursor-pointer group-hover:underline underline-offset-4">
                                            Read <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {/* Pagination / Load More */}
                        <div className="pt-8 text-center">
                            <button className="px-8 py-3 border-2 border-brand-sand text-brand-brown-dark rounded-full font-agency text-lg hover:bg-brand-brown-dark hover:text-white transition-colors">
                                Load More Articles
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR (Spans 4 cols - Hidden on Mobile, Visible on Desktop) */}
                    <aside className="hidden lg:block lg:col-span-4 space-y-12 pl-8 border-l border-gray-100">
                        
                        {/* Search Widget */}
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-4">Search Articles</h4>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Keywords..." 
                                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm bg-white"
                                />
                                <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        {/* Categories Widget */}
                        <div>
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-4 border-b border-gray-200 pb-2">
                                Categories
                            </h4>
                            <ul className="space-y-3">
                                {categories.map((cat, idx) => (
                                    <li key={idx}>
                                        <Link href="#" className="flex items-center justify-between group">
                                            <span className="text-sm text-gray-600 group-hover:text-brand-gold transition-colors">{cat}</span>
                                            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-colors">12</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter Widget */}
                        <div className="bg-brand-brown-dark text-white p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <Mail className="w-8 h-8 text-brand-gold mb-4" />
                            <h4 className="font-agency text-2xl mb-2">Weekly Wisdom</h4>
                            <p className="text-sm text-white/70 mb-6">Get the latest articles and reflections delivered to your inbox.</p>
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 mb-3 text-sm focus:outline-none focus:border-brand-gold"
                            />
                            <button className="w-full py-2 bg-brand-gold text-white font-bold text-sm rounded-lg uppercase tracking-wide hover:bg-white hover:text-brand-brown-dark transition-colors">
                                Subscribe
                            </button>
                        </div>

                        {/* Popular Tags */}
                        <div>
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-4">Popular Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {['Prayer', 'Zakat', 'Youth', 'Marriage', 'Quran', 'History'].map(tag => (
                                    <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-brand-gold hover:text-white transition-colors cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </aside>

                </section>
            </main>
            <Footer />
        </div>
    );
}
