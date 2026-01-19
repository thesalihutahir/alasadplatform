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
    Play, Mic, Calendar, Clock, Search, ArrowLeft, 
    Share2, Bell, Check, ListMusic, Download, FileText 
} from 'lucide-react';

export default function ViewSeriesPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    // --- STATE ---
    const [series, setSeries] = useState(null);
    const [audios, setAudios] = useState([]);
    const [filteredAudios, setFilteredAudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // 1. Fetch Series Details
                const docRef = doc(db, "audio_series", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const seriesData = { id: docSnap.id, ...docSnap.data() };
                    setSeries(seriesData);

                    // 2. Fetch Audios for this Series
                    // Note: Audios link to Series via the 'series' field (Title String)
                    const qAudios = query(
                        collection(db, "audios"),
                        where("series", "==", seriesData.title),
                        orderBy("date", "desc")
                    );
                    
                    const audioSnap = await getDocs(qAudios);
                    const fetchedAudios = audioSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setAudios(fetchedAudios);
                    setFilteredAudios(fetchedAudios);
                } else {
                    console.error("Series not found");
                    router.push('/media/audios/series');
                }
            } catch (error) {
                console.error("Error fetching series data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    // --- FILTER LOGIC ---
    useEffect(() => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const results = audios.filter(audio => 
                audio.title.toLowerCase().includes(term) ||
                (audio.description && audio.description.toLowerCase().includes(term))
            );
            setFilteredAudios(results);
        } else {
            setFilteredAudios(audios);
        }
    }, [searchTerm, audios]);

    // --- HELPER: Format Date ---
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // --- HELPER: Auto-Detect Arabic ---
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    if (loading) return <Loader size="lg" className="h-screen bg-brand-sand" />;
    if (!series) return null;

    const isArabic = series.category === 'Arabic';

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-20">
                
                {/* 1. IMMERSIVE HEADER SECTION */}
                <div className="relative w-full bg-brand-brown-dark overflow-hidden">
                    {/* Blurred Backdrop */}
                    <div className="absolute inset-0">
                        <Image 
                            src={series.cover || "/fallback.webp"} 
                            alt="Backdrop" 
                            fill 
                            className="object-cover opacity-20 blur-3xl scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-brand-brown-dark/80 to-brand-brown-dark"></div>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
                        {/* Back Link */}
                        <Link href="/media/audios/series" className="inline-flex items-center text-white/60 hover:text-brand-gold mb-8 text-xs font-bold uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Series
                        </Link>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start text-center md:text-left">
                            
                            {/* Cover Art */}
                            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-gray-800">
                                <Image 
                                    src={series.cover || "/fallback.webp"} 
                                    alt={series.title} 
                                    fill 
                                    className="object-cover" 
                                />
                            </div>

                            {/* Details */}
                            <div className="flex-grow flex flex-col justify-center h-full pt-2 text-white" dir={isArabic ? 'rtl' : 'ltr'}>
                                <div className={`flex items-center gap-3 mb-4 justify-center ${isArabic ? 'md:justify-end' : 'md:justify-start'}`} dir="ltr">
                                    <span className="px-3 py-1 bg-brand-gold text-white rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                        {series.category} Series
                                    </span>
                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <ListMusic className="w-3 h-3" /> {audios.length} Tracks
                                    </span>
                                </div>

                                <h1 className={`text-3xl md:text-5xl font-bold mb-4 leading-tight ${isArabic ? 'font-tajawal' : 'font-agency'}`}>
                                    {series.title}
                                </h1>

                                <div className={`flex items-center gap-2 text-white/70 font-bold uppercase tracking-wide text-xs md:text-sm mb-6 justify-center ${isArabic ? 'md:justify-end' : 'md:justify-start'}`} dir="ltr">
                                    <Mic className="w-4 h-4 text-brand-gold" />
                                    <span>Speaker: {series.host || "Al-Asad Scholar"}</span>
                                </div>

                                <p className={`text-white/80 text-sm md:text-lg leading-relaxed max-w-2xl mb-8 ${isArabic ? 'font-arabic' : 'font-lato'}`}>
                                    {series.description}
                                </p>

                                {/* Action Buttons */}
                                <div className={`flex items-center gap-4 justify-center ${isArabic ? 'md:justify-end' : 'md:justify-start'}`}>
                                    <button 
                                        onClick={() => setIsSubscribed(!isSubscribed)}
                                        className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                                            isSubscribed 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-white text-brand-brown-dark hover:bg-brand-gold hover:text-white'
                                        }`}
                                    >
                                        {isSubscribed ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                        {isSubscribed ? 'Following' : 'Follow Series'}
                                    </button>
                                    <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TRACK LIST SECTION */}
                <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-10 min-h-[400px]">
                        
                        {/* Header & Search */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
                            <h2 className="font-agency text-3xl text-brand-brown-dark">
                                Tracks List
                            </h2>
                            <div className="relative w-full md:w-72">
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={isArabic ? "بحث في السلسلة..." : "Search tracks..."}
                                    className={`w-full pl-10 pr-4 py-3 bg-brand-sand/30 border border-transparent focus:bg-white focus:border-brand-gold rounded-xl text-sm focus:outline-none transition-all ${isArabic ? 'text-right font-arabic' : ''}`}
                                    dir={isArabic ? 'rtl' : 'ltr'}
                                />
                                <Search className={`absolute w-4 h-4 text-gray-400 top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'}`} />
                            </div>
                        </div>

                        {/* List */}
                        {filteredAudios.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAudios.map((audio, index) => (
                                    <div 
                                        key={audio.id} 
                                        className="group flex flex-col md:flex-row gap-5 p-4 rounded-2xl hover:bg-brand-sand/30 border border-transparent hover:border-brand-gold/20 transition-all items-center"
                                    >
                                        {/* Numbering */}
                                        <div className="hidden md:flex w-8 h-8 flex-shrink-0 items-center justify-center text-brand-gold font-agency text-xl">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>

                                        {/* Play Button */}
                                        <Link 
                                            href={`/media/audios/play/${audio.id}`}
                                            className="w-12 h-12 flex-shrink-0 rounded-full bg-brand-sand text-brand-brown-dark flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors shadow-sm"
                                        >
                                            <Play className="w-5 h-5 fill-current ml-0.5" />
                                        </Link>

                                        {/* Info */}
                                        <div className="flex-grow min-w-0 w-full text-center md:text-left" dir={getDir(audio.title)}>
                                            <Link href={`/media/audios/play/${audio.id}`}>
                                                <h3 className={`text-lg font-bold text-brand-brown-dark leading-tight mb-1 group-hover:text-brand-gold transition-colors ${getDir(audio.title) === 'rtl' ? 'font-tajawal' : 'font-agency'}`}>
                                                    {audio.title}
                                                </h3>
                                            </Link>
                                            
                                            <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider" dir="ltr">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(audio.date)}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {audio.fileSize}</span>
                                            </div>
                                        </div>

                                        {/* Download Action */}
                                        <a 
                                            href={audio.audioUrl} 
                                            download 
                                            target="_blank"
                                            className="p-3 text-gray-300 hover:text-brand-brown-dark hover:bg-white rounded-full transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <ListMusic className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-bold">No audio tracks found.</p>
                                <p className="text-xs">Try searching for something else.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
