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
import { doc, getDoc, updateDoc, increment, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

import { 
    Book, Calendar, Download, Share2, Heart, Eye,
    MessageCircle, Send, Check, ArrowLeft, Library, FileText, Globe, Building2 
} from 'lucide-react';

// --- HELPER: Date Formatter ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    // Handle Firestore Timestamp or string
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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
        <button 
            onClick={handleCopy} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-brand-gold hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
        >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share'}
        </button>
    );
};

// --- COMPONENT: Like Button ---
const LikeButton = ({ bookId, initialLikes }) => {
    const [likes, setLikes] = useState(initialLikes || 0);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const hasLiked = localStorage.getItem(`liked_book_${bookId}`);
        if (hasLiked) setLiked(true);
    }, [bookId]);

    const handleLike = async () => {
        if (liked) return;
        setLikes(prev => prev + 1);
        setLiked(true);
        localStorage.setItem(`liked_book_${bookId}`, 'true');
        try {
            const postRef = doc(db, "ebooks", bookId);
            await updateDoc(postRef, { likes: increment(1) });
        } catch (error) { console.error("Error liking:", error); }
    };

    return (
        <button 
            onClick={handleLike} 
            disabled={liked} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider ${
                liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
        >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likes} Likes</span>
        </button>
    );
};

