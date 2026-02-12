"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import {
    Play,
    Mic,
    Calendar,
    Search,
    ArrowLeft,
    Share2,
    Bell,
    Check,
    ListMusic,
    Download,
    FileText,
    ArrowUpDown,
    X,
    ChevronDown,
    ChevronUp,
    ArrowUpRight
} from 'lucide-react';

export default function ViewSeriesPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [series, setSeries] = useState(null);
    const [audios, setAudios] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortAnimating, setSortAnimating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expandedIds, setExpandedIds] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'audio_series', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const seriesData = { id: docSnap.id, ...docSnap.data() };
                    setSeries(seriesData);

                    const qAudios = query(
                        collection(db, 'audios'),
                        where('series', '==', seriesData.title),
                        orderBy('date', 'desc')
                    );

                    const audioSnap = await getDocs(qAudios);
                    const fetchedAudios = audioSnap.docs.map((audioDoc) => ({
                        id: audioDoc.id,
                        ...audioDoc.data()
                    }));

                    setAudios(fetchedAudios);
                } else {
                    console.error('Series not found');
                    router.push('/media/audios/series');
                }
            } catch (error) {
                console.error('Error fetching series data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

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

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
        setSortAnimating(true);
        setTimeout(() => setSortAnimating(false), 180);
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

    const handleShare = async () => {
        try {
            if (typeof window === 'undefined') return;
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({ title: series?.title || 'Audio Series', url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error('Share failed:', error);
        }
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

    if (!series) return null;

    const isArabic = series.category === 'Arabic';
    const dir = getDir(series.title);

    const filteredAudios = audios.filter((audio) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const title = (audio.title || '').toLowerCase();
        const description = (audio.description || '').toLowerCase();
        return title.includes(term) || description.includes(term);
    });

    const sortedAudios = [...filteredAudios].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const oldestAudioSorted = [...audios].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    const oldestAudioId = oldestAudioSorted.length > 0 ? oldestAudioSorted[0].id : null;

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-lato">
            <Header />

            <main className="flex-grow pb-24">
                <div className="relative w-full pt-10 pb-32 lg:pt-16 lg:pb-48 overflow-hidden bg-brand-brown-dark">
                    <div className="absolute inset-0 z-0 pointer-events-none mix-blend-soft-light opacity-50">
                        <Image
                            src={series.cover || '/fallback.webp'}
                            alt=""
                            fill
                            className="object-cover blur-[80px] scale-120"
                        />
                    </div>
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <Image
                            src={series.cover || '/fallback.webp'}
                            alt=""
                            fill
                            className="object-cover opacity-20 mix-blend-overlay scale-115 saturate-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-brand-brown-dark/50 to-transparent"></div>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>

                    <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 relative z-10">
                        <div className="mb-8">
                            <Link href="/media/audios/series" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Series
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 relative z-20 -mt-24 lg:-mt-36 mb-12">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-10 lg:p-12 relative" dir={dir}>
                        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none z-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sand/30 rounded-full blur-[80px]"></div>
                        </div>

                        <div className="flex flex-col gap-8 lg:gap-10 items-center relative z-10">
                            <div className="w-full sm:w-[400px] lg:w-[600px] flex-shrink-0 -mt-20 lg:-mt-32">
                                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white border border-gray-100 bg-gray-50">
                                    <Image
                                        src={series.cover || '/fallback.webp'}
                                        alt={series.title}
                                        fill
                                        className="object-cover object-center"
                                        priority
                                    />
                                </div>
                            </div>

                            <div className="flex-grow flex flex-col items-center text-center pt-2 w-full max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <ListMusic className="w-3 h-3" /> Audio Series
                                </div>

                                <h1 className={`text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-brand-brown-dark mb-4 leading-tight ${dir === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                    {series.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-[10px] font-bold uppercase tracking-wider" dir="ltr">
                                    <span className="bg-brand-brown-dark text-white px-3 py-1 rounded-md">
                                        {series.category} Series
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                                        <ListMusic className="w-3 h-3" /> {audios.length} Tracks
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                                        <Mic className="w-3 h-3" /> {series.host || 'Al-Asad Scholar'}
                                    </span>
                                </div>

                                <p className={`text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed mb-8 w-full lg:text-center ${getDir(series.description || '') === 'rtl' ? 'font-arabic text-right' : 'font-lato text-left'}`} dir={getDir(series.description || '')}>
                                    {series.description || 'Browse all audio tracks in this series below. Use search and sort to quickly find what you need.'}
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full" dir="ltr">
                                    {oldestAudioId && (
                                        <Link
                                            href={`/media/audios/play/${oldestAudioId}`}
                                            className="inline-flex items-center justify-center gap-3 bg-brand-gold text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group w-full sm:w-auto"
                                        >
                                            <Play className="w-4 h-4 fill-current" /> Start Listening
                                            <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => setIsSubscribed((prev) => !prev)}
                                        className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm w-full sm:w-auto ${
                                            isSubscribed
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-white border border-gray-200 text-brand-brown-dark hover:border-brand-gold/50'
                                        }`}
                                    >
                                        {isSubscribed ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                        {isSubscribed ? 'Following' : 'Follow Series'}
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm w-full sm:w-auto bg-white border border-gray-200 text-brand-brown-dark hover:border-brand-gold/50"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                                        {copied ? 'Copied' : 'Share'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1400px] lg:max-w-[1000px] xl:max-w-[1100px] mx-auto px-4 md:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-4 border-b border-gray-100">
                        <div>
                            <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark flex items-center gap-3">
                                <ListMusic className="w-6 h-6 text-brand-gold" /> Tracks
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Use search, sort, and expand titles as needed.</p>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-72">
                                <Search className={`absolute w-4 h-4 text-gray-400 top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'}`} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={isArabic ? 'بحث في السلسلة...' : 'Search tracks...'}
                                    className={`w-full ${isArabic ? 'pr-10 pl-10 text-right font-arabic' : 'pl-10 pr-10'} py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-all shadow-sm`}
                                    dir={isArabic ? 'rtl' : 'ltr'}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors ${isArabic ? 'left-3' : 'right-3'}`}
                                        aria-label="Clear search"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={toggleSortOrder}
                                className={`flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 sm:px-4 py-2.5 rounded-xl border shadow-sm transition-all min-w-[44px] ${sortAnimating ? 'scale-110' : 'scale-100'} ${
                                    sortOrder === 'desc'
                                        ? 'bg-brand-brown-dark text-white border-brand-brown-dark'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-brand-brown-dark hover:text-brand-brown-dark'
                                }`}
                                dir="ltr"
                                aria-label={sortOrder === 'desc' ? 'Sort oldest first' : 'Sort newest first'}
                                title={sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                            </button>
                        </div>
                    </div>
                    {sortedAudios.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
                            {sortedAudios.map((audio) => {
                                const isExpanded = expandedIds.has(audio.id);
                                const audioDir = getDir(audio.title);
                                return (
                                    <Link
                                        key={audio.id}
                                        href={`/media/audios/play/${audio.id}`}
                                        className="group relative flex items-start gap-4 p-3 rounded-xl border border-gray-100 hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 bg-white"
                                    >
                                        <div className="relative w-32 md:w-40 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 border border-gray-50">
                                            <Image
                                                src={audio.thumbnail || series.cover || '/fallback.webp'}
                                                alt={audio.title}
                                                fill
                                                className="object-cover opacity-90 group-hover:opacity-100 scale-110 group-hover:scale-125 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-8 h-8 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
                                                    <Play className="w-3 h-3 fill-current ml-0.5" />
                                                </div>
                                            </div>
                                            {(audio.duration || audio.fileSize) && (
                                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 rounded">
                                                    {audio.duration || audio.fileSize}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow min-w-0 py-0.5" dir={audioDir}>
                                            <div className="flex flex-wrap items-center gap-2 mb-1" dir="ltr">
                                                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {formatDate(audio.date)}
                                                </span>
                                                {audio.fileSize && (
                                                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> {audio.fileSize}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="relative pr-6">
                                                <h4 className={`text-sm md:text-base lg:text-lg font-bold text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors ${isExpanded ? '' : 'line-clamp-2'} ${audioDir === 'rtl' ? 'font-tajawal' : 'font-lato'}`}>
                                                    {audio.title}
                                                </h4>

                                                <button
                                                    onClick={(e) => toggleExpand(e, audio.id)}
                                                    className="absolute right-0 top-0 p-1 text-gray-300 hover:text-brand-gold transition-colors"
                                                    aria-label={isExpanded ? 'Collapse title' : 'Expand title'}
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (!audio.audioUrl) return;
                                                const proxyUrl = `/api/download?url=${encodeURIComponent(audio.audioUrl)}&name=${encodeURIComponent(`${audio.title || 'audio'}.mp3`)}`;
                                                window.location.assign(proxyUrl);
                                            }}
                                            className="self-center p-2.5 rounded-full border border-gray-100 text-gray-400 hover:text-brand-brown-dark hover:border-brand-gold/40 transition-colors"
                                            title="Download"
                                            aria-label="Download audio"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-300">
                                <ListMusic className="w-8 h-8" />
                            </div>
                            <h3 className="font-agency text-xl text-gray-500 mb-1">No Tracks Found</h3>
                            <p className="text-sm text-gray-400">Try clearing search terms, or check back later.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
