"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader'; // Using your custom loader
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Clock, User, Tag, ChevronRight, Search, Mail, BookOpen, Globe } from 'lucide-react';

export default function ArticlesPage() {

    // --- STATE MANAGEMENT ---
    const [articles, setArticles] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [languageFilter, setLanguageFilter] = useState('All'); // 'All', 'English', 'Hausa', 'Arabic'

    const sidebarTags = ["Spirituality", "Fiqh", "History", "Community", "Lifestyle", "Family"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Articles (Category: Article, Status: Published)
                const qArticles = query(
                    collection(db, "posts"),
                    where("category", "==", "Article"),
                    where("status", "==", "Published"),
                    orderBy("createdAt", "desc")
                );
                const articlesSnapshot = await getDocs(qArticles);
                const fetchedArticles = articlesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setArticles(fetchedArticles);

                // 2. Fetch Series (Category: Article)
                const qSeries = query(
                    collection(db, "blog_series"),
                    where("category", "==", "Article"), 
                    orderBy("createdAt", "desc")
                );
                const seriesSnapshot = await getDocs(qSeries);
                const fetchedSeries = seriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSeries(fetchedSeries);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- HELPER: Safe Date Format ---
    const formatDate = (dateInput) => {
        try {
            if (!dateInput) return '';
            // Handle Firestore Timestamp or String
            const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return '';
        }
    };

    // --- HELPER: Get Series Count ---
    const getSeriesCount = (seriesTitle) => {
        return articles.filter(a => a.series === seriesTitle).length;
    };

    // --- FILTER LOGIC ---
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesLang = languageFilter === 'All' || article.language === languageFilter;

        return matchesSearch && matchesLang;
    });

    const visibleArticles = filteredArticles.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-brand-sand font-lato">
            <Header />
            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image 
                            src="/images/heroes/blogs-articles-hero.webp" 
                            alt="Articles Hero" 
                            fill 
                            className="object-cover object-center" 
                            priority 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-sand via-brand-gold/20 to-transparent "></div>
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

                {/* 2. DYNAMIC SERIES SECTION */}
                {series.length > 0 && (
                    <section className="px-6 md:px-12 lg:px-24 mb-12 md:mb-20 max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
                            <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark">Article Series</h2>
                        </div>

                        <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 md:gap-8 scrollbar-hide snap-x">
                            {series.map((item) => (
                                <div key={item.id} className="snap-center min-w-[260px] md:min-w-0 group cursor-pointer bg-white p-3 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                                    <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-gray-100">
                                        <Image 
                                            src={item.cover || "/fallback.webp"} 
                                            alt={item.title} 
                                            fill 
                                            className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                        <div className="absolute top-2 left-2 bg-white/90 text-brand-brown-dark text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                            <BookOpen className="w-3 h-3" /> Series
                                        </div>
                                    </div>
                                    <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight px-1 group-hover:text-brand-gold transition-colors">
                                        {item.title}
                                    </h3>
                                    {item.language && (
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-1 px-1">{item.language} Series</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. MAIN CONTENT AREA */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: ARTICLE LIST */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-brand-gold" />
                                <span className="text-xs font-bold uppercase text-gray-400">Language:</span>
                                <select 
                                    value={languageFilter} 
                                    onChange={(e) => setLanguageFilter(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-brand-brown-dark focus:outline-none cursor-pointer"
                                >
                                    <option value="All">All</option>
                                    <option value="English">English</option>
                                    <option value="Hausa">Hausa</option>
                                    <option value="Arabic">Arabic</option>
                                </select>
                            </div>
                            <div className="text-xs text-gray-400 font-bold">
                                Showing {visibleArticles.length} of {filteredArticles.length}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader size="md" />
                            </div>
                        ) : visibleArticles.length > 0 ? (
                            <>
                                {visibleArticles.map((item) => (
                                    <Link key={item.id} href={`/blogs/read/${item.id}`} className="block group">
                                        <article className="flex flex-col md:flex-row gap-6 bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-md transition-all">
                                            {/* Image */}
                                            <div className="relative w-full md:w-48 aspect-video md:aspect-square rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                <Image 
                                                    src={item.coverImage || "/fallback.webp"} 
                                                    alt={item.title} 
                                                    fill 
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-col justify-center flex-grow">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-bold text-white bg-brand-brown px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {item.category}
                                                    </span>
                                                    {item.language && (
                                                        <span className="text-[10px] font-bold text-brand-brown-dark bg-brand-sand px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            {item.language}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 ml-auto">
                                                        <Clock className="w-3 h-3" /> {item.readTime || '5 min'}
                                                    </span>
                                                </div>

                                                <h2 className={`font-agency text-2xl text-brand-brown-dark leading-tight mb-2 group-hover:text-brand-gold transition-colors ${item.language === 'Arabic' ? 'font-tajawal text-right' : ''}`}>
                                                    {item.title}
                                                </h2>

                                                <p className={`font-lato text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2 ${item.language === 'Arabic' ? 'text-right font-arabic' : ''}`}>
                                                    {item.excerpt}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                                        <User className="w-3 h-3 text-brand-gold" /> {item.author || "Admin"}
                                                    </div>
                                                    <div className="flex items-center text-brand-gold font-bold text-xs uppercase tracking-widest group-hover:underline underline-offset-4">
                                                        Read <ChevronRight className="w-3 h-3 ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}

                                {/* Load More */}
                                {visibleCount < filteredArticles.length && (
                                    <div className="pt-4 text-center">
                                        <button 
                                            onClick={() => setVisibleCount(prev => prev + 5)}
                                            className="px-8 py-3 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-sm hover:bg-brand-brown-dark hover:text-white transition-colors shadow-sm"
                                        >
                                            Load More Articles
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-400 font-bold">No articles found.</p>
                                <p className="text-xs text-gray-300 mt-1">Try changing the language filter.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <aside className="hidden lg:block lg:col-span-4 space-y-8">
                        {/* Search Widget */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-4">Search Articles</h4>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Keywords..." 
                                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm bg-gray-50"
                                />
                                <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        {/* Topics Widget */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-4">Topics</h4>
                            <div className="flex flex-wrap gap-2">
                                {sidebarTags.map((cat, idx) => (
                                    <span key={idx} className="bg-brand-sand text-brand-brown text-xs px-3 py-1.5 rounded-lg hover:bg-brand-gold hover:text-white cursor-pointer transition-colors">
                                        {cat}
                                    </span>
                                ))}
                            </div>
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
                    </aside>

                </section>
            </main>
            <Footer />
        </div>
    );
}