// --- COMPONENT: Comments ---
const CommentsSection = ({ bookId, isArabic }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "ebooks", bookId, "comments"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [bookId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !authorName.trim()) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "ebooks", bookId, "comments"), { 
                text: newComment, 
                author: authorName, 
                createdAt: serverTimestamp() 
            });
            setNewComment('');
        } catch (error) { console.error("Error posting comment:", error); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="mt-12 border-t border-gray-100 pt-8" dir={isArabic ? 'rtl' : 'ltr'}>
            <h3 className={`font-agency text-2xl text-brand-brown-dark mb-6 flex items-center gap-2 ${isArabic ? 'font-tajawal' : ''}`}>
                <MessageCircle className="w-5 h-5" /> {isArabic ? 'التعليقات' : 'Discussion'}
            </h3>
            
            <form onSubmit={handlePostComment} className="mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-1">
                        <input 
                            type="text" 
                            value={authorName} 
                            onChange={(e) => setAuthorName(e.target.value)} 
                            placeholder={isArabic ? "الاسم" : "Your Name"} 
                            className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${isArabic ? 'font-arabic' : ''}`} 
                            required 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <input 
                            type="text"
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)} 
                            placeholder={isArabic ? "شارك برأيك..." : "Share your thoughts..."} 
                            className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${isArabic ? 'font-arabic' : ''}`} 
                            required
                        />
                    </div>
                </div>
                <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                    <button type="submit" disabled={isSubmitting} className="bg-brand-brown-dark text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-brand-gold transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isSubmitting ? 'Posting...' : <>{isArabic ? 'إرسال' : 'Post Comment'} <Send className={`w-3 h-3 ${isArabic ? 'rotate-180' : ''}`} /></>}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand-sand flex items-center justify-center text-brand-brown-dark font-bold text-xs flex-shrink-0">
                                {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-brand-brown-dark text-sm">{comment.author}</span>
                                    <span className="text-xs text-gray-400 opacity-60">• Just now</span>
                                </div>
                                <p className={`text-gray-600 text-sm leading-relaxed ${isArabic ? 'font-arabic' : ''}`}>{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm italic">{isArabic ? "كن أول من يعلق!" : "Be the first to share your thoughts."}</p>
                )}
            </div>
        </div>
    );
};
// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function BookReadPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    // --- STATE ---
    const [book, setBook] = useState(null);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookData = async () => {
            if (!id) return;
            try {
                // 1. Get Book Data
                const docRef = doc(db, "ebooks", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBook({ id: docSnap.id, ...data });

                    // Increment Reads/Views
                    updateDoc(docRef, { reads: increment(1) });

                    // 2. Fetch Related (Same Collection OR Same Language)
                    let qRelated;
                    if (data.collection) {
                        qRelated = query(
                            collection(db, "ebooks"), 
                            where("collection", "==", data.collection),
                            orderBy("createdAt", "desc"),
                            limit(5)
                        );
                    } else {
                        // Fallback: Same Language if no collection
                        qRelated = query(
                            collection(db, "ebooks"), 
                            where("language", "==", data.language), // Replaced Genre/Category
                            orderBy("createdAt", "desc"),
                            limit(5)
                        );
                    }

                    const relatedSnap = await getDocs(qRelated);
                    const related = relatedSnap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(b => b.id !== id);
                    setRelatedBooks(related);

                } else {
                    router.push('/media/ebooks');
                }
            } catch (error) {
                console.error("Error fetching book:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookData();
    }, [id, router]);

    // Handle Download (and track it)
    const handleDownload = async () => {
        if (!book?.fileUrl) return; 
        
        // 1. Trigger Download
        const link = document.createElement('a');
        link.href = book.fileUrl;
        link.target = "_blank"; 
        link.download = book.fileName || 'document'; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 2. Track in DB
        try {
            const docRef = doc(db, "ebooks", id);
            await updateDoc(docRef, { downloads: increment(1) });
        } catch (e) { console.error("Error tracking download", e); }
    };

    if (loading) return <Loader size="lg" className="h-screen bg-brand-sand" />;
    if (!book) return null;

    const isArabic = book.language === 'Arabic';

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow">
                {/* 1. IMMERSIVE HEADER SECTION */}
                <div className="relative w-full bg-brand-brown-dark overflow-hidden">
                    {/* Blurred Backdrop */}
                    <div className="absolute inset-0">
                        <Image 
                            src={book.coverUrl || "/fallback.webp"} 
                            alt="Backdrop" 
                            fill 
                            className="object-cover opacity-20 blur-3xl scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-brand-brown-dark/80 to-brand-brown-dark"></div>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
                        {/* Back Link */}
                        <Link href="/media/ebooks" className="inline-flex items-center text-white/60 hover:text-brand-gold mb-8 text-xs font-bold uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
                        </Link>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start text-center md:text-left">
                            
                            {/* Book Cover (Physical Look) */}
                            <div className="relative w-48 aspect-[2/3] md:w-64 flex-shrink-0 shadow-2xl rounded-r-lg border-l-4 border-white/20 transform md:rotate-3 transition-transform hover:rotate-0 bg-gray-800">
                                <Image 
                                    src={book.coverUrl || "/fallback.webp"} 
                                    alt={book.title} 
                                    fill 
                                    className="object-cover rounded-r-lg" 
                                />
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                            </div>

                            {/* Details */}
                            <div className="flex-grow flex flex-col justify-center h-full pt-2 text-white" dir={isArabic ? 'rtl' : 'ltr'}>
                                <div className={`flex flex-wrap items-center gap-3 mb-4 justify-center ${isArabic ? 'md:justify-end' : 'md:justify-start'}`} dir="ltr">
                                    <span className="px-3 py-1 bg-brand-gold text-white rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> {book.language}
                                    </span>
                                    {book.year && (
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {book.year}
                                        </span>
                                    )}
                                    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${book.access === 'Members Only' ? 'bg-red-500/80' : 'bg-green-600/80'}`}>
                                        {book.access || 'Free'}
                                    </span>
                                </div>

                                <h1 className={`text-3xl md:text-5xl font-bold mb-4 leading-tight ${isArabic ? 'font-tajawal' : 'font-agency'}`}>
                                    {book.title}
                                </h1>

                                <div className={`flex flex-col gap-2 mb-6 ${isArabic ? 'items-end' : 'items-center md:items-start'}`}>
                                    <p className="text-white/70 font-bold text-sm md:text-lg uppercase tracking-wide">
                                        Author: {book.author}
                                    </p>
                                    <p className="text-white/50 text-xs flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {book.publisher || "Unknown Publisher"}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className={`flex flex-wrap items-center gap-4 justify-center ${isArabic ? 'md:justify-end' : 'md:justify-start'}`}>
                                    <a 
                                        href={book.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-8 py-3 bg-white text-brand-brown-dark font-bold text-sm rounded-full uppercase tracking-wider hover:bg-brand-gold hover:text-white transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" /> Read Online
                                    </a>
                                    <button 
                                        onClick={handleDownload}
                                        className="px-8 py-3 border border-white/30 text-white font-bold text-sm rounded-full uppercase tracking-wider hover:bg-white hover:text-brand-brown-dark transition-all flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Download ({book.fileFormat || 'PDF'})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DETAILS & SIDEBAR GRID */}
                <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT: INFO & COMMENTS */}
                    <div className="lg:col-span-8">
                        {/* Meta Bar */}
                        <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-8" dir={isArabic ? 'rtl' : 'ltr'}>
                            <div className="flex gap-6 text-sm text-gray-500 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-gold" /> {formatDate(book.createdAt)}</div>
                                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-brand-gold" /> {book.fileSize}</div>
                            </div>
                            <div className="flex gap-3">
                                <LikeButton bookId={book.id} initialLikes={book.likes || 0} />
                                <SocialShare title={book.title} />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-stone max-w-none text-gray-600 leading-loose font-lato" dir={isArabic ? 'rtl' : 'ltr'}>
                            <h3 className={`text-xl font-bold text-brand-brown-dark mb-4 ${isArabic ? 'font-tajawal' : 'font-agency'}`}>
                                {isArabic ? 'حول الكتاب' : 'About this Book'}
                            </h3>
                            <p className={isArabic ? 'font-arabic text-lg' : ''}>
                                {book.description || "No description provided for this book."}
                            </p>
                        </div>

                        <CommentsSection bookId={book.id} isArabic={isArabic} />
                    </div>

                    {/* RIGHT: RELATED BOOKS */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-brand-sand/30 p-6 rounded-2xl border border-brand-sand">
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                                <Library className="w-5 h-5 text-brand-gold" /> 
                                {book.collection ? 'From this Collection' : 'Similar Books'}
                            </h3>
                            
                            <div className="space-y-4">
                                {relatedBooks.length > 0 ? (
                                    relatedBooks.map((item) => (
                                        <Link key={item.id} href={`/media/ebooks/read/${item.id}`} className="group flex gap-4 items-start bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                                            <div className="relative w-16 aspect-[2/3] flex-shrink-0 rounded shadow-sm overflow-hidden bg-gray-200">
                                                <Image src={item.coverUrl || "/fallback.webp"} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                            </div>
                                            <div className="min-w-0 flex-grow pt-1">
                                                <h4 className="font-agency text-base text-brand-brown-dark leading-tight mb-1 line-clamp-2 group-hover:text-brand-gold transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-2 truncate">by {item.author}</p>
                                                <span className="text-[10px] font-bold text-brand-brown bg-brand-sand px-2 py-0.5 rounded">
                                                    {item.year || item.language}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        <Book className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        No related books found.
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-brand-brown/10 text-center">
                                <Link href="/media/ebooks" className="inline-block text-xs font-bold text-brand-brown-dark uppercase tracking-widest hover:text-brand-gold transition-colors">
                                    Browse Full Library
                                </Link>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

            <Footer />
        </div>
    );
}