"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PenTool, Newspaper, ScrollText, ArrowRight, Calendar, User } from 'lucide-react';

export default function BlogsPage() {

    // Blog Categories
    const categories = [
        {
            id: 'articles',
            title: 'Articles',
            description: 'Reflections on faith, society, and personal growth.',
            link: '/blogs/articles',
            icon: PenTool 
        },
        {
            id: 'updates',
            title: 'News & Updates',
            description: 'Latest happenings, events, and foundation announcements.',
            link: '/blogs/updates',
            icon: Newspaper
        },
        {
            id: 'research',
            title: 'Research & Papers',
            description: 'Scholarly publications and academic discourses.',
            link: '/blogs/research-and-publications',
            icon: ScrollText
        }
    ];

    // Mock "Featured" Article
    const featured = {
        title: "The Role of the Youth in Nation Building",
        excerpt: "An exploration of how young Muslims can contribute to national development while upholding their Islamic identity. We delve into historical examples and modern applications.",
        date: "22 Dec 2024",
        category: "Article",
        author: "Sheikh Muneer",
        image: "/hero.jpg", 
        link: "/blogs/articles" 
    };

    // Mock Recent Posts
    const recentPosts = [
        {
            id: 1,
            title: "Community outreach program reaches 500 families",
            category: "News",
            date: "20 Dec 2024",
            image: "/hero.jpg"
        },
        {
            id: 2,
            title: "Understanding the Fiqh of Fasting: A Prerequisite",
            category: "Article",
            date: "18 Dec 2024",
            image: "/hero.jpg"
        },
        {
            id: 3,
            title: "New vocational center construction update",
            category: "Update",
            date: "15 Dec 2024",
            image: "/hero.jpg"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/blogs-overview-hero.webp" // Placeholder
                            alt="Blogs Hero"
                            fill
                            className="object-cover object-center opacity-80"
                            priority
                        />
                        {/* Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/60 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Insights & Updates
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Read our latest thoughts, foundation news, and scholarly research. A hub for intellectual and spiritual growth.
                        </p>
                    </div>
                </section>

                {/* 2. CATEGORY NAV CARDS (Mobile: Stack / Desktop: Grid) */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Link 
                                    key={cat.id} 
                                    href={cat.link}
                                    className="flex md:flex-col md:items-center md:text-center items-center p-4 md:p-8 bg-brand-sand/40 rounded-xl md:rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-brand-sand transition-all group"
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-gold group-hover:scale-110 transition-transform mb-0 md:mb-4">
                                        <Icon className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>
                                    <div className="ml-4 md:ml-0">
                                        <h3 className="font-agency text-xl md:text-2xl text-brand-brown-dark leading-none mb-1 md:mb-3 group-hover:text-brand-gold transition-colors">
                                            {cat.title}
                                        </h3>
                                        <p className="font-lato text-xs md:text-sm text-brand-brown leading-tight md:leading-relaxed">
                                            {cat.description}
                                        </p>
                                    </div>
                                    <div className="ml-auto md:ml-0 md:mt-4 text-brand-brown-dark/30 group-hover:text-brand-gold transition-colors">
                                        <ArrowRight className="w-5 h-5 md:hidden" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* 3. FEATURED STORY (Mobile: Stack / Desktop: Split Layout) */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark mb-6 md:mb-8 border-l-4 border-brand-gold pl-3 md:pl-6">
                        Featured Read
                    </h2>

                    <Link href={featured.link} className="block group">
                        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
                            {/* Image Side */}
                            <div className="relative w-full lg:w-3/5 aspect-video rounded-2xl overflow-hidden shadow-lg">
                                <Image
                                    src={featured.image}
                                    alt={featured.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3 bg-brand-gold text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded shadow-sm uppercase tracking-widest">
                                    {featured.category}
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className="lg:w-2/5 flex flex-col justify-center">
                                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2 md:mb-3">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {featured.date}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {featured.author}</span>
                                </div>
                                <h3 className="font-agency text-2xl md:text-4xl text-brand-brown-dark leading-tight mb-3 md:mb-4 group-hover:text-brand-gold transition-colors">
                                    {featured.title}
                                </h3>
                                <p className="font-lato text-sm md:text-lg text-brand-brown line-clamp-3 md:line-clamp-4 mb-4 leading-relaxed">
                                    {featured.excerpt}
                                </p>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-brand-brown-dark transition-colors flex items-center gap-2">
                                    Read More <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </Link>
                </section>

                {/* 4. RECENT POSTS LIST (Mobile: List / Desktop: Grid) */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <h3 className="font-agency text-xl md:text-3xl text-brand-brown-dark mb-6 md:mb-8 opacity-80 border-b border-gray-100 pb-2">
                        Recent Posts
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {recentPosts.map((item) => (
                            <div key={item.id} className="group flex md:flex-col gap-4 items-start md:bg-white md:rounded-2xl md:overflow-hidden md:shadow-md md:hover:shadow-xl md:border md:border-gray-100 transition-all">
                                
                                {/* Thumbnail */}
                                <div className="relative w-24 h-24 md:w-full md:h-48 flex-shrink-0 rounded-lg md:rounded-none overflow-hidden bg-brand-sand">
                                    <Image src={item.image} alt="Post thumbnail" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    {/* Desktop Date Badge */}
                                    <div className="hidden md:block absolute bottom-0 left-0 bg-white/90 px-3 py-1 text-xs font-bold text-brand-brown-dark rounded-tr-lg">
                                        {item.date}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="md:p-5 md:flex-grow">
                                    <span className="text-[10px] md:text-xs text-brand-gold font-bold uppercase tracking-widest">
                                        {item.category}
                                    </span>
                                    <h4 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight mb-1 md:mt-2 line-clamp-2 md:line-clamp-3 group-hover:text-brand-gold transition-colors">
                                        {item.title}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 md:hidden">{item.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
