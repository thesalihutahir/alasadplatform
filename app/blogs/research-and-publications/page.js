"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { FileText, Download, Search, User, Calendar, BookOpen, Filter, Loader2 } from 'lucide-react';

export default function ResearchPage() {

    // --- STATE ---
    const [papers, setPapers] = useState([]);
    const [featuredPaper, setFeaturedPaper] = useState(null);
    const [listPapers, setListPapers] = useState([]); // Papers excluding the featured one
    const [loading, setLoading] = useState(true);
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Papers');

    const filters = ["All Papers", "Jurisprudence", "Economy", "History", "Education", "Sociology"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchResearch = async () => {
            try {
                // Query: Get all posts where category is 'Research', ordered by newest
                const q = query(
                    collection(db, "posts"),
                    where("category", "==", "Research"),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const fetchedPapers = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setPapers(fetchedPapers);

                if (fetchedPapers.length > 0) {
                    setFeaturedPaper(fetchedPapers[0]); // Newest is Featured
                    setListPapers(fetchedPapers.slice(1)); // Rest go to list
                }
            } catch (error) {
                console.error("Error fetching research papers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResearch();
    }, []);

    // --- HELPER: Format Date ---
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); // e.g. Oct 2024
    };

    // --- FILTER LOGIC ---
    // Filters based on Search Term AND Selected Filter (checking Tags)
    const filteredList = listPapers.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = activeFilter === 'All Papers' || 
                              (item.tags && item.tags.some(tag => tag.toLowerCase() === activeFilter.toLowerCase()));

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
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
                        {/* Gradient Overlay */}
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
                        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* 2. FEATURED PAPER (Banner) */}
                        {featuredPaper && (
                            <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-20 max-w-7xl mx-auto">
                                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                        Spotlight Paper
                                    </h2>
                                </div>

                                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col lg:flex-row group">
                                    {/* Visual Side */}
                                    <div className="relative w-full lg:w-2/5 min-h-[250px] bg-brand-sand/30 flex items-center justify-center p-8">
                                        <div className="relative w-3/4 aspect-[3/4] bg-white shadow-2xl rounded-tr-3xl rounded-bl-3xl border border-gray-200 transform group-hover:-rotate-2 transition-transform duration-500 overflow-hidden">
                                            <Image 
                                                src={featuredPaper.coverImage || "/hero.jpg"} 
                                                alt="Paper Cover" 
                                                fill 
                                                className="object-cover opacity-80" 
                                            />
                                            <div className="absolute inset-0 bg-brand-brown-dark/10"></div>
                                            {/* Icon Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FileText className="w-16 h-16 text-brand-brown-dark/50" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="p-8 md:p-12 lg:w-3/5 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-[10px] md:text-xs font-bold text-white bg-brand-gold px-3 py-1 rounded-full uppercase tracking-wider">
                                                {featuredPaper.category}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {formatDate(featuredPaper.date)}
                                            </span>
                                        </div>

                                        <h3 className="font-agency text-2xl md:text-4xl text-brand-brown-dark leading-tight mb-4 group-hover:text-brand-gold transition-colors">
                                            {featuredPaper.title}
                                        </h3>

                                        <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-brand-brown-dark mb-6">
                                            <p className="font-lato text-xs md:text-sm text-gray-600 italic leading-relaxed">
                                                <span className="font-bold text-brand-brown-dark not-italic">Abstract: </span>
                                                {featuredPaper.excerpt || "No abstract available for this paper."}
                                            </p>
                                        </div>

                                        <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden">
                                                     <Image src="/hero.jpg" alt="Author" fill className="object-cover" />
                                                </div>
                                                <span className="text-xs md:text-sm font-bold text-brand-brown-dark">{featuredPaper.author}</span>
                                            </div>
                                            
                                            {featuredPaper.pdfUrl ? (
                                                <a 
                                                    href={featuredPaper.pdfUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-6 py-2 bg-brand-brown-dark text-white text-xs md:text-sm font-bold rounded-full uppercase tracking-wider hover:bg-brand-gold transition-colors"
                                                >
                                                    <Download className="w-4 h-4" /> Download PDF
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">PDF Not Available</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 3. FILTER BAR */}
                        <section className="px-6 md:px-12 lg:px-24 mb-8 max-w-7xl mx-auto">
                             <div className="flex items-center gap-2 mb-4 md:hidden">
                                <Filter className="w-4 h-4 text-brand-brown" />
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-brown">Filter Topics</span>
                            </div>
                            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide md:justify-center md:flex-wrap">
                                {filters.map((filter, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                                            activeFilter === filter 
                                            ? 'bg-brand-brown-dark text-white shadow-md' 
                                            : 'bg-brand-sand text-brand-brown-dark hover:bg-brand-brown-dark/10'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 4. PAPERS LIST */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-12">
                            {filteredList.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    {filteredList.map((item) => (
                                        <div key={item.id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl hover:border-brand-gold/30 transition-all p-6 md:p-8 flex flex-col h-full group">
                                            
                                            {/* Header: Category & Date */}
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-bold text-brand-brown-dark bg-brand-sand px-2 py-1 rounded uppercase tracking-wider">
                                                    {item.category}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                        {/* Use generic PDF text if page count not known */}
                                                        <BookOpen className="w-3 h-3" /> {item.readTime || 'PDF'}
                                                    </span>
                                                    <div className="p-1.5 bg-green-50 rounded-md text-green-600">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <Link href={`/blogs/read/${item.id}`}>
                                                <h3 className="font-agency text-xl md:text-2xl text-brand-brown-dark leading-tight mb-3 group-hover:text-brand-gold transition-colors cursor-pointer">
                                                    {item.title}
                                                </h3>
                                            </Link>

                                            {/* Abstract Preview */}
                                            <p className="font-lato text-xs md:text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3 flex-grow">
                                                {item.excerpt}
                                            </p>

                                            {/* Footer: Author & Action */}
                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 relative overflow-hidden">
                                                         <Image src="/hero.jpg" alt="Author" fill className="object-cover" />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700">{item.author}</span>
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

                        {/* 5. SEARCH / ARCHIVE */}
                        <section className="px-6 md:px-12 lg:px-24 mb-8 max-w-2xl mx-auto text-center">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search research papers, authors, or keywords..." 
                                    className="w-full pl-6 pr-12 py-4 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm"
                                />
                                <button className="absolute right-2 top-2 p-2 bg-brand-brown-dark text-white rounded-full hover:bg-brand-gold transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </section>
                    </>
                )}

            </main>
            <Footer />
        </div>
    );
}
