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
import { Book, Download, Library, Filter, Loader2, ChevronRight } from 'lucide-react';

export default function EbooksPage() {

    // --- STATE ---
    const [allBooks, setAllBooks] = useState([]);
    const [allCollections, setAllCollections] = useState([]);
    
    // Filtered State
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [activeLang, setActiveLang] = useState("English");
    const [activeCategory, setActiveCategory] = useState("All");
    const [visibleCount, setVisibleCount] = useState(10);

    const languages = ["English", "Hausa", "Arabic"];
    const categories = ["All", "Tafsir", "Fiqh", "Aqeedah", "History", "General"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Books
                const qBooks = query(collection(db, "ebooks"), orderBy("createdAt", "desc"));
                const booksSnapshot = await getDocs(qBooks);
                const fetchedBooks = booksSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllBooks(fetchedBooks);

                // 2. Fetch Collections
                const qCollections = query(collection(db, "ebook_collections"), orderBy("createdAt", "desc"));
                const collectionsSnapshot = await getDocs(qCollections);
                const fetchedCollections = collectionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllCollections(fetchedCollections);

            } catch (error) {
                console.error("Error fetching library data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- FILTER LOGIC ---
    useEffect(() => {
        // 1. Filter by Language
        const langBooks = allBooks.filter(b => b.language === activeLang);
        const langCollections = allCollections.filter(c => c.category === activeLang); // Collection category maps to language in Admin

        // 2. Filter Books by Category (if selected)
        const finalBooks = activeCategory === "All" 
            ? langBooks 
            : langBooks.filter(b => b.category === activeCategory);

        setFilteredBooks(finalBooks);
        setFilteredCollections(langCollections);
        setVisibleCount(10); // Reset pagination

    }, [activeLang, activeCategory, allBooks, allCollections]);

    // Helper: Get Book Count per Collection
    const getCollectionBookCount = (collectionTitle, storedCount) => {
        if (allBooks.length > 0) {
            return allBooks.filter(b => b.collection === collectionTitle).length;
        }
        return storedCount || 0;
    };

    const visibleBooks = filteredBooks.slice(0, visibleCount);

    return (
        <div className="min-h-screen flex flex-col bg-brand-sand font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-ebooks-hero.webp" 
                            alt="eBooks Library Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            eBooks & Publications
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Read and download scholarly articles, books, and pamphlets. Build your digital Islamic library today.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader size="md" />
                    </div>
                ) : (
                    <>
                        {/* 2. LANGUAGE FILTER */}
                        <section className="px-6 md:px-12 lg:px-24 mb-10 max-w-7xl mx-auto">
                            <div className="flex justify-center">
                                <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 flex gap-2">
                                    {languages.map((lang) => (
                                        <button 
                                            key={lang} 
                                            onClick={() => { setActiveLang(lang); setActiveCategory("All"); }}
                                            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                                                activeLang === lang 
                                                ? 'bg-brand-brown-dark text-white shadow-md' 
                                                : 'bg-transparent text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 3. FEATURED COLLECTIONS */}
                        {filteredCollections.length > 0 && (
                            <section className="px-6 md:px-12 lg:px-24 mb-12 md:mb-20 max-w-7xl mx-auto">
                                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
                                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                        Featured Collections
                                    </h2>
                                    <Link href="/media/ebooks/collections" className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:flex items-center gap-1 hover:text-brand-gold transition-colors">
                                        View All <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="flex overflow-x-auto gap-4 pb-6 md:grid md:grid-cols-3 md:gap-8 scrollbar-hide snap-x pt-2 pl-2">
                                    {filteredCollections.slice(0, 3).map((col) => (
                                        <Link 
                                            href={`/media/ebooks/collections/${col.id}`}
                                            key={col.id} 
                                            className="snap-center min-w-[240px] md:min-w-0 bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer group hover:bg-brand-sand/40 transition-colors border border-gray-100 hover:border-brand-gold/20 shadow-sm"
                                        >
                                            <div className="relative w-20 h-28 md:w-24 md:h-32 flex-shrink-0 shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 group-hover:rotate-2">
                                                <Image 
                                                    src={col.cover || "/fallback.webp"} 
                                                    alt={col.title} 
                                                    fill 
                                                    className="object-cover rounded-md"
                                                />
                                                <div className="absolute top-1 -right-1 w-full h-full bg-gray-200 rounded-md -z-10 border border-gray-300"></div>
                                                <div className="absolute top-2 -right-2 w-full h-full bg-gray-100 rounded-md -z-20 border border-gray-300"></div>
                                            </div>

                                            <div>
                                                <h3 className="font-agency text-xl text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors line-clamp-2">
                                                    {col.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Library className="w-3 h-3" /> {getCollectionBookCount(col.title, col.bookCount)} Books
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 4. CATEGORY FILTER */}
                        <section className="px-6 md:px-12 lg:px-24 mb-8 max-w-7xl mx-auto">
                            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                                {categories.map((cat, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                                            activeCategory === cat 
                                            ? 'bg-brand-brown-dark text-white border-brand-brown-dark shadow-md' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-brand-gold hover:text-brand-gold'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 5. BOOK GRID */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                             <div className="flex justify-between items-end mb-6 md:mb-8">
                                <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark">
                                    Recent Uploads
                                </h2>
                            </div>

                            {visibleBooks.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
                                    {visibleBooks.map((book) => (
                                        <div key={book.id} className="group flex flex-col items-start cursor-pointer">

                                            {/* Book Cover Card */}
                                            <div className="relative w-full aspect-[2/3] bg-gray-200 rounded-lg md:rounded-xl overflow-hidden shadow-md mb-4 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl border border-gray-100">
                                                <Image
                                                    src={book.coverUrl || "/fallback.webp"}
                                                    alt={book.title}
                                                    fill
                                                    className="object-cover"
                                                />

                                                {/* Hover Overlay */}
                                                <Link 
                                                    href={`/media/ebooks/read/${book.id}`}
                                                    className="absolute inset-0 bg-brand-brown-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[1px]"
                                                >
                                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-colors shadow-lg transform hover:scale-110">
                                                        <Book className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-white text-xs font-bold uppercase tracking-widest">Read Details</span>
                                                </Link>

                                                {/* Language Badge */}
                                                <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-sm pointer-events-none">
                                                    {book.language}
                                                </div>
                                            </div>

                                            {/* Book Info */}
                                            <Link href={`/media/ebooks/read/${book.id}`} className="block w-full">
                                                <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight mb-1 group-hover:text-brand-gold transition-colors line-clamp-2">
                                                    {book.title}
                                                </h3>
                                                <p className="font-lato text-xs md:text-sm text-gray-500 mb-3 line-clamp-1">
                                                    by {book.author}
                                                </p>

                                                <div className="mt-auto flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                        PDF • {book.fileSize || 'Unknown'}
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Book className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No books found matching your criteria.</p>
                                </div>
                            )}
                        </section>

                        {/* 6. LOAD MORE */}
                        {visibleCount < filteredBooks.length && (
                            <section className="py-12 text-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 10)}
                                    className="px-8 py-3 bg-white border border-gray-200 text-brand-brown-dark rounded-full font-bold text-sm hover:bg-brand-brown-dark hover:text-white transition-colors shadow-sm uppercase tracking-wide"
                                >
                                    Load More Books
                                </button>
                            </section>
                        )}
                    </>
                )}

            </main>

            <Footer />
        </div>
    );
}
