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
    Quote, FileText, Layers, Heart, ThumbsUp, Eye
} from 'lucide-react';

// --- HELPER: Date Formatter (Crash Proof) ---
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
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-full transition-all transform active:scale-95 shadow-sm ${
                liked 
                ? 'bg-red-50 text-red-500 border border-red-200' 
                : 'bg-white text-gray-500 border border-gray-200 hover:border-red-200 hover:text-red-500'
            }`}
        >
            <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${liked ? 'fill-current' : ''}`} />
            <span className="font-bold text-sm font-agency pt-1">{likes}</span>
        </button>
    );
};

// ==========================================
// LAYOUT 1: ARTICLE (Medium.com / Story Style)
// ==========================================
const ArticleLayout = ({ post }) => (
    <div className="bg-white font-lato">
        {/* Minimalist Centered Header */}
        <div className="max-w-3xl mx-auto px-6 pt-12 md:pt-20 pb-8 text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="px-3 py-1 bg-brand-gold text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full">
                    {post.category}
                </span>
                {post.language && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full border border-gray-200">
                        {post.language}
                    </span>
                )}
            </div>
            <h1 className="font-agency text-4xl md:text-6xl text-brand-brown-dark leading-[1.1] mb-8 drop-shadow-sm">
                {post.title}
            </h1>
            
            {/* Author Meta */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-gray-500 border-t border-b border-gray-100 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden relative border border-gray-100">
                        <Image src="/fallback.webp" alt="Author" fill className="object-cover" />
                    </div>
                    <span className="font-bold text-brand-brown-dark">{post.author || "Al-Asad Foundation"}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span>{formatDate(post.date)}</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><Clock className="w-3 h-3" /> {post.readTime}</span>
            </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-6 pb-24">
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-xl bg-gray-100">
                <Image src={post.coverImage || "/fallback.webp"} alt={post.title} fill className="object-cover" />
            </div>
            
            <article className="prose prose-lg md:prose-xl prose-stone max-w-none font-lato leading-relaxed text-gray-700 
                prose-headings:font-agency prose-headings:text-brand-brown-dark prose-headings:font-bold
                prose-a:text-brand-gold hover:prose-a:text-brand-brown-dark 
                prose-img:rounded-xl prose-img:shadow-lg prose-blockquote:border-brand-gold prose-blockquote:bg-brand-sand/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>

            {/* Footer Actions */}
            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <LikeButton postId={post.id} initialLikes={post.likes || 0} />
                <div className="flex gap-2">
                    {post.tags && (typeof post.tags === 'string' ? post.tags.split(',') : post.tags).map((tag, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-xs hover:bg-brand-gold hover:text-white transition-colors cursor-pointer">
                            #{tag.trim()}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
// ==========================================
// LAYOUT 2: NEWS (Bold, Magazine Style)
// ==========================================
const NewsLayout = ({ post, relatedPosts }) => (
    <div className="bg-white min-h-screen font-lato">
        {/* Split Header Design */}
        <div className="relative bg-brand-brown-dark text-white">
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-gold rounded-full blur-[100px]"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                <div className="order-2 md:order-1">
                    <div className="flex items-center gap-3 mb-6 text-brand-gold font-bold uppercase tracking-widest text-xs">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> News</span>
                        <span className="w-1 h-1 bg-brand-gold rounded-full"></span>
                        <span>{formatDate(post.date)}</span>
                    </div>
                    <h1 className="font-agency text-4xl md:text-7xl leading-[0.95] mb-8">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>By {post.author}</span>
                        <span className="w-px h-4 bg-white/20"></span>
                        <span className="text-brand-gold">{post.language} Edition</span>
                    </div>
                </div>
                {/* Hero Image overlapping bottom */}
                <div className="order-1 md:order-2 relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                    <Image src={post.coverImage || "/fallback.webp"} alt={post.title} fill className="object-cover" />
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                     <LikeButton postId={post.id} initialLikes={post.likes || 0} />
                     <ShareButton />
                </div>
                <article className="prose prose-lg max-w-none font-lato prose-p:text-gray-600 prose-headings:font-agency prose-headings:text-brand-brown-dark">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-brand-sand/30 p-6 rounded-xl border border-brand-gold/10">
                    <h3 className="font-agency text-2xl text-brand-brown-dark mb-4">Latest Updates</h3>
                    <div className="space-y-4">
                        {relatedPosts.map(item => (
                            <Link key={item.id} href={`/blogs/read/${item.id}`} className="flex gap-4 group">
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image src={item.coverImage || "/fallback.webp"} alt={item.title} fill className="object-cover" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-brand-gold font-bold uppercase">{formatDate(item.date)}</span>
                                    <h4 className="font-bold text-sm leading-tight text-brand-brown-dark group-hover:text-brand-gold transition-colors line-clamp-2">{item.title}</h4>
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
// LAYOUT 3: RESEARCH (Academic & Formal)
// ==========================================
const ResearchLayout = ({ post }) => (
    <div className="bg-[#F9FAFB] min-h-screen font-lato">
        {/* Academic Header Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/blogs/research-and-publications" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-gold">
                    <ArrowLeft className="w-4 h-4" /> Back to Research
                </Link>
                <div className="flex items-center gap-3">
                    <LikeButton postId={post.id} initialLikes={post.likes || 0} />
                    {post.pdfUrl && (
                        <a href={post.pdfUrl} target="_blank" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download PDF
                        </a>
                    )}
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Metadata Sidebar */}
            <div className="lg:col-span-3 order-2 lg:order-1 space-y-6">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Paper Details
                    </h4>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div><span className="block text-xs text-gray-400">Published</span> {formatDate(post.date)}</div>
                        <div><span className="block text-xs text-gray-400">Author</span> {post.author}</div>
                        <div><span className="block text-xs text-gray-400">Language</span> {post.language}</div>
                        <div><span className="block text-xs text-gray-400">Topics</span> 
                            <div className="flex flex-wrap gap-1 mt-1">
                                {post.tags && (typeof post.tags === 'string' ? post.tags.split(',') : post.tags).map((tag, idx) => (
                                    <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{tag.trim()}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-blue-900 text-sm mb-2">Citation</h4>
                    <p className="text-xs text-blue-800 font-mono break-words leading-relaxed select-all">
                        {post.author}. ({new Date(post.date).getFullYear()}). "{post.title}". Al-Asad Education Foundation Research.
                    </p>
                </div>
            </div>

            {/* Right: Main Content */}
            <div className="lg:col-span-9 order-1 lg:order-2">
                <div className="bg-white p-8 md:p-12 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 block">Original Research</span>
                    <h1 className="font-serif text-3xl md:text-5xl text-gray-900 leading-tight mb-8">
                        {post.title}
                    </h1>

                    {/* Abstract Box */}
                    {post.excerpt && (
                        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-600 mb-10">
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-2">Abstract</h3>
                            <p className="text-gray-700 italic text-sm leading-relaxed">{post.excerpt}</p>
                        </div>
                    )}

                    {/* Image */}
                    <div className="relative w-full aspect-[21/9] bg-gray-100 mb-10 rounded-lg overflow-hidden border border-gray-200">
                        <Image src={post.coverImage || "/fallback.webp"} alt="Figure 1" fill className="object-cover" />
                    </div>

                    <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    </div>
);

// --- HELPER: Share Button ---
const ShareButton = () => (
    <button 
        onClick={() => {
            if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            }
        }}
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-brown-dark transition-colors"
    >
        <Share2 className="w-4 h-4" /> Share
    </button>
);

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function BlogPostPage() {
    const params = useParams();
    // Safely access ID using Optional Chaining to prevent "Client Side Exception"
    const id = params?.id; 
    
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostData = async () => {
            if (!id) return;
            setLoading(true);

            try {
                const docRef = doc(db, "posts", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const postData = { id: docSnap.id, ...docSnap.data() };
                    setPost(postData);

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

    if (loading) return <Loader size="lg" className="h-screen" />;

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-lato">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                    <h1 className="font-agency text-4xl text-brand-brown-dark mb-4">Post Not Found</h1>
                    <p className="text-gray-500 mb-8">The content may have been moved or deleted.</p>
                    <Link href="/blogs/articles" className="px-8 py-3 bg-brand-gold text-white rounded-full font-bold">
                        Back to Library
                    </Link>
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
