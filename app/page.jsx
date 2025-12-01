// app/page.jsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Zap, ArrowRight, Video, FileText, Image, CalendarDays } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getNewsArticles, getPrograms, getMultimedia } from '@/lib/firestore-utils';

// Placeholder data for sections based on the mockup structure
const MOCK_PILLARS = [
    { icon: BookOpen, label: 'Educational Support', description: "Providing resources for Qur'an-centered learning and excellence." },
    { icon: Users, label: 'Community Development', description: "Empowering individuals and fostering social progress." },
    { icon: Zap, label: 'Training and Innovation', description: "Developing skills and embracing modern educational techniques." },
];

const FEATURED_PROGRAM = {
    title: 'Tafsir & Hifz',
    summary: "Our flagship program dedicated to deep study of the Qur'an interpretation and memorization.",
    image: "https://placehold.co/600x400/4E3C2C/ffffff?text=Tafsir+%26+Hifz"
};

// Placeholder utility for fetching images/videos
const getPlaceholderImage = (index) => {
    const images = [
        "https://placehold.co/400x250/B08968/ffffff?text=Weekly+Tafsir",
        "https://placehold.co/400x250/9d816c/ffffff?text=Event+Photo",
        "https://placehold.co/400x250/4E3C2C/ffffff?text=Outreach",
    ];
    return images[index % images.length];
};

