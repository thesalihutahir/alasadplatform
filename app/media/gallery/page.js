"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Image as ImageIcon, FolderOpen, MapPin, Calendar, Loader2 } from 'lucide-react';

export default function GalleryPage() {

    // --- STATE ---
    const [albums, setAlbums] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Aspect ratios to cycle through for the "Masonry" look
    const aspectRatios = ["aspect-[3/4]", "aspect-[4/3]", "aspect-square", "aspect-[3/5]"];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Photos
                const qPhotos = query(collection(db, "gallery_photos"), orderBy("createdAt", "desc"));
                const photoSnapshot = await getDocs(qPhotos);
                const fetchedPhotos = photoSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 2. Fetch Albums
                const qAlbums = query(collection(db, "gallery_albums"), orderBy("createdAt", "desc"));
                const albumSnapshot = await getDocs(qAlbums);
                const fetchedAlbums = albumSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 3. Calculate Photo Counts for Albums
                const enrichedAlbums = fetchedAlbums.map(album => {
                    const count = fetchedPhotos.filter(p => p.albumId === album.id).length;
                    return { ...album, count };
                });

                setPhotos(fetchedPhotos);
                setAlbums(enrichedAlbums);

            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper: Get Album Name for a Photo
    const getAlbumName = (albumId) => {
        if (!albumId || albumId === 'uncategorized') return 'Recent Capture';
        const album = albums.find(a => a.id === albumId);
        return album ? album.title : 'Event Highlight';
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/media-gallery-hero.webp" 
                            alt="Gallery Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Photo Gallery
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Visual moments from our journey in serving the community, spreading knowledge, and building the future.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* 2. ALBUMS / FOLDERS SECTION */}
                        {albums.length > 0 && (
                            <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                                <div className="flex justify-between items-end mb-6 md:mb-8 border-b border-gray-100 pb-2">
                                    <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark">
                                        Event Albums
                                    </h2>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                                        View Collections
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                                    {albums.map((album) => (
                                        <div key={album.id} className="group cursor-pointer">
                                            {/* Folder Visual (Stacked effect) */}
                                            <div className="relative w-full aspect-[4/3] mb-3">
                                                {/* Background Stack Cards */}
                                                <div className="absolute top-0 left-2 right-2 bottom-2 bg-gray-200 rounded-2xl transform translate-y-2 translate-x-1 group-hover:translate-x-2 group-hover:translate-y-3 transition-transform duration-300"></div>
                                                <div className="absolute top-1 left-1 right-1 bottom-1 bg-gray-300 rounded-2xl transform translate-y-1 translate-x-0.5 group-hover:translate-x-1 group-hover:translate-y-1.5 transition-transform duration-300"></div>
                                                
                                                {/* Main Cover Image */}
                                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow border-2 border-white bg-gray-100">
                                                    <Image
                                                        src={album.cover || "/hero.jpg"}
                                                        alt={album.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    {/* Overlay */}
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                                    
                                                    {/* Icon Badge */}
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg p-1.5 text-brand-brown-dark">
                                                        <FolderOpen className="w-4 h-4" />
                                                    </div>

                                                    {/* Count Badge */}
                                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3" /> {album.count}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Text Info */}
                                            <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors line-clamp-1">
                                                {album.title}
                                            </h3>
                                            <p className="text-[10px] md:text-xs text-gray-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {album.date}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3. RECENT MOMENTS (MASONRY GRID) */}
                        <section className="px-4 md:px-12 lg:px-24 max-w-7xl mx-auto">
                            <h2 className="font-agency text-2xl md:text-4xl text-brand-brown-dark mb-6 md:mb-8 text-center md:text-left">
                                Recent Moments
                            </h2>

                            {photos.length > 0 ? (
                                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                                    {photos.map((photo, index) => {
                                        // Assign a cyclical aspect ratio for the masonry look
                                        const aspectRatio = aspectRatios[index % aspectRatios.length];
                                        
                                        return (
                                            <div key={photo.id} className="relative w-full break-inside-avoid rounded-2xl overflow-hidden shadow-md group cursor-zoom-in bg-gray-200">
                                                {/* Aspect Ratio Controlled by Class */}
                                                <div className={`relative w-full ${aspectRatio}`}>
                                                    <Image
                                                        src={photo.url}
                                                        alt={photo.name}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-brand-brown-dark/0 group-hover:bg-brand-brown-dark/60 transition-colors duration-300"></div>

                                                    {/* Content on Hover (Desktop) */}
                                                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                                                        <p className="text-white font-agency text-lg leading-none mb-1 line-clamp-2">
                                                            {getAlbumName(photo.albumId)}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-white/70 text-[10px]">
                                                            <MapPin className="w-3 h-3" /> 
                                                            <span className="uppercase tracking-wider">Katsina</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No photos added yet.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* 4. CTA */}
                <section className="mt-16 md:mt-24 text-center px-6 mb-8">
                    <p className="font-lato text-sm md:text-lg text-brand-brown mb-6">
                        Follow us on social media for daily updates and live coverage.
                    </p>
                    <div className="flex justify-center gap-4 md:gap-6">
                        <Link href="#" className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-all transform hover:scale-110 shadow-sm">
                            <span className="font-agency font-bold text-lg">Fb</span>
                        </Link>
                        <Link href="#" className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-all transform hover:scale-110 shadow-sm">
                            <span className="font-agency font-bold text-lg">Ig</span>
                        </Link>
                        <Link href="#" className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark hover:bg-brand-gold hover:text-white transition-all transform hover:scale-110 shadow-sm">
                            <span className="font-agency font-bold text-lg">X</span>
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
