"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown'; 
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

import { 
    Calendar, User, Clock, Tag, Download, 
    ArrowLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon,
    Quote, FileText, Layers, Heart, Eye
} from 'lucide-react';

// --- HELPER: Date Formatter ---
const formatDate = (dateString) => {
    try {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        });
    } catch (e) { return dateString; }
};

// --- COMPONENT: Like Button ---
const LikeButton = ({ postId, initialLikes }) => {
    const [likes, setLikes] = useState(initialLikes || 0);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const hasLiked = localStorage.getItem(`liked_${postId}`);
        if (hasLiked) setLiked(true);
    }, [postId]);

    const handleLike = async () => {
        if (liked) return;
        setLikes(prev => prev + 1);
        setLiked(true);
        localStorage.setItem(`liked_${postId}`, 'true');

        try {
            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, { likes: increment(1) });
        } catch (error) { console.error("Error liking:", error); }
    };

    return (
        <button 
            onClick={handleLike}
            disabled={liked}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all transform active:scale-95 shadow-sm border ${
                liked 
                ? 'bg-red-50 text-red-500 border-red-200' 
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-brand-gold hover:text-brand-gold'
            }`}
        >
            <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${liked ? 'fill-current' : ''}`} />
            <span className="font-bold text-sm font-agency pt-1">{likes}</span>
        </button>
    );
};

