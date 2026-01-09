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
import { doc, getDoc, updateDoc, increment, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

import { 
    Calendar, User, Clock, Tag, Download, 
    ArrowLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon,
    Quote, FileText, Layers, Heart, MessageCircle, Send, Check
} from 'lucide-react';

// --- HELPER: Date Formatter ---
const formatDate = (dateString, locale = 'en-GB') => {
    try {
        if (!dateString) return '';
        // Handle Firestore Timestamp or string
        const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
        return date.toLocaleDateString(locale, { 
            day: 'numeric', month: 'long', year: 'numeric' 
        });
    } catch (e) { return String(dateString); }
};

// --- HELPER: Read Time Formatter ---
const getReadTime = (text, lang) => {
    if (!text) return '';
    const wpm = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);

    if (lang === 'Arabic') return `${time} دقائق قراءة`;
    if (lang === 'Hausa') return `Minti ${time} karatu`;
    return `${time} min read`;
};

// --- HELPER: Time Ago ---
const timeAgo = (date) => {
    if (!date) return 'Just now';
    const d = date.toDate ? date.toDate() : new Date(date);
    const seconds = Math.floor((new Date() - d) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

// --- COMPONENT: Social Share ---
const SocialShare = ({ title }) => {
    const [copied, setCopied] = useState(false);
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') setUrl(window.location.href);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!url) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:block">Share:</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-colors"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-700 rounded-full hover:bg-black hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
            <button onClick={handleCopy} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-brand-gold hover:text-white transition-colors relative">{copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}</button>
        </div>
    );
};

// --- COMPONENT: Like Button ---
const LikeButton = ({ postId, initialLikes, collectionName }) => {
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
            const postRef = doc(db, collectionName, postId);
            await updateDoc(postRef, { likes: increment(1) });
        } catch (error) { console.error("Error liking:", error); }
    };

    return (
        <button onClick={handleLike} disabled={liked} className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all transform active:scale-95 shadow-sm border ${liked ? 'bg-red-50 text-red-500 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-brand-gold hover:text-brand-gold'}`}>
            <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${liked ? 'fill-current' : ''}`} />
            <span className="font-bold text-sm font-agency pt-1">{likes}</span>
        </button>
    );
};

