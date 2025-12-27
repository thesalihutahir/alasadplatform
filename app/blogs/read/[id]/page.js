"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

import { 
    Calendar, 
    User, 
    Clock, 
    Tag, 
    Share2, 
    Download, 
    FileText, 
    ArrowLeft,
    Facebook,
    Twitter,
    Linkedin,
    Link as LinkIcon
} from 'lucide-react';

export default function BlogPostPage() {
    const { id } = useParams();
    const router = useRouter();
    
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. FETCH POST DATA ---
    useEffect(() => {
        const fetchPostData = async () => {
            if (!id) return;
            try {
                // A. Fetch Main Post
                const docRef = doc(db, "posts", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const postData = { id: docSnap.id, ...docSnap.data() };
                    setPost(postData);

                    // B. Fetch Related Posts (Same Category, excluding current)
                    // Note: Firestore limitation means we fetch a few more and filter in JS
                    const qRelated = query(
                        collection(db, "posts"),
                        where("category", "==", postData.category),
                        where("status", "==", "Published"),
                        orderBy("createdAt", "desc"),
                        limit(4) 
                    );
                    
                    const relatedSnap = await getDocs(qRelated);
                    const related = relatedSnap.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(p => p.id !== id) // Exclude current post
                        .slice(0, 3); // Keep only 3

                    setRelatedPosts(related);
                } else {
                    console.error("Post not found");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [id]);

    // --- HELPER: Get Dynamic Hero based on Category ---
    const getCategoryHero = (category) => {
        switch(category) {
            case 'News': return '/images/heroes/blogs-updates-hero.webp';
            case 'Research': return '/images/heroes/blogs-research-publications-hero.webp';
            default: return '/images/heroes/blogs-articles-hero.webp'; // Default for Articles
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        });
    };

    // --- LOADING STATE ---
    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <Loader size="full" />
            </div>
        );
    }

    // --- 404 STATE ---
    if (!post) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-lato">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                    <h1 className="font-agency text-4xl text-brand-brown-dark mb-4">404 | Post Not Found</h1>
                    <p className="text-gray-500 mb-8">The article you are looking for does not exist or has been removed.</p>
                    <Link href="/blogs/articles" className="px-8 py-3 bg-brand-gold text-white rounded-full font-bold hover:bg-brand-brown-dark transition-colors">
                        Back to Library
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const categoryHero = getCategoryHero(post.category);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow">

                {/* 1. IMMERSIVE HEADER (Contextual Background) */}
                <div className="relative w-full h-[60vh] lg:h-[70vh]">
                    <Image 
                        src={categoryHero} 
                        alt="Category Hero" 
                        fill 
                        className="object-cover" 
                        priority 
                    />
                    {/* Heavy Overlay for readability */}
                    <div className="absolute inset-0 bg-brand-brown-dark/80 backdrop-blur-sm"></div>

                    {/* Header Content */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 max-w-5xl mx-auto z-10 text-white">
                        
                        {/* Breadcrumb / Category */}
                        <div className="mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="px-3 py-1 bg-brand-gold text-white text-xs font-bold uppercase tracking-widest rounded-full">
                                {post.category}
                            </span>
                            {post.language && (
                                <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-md">
                                    {post.language}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 drop-shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            {post.title}
                        </h1>

                        {/* Meta Data */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base font-medium text-white/80 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-gold" />
                                <span>{post.author || "Al-Asad Foundation"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-brand-gold" />
                                <span>{formatDate(post.date)}</span>
                            </div>
                            {post.readTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-brand-gold" />
                                    <span>{post.readTime}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CONTENT CONTAINER */}
                <div className="relative z-20 -mt-20 px-6 md:px-12 lg:px-24">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-16 lg:p-20 border border-gray-100">
                        
                        {/* Featured Image (Specific to Post) */}
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-lg">
                            <Image 
                                src={post.coverImage || "/fallback.webp"} 
                                alt={post.title} 
                                fill 
                                className="object-cover" 
                            />
                        </div>

                        {/* THE CONTENT */}
                        <article className="prose prose-lg md:prose-xl prose-stone max-w-none font-lato text-gray-700 leading-relaxed whitespace-pre-wrap first-letter:text-5xl first-letter:font-agency first-letter:text-brand-brown-dark first-letter:float-left first-letter:mr-3">
                            {post.content}
                        </article>

                        {/* PDF Download Box */}
                        {post.pdfUrl && (
                            <div className="mt-12 bg-brand-sand/30 border-l-4 border-brand-brown-dark p-6 rounded-r-xl flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-full shadow-sm text-brand-brown-dark">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="font-agency text-xl text-brand-brown-dark">Attached Resource</h4>
                                        <p className="text-sm text-gray-600">{post.pdfName || "Research Paper / Document"}</p>
                                    </div>
                                </div>
                                <a 
                                    href={post.pdfUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-brand-brown-dark text-white font-bold rounded-lg shadow hover:bg-brand-gold transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download PDF
                                </a>
                            </div>
                        )}

                        {/* Tags & Share */}
                        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {post.tags && post.tags.split(',').map((tag, idx) => (
                                    <span key={idx} className="flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-brand-gold hover:text-white transition-colors cursor-pointer">
                                        <Tag className="w-3 h-3" /> {tag.trim()}
                                    </span>
                                ))}
                            </div>

                            {/* Share Buttons (Mock) */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">Share:</span>
                                <button className="p-2 bg-gray-50 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"><Facebook className="w-4 h-4" /></button>
                                <button className="p-2 bg-gray-50 rounded-full text-sky-500 hover:bg-sky-500 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></button>
                                <button className="p-2 bg-gray-50 rounded-full text-blue-700 hover:bg-blue-700 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></button>
                                <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-600 hover:text-white transition-colors" onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert("Link copied!");
                                }}>
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. RELATED POSTS */}
                {relatedPosts.length > 0 && (
                    <section className="bg-gray-50 py-16 md:py-24 mt-12 md:mt-20">
                        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
                            <h3 className="font-agency text-3xl text-brand-brown-dark mb-8 border-l-4 border-brand-gold pl-4">
                                More in {post.category}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {relatedPosts.map((item) => (
                                    <Link key={item.id} href={`/blogs/read/${item.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                        <div className="relative w-full aspect-video bg-gray-200">
                                            <Image 
                                                src={item.coverImage || "/fallback.webp"} 
                                                alt={item.title} 
                                                fill 
                                                className="object-cover" 
                                            />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                <span>{formatDate(item.date)}</span>
                                            </div>
                                            <h4 className="font-agency text-xl text-brand-brown-dark leading-tight mb-2 group-hover:text-brand-gold transition-colors line-clamp-2">
                                                {item.title}
                                            </h4>
                                            <p className="font-lato text-sm text-gray-500 line-clamp-2">
                                                {item.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </main>
            <Footer />
        </div>
    );
}