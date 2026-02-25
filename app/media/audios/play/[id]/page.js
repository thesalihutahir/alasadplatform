"use client";

import React, { useState, useEffect, useRef } from 'react';
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
    Play,
    Pause,
    Calendar,
    User,
    Download,
    Share2,
    Heart,
    MessageCircle,
    Send,
    Check,
    ListMusic,
    FileText,
    Headphones,
    ChevronDown,
    ChevronUp,
    ArrowLeft
} from 'lucide-react';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getDir = (text) => {
    if (!text) return 'ltr';
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? 'rtl' : 'ltr';
};

const SocialShare = ({ title }) => {
    const [copied, setCopied] = useState(false);
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') setUrl(window.location.href);
    }, []);

    const handleShare = async () => {
        if (!url) return;
        try {
            if (navigator.share) {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    if (!url) return null;

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-brand-brown-dark hover:border-brand-gold/50 transition-colors text-[10px] font-bold uppercase tracking-widest"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Share'}
        </button>
    );
};

const LikeButton = ({ audioId, initialLikes }) => {
    const [likes, setLikes] = useState(initialLikes || 0);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const hasLiked = localStorage.getItem(`liked_audio_${audioId}`);
        if (hasLiked) setLiked(true);
    }, [audioId]);

    const handleLike = async () => {
        if (liked) return;
        setLikes((prev) => prev + 1);
        setLiked(true);
        localStorage.setItem(`liked_audio_${audioId}`, 'true');
        try {
            const docRef = doc(db, 'audios', audioId);
            await updateDoc(docRef, { likes: increment(1) });
        } catch (error) {
            console.error('Error liking:', error);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={liked}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest ${
                liked ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-white border border-gray-200 text-brand-brown-dark hover:bg-red-50 hover:border-red-100 hover:text-red-500'
            }`}
        >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            <span>{likes} Likes</span>
        </button>
    );
};

const CommentsSection = ({ audioId, isArabic }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'audios', audioId, 'comments'), orderBy('createdAtClient', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
        });
        return () => unsubscribe();
    }, [audioId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !authorName.trim()) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'audios', audioId, 'comments'), {
                text: newComment,
                author: authorName,
                createdAt: serverTimestamp(),
                createdAtClient: Date.now()
            });
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 border-t border-gray-100 pt-8" dir={isArabic ? 'rtl' : 'ltr'}>
            <h3 className={`font-agency text-2xl text-brand-brown-dark mb-6 flex items-center gap-2 ${isArabic ? 'font-tajawal' : ''}`}>
                <MessageCircle className="w-5 h-5 text-brand-gold" /> {isArabic ? 'التعليقات' : 'Discussion'}
            </h3>

            <form onSubmit={handlePostComment} className="mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex flex-col gap-4 mb-4">
                    <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder={isArabic ? 'الاسم' : 'Your Name'}
                        className={`w-full md:w-1/3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold/50 transition-colors ${isArabic ? 'font-arabic' : ''}`}
                        required
                    />
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isArabic ? 'شارك برأيك...' : 'Join the conversation...'}
                        rows="4"
                        className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold/50 transition-colors resize-y min-h-[100px] ${isArabic ? 'font-arabic' : ''}`}
                        required
                    ></textarea>
                </div>
                <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-brand-brown-dark text-white px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-brand-gold transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Posting...' : <>{isArabic ? 'إرسال' : 'Post Comment'} <Send className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} /></>}
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
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
                        <p className="text-gray-400 text-sm italic">{isArabic ? 'كن أول من يعلق!' : 'Be the first to share your thoughts.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function AudioPlayPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [audio, setAudio] = useState(null);
    const [relatedAudios, setRelatedAudios] = useState([]);
    const [seriesImage, setSeriesImage] = useState(null);
    const [seriesId, setSeriesId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const audioRef = useRef(null);

    useEffect(() => {
        const fetchAudioData = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'audios', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setAudio({ id: docSnap.id, ...data });
                    updateDoc(docRef, { plays: increment(1) });

                    if (data.series) {
                        const qSeries = query(collection(db, 'audio_series'), where('title', '==', data.series));
                        const seriesSnap = await getDocs(qSeries);
                        if (!seriesSnap.empty) {
                            setSeriesImage(seriesSnap.docs[0].data().cover);
                            setSeriesId(seriesSnap.docs[0].id);
                        }

                        const qRelated = query(
                            collection(db, 'audios'),
                            where('series', '==', data.series),
                            orderBy('date', 'desc'),
                            limit(5)
                        );
                        const relatedSnap = await getDocs(qRelated);
                        const related = relatedSnap.docs
                            .map((d) => ({ id: d.id, ...d.data() }))
                            .filter((audioItem) => audioItem.id !== id);
                        setRelatedAudios(related);
                    } else {
                        const qRelated = query(
                            collection(db, 'audios'),
                            where('category', '==', data.category),
                            orderBy('date', 'desc'),
                            limit(5)
                        );
                        const relatedSnap = await getDocs(qRelated);
                        const related = relatedSnap.docs
                            .map((d) => ({ id: d.id, ...d.data() }))
                            .filter((audioItem) => audioItem.id !== id);
                        setRelatedAudios(related);
                    }
                } else {
                    router.push('/media/audios');
                }
            } catch (error) {
                console.error('Error fetching audio:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAudioData();
    }, [id, router]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) setProgress(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const buildForcedDownloadUrl = (url, filename) => {
  if (!url) return url;

  // Works for Firebase download URLs even if object metadata wasn't set for old uploads
  const disp = `attachment; filename="${filename || 'audio.mp3'}"`;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}response-content-disposition=${encodeURIComponent(disp)}`;
};

const handleDownload = async (e, audioUrl, filename) => {
  e.preventDefault();
  if (!audioUrl || !audio?.id) return;

  try {
    // Track downloads (non-blocking is fine, but awaiting keeps it clean)
    const docRef = doc(db, 'audios', audio.id);
    await updateDoc(docRef, { downloads: increment(1) });
  } catch (err) {
    console.error('Error incrementing downloads:', err);
  }

  const forcedUrl = buildForcedDownloadUrl(audioUrl, filename);
  window.location.href = forcedUrl;
};

    const toggleExpand = (e, audioId) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(audioId)) next.delete(audioId);
            else next.add(audioId);
            return next;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader size="lg" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!audio) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center p-10 text-center">
                    <h1 className="text-2xl font-bold text-gray-400">Audio Not Found</h1>
                    <Link href="/media/audios" className="mt-4 text-brand-gold hover:underline">Browse Audio Library</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const isArabic = audio.category === 'Arabic';
    const dir = getDir(audio.title);
    const coverImage = seriesImage || audio.thumbnail || '/fallback.webp';

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">
                <div className="relative w-full pt-10 pb-32 lg:pt-16 lg:pb-48 overflow-hidden bg-brand-brown-dark">
                    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-soft-light opacity-50">
                        <Image src={coverImage} alt="" fill className="object-cover blur-[80px] scale-120" />
                    </div>
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <Image src={coverImage} alt="" fill className="object-cover opacity-20 mix-blend-overlay scale-115 saturate-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-brand-brown-dark/50 to-transparent"></div>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>

                    <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 relative z-10">
                        <div className="mb-8 flex items-center justify-between">
                            <Link href="/media/audios" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Audios
                            </Link>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/20 backdrop-blur-md">
                                <Headphones className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                                <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Now Playing</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 relative z-20 -mt-24 lg:-mt-36">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white rounded-3xl p-5 md:p-8 border border-gray-100 shadow-sm" dir={dir}>
                                <div className="flex flex-col md:flex-row gap-6 items-center md:items-stretch mb-6">
                                    <div className="relative w-full md:w-[260px] aspect-square rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-gray-50 flex-shrink-0">
                                        <Image src={coverImage} alt={audio.title} fill className={`object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`} />
                                    </div>

                                    <div className="flex-grow w-full text-center md:text-left">
                                        <div className="mb-4">
                                            <span className="inline-flex px-3 py-1 bg-brand-brown-dark text-white text-[10px] font-bold uppercase rounded-full tracking-wider mb-3" dir="ltr">
                                                {audio.category}
                                            </span>
                                            <h1 className={`text-2xl md:text-4xl font-bold text-brand-brown-dark leading-tight mb-2 ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                {audio.title}
                                            </h1>
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center md:justify-start gap-2" dir="ltr">
                                                <User className="w-3.5 h-3.5 text-brand-gold" /> {audio.speaker}
                                            </p>
                                        </div>

                                        <audio
                                            ref={audioRef}
                                            src={audio.audioUrl}
                                            onTimeUpdate={handleTimeUpdate}
                                            onLoadedMetadata={handleLoadedMetadata}
                                            onEnded={() => setIsPlaying(false)}
                                        />

                                        <div className="mb-5" dir="ltr">
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration || 0}
                                                value={progress}
                                                onChange={handleSeek}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-gold"
                                            />
                                            <div className="flex justify-between text-[11px] font-mono text-gray-400 mt-2">
                                                <span>{formatTime(progress)}</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center md:justify-start gap-3" dir="ltr">
                                            <button
                                                onClick={togglePlay}
                                                className="w-14 h-14 bg-brand-brown-dark text-white rounded-full flex items-center justify-center hover:bg-brand-gold transition-all shadow-lg"
                                                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                                            >
                                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                            </button>

                                            <button
                                                onClick={(e) => handleDownload(e, audio.audioUrl, audio.fileName || `${audio.title}.mp3`)}
                                                className="inline-flex items-center gap-2 px-5 py-3 bg-gray-50 text-brand-brown-dark rounded-full border border-gray-200 hover:border-brand-gold/50 transition-all text-xs font-bold uppercase tracking-wider"
                                            >
                                                <Download className="w-4 h-4" /> Download MP3
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-100" dir="ltr">
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-gold" /> {formatDate(audio.date)}</span>
                                        <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-brand-gold" /> {audio.fileSize || audio.duration || '--'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LikeButton audioId={audio.id} initialLikes={audio.likes || 0} />
                                        <SocialShare title={audio.title} />
                                    </div>
                                </div>

                                <div className={`prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed whitespace-pre-line ${dir === 'rtl' ? 'font-arabic text-right' : 'font-lato'}`}>
                                    {audio.series && (seriesId ? (
                                        <Link href={`/media/audios/series/${seriesId}`} className="block w-fit text-xs font-bold text-brand-gold mb-4 uppercase tracking-wide border-l-2 border-brand-gold pl-3 hover:text-brand-brown-dark hover:underline transition-colors" dir="ltr">
                                            Audio Series: {audio.series}
                                        </Link>
                                    ) : (
                                        <p className="text-xs font-bold text-brand-gold mb-4 uppercase tracking-wide border-l-2 border-brand-gold pl-3" dir="ltr">
                                            Audio Series: {audio.series}
                                        </p>
                                    ))}
                                    {audio.description || 'No description provided for this audio track.'}
                                </div>

                                <CommentsSection audioId={audio.id} isArabic={isArabic} />
                            </div>
                        </div>

                        <aside className="lg:col-span-4 space-y-8">
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                                    <ListMusic className="w-5 h-5 text-brand-gold" />
                                    {audio.series ? 'More in Series' : 'Similar Audios'}
                                </h3>

                                <div className="flex flex-col gap-4">
                                    {relatedAudios.length > 0 ? (
                                        relatedAudios.map((item) => {
                                            const isExpanded = expandedIds.has(item.id);
                                            const itemDir = getDir(item.title);
                                            return (
                                                <Link
                                                    key={item.id}
                                                    href={`/media/audios/play/${item.id}`}
                                                    className="group relative flex items-start gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                                                >
                                                    <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 border border-gray-100 shadow-sm">
                                                        <Image
                                                            src={item.thumbnail || seriesImage || '/fallback.webp'}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-7 h-7 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20">
                                                                <Play className="w-3 h-3 fill-current ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow min-w-0 py-0.5" dir={itemDir}>
                                                        <div className="relative pr-6">
                                                            <h4 className={`text-sm font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${itemDir === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                                {item.title}
                                                            </h4>
                                                            <button
                                                                onClick={(e) => toggleExpand(e, item.id)}
                                                                className="absolute right-0 top-0 p-0.5 text-gray-300 hover:text-brand-gold transition-colors"
                                                                aria-label={isExpanded ? 'Collapse title' : 'Expand title'}
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider" dir="ltr">
                                                            {formatDate(item.date)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            No related tracks found.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-brand-brown/10 text-center">
                                    <Link href="/media/audios" className="inline-block text-xs font-bold text-brand-brown-dark uppercase tracking-widest hover:text-brand-gold transition-colors">
                                        Browse Library
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
