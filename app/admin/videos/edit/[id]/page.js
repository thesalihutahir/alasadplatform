"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
// Context & Components
import { useModal } from '@/context/ModalContext'; 
import CustomSelect from '@/components/CustomSelect'; 
import CustomDatePicker from '@/components/CustomDatePicker'; 

import { 
    ArrowLeft, 
    Save, 
    Youtube, 
    PlayCircle, 
    CheckCircle, 
    ListVideo, 
    Loader2,
    Play, 
    Clock,
    Globe,
    Calendar as CalendarIcon
} from 'lucide-react';

export default function EditVideoPage() {
    const router = useRouter();
    const params = useParams();
    const videoIdParam = params?.id; 
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Dynamic Playlists State
    const [allPlaylists, setAllPlaylists] = useState([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        category: 'English', 
        playlist: '', 
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [youtubeId, setYoutubeId] = useState(null); 
    const [thumbnail, setThumbnail] = useState(null);
    const [isValid, setIsValid] = useState(false);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);

    // Constants
    const CATEGORY_OPTIONS = [
        { value: 'English', label: 'English' },
        { value: 'Hausa', label: 'Hausa' },
        { value: 'Arabic', label: 'Arabic' }
    ];

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // Helper: Extract YouTube ID
    const extractVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // 1. Fetch Video Data & Playlists
    useEffect(() => {
        const fetchAllData = async () => {
            if (!videoIdParam) return;
            setIsLoadingData(true);

            try {
                // A. Fetch Playlists
                const qPlaylists = query(collection(db, "video_playlists"), orderBy("createdAt", "desc"));
                const plSnapshot = await getDocs(qPlaylists);
                const fetchedPlaylists = plSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllPlaylists(fetchedPlaylists);

                // B. Fetch Video Details
                const videoRef = doc(db, "videos", videoIdParam);
                const videoSnap = await getDoc(videoRef);

                if (videoSnap.exists()) {
                    const data = videoSnap.data();
                    setFormData({
                        title: data.title || '',
                        url: data.url || '',
                        category: data.category || 'English',
                        playlist: data.playlist || '',
                        date: data.date || new Date().toISOString().split('T')[0],
                        description: data.description || ''
                    });

                    // Set derived state
                    if (data.videoId) {
                        setYoutubeId(data.videoId);
                        setThumbnail(data.thumbnail);
                        setIsValid(true);
                    }
                } else {
                    alert("Video not found!");
                    router.push('/admin/videos');
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchAllData();
    }, [videoIdParam, router]);

    // 2. Filter Playlists when Category Changes
    useEffect(() => {
        if (allPlaylists.length > 0) {
            const filtered = allPlaylists.filter(p => p.category === formData.category);
            setFilteredPlaylists(filtered);
        }
    }, [formData.category, allPlaylists]);

    // Handle URL Change
    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, url }));
        setIsPlayingPreview(false);

        const id = extractVideoId(url);
        if (id) {
            setYoutubeId(id);
            setThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
            setIsValid(true);
        } else {
            setYoutubeId(null);
            setThumbnail(null);
            setIsValid(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for Custom Selects
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'category') {
            setFormData(prev => ({ ...prev, playlist: '' })); // Reset playlist on language switch
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Added Title Check
        if (!isValid || !youtubeId || !formData.title.trim()) {
            alert("Please ensure the title is filled and the YouTube URL is valid.");
            return;
        }

        setIsSubmitting(true);

        try {
            const videoData = {
                ...formData,
                videoId: youtubeId,
                thumbnail: thumbnail, 
                updatedAt: new Date().toISOString()
            };

            const videoRef = doc(db, "videos", videoIdParam);
            await updateDoc(videoRef, videoData);

            showSuccess({
                title: "Video Updated!",
                message: "Your changes have been saved successfully.",
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/videos')
            });

        } catch (error) {
            console.error("Error updating video:", error);
            alert("Failed to update video.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format Date Helper
    const formatDate = (dateString) => {
        if (!dateString) return 'Date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Generate Playlist Options
    const playlistOptions = filteredPlaylists.map(pl => ({
        value: pl.title,
        label: pl.title
    }));

    if (isLoadingData) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></div>;
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/videos" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Video</h1>
                        <p className="font-lato text-sm text-gray-500">Update video details and settings.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/videos">
                        <button type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={!isValid || isSubmitting || !formData.title.trim()}
                        className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-colors shadow-md ${
                            isValid && formData.title.trim()
                            ? 'bg-brand-gold text-white hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2. LEFT COLUMN: INPUTS */}
                <div className="lg:col-span-2 space-y-6">

                    {/* YouTube URL Input */}
                    <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${isValid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            YouTube Link <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Youtube className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isValid ? 'text-red-600' : 'text-gray-400'}`} />
                            <input 
                                type="text" 
                                name="url"
                                value={formData.url}
                                onChange={handleUrlChange}
                                placeholder="Paste YouTube URL here" 
                                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                            />
                            {isValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
                        </div>
                    </div>

                    {/* Details Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Video Details</h3>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-2">
                                Video Title <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter video title" 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                dir={getDir(formData.title)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-2">Short Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Briefly describe what this video is about..." 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                dir={getDir(formData.description)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT COLUMN: META & PREVIEW */}
                <div className="space-y-6">
                    
                    {/* Meta Controls */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Classification</h3>
                        
                        <CustomSelect 
                            label="Category (Language)"
                            options={CATEGORY_OPTIONS}
                            value={formData.category}
                            onChange={(val) => handleSelectChange('category', val)}
                            icon={Globe}
                            placeholder="Select Language"
                        />

                        <CustomDatePicker 
                            label="Date Recorded"
                            value={formData.date}
                            onChange={(val) => handleSelectChange('date', val)}
                            icon={CalendarIcon}
                        />

                        <div className="pt-2 border-t border-gray-100">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Playlist (Optional)</label>
                            
                            <CustomSelect 
                                options={playlistOptions}
                                value={formData.playlist}
                                onChange={(val) => handleSelectChange('playlist', val)}
                                icon={ListVideo}
                                placeholder={playlistOptions.length > 0 ? "Select Playlist" : "No playlists found"}
                            />
                            
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                Showing playlists for: <span className="font-bold text-brand-gold">{formData.category}</span>
                            </p>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-brand-gold" />
                            Live Preview
                        </h3>

                        <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800 transform transition-all hover:scale-[1.02]">
                            <div className="relative w-full aspect-video group">
                                {isValid && youtubeId ? (
                                    isPlayingPreview ? (
                                        <iframe 
                                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} 
                                            title="Preview"
                                            className="absolute inset-0 w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <div 
                                            className="relative w-full h-full cursor-pointer"
                                            onClick={() => setIsPlayingPreview(true)}
                                        >
                                            <Image 
                                                src={thumbnail} 
                                                alt="Preview" 
                                                fill 
                                                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-300">
                                                    <Play className="w-6 h-6 text-white fill-current ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Watch
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <Youtube className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="text-xs">Preview will appear here</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Area - RTL ENABLED */}
                        <div className="p-5" dir={getDir(formData.title)}>
                            <div className="flex justify-between items-start mb-2" dir="ltr">
                                <div className="flex gap-2">
                                    <span className="text-[10px] font-bold text-brand-brown-dark bg-brand-sand px-2 py-1 rounded uppercase tracking-wider">
                                        {formData.category}
                                    </span>
                                    {formData.playlist && (
                                        <span className="text-[10px] font-bold text-brand-gold border border-brand-gold/30 px-2 py-1 rounded uppercase tracking-wider">
                                            Series
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 font-lato">
                                    {formatDate(formData.date)}
                                </span>
                            </div>

                            <h3 className={`font-agency text-xl text-brand-brown-dark mb-2 leading-tight ${getDir(formData.title) === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                {formData.title || "Video Title Placeholder"}
                            </h3>

                            {formData.playlist && (
                                <p className="text-xs text-brand-gold font-bold uppercase tracking-wide mb-2" dir="ltr">
                                    Part of: {formData.playlist}
                                </p>
                            )}

                            <p className={`text-sm text-brand-brown line-clamp-2 opacity-80 ${getDir(formData.description) === 'rtl' ? 'font-arabic' : 'font-lato'}`}>
                                {formData.description || "The description you enter will appear here, giving users a quick summary of the lecture content."}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
}
