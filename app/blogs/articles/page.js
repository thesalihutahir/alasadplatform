"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Clock, User, Tag, ChevronRight, Search, Mail, Globe } from 'lucide-react';

export default function ArticlesPage() {

    // --- STATE MANAGEMENT ---
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLang, setActiveLang] = useState('All'); 

    const languages = ["All", "English", "Hausa", "Arabic"];
    const sidebarTags = ["Spirituality", "Fiqh", "History", "Community", "Lifestyle", "Reflections"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Articles from specific collection
                const qArticles = query(
                    collection(db, "articles"),
                    where("status", "==", "Published"),
                    orderBy("createdAt", "desc")
                );
                const articlesSnapshot = await getDocs(qArticles);
                const fetchedArticles = articlesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setArticles(fetchedArticles);

            } catch (error) {
                console.error("Error fetching articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- HELPER: Read Time Formatter (Automated) ---
    const getReadTime = (text, lang) => {
        if (!text) return '';
        const wpm = 200;
        const words = text.trim().split(/\s+/).length;
        const time = Math.ceil(words / wpm);

        if (lang === 'Arabic') return `${time} دقائق قراءة`;
        if (lang === 'Hausa') return `Minti ${time} karatu`;
        return `${time} min read`;
    };

    // --- FILTER LOGIC ---
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesLang = activeLang === 'All' || article.language === activeLang;

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
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
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

                {/* 2. MAIN CONTENT AREA */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT COLUMN: ARTICLE LIST */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Horizontal Language Filter & Search */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            {/* Horizontal Looping Buttons */}
                            <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                                {languages.map((lang) => (
                                    <button 
                                        key={lang} 
                                        onClick={() => setActiveLang(lang)}
                                        className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                                            activeLang === lang 
                                            ? 'bg-brand-brown-dark text-white border-brand-brown-dark shadow-md' 
                                            : 'bg-brand-sand text-gray-500 border-transparent hover:border-brand-gold hover:text-brand-gold'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>

                            {/* Search Bar */}
                            <div className="relative w-full md:w-64">
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search articles..." 
                                    className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm bg-gray-50"
                                />
                                <Search className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader size="md" />
                            </div>
                        ) : visibleArticles.length > 0 ? (
                            <>
                                {visibleArticles.map((item) => {
                                    const isArabic = item.language === 'Arabic';
                                    return (
                                        <Link key={item.id} href={`/blogs/read/${item.id}`} className="block group">
                                            <article className="flex flex-col md:flex-row gap-6 bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-md transition-all">
                                                {/* Image */}
                                                <div className="relative w-full md:w-48 aspect-video md:aspect-square rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                                    <Image 
                                                        src={item.featuredImage || "/fallback.webp"} 
                                                        alt={item.title} 
                                                        fill 
                                                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex flex-col justify-center flex-grow">
                                                    {/* Meta Row */}
                                                    <div className={`flex items-center gap-3 mb-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                                        <span className="text-[10px] font-bold text-white bg-brand-brown px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            {item.category}
                                                        </span>
                                                        {item.language && (
                                                            <span className="text-[10px] font-bold text-brand-brown-dark bg-brand-sand px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                {item.language}
                                                            </span>
                                                        )}
                                                        {/* Force LTR for time/icon pair even in Arabic context */}
                                                        <span className={`text-[10px] text-gray-400 flex items-center gap-1 ${isArabic ? 'mr-auto' : 'ml-auto'}`} dir="ltr">
                                                            <Clock className="w-3 h-3" /> {getReadTime(item.body || "", item.language)}
                                                        </span>
                                                    </div>

                                                    <h2 className={`text-2xl text-brand-brown-dark leading-tight mb-2 group-hover:text-brand-gold transition-colors ${isArabic ? 'font-tajawal text-right font-bold' : 'font-agency'}`}>
                                                        {item.title}
                                                    </h2>

                                                    <p className={`text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2 ${isArabic ? 'text-right font-arabic' : 'font-lato'}`}>
                                                        {item.excerpt}
                                                    </p>

                                                    <div className={`mt-auto flex items-center justify-between pt-3 border-t border-gray-50 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                                        {/* Force LTR for user/icon pair */}
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold" dir="ltr">
                                                            <User className="w-3 h-3 text-brand-gold" /> {item.author || "Admin"}
                                                        </div>
                                                        <div className={`flex items-center text-brand-gold font-bold text-xs uppercase tracking-widest group-hover:underline underline-offset-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                                            {isArabic ? 'اقرأ' : 'Read'} <ChevronRight className={`w-3 h-3 ml-1 ${isArabic ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    );
                                })}

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

                        {/* Topics Widget */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-4 border-b border-gray-200 pb-2">
                                Popular Topics
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {sidebarTags.map((cat, idx) => (
                                    <span key={idx} className="bg-brand-sand text-brand-brown text-xs px-3 py-1.5 rounded-lg cursor-default border border-transparent">
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