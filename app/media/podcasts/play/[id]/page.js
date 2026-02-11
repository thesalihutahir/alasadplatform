"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Imported Custom Player (Reused for consistent look)
import CustomVideoPlayer from '@/components/CustomVideoPlayer';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

import { 
    Play, Calendar, Clock, Download, Share2, Heart, 
    MessageCircle, Send, Check, ArrowLeft, Mic, ListMusic, Headphones, ChevronUp, ChevronDown 
} from 'lucide-react';

// --- HELPER: Date Formatter ---
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getDir = (text) => {
    if (!text) return 'ltr';
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? 'rtl' : 'ltr';
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
            className="flex items-center gap-2 text-brand-gold hover:text-brand-brown-dark transition-colors text-xs font-bold uppercase tracking-wider flex-shrink-0"
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Share'}
        </button>
    );
};

// --- COMPONENT: Like Button ---
const LikeButton = ({ postId, initialLikes }) => {
    const [likes, setLikes] = useState(initialLikes || 0);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const hasLiked = localStorage.getItem(`liked_podcast_${postId}`);
        if (hasLiked) setLiked(true);
    }, [postId]);

    const handleLike = async () => {
        if (liked) return;
        setLikes(prev => prev + 1);
        setLiked(true);
        localStorage.setItem(`liked_podcast_${postId}`, 'true');
        try {
            const postRef = doc(db, "podcasts", postId);
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

// --- COMPONENT: Comments Section (Unchanged logic, slightly refined styling) ---
const CommentsSection = ({ postId, isArabic }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "podcasts", postId, "comments"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [postId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !authorName.trim()) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "podcasts", postId, "comments"), { 
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
                <MessageCircle className="w-5 h-5 text-brand-gold" /> {isArabic ? 'التعليقات' : 'Discussion'}
            </h3>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-1">
                        <input 
                            type="text" 
                            value={authorName} 
                            onChange={(e) => setAuthorName(e.target.value)} 
                            placeholder={isArabic ? "الاسم" : "Your Name"} 
                            className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold/50 transition-colors ${isArabic ? 'font-arabic' : ''}`} 
                            required 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <input 
                            type="text"
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)} 
                            placeholder={isArabic ? "شارك برأيك..." : "Join the conversation..."} 
                            className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold/50 transition-colors ${isArabic ? 'font-arabic' : ''}`} 
                            required
                        />
                    </div>
                </div>
                <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                    <button type="submit" disabled={isSubmitting} className="bg-brand-brown-dark text-white px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-brand-gold transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isSubmitting ? 'Posting...' : <>{isArabic ? 'إرسال' : 'Post Comment'} <Send className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} /></>}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-sm flex-shrink-0 uppercase">
                                {comment.author.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-brand-brown-dark text-sm">{comment.author}</span>
                                </div>
                                <p className={`text-gray-600 text-sm leading-relaxed ${isArabic ? 'font-arabic' : 'font-lato'}`}>{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm italic">{isArabic ? "كن أول من يعلق!" : "Be the first to share your thoughts."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function PodcastPlayPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [episode, setEpisode] = useState(null);
    const [relatedEpisodes, setRelatedEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEpisodeData = async () => {
            if (!id) return;
            try {
                // 1. Get Episode
                const docRef = doc(db, "podcasts", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setEpisode({ id: docSnap.id, ...data });

                    // 2. Increment Plays (Client-side trigger, ideally secure this server-side later)
                    updateDoc(docRef, { plays: increment(1) });

                    // 3. Fetch Related (Same Show)
                    if (data.show) {
                        const qRelated = query(
                            collection(db, "podcasts"), 
                            where("show", "==", data.show),
                            orderBy("date", "desc"),
                            limit(5)
                        );
                        const relatedSnap = await getDocs(qRelated);
                        const related = relatedSnap.docs
                            .map(d => ({ id: d.id, ...d.data() }))
                            .filter(ep => ep.id !== id); // Exclude current
                        setRelatedEpisodes(related);
                    }
                } else {
                    router.push('/media/podcasts');
                }
            } catch (error) {
                console.error("Error fetching episode:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEpisodeData();
    }, [id, router]);

    // UPDATED: Use server-side proxy route to force native download behavior
    const handleDownload = (e, audioUrl, title) => {
        e.preventDefault();
        if (!audioUrl) return;
        const proxyUrl = `/api/download?url=${encodeURIComponent(audioUrl)}&name=${encodeURIComponent(title || 'episode')}`;
        window.location.assign(proxyUrl);
    };

    if (loading) return <Loader size="lg" className="h-screen bg-brand-sand" />;
    if (!episode) return null;

    const isArabic = episode.category === 'Arabic';
return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow">
                {/* 1. CINEMA MODE PLAYER SECTION */}
                <div className="bg-brand-brown-dark text-white pt-8 pb-12 px-4 md:px-0">
                    <div className="max-w-6xl mx-auto">

                        {/* Breadcrumb / Back */}
                        <div className="flex justify-between items-center mb-6 px-4">
                            <Link href="/media/podcasts" className="flex items-center gap-2 text-white/60 hover:text-brand-gold transition-colors text-sm font-bold uppercase tracking-wider">
                                <ArrowLeft className="w-4 h-4" /> Back to Library
                            </Link>
                            <span className="text-white/40 text-xs font-agency tracking-widest hidden md:block">Now Playing</span>
                        </div>

                        {/* Player Container */}
                        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                            <iframe 
                                src={`https://www.youtube.com/embed/${episode.videoId}?autoplay=1&modestbranding=1&rel=0`} 
                                title={episode.title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* 2. DETAILS & SIDEBAR GRID */}
                <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT: INFO & COMMENTS */}
                    <div className="lg:col-span-8">
                        {/* Meta Header */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 border-b border-gray-100 pb-8" dir={isArabic ? 'rtl' : 'ltr'}>
                            <div className="flex-grow">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-brand-sand text-brand-brown-dark rounded-md text-[10px] font-bold uppercase tracking-widest">
                                        {episode.show}
                                    </span>
                                    {episode.episodeNumber && (
                                        <span className="px-3 py-1 bg-brand-gold text-white rounded-md text-[10px] font-bold uppercase tracking-widest">
                                            S{episode.season || 1} • EP{episode.episodeNumber}
                                        </span>
                                    )}
                                </div>
                                <h1 className={`text-3xl md:text-4xl text-brand-brown-dark leading-tight mb-4 ${isArabic ? 'font-tajawal font-bold' : 'font-agency'}`}>
                                    {episode.title}
                                </h1>
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(episode.date)}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {episode.plays || 0} Plays</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 flex-shrink-0">
                                <LikeButton postId={episode.id} initialLikes={episode.likes || 0} />
                                {/* UPDATED: Button Triggers proxy endpoint, replaces anchor link */}
                                {episode.audioUrl && (
                                    <button 
                                        onClick={(e) => handleDownload(e, episode.audioUrl, episode.title)}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-brown-dark text-white rounded-full hover:bg-brand-gold transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                        <Download className="w-4 h-4" /> Download MP3
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-stone max-w-none text-gray-600 leading-loose font-lato" dir={isArabic ? 'rtl' : 'ltr'}>
                            <p className={isArabic ? 'font-arabic text-lg' : ''}>
                                {episode.description || "No description provided."}
                            </p>
                        </div>

                        {/* Comments */}
                        <CommentsSection postId={episode.id} isArabic={isArabic} />
                    </div>

                    {/* RIGHT: UP NEXT */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-brand-sand/30 p-6 rounded-2xl border border-brand-sand">
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                                <ListMusic className="w-5 h-5 text-brand-gold" /> Up Next
                            </h3>

                            <div className="space-y-4">
                                {relatedEpisodes.length > 0 ? (
                                    relatedEpisodes.map((ep) => (
                                        <Link key={ep.id} href={`/media/podcasts/play/${ep.id}`} className="group flex gap-4 items-start bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                                <Image src={ep.thumbnail || "/fallback.webp"} alt={ep.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                    <Play className="w-6 h-6 text-white opacity-80 group-hover:opacity-100" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-grow pt-1">
                                                <h4 className="font-agency text-base text-brand-brown-dark leading-tight mb-1 truncate group-hover:text-brand-gold transition-colors">
                                                    {ep.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-2 truncate">{ep.show}</p>
                                                <span className="text-[10px] font-bold text-white bg-brand-brown-dark/80 px-2 py-0.5 rounded">
                                                    EP {ep.episodeNumber || '-'}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        <Mic className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        No more episodes in this series.
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-brand-brown/10 text-center">
                                <Link href="/media/podcasts" className="inline-block text-xs font-bold text-brand-brown-dark uppercase tracking-widest hover:text-brand-gold transition-colors">
                                    View Full Library
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