export default function HomePage() {
    const [news, setNews] = useState([]);
    const [programs, setPrograms] = useState(MOCK_PILLARS); // Using mock pillars for now
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data loading for now
        const loadData = async () => {
            const [newsData, programsData] = await Promise.all([
                getNewsArticles(),
                getPrograms()
            ]);
            setNews(newsData.slice(0, 3));
            // setPrograms(programsData.slice(0, 3)); // Use mock pillars for section 2
            setLoading(false);
        };
        loadData();
    }, []);
    
    // Placeholder data for upcoming events
    const UPCOMING_EVENTS = [
        { day: 27, month: 'SEP', title: 'Weekly Tafsir by Sheikh T.', type: 'Lecture', link: '#' },
        { day: 28, month: 'DEC', title: 'Community Outreach Seminar', type: 'Event', link: '#' },
    ];


    return (
        <div className="min-h-screen flex flex-col font-body bg-brand-sand">
            <Header />
            <main className="flex-grow">
                
                {/* 1. HERO SECTION (Matching Mockup Text) */}
                <section className="bg-hero bg-cover bg-center h-[90vh] flex items-center relative before:content-[''] before:absolute before:inset-0 before:bg-black/40">
                    <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        <div className="max-w-xl lg:max-w-2xl text-white">
                            <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 font-heading tracking-wider leading-tight">
                                Guiding through Qur'an, Empowering Communities
                            </h1>
                            <p className="text-xl text-gray-100 mb-8 font-medium">
                                To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
                            </p>
                            <Link
                                href="/donate"
                                className="inline-flex items-center px-8 py-4 text-lg font-bold rounded-xl shadow-2xl text-brand-brown-dark bg-brand-gold hover:bg-brand-brown-dark hover:text-white transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                Donate Now
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 2. PILLARS / NAVIGATION ROW (As seen in Mockup's mobile view) */}
                <section className="py-8 bg-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-8 justify-items-center">
                            {[
                                { name: 'Programs', href: '/programs', icon: BookOpen },
                                { name: 'Multimedia', href: '/multimedia', icon: Video },
                                { name: 'News', href: '/news', icon: FileText },
                                { name: 'Donate', href: '/donate', icon: DollarSign },
                                { name: 'Photos', href: '/multimedia?type=photos', icon: Image },
                            ].map((item, index) => (
                                <Link key={index} href={item.href} className="flex flex-col items-center p-3 sm:p-4 rounded-xl hover:bg-brand-sand transition-colors w-full">
                                    <item.icon className="w-8 h-8 text-brand-gold mb-1" />
                                    <p className="text-sm font-semibold text-brand-brown-dark mt-1 font-heading uppercase">{item.name}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. FEATURED PROGRAM SECTION (Tafsir & Hifz) */}
                <section className="py-16 bg-brand-sand">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:w-3/4 mx-auto p-6 lg:p-10 featured-background card-shadow">
                            <h2 className="text-2xl font-bold text-brand-brown-dark mb-4 font-heading uppercase">
                                Featured Program: <span className="text-brand-gold">{FEATURED_PROGRAM.title}</span>
                            </h2>
                            <div className="lg:flex gap-6 items-center">
                                <img 
                                    src={FEATURED_PROGRAM.image}
                                    alt={FEATURED_PROGRAM.title}
                                    className="w-full lg:w-1/3 h-48 object-cover rounded-lg mb-4 lg:mb-0"
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/B08968/ffffff?text=Tafsir+%26+Hifz" }}
                                />
                                <div className="lg:w-2/3">
                                    <p className="text-gray-700 mb-4">{FEATURED_PROGRAM.summary} Our mission is expanding access to knowledge through Qur'an-centered and community driven education. Join us in building a future shaped by knowledge and faith.</p>
                                    <Link 
                                        href="/programs/tafsir-hifz" 
                                        className="inline-flex items-center text-sm font-semibold text-white bg-brand-brown-dark px-4 py-2 rounded-full hover:bg-brand-gold hover:text-brand-brown-dark transition"
                                    >
                                        Learn More <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* 4. LATEST NEWS & FEATURED LECTURE (Side-by-Side as in Mockup) */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            
                            {/* LEFT COLUMN: Latest News */}
                            <div className="lg:col-span-2 space-y-8">
                                <h2 className="text-3xl font-extrabold text-brand-brown-dark font-heading uppercase border-b-2 border-brand-gold pb-2 mb-6">
                                    Latest News
                                </h2>
                                {loading ? (
                                    <p className="text-gray-500">Loading news...</p>
                                ) : news.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {news.map((article, index) => (
                                            <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                                                <img 
                                                    src={article.imageUrl || getPlaceholderImage(index)} 
                                                    alt={article.title || "News Article"} 
                                                    className="w-full h-32 object-cover" 
                                                    onError={(e) => { e.target.onerror = null; e.target.src=getPlaceholderImage(index) }}
                                                />
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-brand-brown-dark mb-1 truncate font-heading">{article.title || 'Weekly Tafsir by Shiekh'}</h3>
                                                    <p className="text-gray-600 text-sm line-clamp-2">{article.summary || 'A summary of the latest happenings and activities...'}</p>
                                                    <Link href={`/news/${article.id}`} className="mt-3 inline-flex items-center text-brand-gold hover:text-brand-brown-dark text-xs font-semibold transition">
                                                        Read More <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No recent news available.</p>
                                )}
                                
                                {/* Featured Lecture/Video Player */}
                                <div className="pt-8">
                                    <h2 className="text-3xl font-extrabold text-brand-brown-dark font-heading uppercase border-b-2 border-brand-gold pb-2 mb-6">
                                        Featured Lecture
                                    </h2>
                                    <div className="relative bg-black rounded-xl overflow-hidden shadow-xl aspect-video">
                                        <img 
                                            src="https://placehold.co/1200x675/4E3C2C/ffffff?text=Video+Placeholder" 
                                            alt="Featured Lecture"
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                            <button className="text-white p-4 rounded-full bg-brand-gold/80 hover:bg-brand-gold transition-colors">
                                                <Video className="w-10 h-10 fill-current" />
                                            </button>
                                            <p className="mt-4 text-xl font-bold text-white font-heading">Weekly Tafsir by Sheikh Y.</p>
                                            <p className="text-sm text-gray-200">Date: Friday, December 2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* RIGHT COLUMN: Upcoming Events */}
                            <div className="lg:col-span-1 p-6 bg-brand-sand rounded-xl card-shadow h-fit">
                                <h2 className="text-2xl font-extrabold text-brand-brown-dark font-heading uppercase border-b border-brand-gold pb-3 mb-6">
                                    Upcoming Events
                                </h2>
                                <div className="space-y-6">
                                    {UPCOMING_EVENTS.map((event, index) => (
                                        <div key={index} className="flex items-start bg-white p-4 rounded-lg shadow-sm border-l-4 border-brand-gold">
                                            <div className="flex-shrink-0 text-center mr-4 p-2 border-r border-gray-200">
                                                <div className="text-3xl font-bold text-brand-brown-dark font-heading leading-none">{event.day}</div>
                                                <div className="text-sm font-medium text-brand-gold uppercase">{event.month}</div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-brand-brown-dark font-heading">{event.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{event.type} | <CalendarDays className="inline w-3 h-3 mr-1" /> 10:00 AM</p>
                                                <Link href={event.link} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                                                    Register Now
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 text-center">
                                        <Link 
                                            href="/programs" 
                                            className="inline-flex items-center text-sm font-semibold text-brand-brown-dark hover:text-brand-gold transition"
                                        >
                                            View All Events <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* 5. VISION & MISSION SECTION (Inspired by the banner structure) */}
                <section className="py-16 bg-brand-brown-dark text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-extrabold text-brand-gold mb-12 font-heading uppercase">
                            Our Core Mission
                        </h2>
                        
                        {/* Pillars */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                            {programs.map((item, index) => (
                                <div key={index} className="p-6 bg-brand-brown-dark/70 rounded-xl shadow-lg border-t-4 border-brand-gold hover:bg-brand-brown-dark/90 transition-all">
                                    <item.icon className="w-12 h-12 text-brand-gold mx-auto mb-4" />
                                    <h3 className="text-xl font-bold font-heading mb-2">{item.label}</h3>
                                    <p className="text-sm text-gray-300">{item.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Statements */}
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div>
                                <h3 className="text-2xl font-extrabold text-brand-gold mb-3 font-heading uppercase">Vision Statement</h3>
                                <p className="text-lg text-gray-200">
                                    "To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities."
                                </p>
                            </div>
                            <div className="pt-4">
                                <h3 className="text-2xl font-extrabold text-brand-gold mb-3 font-heading uppercase">Mission Statement</h3>
                                <p className="text-lg text-gray-200">
                                    "Expanding access to knowledge through Qur'an-centered and community driven education."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}