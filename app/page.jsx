// app/page.jsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Globe, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getNewsArticles, getPrograms, getMultimedia } from '@/lib/firestore-utils';

export default function HomePage() {
    const [news, setNews] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [newsData, programsData] = await Promise.all([
                getNewsArticles(),
                getPrograms()
            ]);
            // Sort by a mock 'date' or just take the first few
            setNews(newsData.slice(0, 3));
            setPrograms(programsData.slice(0, 3));
            setLoading(false);
        };
        loadData();
    }, []);
    
    // Placeholder function for fetching images/videos
    const getPlaceholderImage = (index) => {
        const images = [
            "https://placehold.co/600x400/9d816c/ffffff?text=Education",
            "https://placehold.co/600x400/c39d6e/ffffff?text=Outreach",
            "https://placehold.co/600x400/6e4e3b/ffffff?text=Community",
        ];
        return images[index % images.length];
    };

    return (
        <div className="min-h-screen flex flex-col font-body">
            <Header />
            <main className="flex-grow">
                
                {/* 1. HERO SECTION (Using Tailwind bg-hero) */}
                <section className="bg-hero bg-cover bg-center h-screen flex items-center justify-center relative before:content-[''] before:absolute before:inset-0 before:bg-black/50">
                    <div className="relative z-10 text-center px-4 max-w-4xl">
                        <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 font-heading tracking-widest leading-tight uppercase">
                            Empowering Minds,<br/> Building Futures
                        </h1>
                        <p className="text-xl sm:text-2xl text-brand-sand/90 mb-10 font-medium">
                            Dedicated to fostering academic excellence and Islamic values in our community.
                        </p>
                        <Link
                            href="/donate"
                            className="inline-flex items-center px-8 py-4 text-xl font-bold rounded-full shadow-2xl text-white bg-brand-gold hover:bg-brand-brown-dark transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Support Our Mission
                            <ArrowRight className="w-6 h-6 ml-3" />
                        </Link>
                    </div>
                </section>

                {/* 2. CORE VALUES/STATISTICS SECTION */}
                <section className="py-16 bg-brand-sand">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-brown-dark mb-12 font-heading uppercase">
                            Our Impact in Numbers
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { icon: BookOpen, number: '500+', label: 'Students Enrolled' },
                                { icon: Users, number: '15+', label: 'Community Programs' },
                                { icon: Globe, number: '3', label: 'Areas of Outreach' },
                            ].map((item, index) => (
                                <div key={index} className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-brand-gold">
                                    <item.icon className="w-12 h-12 text-brand-gold mx-auto mb-4" />
                                    <div className="text-5xl font-extrabold text-brand-brown-dark font-heading mb-2">{item.number}</div>
                                    <p className="text-lg text-gray-600 font-semibold">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* 3. LATEST NEWS SECTION */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-brown-dark mb-10 text-center font-heading uppercase">
                            Latest News & Updates
                        </h2>
                        {loading ? (
                            <p className="text-center text-gray-500">Loading news...</p>
                        ) : news.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {news.map((article, index) => (
                                    <Link key={article.id} href={`/news/${article.id}`} className="block">
                                        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                            <img 
                                                src={article.imageUrl || getPlaceholderImage(index)} 
                                                alt={article.title || "News Article"} 
                                                className="w-full h-48 object-cover" 
                                                onError={(e) => { e.target.onerror = null; e.target.src=getPlaceholderImage(index) }}
                                            />
                                            <div className="p-6">
                                                <p className="text-sm font-semibold text-brand-gold uppercase mb-2">{article.category || 'Event'}</p>
                                                <h3 className="text-xl font-bold text-brand-brown-dark mb-3 truncate font-heading">{article.title || 'Untitled Article'}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-3">{article.summary || 'A summary of the latest happenings and activities at the Al Asad Platform.'}</p>
                                                <span className="mt-4 inline-flex items-center text-brand-gold hover:text-brand-brown-dark text-sm font-semibold transition">
                                                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No recent news available.</p>
                        )}
                         <div className="text-center mt-12">
                            <Link
                                href="/news"
                                className="inline-flex items-center px-6 py-3 border-2 border-brand-brown-dark text-base font-bold rounded-full text-brand-brown-dark bg-transparent hover:bg-brand-brown-dark hover:text-white transition"
                            >
                                View All News
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}