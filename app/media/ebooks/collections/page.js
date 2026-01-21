"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Search, Library, Book, ArrowRight, Layers, Filter } from 'lucide-react';

export default function AllCollectionsPage() {

    // --- STATE ---
    const [allCollections, setAllCollections] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [activeLang, setActiveLang] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const languages = ["All", "English", "Hausa", "Arabic"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                // 1. Fetch Collections
                const qCollections = query(collection(db, "ebook_collections"), orderBy("createdAt", "desc"));
                const colSnapshot = await getDocs(qCollections);
                const fetchedCols = colSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 2. Fetch Books (for counting)
                const qBooks = query(collection(db, "ebooks"));
                const bookSnapshot = await getDocs(qBooks);
                const allBooks = bookSnapshot.docs.map(doc => doc.data());

                // 3. Enrich Collections with Counts
                const enrichedCols = fetchedCols.map(col => {
                    const count = allBooks.filter(b => b.collection === col.title).length;
                    return { ...col, count };
                });

                setAllCollections(enrichedCols);
                setFilteredCollections(enrichedCols);

            } catch (error) {
                console.error("Error fetching collections:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    // --- FILTER LOGIC ---
    useEffect(() => {
        let results = allCollections;

        // 1. Language Filter (category field)
        if (activeLang !== 'All') {
            results = results.filter(col => col.category === activeLang);
        }

        // 2. Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(col => 
                col.title.toLowerCase().includes(term) || 
                (col.description && col.description.toLowerCase().includes(term))
            );
        }

        setFilteredCollections(results);
    }, [activeLang, searchTerm, allCollections]);
    return (
        <div className="min-h-screen flex flex-col bg-brand-sand font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-ebooks-hero.webp" 
                            alt="Collections Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Book Collections
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Browse curated sets of publications, organized by theme and language for comprehensive study.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <>
                        {/* 2. FILTER & SEARCH BAR */}
                        <section className="px-6 md:px-12 lg:px-24 mb-12 max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                {/* Language Filter */}
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
                                        placeholder="Search collections..." 
                                        className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm bg-gray-50"
                                    />
                                    <Search className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                                </div>
                            </div>
                        </section>

                        {/* 3. COLLECTIONS GRID */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-20">
                            {filteredCollections.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredCollections.map((col) => (
                                        <Link 
                                            key={col.id} 
                                            href={`/media/ebooks/collections/${col.id}`}
                                            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-brand-gold/30 h-full"
                                        >
                                            {/* Cover Image */}
                                            <div className="relative w-full aspect-[3/4] bg-gray-200">
                                                <Image 
                                                    src={col.cover || "/fallback.webp"} 
                                                    alt={col.title} 
                                                    fill 
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                                />
                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                                
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                                        <Library className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                
                                                {/* Language Badge */}
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-brand-brown-dark uppercase tracking-wider">
                                                    {col.category}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="font-agency text-xl text-brand-brown-dark leading-tight mb-1 group-hover:text-brand-gold transition-colors line-clamp-2">
                                                    {col.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Book className="w-3 h-3 text-brand-gold" />
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide truncate">
                                                        {col.count} Books
                                                    </span>
                                                </div>
                                                
                                                {/* Description Preview */}
                                                <p className="font-lato text-xs text-gray-400 line-clamp-2 mb-4 flex-grow">
                                                    {col.description || "No description available."}
                                                </p>

                                                {/* Footer Action */}
                                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                        View Set
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-400 font-bold">No collections found matching your criteria.</p>
                                    <p className="text-xs text-gray-300 mt-1">Try adjusting your filters.</p>
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
