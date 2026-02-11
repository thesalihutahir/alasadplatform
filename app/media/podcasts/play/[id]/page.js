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

// --- COMPONENT: Comments Section ---
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
    const [nextEpisode, setNextEpisode] = useState(null);
    const [playlistId, setPlaylistId] = useState(null); // Holds the podcast playlist ID
    const [loading, setLoading] = useState(true);
    
    const [expandedIds, setExpandedIds] = useState(new Set());

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

                    // 2. Increment Plays (Client-side trigger)
                    updateDoc(docRef, { plays: increment(1) });

                    // 3. Fetch Related (Same Show/Category)
                    const podcastsRef = collection(db, "podcasts");
                    let q;

                    if (data.show) {
                        // Fetch the podcast playlist's document ID to make the link clickable
                        try {
                            const plQ = query(collection(db, "podcast_playlists"), where("title", "==", data.show), limit(1));
                            const plSnap = await getDocs(plQ);
                            if (!plSnap.empty) {
                                setPlaylistId(plSnap.docs[0].id);
                            } else if (data.playlistId) {
                                setPlaylistId(data.playlistId); // Fallback if saved on episode
                            }
                        } catch (e) {
                            console.error("Error fetching podcast playlist ID:", e);
                        }

                        q = query(podcastsRef, where("show", "==", data.show));
                        const snap = await getDocs(q);
                        let showEpisodes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        showEpisodes.sort((a, b) => new Date(a.date) - new Date(b.date));
                        const currentIndex = showEpisodes.findIndex(v => v.id === id);

                        if (currentIndex !== -1 && currentIndex < showEpisodes.length - 1) {
                            setNextEpisode(showEpisodes[currentIndex + 1]); 
                        } else {
                            setNextEpisode(null); 
                        }
                        setRelatedEpisodes(showEpisodes.filter(v => v.id !== id).slice(0, 4));
                    } else {
                        q = query(podcastsRef, where("category", "==", data.category), orderBy("createdAt", "desc"), limit(5));
                        const snap = await getDocs(q);
                        const related = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => v.id !== id);
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

    // UPDATED: Direct Download Logic without opening a new tab
    const handleDownload = async (e, audioUrl, fileName) => {
        e.preventDefault();
        if (!audioUrl) return;
        
        try {
            // Fetch the file as a blob
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            
            // Create a temporary object URL and trigger download
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'download.mp3'; // Fallback name
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed due to CORS or fetching error, opening fallback window:", error);
            // Fallback if CORS prevents blob fetch
            window.open(audioUrl, '_blank'); 
        }
    };

    const toggleExpand = (e, epId) => {
        e.preventDefault(); 
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(epId)) next.delete(epId);
            else next.add(epId);
            return next;
        });
    };

    if (loading) return <div className="min-h-screen flex flex-col bg-white"><Header /><div className="flex-grow flex items-center justify-center"><Loader size="lg" /></div><Footer /></div>;
    if (!episode) return <div className="min-h-screen flex flex-col bg-white"><Header /><div className="flex-grow flex flex-col items-center justify-center text-center p-6"><h2 className="text-2xl font-bold text-gray-400">Podcast Not Found</h2><Link href="/media/podcasts" className="mt-4 text-brand-gold hover:underline">Return to Library</Link></div><Footer /></div>;

    const isArabic = episode.category === 'Arabic';
    const dir = getDir(episode.title);

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">

                {/* 1. HERO BACKGROUND SECTION */}
                <div className="relative w-full bg-brand-brown-dark pt-12 pb-32 lg:pb-48 px-4 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/fallback.webp"
                            alt=""
                            fill
                            className="object-cover opacity-50 mix-blend-overlay scale-110 saturate-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-brand-brown-dark/90 to-transparent"></div>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md mb-6">
                            <Headphones className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                            <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Now Playing</span>
                        </div>
                    </div>
                </div>
{/* 2. OVERLAPPING PLAYER & CONTENT */}
                <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 relative z-20 -mt-24 lg:-mt-40">

                    {/* A) TOP ROW: PLAYER & DESKTOP UP NEXT */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch mb-12">

                        <div className={`w-full ${nextEpisode ? 'lg:w-[65%]' : 'lg:max-w-[854px] mx-auto'}`}>
                            <CustomVideoPlayer 
                                videoId={episode.videoId} 
                                thumbnail={episode.thumbnail} 
                                title={episode.title} 
                            />
                        </div>

                        {nextEpisode && (
                            <div className="hidden lg:block lg:w-[35%]">
                                <div className="bg-brand-brown-dark text-white p-6 rounded-3xl relative overflow-hidden shadow-xl ring-1 ring-white/10 group h-full flex flex-col">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                        <Headphones className="w-24 h-24" />
                                    </div>

                                    <div className="relative z-10 flex-grow flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <ListMusic className="w-3 h-3" /> Up Next
                                        </p>
                                        <Link href={`/media/podcasts/${nextEpisode.id}`} className="block group/link">
                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/5 shadow-inner">
                                                <Image 
                                                    src={nextEpisode.thumbnail || "/fallback.webp"} 
                                                    alt={nextEpisode.title} 
                                                    fill 
                                                    className="object-cover opacity-80 group-hover/link:opacity-100 transition-opacity duration-500"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover/link:bg-brand-gold group-hover/link:border-brand-gold group-hover/link:scale-110 transition-all duration-300 shadow-xl">
                                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="text-white font-agency text-xl md:text-2xl leading-snug line-clamp-2 mb-2 group-hover/link:text-brand-gold transition-colors">
                                                {nextEpisode.title}
                                            </h3>
                                            <p className="text-xs text-white/40 line-clamp-1">From Series: {nextEpisode.show || episode.category}</p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* B) INFO & SIDEBAR GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 lg:items-stretch items-start">

                        {/* LEFT: EPISODE INFO */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm h-full flex flex-col" dir={dir}>
                                
                                {/* UPDATED: Control Strip - Single horizontal row without breaking lines */}
                                <div className="flex flex-nowrap items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-6 overflow-x-auto scrollbar-hide" dir="ltr">
                                    <div className="flex flex-nowrap items-center gap-3 flex-shrink-0">
                                        <span className="px-3 py-1 bg-brand-brown-dark text-white text-[10px] font-bold uppercase rounded-full tracking-wider whitespace-nowrap">
                                            {episode.category}
                                        </span>
                                        {episode.show && (
                                            <div className="hidden sm:flex items-center gap-2 text-brand-brown-dark/60 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-50 whitespace-nowrap">
                                                <ListMusic className="w-3 h-3 flex-shrink-0" /> 
                                                <span className="truncate max-w-[200px]" title={episode.show}>
                                                    {episode.show}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-nowrap items-center gap-3 lg:gap-4 flex-shrink-0">
                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold whitespace-nowrap">
                                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" /> {formatDate(episode.date)}
                                        </div>
                                        <div className="h-4 w-px bg-gray-200 flex-shrink-0"></div>
                                        <SocialShare title={episode.title} />
                                    </div>
                                </div>

                                <h1 className={`text-xl md:text-3xl font-bold text-brand-brown-dark mb-6 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {episode.title}
                                </h1>

                                {/* UPDATED: Download Card - Balanced perfectly for Mobile and Desktop */}
                                {episode.audioUrl && (
                                    <div className="mb-8 flex items-center justify-between p-3 sm:p-5 bg-brand-sand/10 border border-brand-gold/20 rounded-2xl" dir="ltr">
                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-gold rounded-full flex flex-shrink-0 items-center justify-center text-white shadow-md">
                                                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-brand-brown-dark truncate">Audio Version</p>
                                                <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-0.5 truncate">Listen on the go</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => handleDownload(e, episode.audioUrl, `${episode.title}.mp3`)}
                                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-brand-brown-dark text-white rounded-full hover:bg-brand-gold transition-all shadow-md text-[10px] sm:text-xs font-bold uppercase tracking-wider flex-shrink-0"
                                        >
                                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Download</span><span className="sm:hidden">MP3</span>
                                        </button>
                                    </div>
                                )}

                                {/* Description */}
                                <div className={`prose prose-sm md:prose-base max-w-none text-gray-600 flex-grow leading-relaxed whitespace-pre-line ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                    {episode.show && (
                                        playlistId ? (
                                            <Link 
                                                href={`/media/podcasts/playlists/${playlistId}`} 
                                                className="block w-fit text-xs font-bold text-brand-gold mb-4 uppercase tracking-wide border-l-2 border-brand-gold pl-3 hover:text-brand-brown-dark hover:underline transition-colors"
                                            >
                                                Podcast Series: {episode.show}
                                            </Link>
                                        ) : (
                                            <p className="text-xs font-bold text-brand-gold mb-4 uppercase tracking-wide border-l-2 border-brand-gold pl-3">
                                                Podcast Series: {episode.show}
                                            </p>
                                        )
                                    )}
                                    {episode.description}
                                </div>

                                {/* Comments */}
                                <CommentsSection postId={episode.id} isArabic={isArabic} />
                            </div>
                        </div>

                        {/* RIGHT: SIDEBAR */}
                        <div className="lg:col-span-4 space-y-8 flex flex-col h-full">

                            {/* Up Next (Mobile Only) */}
                            {nextEpisode && (
                                <div className="block lg:hidden">
                                    <div className="bg-brand-brown-dark text-white p-6 rounded-3xl relative overflow-hidden shadow-xl ring-1 ring-white/10 group">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                            <Headphones className="w-24 h-24" />
                                        </div>

                                        <div className="relative z-10">
                                            <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <ListMusic className="w-3 h-3" /> Up Next
                                            </p>
                                            <Link href={`/media/podcasts/${nextEpisode.id}`} className="block group/link">
                                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/5 shadow-inner">
                                                    <Image 
                                                        src={nextEpisode.thumbnail || "/fallback.webp"} 
                                                        alt={nextEpisode.title} 
                                                        fill 
                                                        className="object-cover opacity-80 group-hover/link:opacity-100 transition-opacity duration-500"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover/link:bg-brand-gold group-hover/link:border-brand-gold group-hover/link:scale-110 transition-all duration-300 shadow-xl">
                                                            <Play className="w-5 h-5 fill-current ml-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <h3 className="text-white font-agency text-xl leading-snug line-clamp-2 mb-2 group-hover/link:text-brand-gold transition-colors">
                                                    {nextEpisode.title}
                                                </h3>
                                                <p className="text-xs text-white/40 line-clamp-1">From Series: {nextEpisode.show || episode.category}</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Related Episodes */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex-grow">
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-6 px-1 flex items-center gap-2">
                                    {episode.show ? "More From This Series" : "Related Episodes"}
                                </h3>
                                <div className="flex flex-col gap-4">
                                    {relatedEpisodes.length > 0 ? (
                                        relatedEpisodes.map((rel) => {
                                            const isExpanded = expandedIds.has(rel.id);
                                            return (
                                                <Link 
                                                    key={rel.id} 
                                                    href={`/media/podcasts/${rel.id}`}
                                                    className="group relative flex items-start gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                                                >
                                                    <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 border border-gray-100 shadow-sm">
                                                        <Image 
                                                            src={rel.thumbnail || "/fallback.webp"} 
                                                            alt={rel.title} 
                                                            fill 
                                                            className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-6 h-6 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20">
                                                                <Headphones className="w-2.5 h-2.5 text-white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow min-w-0 py-0.5" dir={getDir(rel.title)}>
                                                        <div className="relative pr-6">
                                                            <h4 className={`text-sm font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${getDir(rel.title) === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                                {rel.title}
                                                            </h4>
                                                            <button 
                                                                onClick={(e) => toggleExpand(e, rel.id)}
                                                                className="absolute right-0 top-0 p-0.5 text-gray-300 hover:text-brand-gold transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider" dir="ltr">{formatDate(rel.date)}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center text-gray-400 text-xs py-4">No related episodes found.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}