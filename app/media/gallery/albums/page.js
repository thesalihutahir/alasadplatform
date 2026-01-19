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
import { Search, FolderOpen, ImageIcon, Calendar, Filter, Layers } from 'lucide-react';

export default function AllAlbumsPage() {

    // --- STATE ---
    const [allAlbums, setAllAlbums] = useState([]);
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [activeYear, setActiveYear] = useState('All');
    
    // Derived Years list for filter
    const [availableYears, setAvailableYears] = useState(["All"]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Albums
                const qAlbums = query(collection(db, "gallery_albums"), orderBy("createdAt", "desc"));
                const albumSnapshot = await getDocs(qAlbums);
                const fetchedAlbums = albumSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 2. Fetch Photos (Only needed to count them per album)
                // Optimization: In a huge app, you'd store 'photoCount' on the album doc itself. 
                // For now, client-side counting is fine.
                const qPhotos = query(collection(db, "gallery_photos"));
                const photoSnapshot = await getDocs(qPhotos);
                const allPhotos = photoSnapshot.docs.map(doc => doc.data());

                // 3. Enrich Albums with Counts
                const enrichedAlbums = fetchedAlbums.map(album => {
                    const count = allPhotos.filter(p => p.albumId === album.id).length;
                    return { ...album, count };
                });

                setAllAlbums(enrichedAlbums);
                setFilteredAlbums(enrichedAlbums);

                // 4. Extract Years for Filter
                const years = new Set(enrichedAlbums.map(a => {
                    const d = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    return d.getFullYear().toString();
                }));
                setAvailableYears(["All", ...Array.from(years).sort().reverse()]);

            } catch (error) {
                console.error("Error fetching albums:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- FILTER LOGIC ---
    useEffect(() => {
        let results = allAlbums;

        // 1. Year Filter
        if (activeYear !== 'All') {
            results = results.filter(album => {
                const d = album.createdAt?.toDate ? album.createdAt.toDate() : new Date(album.createdAt);
                return d.getFullYear().toString() === activeYear;
            });
        }

        // 2. Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(album => 
                album.title.toLowerCase().includes(term) || 
                (album.description && album.description.toLowerCase().includes(term))
            );
        }

        setFilteredAlbums(results);
    }, [activeYear, searchTerm, allAlbums]);

    // --- HELPER: Format Date ---
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-brand-sand font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-gallery-hero.webp" 
                            alt="Albums Collection Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Event Collections
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Browse through our curated albums documenting specific events, programs, and milestones.
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
                                {/* Year Filter */}
                                <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                                    {availableYears.map((year) => (
                                        <button 
                                            key={year} 
                                            onClick={() => setActiveYear(year)}
                                            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                                                activeYear === year 
                                                ? 'bg-brand-brown-dark text-white border-brand-brown-dark shadow-md' 
                                                : 'bg-brand-sand text-gray-500 border-transparent hover:border-brand-gold hover:text-brand-gold'
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>

                                {/* Search Bar */}
                                <div className="relative w-full md:w-80">
                                    <input 
                                        type="text" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search albums..." 
                                        className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm bg-gray-50"
                                    />
                                    <Search className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                                </div>
                            </div>
                        </section>

                        {/* 3. ALBUMS GRID */}
                        <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-20">
                            {filteredAlbums.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {filteredAlbums.map((album) => (
                                        <Link 
                                            key={album.id} 
                                            href={`/media/gallery/albums/${album.id}`}
                                            className="group cursor-pointer"
                                        >
                                            {/* Folder Visual */}
                                            <div className="relative w-full aspect-[4/3] mb-3">
                                                {/* Stack Effects */}
                                                <div className="absolute top-0 left-2 right-2 bottom-2 bg-gray-200 rounded-2xl transform translate-y-2 translate-x-1 group-hover:translate-x-2 group-hover:translate-y-3 transition-transform duration-300 border border-gray-300"></div>
                                                <div className="absolute top-1 left-1 right-1 bottom-1 bg-gray-100 rounded-2xl transform translate-y-1 translate-x-0.5 group-hover:translate-x-1 group-hover:translate-y-1.5 transition-transform duration-300 border border-gray-200"></div>

                                                {/* Main Cover */}
                                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow border-2 border-white bg-white">
                                                    <Image
                                                        src={album.cover || "/fallback.webp"}
                                                        alt={album.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg p-1.5 text-brand-brown-dark">
                                                        <FolderOpen className="w-4 h-4" />
                                                    </div>

                                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3" /> {album.count} Photos
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Text Info */}
                                            <div className="px-1">
                                                <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors line-clamp-1">
                                                    {album.title}
                                                </h3>
                                                <p className="text-[10px] md:text-xs text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {formatDate(album.createdAt)}
                                                </p>
                                                {album.description && (
                                                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                                        {album.description}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-400 font-bold">No collections found.</p>
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
