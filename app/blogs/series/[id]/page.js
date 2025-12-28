"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ArrowLeft, Calendar, User, Clock, ChevronRight, BookOpen, Layers } from 'lucide-react';

export default function SeriesDetailPage() {
    const params = useParams();
    const seriesId = params?.id;

    const [series, setSeries] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!seriesId) return;
            setLoading(true);

            try {
                // 1. Fetch Series Details
                const seriesRef = doc(db, "blog_series", seriesId);
                const seriesSnap = await getDoc(seriesRef);

                if (seriesSnap.exists()) {
                    const seriesData = { id: seriesSnap.id, ...seriesSnap.data() };
                    setSeries(seriesData);

                    // 2. Fetch Posts belonging to this Series (Match by Title)
                    // Note: In your Admin upload, you saved 'series' as the Title string.
                    const qPosts = query(
                        collection(db, "posts"),
                        where("series", "==", seriesData.title),
                        where("status", "==", "Published"),
                        orderBy("createdAt", "asc") // Ascending order (Part 1, Part 2...)
                    );
                    
                    const postsSnap = await getDocs(qPosts);
                    const fetchedPosts = postsSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setPosts(fetchedPosts);
                }
            } catch (error) {
                console.error("Error fetching series data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [seriesId]);

    // Format Date Helper
    const formatDate = (dateInput) => {
        try {
            if (!dateInput) return '';
            const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) { return ''; }
    };

    if (loading) return <Loader size="lg" className="h-screen bg-brand-sand" />;

    if (!series) {
        return (
            <div className="min-h-screen bg-brand-sand flex flex-col font-lato">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                    <h1 className="font-agency text-4xl text-brand-brown-dark mb-4">Series Not Found</h1>
                    <Link href="/blogs/articles" className="px-8 py-3 bg-brand-gold text-white rounded-full font-bold">
                        Back to Library
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-brand-sand font-lato">
            <Header />
            
            <main className="flex-grow">
                {/* 1. HERO HEADER */}
                <div className="bg-brand-brown-dark text-white pt-24 pb-32 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
                        <Link href="/blogs/articles" className="inline-flex items-center text-white/60 hover:text-brand-gold mb-6 transition-colors font-bold text-sm">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
                        </Link>
                        <span className="block text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">Curated Series</span>
                        <h1 className="font-agency text-4xl md:text-6xl mb-6">{series.title}</h1>
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                            <Layers className="w-4 h-4 text-brand-gold" />
                            <span className="text-sm font-bold">{posts.length} Parts</span>
                        </div>
                    </div>
                </div>

                {/* 2. SERIES COVER & LIST */}
                <div className="max-w-5xl mx-auto px-6 -mt-20 pb-20 relative z-20">
                    
                    {/* Series Cover Image */}
                    <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border-4 border-white mb-12 bg-gray-800">
                        <Image src={series.cover || "/fallback.webp"} alt={series.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-6">
                        {posts.length > 0 ? (
                            posts.map((post, index) => (
                                <Link key={post.id} href={`/blogs/read/${post.id}`} className="block group">
                                    <article className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:items-center hover:shadow-lg hover:border-brand-gold/30 transition-all relative overflow-hidden">
                                        
                                        {/* Part Number Badge */}
                                        <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 bg-brand-sand rounded-xl flex-shrink-0 text-brand-brown-dark">
                                            <span className="text-[10px] font-bold uppercase">Part</span>
                                            <span className="font-agency text-2xl font-bold">{index + 1}</span>
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                                                <span className="md:hidden bg-brand-gold text-white px-2 py-0.5 rounded font-bold">Part {index + 1}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.date)}</span>
                                                <span className="hidden md:inline">•</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                            </div>
                                            <h3 className="font-agency text-2xl text-brand-brown-dark group-hover:text-brand-gold transition-colors mb-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                                        </div>

                                        <div className="flex-shrink-0 self-start md:self-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 font-bold">No articles added to this series yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