// ==========================================
// LAYOUT 1: ARTICLE (The "Card" Look)
// ==========================================
const ArticleLayout = ({ post }) => (
    <div className="bg-brand-sand min-h-screen py-12 md:py-20 font-lato">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            {/* Back Link */}
            <Link href="/blogs/articles" className="inline-flex items-center text-brand-brown-dark font-bold text-sm mb-6 hover:text-brand-gold transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
            </Link>

            {/* THE CARD CONTAINER */}
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                
                {/* 1. Hero Image Area */}
                <div className="relative w-full aspect-video md:aspect-[2.5/1]">
                    <Image 
                        src={post.coverImage || "/fallback.webp"} 
                        alt={post.title} 
                        fill 
                        className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Floating Badges on Image */}
                    <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-brand-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">
                            {post.category}
                        </span>
                        {post.language && (
                            <span className="px-3 py-1 bg-white/90 text-brand-brown-dark text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm backdrop-blur-sm">
                                {post.language}
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. Content Area */}
                <div className="px-6 py-8 md:px-12 md:py-12">
                    
                    {/* Header Info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-brand-gold" />
                            <span className="font-bold text-brand-brown-dark">{post.author || "Al-Asad Foundation"}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-gold" />
                            <span>{formatDate(post.date)}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand-gold" />
                            <span>{post.readTime}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="font-agency text-4xl md:text-5xl lg:text-6xl text-brand-brown-dark leading-[1.1] mb-6">
                        {post.title}
                    </h1>
                    
                    {/* Brand Divider */}
                    <div className="w-24 h-1.5 bg-brand-gold rounded-full mb-8"></div>

                    {/* Markdown Content */}
                    <article className="prose prose-lg md:prose-xl prose-stone max-w-none font-lato leading-loose text-gray-700
                        prose-headings:font-agency prose-headings:text-brand-brown-dark prose-headings:font-bold
                        prose-a:text-brand-gold hover:prose-a:text-brand-brown-dark 
                        prose-img:rounded-2xl prose-img:shadow-md 
                        prose-blockquote:border-l-4 prose-blockquote:border-brand-gold prose-blockquote:bg-brand-sand/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </article>

                    {/* 3. Footer: Reactions & Tags */}
                    <div className="mt-16 pt-8 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            
                            <LikeButton postId={post.id} initialLikes={post.likes || 0} />
                            
                            {/* Tags - Fixed Wrapping */}
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                {post.tags && (typeof post.tags === 'string' ? post.tags.split(',') : post.tags).map((tag, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-brown-dark hover:text-white transition-colors cursor-pointer border border-gray-200">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
);
// ==========================================
// LAYOUT 2: NEWS (Magazine Card Style)
// ==========================================
const NewsLayout = ({ post, relatedPosts }) => (
    <div className="bg-brand-sand min-h-screen py-8 md:py-16 font-lato">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: Main News Card */}
            <div className="lg:col-span-8">
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                    <div className="relative h-64 md:h-96 w-full">
                        <Image src={post.coverImage || "/fallback.webp"} alt={post.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <span className="bg-brand-gold text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-widest mb-3 inline-block">
                                News Update
                            </span>
                            <h1 className="font-agency text-3xl md:text-5xl text-white leading-tight drop-shadow-md">
                                {post.title}
                            </h1>
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                             <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <Calendar className="w-4 h-4 text-brand-gold" /> {formatDate(post.date)}
                             </div>
                             <LikeButton postId={post.id} initialLikes={post.likes || 0} />
                        </div>

                        <article className="prose prose-lg max-w-none font-lato prose-headings:font-agency prose-headings:text-brand-brown-dark">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </article>
                    </div>
                </div>
            </div>

            {/* RIGHT: Sidebar Cards */}
            <div className="lg:col-span-4 space-y-6">
                {/* Related Widget */}
                <div className="bg-brand-brown-dark rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h3 className="font-agency text-2xl mb-6 relative z-10">Latest Updates</h3>
                    <div className="space-y-6 relative z-10">
                        {relatedPosts.map(item => (
                            <Link key={item.id} href={`/blogs/read/${item.id}`} className="flex gap-4 group items-start">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                    <Image src={item.coverImage || "/fallback.webp"} alt={item.title} fill className="object-cover" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-brand-gold font-bold uppercase block mb-1">{formatDate(item.date)}</span>
                                    <h4 className="font-bold text-sm leading-tight text-white/90 group-hover:text-brand-gold transition-colors line-clamp-2">{item.title}</h4>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ==========================================
// LAYOUT 3: RESEARCH (Formal Document Card)
// ==========================================
const ResearchLayout = ({ post }) => (
    <div className="bg-[#f0f2f5] min-h-screen py-12 px-4 md:px-8 font-lato">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: Metadata Card */}
            <div className="lg:col-span-3 order-2 lg:order-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h4 className="font-agency text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-600" /> Details
                    </h4>
                    <div className="space-y-4 text-sm">
                        <div className="pb-3 border-b border-gray-100">
                            <span className="block text-xs text-gray-400 uppercase font-bold">Published</span> 
                            <span className="font-bold text-gray-700">{formatDate(post.date)}</span>
                        </div>
                        <div className="pb-3 border-b border-gray-100">
                            <span className="block text-xs text-gray-400 uppercase font-bold">Author</span> 
                            <span className="font-bold text-gray-700">{post.author}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 uppercase font-bold mb-2">Topics</span> 
                            <div className="flex flex-wrap gap-2">
                                {post.tags && (typeof post.tags === 'string' ? post.tags.split(',') : post.tags).map((tag, idx) => (
                                    <span key={idx} className="bg-gray-100 px-2 py-1 rounded-md text-xs font-bold text-gray-600">{tag.trim()}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {post.pdfUrl && (
                    <a href={post.pdfUrl} target="_blank" className="block w-full py-4 bg-blue-600 text-white font-bold text-center rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                        <Download className="w-5 h-5" /> Download PDF
                    </a>
                )}
            </div>

            {/* RIGHT: Paper Content Card */}
            <div className="lg:col-span-9 order-1 lg:order-2">
                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-200">
                    <div className="flex gap-3 mb-6">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-100">
                            Research Paper
                        </span>
                        <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-200">
                            {post.language}
                        </span>
                    </div>

                    <h1 className="font-serif text-3xl md:text-5xl text-gray-900 leading-tight mb-8">
                        {post.title}
                    </h1>

                    {/* Abstract Box */}
                    {post.excerpt && (
                        <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-blue-600 mb-10">
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-2">Abstract</h3>
                            <p className="text-gray-700 italic text-sm leading-relaxed">{post.excerpt}</p>
                        </div>
                    )}

                    <article className="prose prose-slate max-w-none prose-h2:text-blue-800 prose-a:text-blue-600 prose-img:rounded-xl">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </article>
                    
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
                         <LikeButton postId={post.id} initialLikes={post.likes || 0} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function BlogPostPage() {
    const params = useParams();
    const id = params?.id; 
    
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostData = async () => {
            if (!id) return;
            setLoading(true);

            try {
                // A. Fetch Main Post
                const docRef = doc(db, "posts", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const postData = { id: docSnap.id, ...docSnap.data() };
                    setPost(postData);

                    // B. Fetch Related
                    if (postData.category) {
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
                            .filter(p => p.id !== id)
                            .slice(0, 3);
                        setRelatedPosts(related);
                    }
                } else {
                    setPost(null);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [id]);

    if (loading) return <Loader size="lg" className="h-screen bg-brand-sand" />;

    if (!post) {
        return (
            <div className="min-h-screen bg-brand-sand flex flex-col font-lato">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                    <div className="bg-white p-12 rounded-3xl shadow-lg">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-4">Post Not Found</h1>
                        <p className="text-gray-500 mb-8">The content may have been moved or deleted.</p>
                        <Link href="/blogs/articles" className="px-8 py-3 bg-brand-gold text-white rounded-full font-bold hover:bg-brand-brown-dark transition-colors">
                            Back to Library
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Header />
            <main>
                {post.category === 'Research' ? (
                    <ResearchLayout post={post} relatedPosts={relatedPosts} />
                ) : post.category === 'News' ? (
                    <NewsLayout post={post} relatedPosts={relatedPosts} />
                ) : (
                    <ArticleLayout post={post} />
                )}
            </main>
            <Footer />
        </>
    );
}
