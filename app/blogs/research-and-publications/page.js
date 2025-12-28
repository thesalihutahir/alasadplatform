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
import { FileText, Download, Search, User, Calendar, BookOpen, Layers, Globe } from 'lucide-react';

export default function ResearchPage() {

    // --- STATE ---
    const [papers, setPapers] = useState([]);
    const [series, setSeries] = useState([]); 
    const [featuredPaper, setFeaturedPaper] = useState(null);
    const [listPapers, setListPapers] = useState([]); 
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLang, setActiveLang] = useState('All'); 

    const languages = ["All", "English", "Hausa", "Arabic"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Research Papers (Published only)
                const qPapers = query(
                    collection(db, "posts"),
                    where("category", "==", "Research"),
                    where("status", "==", "Published"),
                    orderBy("createdAt", "desc")
                );
                const papersSnapshot = await getDocs(qPapers);
                const fetchedPapers = papersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setPapers(fetchedPapers);

                // Set Featured & List based on initial fetch
                if (fetchedPapers.length > 0) {
                    setFeaturedPaper(fetchedPapers[0]); 
                    setListPapers(fetchedPapers.slice(1)); 
                }

                // 2. Fetch Research Series
                const qSeries = query(
                    collection(db, "blog_series"),
                    where("category", "==", "Research"), 
                    orderBy("createdAt", "desc")
                );
                const seriesSnapshot = await getDocs(qSeries);
                const fetchedSeries = seriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSeries(fetchedSeries);

            } catch (error) {
                console.error("Error fetching research data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- HELPER: Format Date ---
    const formatDate = (dateInput) => {
        try {
            if (!dateInput) return '';
            const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
            return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); 
        } catch (e) { return ''; }
    };

    // --- HELPER: Count Papers in Series ---
    const getSeriesCount = (seriesTitle) => {
        return papers.filter(p => p.series === seriesTitle).length;
    };

    // --- FILTER LOGIC ---
    // We filter the *entire* list of papers, then decide what is featured vs list
    useEffect(() => {
        let filtered = papers;

        // Language Filter
        if (activeLang !== 'All') {
            filtered = filtered.filter(item => item.language === activeLang);
        }

        // Search Filter
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Update View
        if (filtered.length > 0) {
            setFeaturedPaper(filtered[0]);
            setListPapers(filtered.slice(1));
        } else {
            setFeaturedPaper(null);
            setListPapers([]);
        }

    }, [activeLang, searchTerm, papers]);


    return (
        <div className="min-h-screen flex flex-col bg-brand-sand font-lato">
            <Header />
            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image 
                            src="/images/heroes/blogs-research-publications-hero.webp" 
                            alt="Research Hero" 
                            fill 
                            className="object-cover object-center" 
                            priority 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>
                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Research & Publications
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Scholarly papers, policy analysis, and academic discourses contributing to the intellectual heritage of the Ummah.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <>
                        {/* 2. DYNAMIC SERIES SECTION */}
                        {series.length > 0 && (
                            <section className="px-6 md:px-12 lg:px-24 mb-12 md:mb-20 max-w-7xl mx-auto">
                                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                        Research Collections
                                    </h2>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                                        Thematic Compilations
                                    </span>
                                </div>

                                <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 md:gap-8 scrollbar-hide snap-x">
                                    {series.map((item) => (
                                        <Link 
                                            href={`/blogs/series/${item.id}`} // Clickable Link
                                            key={item.id} 
                                            className="snap-center min-w-[240px] md:min-w-0 group cursor-pointer relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                                        >
                                            <div className="relative w-full aspect-[16/9]">
                                                <Image 
                                                    src={item.cover || "/fallback.webp"} 
                                                    alt={item.title} 
                                                    fill 
                                                    className="object-cover" 
                                                />
                                                <div className="absolute inset-0 bg-brand-brown-dark/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded uppercase tracking-wider">Browse Collection</span>
                                                </div>
                                                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                                                    <span className="text-white font-agency text-lg drop-shadow-md truncate">{item.title}</span>
                                                    <span className="text-white/80 text-[10px] bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                                                        <Layers className="w-3 h-3" /> {getSeriesCount(item.title)}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3. FILTER & SEARCH BAR */}
                        <section className="px-6 md:px-12 lg:px-24 mb-8 max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                {/* Horizontal Language Loop */}
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
                                <div className="relative w-full md:w-80">
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search papers..." 
                                        className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm bg-gray-50"
                                    />
                                    <Search className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                                </div>
                            </div>
                        </section>

                        {/* 4. FEATURED PAPER (Banner) */}
                        {featuredPaper && (
                            <section className="px-6 md:px-12 lg:px-24 mb-16 max-w-7xl mx-auto">
                                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col lg:flex-row group">
                                    {/* Visual Side */}
                                    <div className="relative w-full lg:w-2/5 min-h-[250px] bg-brand-sand/30 flex items-center justify-center p-8">
                                        <div className="relative w-3/4 aspect-[3/4] bg-white shadow-2xl rounded-tr-3xl rounded-bl-3xl border border-gray-200 transform group-hover:-rotate-2 transition-transform duration-500 overflow-hidden">
                                            <Image 
                                                src={featuredPaper.coverImage || "/fallback.webp"} 
                                                alt="Paper Cover" 
                                                fill 
                                                className="object-cover opacity-90" 
                                            />
                                            <div className="absolute inset-0 bg-brand-brown-dark/10"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FileText className="w-16 h-16 text-white/80 drop-shadow-lg" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="p-8 md:p-12 lg:w-3/5 flex flex-col justify-center" dir={featuredPaper.language === 'Arabic' ? 'rtl' : 'ltr'}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-[10px] md:text-xs font-bold text-white bg-brand-gold px-3 py-1 rounded-full uppercase tracking-wider">
                                                {featuredPaper.category}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold flex items-center gap-1" dir="ltr">
                                                <Calendar className="w-3 h-3" /> {formatDate(featuredPaper.date)}
                                            </span>
                                        </div>

                                        <h3 className={`font-agency text-2xl md:text-4xl text-brand-brown-dark leading-tight mb-4 group-hover:text-brand-gold transition-colors ${featuredPaper.language === 'Arabic' ? 'font-tajawal font-bold' : ''}`}>
                                            {featuredPaper.title}
                                        </h3>

                                        <div className={`bg-gray-50 p-4 rounded-xl border-brand-brown-dark mb-6 ${featuredPaper.language === 'Arabic' ? 'border-r-4' : 'border-l-4'}`}>
                                            <p className={`font-lato text-xs md:text-sm text-gray-600 italic leading-relaxed ${featuredPaper.language === 'Arabic' ? 'font-arabic not-italic' : ''}`}>
                                                <span className="font-bold text-brand-brown-dark not-italic">{featuredPaper.language === 'Arabic' ? 'الملخص: ' : 'Abstract: '}</span>
                                                {featuredPaper.excerpt || "No abstract available for this paper."}
                                            </p>
                                        </div>

                                        <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-2" dir="ltr">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden">
                                                     <Image src="/fallback.webp" alt="Author" fill className="object-cover" />
                                                </div>
                                                <span className="text-xs md:text-sm font-bold text-brand-brown-dark">{featuredPaper.author || "Sheikh Muneer"}</span>
                                            </div>

                                            {featuredPaper.pdfUrl ? (
                                                <a 
                                                    href={featuredPaper.pdfUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-6 py-2 bg-brand-brown-dark text-white text-xs md:text-sm font-bold rounded-full uppercase tracking-wider hover:bg-brand-gold transition-colors"
                                                >
                                                    <Download className="w-4 h-4" /> {featuredPaper.language === 'Arabic' ? 'تحميل PDF' : 'Download PDF'}
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">PDF Not Available</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 5. PAPERS LIST */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-12">
                            {listPapers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    {listPapers.map((item) => (
                                        <div key={item.id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl hover:border-brand-gold/30 transition-all p-6 md:p-8 flex flex-col h-full group">

                                            {/* Header: Category & Date */}
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-bold text-brand-brown-dark bg-brand-sand px-2 py-1 rounded uppercase tracking-wider">
                                                    {item.category}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                        <BookOpen className="w-3 h-3" /> {item.readTime ? `${item.readTime} min` : 'PDF'}
                                                    </span>
                                                    <div className="p-1.5 bg-green-50 rounded-md text-green-600">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <Link href={`/blogs/read/${item.id}`}>
                                                <h3 className={`font-agency text-xl md:text-2xl text-brand-brown-dark leading-tight mb-3 group-hover:text-brand-gold transition-colors cursor-pointer ${item.language === 'Arabic' ? 'font-tajawal font-bold text-right' : ''}`}>
                                                    {item.title}
                                                </h3>
                                            </Link>

                                            {/* Abstract Preview */}
                                            <p className={`font-lato text-xs md:text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3 flex-grow ${item.language === 'Arabic' ? 'font-arabic text-right' : ''}`}>
                                                {item.excerpt}
                                            </p>

                                            {/* Footer: Author & Action */}
                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-2" dir="ltr">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 relative overflow-hidden">
                                                         <Image src="/fallback.webp" alt="Author" fill className="object-cover" />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700">{item.author || "Al-Asad Scholar"}</span>
                                                </div>

                                                {item.pdfUrl ? (
                                                    <a 
                                                        href={item.pdfUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-brand-gold hover:text-brand-brown-dark transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No research papers found matching your criteria.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}

            </main>
            <Footer />
        </div>
    );
}
