"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { 
    Book, Library, Calendar, Search, ArrowLeft, 
    Share2, Bell, Check, Eye, Download 
} from 'lucide-react';

export default function ViewCollectionPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    // --- STATE ---
    const [colData, setColData] = useState(null);
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // 1. Fetch Collection Details
                const docRef = doc(db, "ebook_collections", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setColData(data);

                    // 2. Fetch Books in this Collection
                    // Matches books where 'collection' field equals this collection's Title
                    const qBooks = query(
                        collection(db, "ebooks"),
                        where("collection", "==", data.title),
                        orderBy("createdAt", "desc")
                    );
                    
                    const bookSnap = await getDocs(qBooks);
                    const fetchedBooks = bookSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setBooks(fetchedBooks);
                    setFilteredBooks(fetchedBooks);
                } else {
                    console.error("Collection not found");
                    router.push('/media/ebooks/collections');
                }
            } catch (error) {
                console.error("Error fetching collection data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    // --- FILTER LOGIC ---
    useEffect(() => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const results = books.filter(book => 
                book.title.toLowerCase().includes(term) ||
                (book.description && book.description.toLowerCase().includes(term))
            );
            setFilteredBooks(results);
        } else {
            setFilteredBooks(books);
        }
    }, [searchTerm, books]);

    // --- HELPER: Format Date ---
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) return <Loader size="lg" className="h-screen bg-brand-sand" />;
    if (!colData) return null;

    // Use 'category' field for language check
    const isArabic = colData.category === 'Arabic'; 
    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-20">
                
                {/* 1. IMMERSIVE HEADER SECTION */}
                <div className="relative w-full bg-brand-brown-dark overflow-hidden">
                    {/* Blurred Backdrop */}
                    <div className="absolute inset-0">
                        <Image 
                            src={colData.cover || "/fallback.webp"} 
                            alt="Backdrop" 
                            fill 
                            className="object-cover opacity-20 blur-3xl scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-brand-brown-dark/80 to-brand-brown-dark"></div>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
                        {/* Back Link */}
                        <Link href="/media/ebooks/collections" className="inline-flex items-center text-white/60 hover:text-brand-gold mb-8 text-xs font-bold uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collections
                        </Link>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start text-center md:text-left">
                            
                            {/* Cover Art (Book Stack Look) */}
                            <div className="relative w-48 aspect-[2/3] md:w-56 flex-shrink-0">
                                {/* Stack Effects */}
                                <div className="absolute top-0 -right-2 w-full h-full bg-white/10 rounded-r-lg transform rotate-2"></div>
                                <div className="absolute top-0 -right-4 w-full h-full bg-white/5 rounded-r-lg transform rotate-4"></div>
                                
                                <div className="relative w-full h-full rounded-r-lg overflow-hidden shadow-2xl border-l-4 border-white/20 bg-gray-800">
                                    <Image 
                                        src={colData.cover || "/fallback.webp"} 
                                        alt={colData.title} 
                                        fill 
                                        className="object-cover" 
                                    />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-grow flex flex-col justify-center h-full pt-2 text-white">
                                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                                    {/* Language Badge (from category) */}
                                    <span className="px-3 py-1 bg-brand-gold text-white rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                        {colData.category} Collection
                                    </span>
                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <Library className="w-3 h-3" /> {books.length} Books
                                    </span>
                                </div>

                                <h1 className={`text-4xl md:text-6xl font-bold mb-4 leading-tight ${isArabic ? 'font-tajawal' : 'font-agency'}`}>
                                    {colData.title}
                                </h1>

                                <div className="flex items-center gap-2 text-white/70 font-bold uppercase tracking-wide text-xs md:text-sm mb-6 justify-center md:justify-start">
                                    <Calendar className="w-4 h-4 text-brand-gold" />
                                    <span>Created: {formatDate(colData.createdAt)}</span>
                                </div>

                                <p className={`font-lato text-white/80 text-sm md:text-lg leading-relaxed max-w-2xl mb-8 ${isArabic ? 'font-arabic text-right md:text-right' : ''}`}>
                                    {colData.description || "A curated set of publications."}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4 justify-center md:justify-start">
                                    <button 
                                        onClick={() => setIsSubscribed(!isSubscribed)}
                                        className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                                            isSubscribed 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-white text-brand-brown-dark hover:bg-brand-gold hover:text-white'
                                        }`}
                                    >
                                        {isSubscribed ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                        {isSubscribed ? 'Saved to Library' : 'Save Collection'}
                                    </button>
                                    <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. BOOKS LIST SECTION */}
                <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-10 min-h-[400px]">
                        
                        {/* Header & Search */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
                            <h2 className="font-agency text-3xl text-brand-brown-dark">
                                Books in this Set
                            </h2>
                            <div className="relative w-full md:w-72">
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search books..."
                                    className="w-full pl-10 pr-4 py-3 bg-brand-sand/30 border border-transparent focus:bg-white focus:border-brand-gold rounded-xl text-sm focus:outline-none transition-all"
                                />
                                <Search className="absolute w-4 h-4 text-gray-400 top-1/2 -translate-y-1/2 left-3" />
                            </div>
                        </div>

                        {/* List */}
                        {filteredBooks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredBooks.map((book) => (
                                    <div 
                                        key={book.id} 
                                        className="group flex gap-5 p-4 rounded-2xl hover:bg-brand-sand/30 border border-transparent hover:border-brand-gold/20 transition-all items-start"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-20 aspect-[2/3] flex-shrink-0 rounded overflow-hidden bg-gray-200 shadow-sm group-hover:shadow-md transition-all">
                                            <Image 
                                                src={book.coverUrl || "/fallback.webp"} 
                                                alt={book.title} 
                                                fill 
                                                className="object-cover" 
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow min-w-0 pt-1">
                                            <div className="flex justify-between items-start">
                                                <Link href={`/media/ebooks/read/${book.id}`}>
                                                    <h3 className={`text-lg font-bold text-brand-brown-dark leading-tight mb-1 group-hover:text-brand-gold transition-colors line-clamp-2 ${isArabic ? 'font-tajawal' : ''}`}>
                                                        {book.title}
                                                    </h3>
                                                </Link>
                                            </div>
                                            
                                            <p className="text-xs text-gray-500 mb-3 truncate">
                                                by {book.author}
                                            </p>

                                            <div className="flex gap-3">
                                                <Link 
                                                    href={`/media/ebooks/read/${book.id}`}
                                                    className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:text-brand-brown-dark transition-colors inline-flex items-center gap-1"
                                                >
                                                    <Eye className="w-3 h-3" /> Read
                                                </Link>
                                                {book.fileUrl && (
                                                    <a 
                                                        href={book.fileUrl} 
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer" 
                                                        className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand-brown-dark transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <Download className="w-3 h-3" /> Download
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Book className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-bold">No books found.</p>
                                <p className="text-xs">Try searching for something else.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