// --- COMPONENT: Comments ---
const CommentsSection = ({ postId, collectionName, isArabic }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, collectionName, postId, "comments"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [postId, collectionName]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !authorName.trim()) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, collectionName, postId, "comments"), { text: newComment, author: authorName, createdAt: serverTimestamp() });
            setNewComment('');
        } catch (error) { console.error("Error posting comment:", error); } finally { setIsSubmitting(false); }
    };

    return (
        <div className={`bg-brand-sand/20 rounded-2xl p-6 md:p-8 mt-12 border border-brand-brown/5 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
            <h3 className={`font-agency text-2xl text-brand-brown-dark mb-6 flex items-center gap-2 ${isArabic ? 'font-tajawal' : ''}`}>
                <MessageCircle className="w-5 h-5" /> {isArabic ? `التعليقات (${comments.length})` : `Discussion (${comments.length})`}
            </h3>
            <form onSubmit={handlePostComment} className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4">
                    <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder={isArabic ? "الاسم" : "Your Name"} className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all ${isArabic ? 'font-arabic' : ''}`} required />
                </div>
                <div className="mb-4">
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={isArabic ? "أكتب تعليقك هنا..." : "Share your thoughts..."} rows="3" className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all resize-none ${isArabic ? 'font-arabic' : ''}`} required></textarea>
                </div>
                <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                    <button type="submit" disabled={isSubmitting} className="bg-brand-brown-dark text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-brand-gold transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isSubmitting ? (isArabic ? 'جاري النشر...' : 'Posting...') : <>{isArabic ? 'إرسال' : 'Post Comment'} <Send className={`w-3 h-3 ${isArabic ? 'rotate-180' : ''}`} /></>}
                    </button>
                </div>
            </form>
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-gold font-bold text-lg shadow-sm flex-shrink-0">
                                {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-brand-brown-dark text-sm">{comment.author}</span>
                                    <span className="text-[10px] text-gray-400">• {comment.createdAt ? timeAgo(comment.createdAt) : 'Just now'}</span>
                                </div>
                                <p className={`text-gray-600 text-sm leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm italic text-center py-4">{isArabic ? "لا توجد تعليقات حتى الآن." : "No comments yet. Be the first to share your thoughts!"}</p>
                )}
            </div>
        </div>
    );
};
// ==========================================
// LAYOUT 1: ARTICLE (Standard)
// ==========================================
const ArticleLayout = ({ post, collectionName }) => {
    const isArabic = post.language === 'Arabic';
    const displayDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt || Date.now());

    return (
        <div className="bg-brand-sand min-h-screen py-12 md:py-20 font-lato relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-[url('/pattern-light.svg')] opacity-5 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/blogs/articles" className="inline-flex items-center text-brand-brown-dark font-bold text-sm hover:text-brand-gold transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
                    </Link>
                    <span className="font-agency text-xl text-brand-brown-dark/20 uppercase tracking-[0.2em] hidden md:block">Journal & Insights</span>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50">
                    {/* Hero Image */}
                    <div className="relative w-full aspect-video md:aspect-[2.5/1]">
                        <Image src={post.featuredImage || "/fallback.webp"} alt={post.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className={`absolute bottom-6 ${isArabic ? 'right-6' : 'left-6'} flex flex-wrap gap-2`}>
                            <span className="px-3 py-1 bg-brand-gold text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">{post.category}</span>
                            {post.language && <span className="px-3 py-1 bg-white/90 text-brand-brown-dark text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm backdrop-blur-sm">{post.language}</span>}
                        </div>
                    </div>

                    <div className="px-6 py-8 md:px-12 md:py-12" dir={isArabic ? 'rtl' : 'ltr'}>
                        {/* Meta */}
                        <div className={`flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100 ${isArabic ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex items-center gap-2" dir="ltr">
                                <User className="w-4 h-4 text-brand-gold" />
                                <span className="font-bold text-brand-brown-dark">{post.author || "Al-Asad Foundation"}</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-2" dir="ltr">
                                <Calendar className="w-4 h-4 text-brand-gold" />
                                <span>{formatDate(displayDate)}</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-2" dir="ltr">
                                <Clock className="w-4 h-4 text-brand-gold" />
                                <span>{getReadTime(post.body || "", post.language)}</span>
                            </div>
                        </div>

                        <h1 className={`text-4xl md:text-5xl lg:text-6xl text-brand-brown-dark leading-[1.2] mb-6 ${isArabic ? 'font-tajawal font-bold text-right' : 'font-agency text-left'}`}>
                            {post.title}
                        </h1>

                        <div className={`w-24 h-1.5 bg-brand-gold rounded-full mb-10 ${isArabic ? 'ml-auto mr-0' : 'mr-auto ml-0'}`}></div>

                        <article className={`prose prose-lg md:prose-xl prose-stone max-w-none leading-loose text-gray-700 
                            prose-headings:text-brand-brown-dark prose-headings:font-bold
                            prose-a:text-brand-gold hover:prose-a:text-brand-brown-dark 
                            prose-img:rounded-2xl prose-img:shadow-md 
                            ${isArabic 
                                ? 'font-arabic text-right prose-headings:font-tajawal prose-blockquote:border-r-4 prose-blockquote:border-l-0 prose-blockquote:border-brand-gold prose-blockquote:pr-4' 
                                : 'font-lato text-left prose-headings:font-agency prose-blockquote:border-l-4 prose-blockquote:border-brand-gold prose-blockquote:pl-4'
                            }`}>
                            <ReactMarkdown>{post.body}</ReactMarkdown>
                        </article>

                        <div className="mt-16 pt-8 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <LikeButton postId={post.id} initialLikes={post.likes || 0} collectionName={collectionName} />
                                    <SocialShare title={post.title} />
                                </div>
                            </div>
                            <CommentsSection postId={post.id} collectionName={collectionName} isArabic={isArabic} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// LAYOUT 2: NEWS
// ==========================================
const NewsLayout = ({ post, collectionName, relatedPosts }) => {
    const isArabic = post.language === 'Arabic';
    const eventDate = post.eventDate ? new Date(post.eventDate) : new Date();

    return (
        <div className="bg-brand-sand min-h-screen py-8 md:py-16 font-lato relative">
             <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-brand-sand pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                        <div className="relative h-64 md:h-96 w-full">
                            <Image src={post.featuredImage || "/fallback.webp"} alt={post.headline} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                            <div className={`absolute bottom-6 ${isArabic ? 'right-6 text-right' : 'left-6 text-left'} right-6`}>
                                <span className="bg-brand-gold text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-widest mb-3 inline-block">News Update</span>
                                <h1 className={`text-3xl md:text-5xl text-white leading-tight drop-shadow-md ${isArabic ? 'font-tajawal font-bold' : 'font-agency'}`}>{post.headline}</h1>
                            </div>
                        </div>
                        <div className="p-8 md:p-10" dir={isArabic ? 'rtl' : 'ltr'}>
                            <div className={`flex flex-col md:flex-row md:items-center gap-4 mb-8 border-b border-gray-100 pb-4 ${isArabic ? 'md:flex-row-reverse' : 'md:justify-between'}`}>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-500" dir="ltr"><Calendar className="w-4 h-4 text-brand-gold" /> {formatDate(eventDate)}</div>
                                <div className="flex items-center gap-4">
                                    <LikeButton postId={post.id} initialLikes={post.likes || 0} collectionName={collectionName} />
                                    <SocialShare title={post.headline} />
                                </div>
                            </div>
                            {/* Short Description Highlight */}
                            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-brand-gold mb-8 italic text-gray-600">
                                {post.shortDescription}
                            </div>
                            <article className={`prose prose-lg max-w-none text-gray-700 leading-loose ${isArabic ? 'font-arabic text-right prose-headings:font-tajawal' : 'font-lato prose-headings:font-agency'}`}>
                                <ReactMarkdown>{post.body || "No additional content."}</ReactMarkdown>
                            </article>
                            <CommentsSection postId={post.id} collectionName={collectionName} isArabic={isArabic} />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-brand-brown-dark rounded-3xl p-8 text-white shadow-lg relative overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className={`text-2xl mb-6 relative z-10 ${isArabic ? 'font-tajawal font-bold text-right' : 'font-agency'}`}>{isArabic ? 'أحدث الأخبار' : 'Latest Updates'}</h3>
                        <div className="space-y-6 relative z-10">
                            {relatedPosts.map(item => (
                                <Link key={item.id} href={`/blogs/read/${item.id}`} className="flex gap-4 group items-start">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                        <Image src={item.featuredImage || "/fallback.webp"} alt={item.headline} fill className="object-cover" />
                                    </div>
                                    <div className={isArabic ? 'text-right' : 'text-left'}>
                                        <span className="text-[10px] text-brand-gold font-bold uppercase block mb-1">{formatDate(item.eventDate)}</span>
                                        <h4 className={`font-bold text-sm leading-tight text-white/90 group-hover:text-brand-gold transition-colors line-clamp-2 ${isArabic ? 'font-tajawal' : ''}`}>{item.headline}</h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// LAYOUT 3: RESEARCH
// ==========================================
const ResearchLayout = ({ post, collectionName }) => {
    const isArabic = post.language === 'Arabic';
    const publishDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

    return (
        <div className="bg-[#f0f2f5] min-h-screen py-12 px-4 md:px-8 font-lato">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 order-2 lg:order-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200" dir={isArabic ? 'rtl' : 'ltr'}>
                        <h4 className={`text-xl text-gray-900 mb-4 flex items-center gap-2 ${isArabic ? 'font-tajawal font-bold' : 'font-agency'}`}><Layers className="w-5 h-5 text-blue-600" /> {isArabic ? 'تفاصيل البحث' : 'Details'}</h4>
                        <div className={`space-y-4 text-sm ${isArabic ? 'text-right' : 'text-left'}`}>
                            <div className="pb-3 border-b border-gray-100"><span className="block text-xs text-gray-400 uppercase font-bold">{isArabic ? 'تاريخ النشر' : 'Published'}</span> <span className="font-bold text-gray-700">{formatDate(publishDate)}</span></div>
                            <div className="pb-3 border-b border-gray-100"><span className="block text-xs text-gray-400 uppercase font-bold">{isArabic ? 'المؤلف' : 'Authors'}</span> <span className="font-bold text-gray-700">{post.authors}</span></div>
                            <div><span className="block text-xs text-gray-400 uppercase font-bold">{isArabic ? 'النوع' : 'Type'}</span> <span className="font-bold text-blue-600">{post.researchType}</span></div>
                        </div>
                    </div>
                    {post.pdfUrl && <a href={post.pdfUrl} target="_blank" className="block w-full py-4 bg-blue-600 text-white font-bold text-center rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"><Download className="w-5 h-5" /> {isArabic ? 'تحميل PDF' : 'Download PDF'}</a>}
                    {post.doi && <a href={post.doi} target="_blank" className="block w-full py-4 bg-white border border-gray-300 text-gray-700 font-bold text-center rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"><LinkIcon className="w-4 h-4" /> DOI Link</a>}
                </div>
                <div className="lg:col-span-9 order-1 lg:order-2">
                    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-gray-200" dir={isArabic ? 'rtl' : 'ltr'}>
                        <div className={`flex gap-3 mb-6 ${isArabic ? 'justify-start' : ''}`}>
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-100">{post.publicationStatus}</span>
                            <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-200">{post.language}</span>
                        </div>
                        <h1 className={`text-3xl md:text-5xl text-gray-900 leading-tight mb-8 ${isArabic ? 'font-tajawal font-bold text-right' : 'font-serif'}`}>{post.researchTitle}</h1>
                        {post.abstract && (
                            <div className={`bg-gray-50 p-6 rounded-2xl border-blue-600 mb-10 ${isArabic ? 'border-r-4 text-right' : 'border-l-4 text-left'}`}>
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-2">{isArabic ? 'الملخص' : 'Abstract'}</h3>
                                <p className={`text-gray-700 italic text-sm leading-relaxed ${isArabic ? 'font-arabic not-italic' : ''}`}>{post.abstract}</p>
                            </div>
                        )}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end gap-4 items-center">
                             <SocialShare title={post.researchTitle} />
                             <LikeButton postId={post.id} initialLikes={post.likes || 0} collectionName={collectionName} />
                        </div>
                        <CommentsSection postId={post.id} collectionName={collectionName} isArabic={isArabic} />
                    </div>
                </div>
            </div>
        </div>
    );
};
// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const [post, setPost] = useState(null);
    const [collectionName, setCollectionName] = useState('articles'); // Default
    const [relatedPosts, setRelatedPosts] = useState([]); // For News
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // 1. Try finding it in 'articles'
                let docRef = doc(db, "articles", id);
                let docSnap = await getDoc(docRef);
                let foundCollection = 'articles';

                // 2. If not found, try 'news'
                if (!docSnap.exists()) {
                    docRef = doc(db, "news", id);
                    docSnap = await getDoc(docRef);
                    foundCollection = 'news';
                }

                // 3. If not found, try 'research'
                if (!docSnap.exists()) {
                    docRef = doc(db, "research", id);
                    docSnap = await getDoc(docRef);
                    foundCollection = 'research';
                }

                if (docSnap.exists()) {
                    setCollectionName(foundCollection);
                    const postData = { id: docSnap.id, ...docSnap.data() };
                    setPost(postData);

                    // If it's News, fetch related news
                    if (foundCollection === 'news') {
                        const qRelated = query(collection(db, "news"), where("status", "==", "Published"), orderBy("createdAt", "desc"), limit(4));
                        const relatedSnap = await getDocs(qRelated);
                        const related = relatedSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id).slice(0, 3);
                        setRelatedPosts(related);
                    }
                } else {
                    setPost(null);
                }
            } catch (error) { 
                console.error("Error fetching post:", error); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchPostData();
    }, [id]);

    if (loading) return <Loader size="lg" className="h-screen bg-brand-sand" />;
    
    if (!post) return (
        <div className="min-h-screen bg-brand-sand flex flex-col items-center justify-center">
            <h1 className="font-agency text-4xl text-brand-brown-dark mb-4">Post Not Found</h1>
            <Link href="/blogs" className="px-6 py-2 bg-brand-gold text-white rounded-xl font-bold">Return to Blogs</Link>
        </div>
    );

    return (
        <>
            <Header />
            <main>
                {collectionName === 'research' && <ResearchLayout post={post} collectionName={collectionName} />}
                {collectionName === 'news' && <NewsLayout post={post} collectionName={collectionName} relatedPosts={relatedPosts} />}
                {collectionName === 'articles' && <ArticleLayout post={post} collectionName={collectionName} />}
            </main>
            <Footer />
        </>
    );
}
