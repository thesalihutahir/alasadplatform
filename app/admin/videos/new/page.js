"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';

import { 
    ArrowLeft, 
    Save, 
    Youtube, 
    PlayCircle, 
    CheckCircle, 
    AlertCircle, 
    ListVideo,
    Loader2
} from 'lucide-react';

export default function AddVideoPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);

    // Dynamic Playlists State
    const [availablePlaylists, setAvailablePlaylists] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        category: 'Lecture',
        playlist: '', 
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [videoId, setVideoId] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [isValid, setIsValid] = useState(false);

    // 1. Fetch Playlists on Mount
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const q = query(collection(db, "video_playlists"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const playlists = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailablePlaylists(playlists);
            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setIsLoadingPlaylists(false);
            }
        };

        fetchPlaylists();
    }, []);

    // Helper: Extract YouTube ID
    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Handle URL Change
    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, url }));

        const id = extractVideoId(url);
        if (id) {
            setVideoId(id);
            setThumbnail(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
            setIsValid(true);
            
            // Optional: Auto-fill title if empty (requires YouTube API key, skipping for now to keep it simple/free)
        } else {
            setVideoId(null);
            setThumbnail(null);
            setIsValid(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isValid || !videoId) {
            alert("Please enter a valid YouTube URL first.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare Data
            const videoData = {
                ...formData,
                videoId: videoId, // Important for embedding
                thumbnail: thumbnail,
                createdAt: serverTimestamp(),
                views: 0
            };

            // Save to Firestore
            await addDoc(collection(db, "videos"), videoData);

            alert("Video published successfully!");
            router.push('/admin/videos');

        } catch (error) {
            console.error("Error saving video:", error);
            alert("Failed to save video. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/videos" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Add New Video</h1>
                        <p className="font-lato text-sm text-gray-500">Link a YouTube video to your library.</p>
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
                        disabled={!isValid || isSubmitting}
                        className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-colors shadow-md ${
                            isValid 
                            ? 'bg-brand-gold text-white hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Publishing...' : 'Publish Video'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 2. LEFT COLUMN: INPUT FIELDS */}
                <div className="space-y-6">

                    {/* YouTube URL Input */}
                    <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${isValid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            YouTube Link
                        </label>
                        <div className="relative">
                            <Youtube className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isValid ? 'text-red-600' : 'text-gray-400'}`} />
                            <input 
                                type="text" 
                                name="url"
                                value={formData.url}
                                onChange={handleUrlChange}
                                placeholder="Paste YouTube URL here (e.g. https://youtu.be/...)" 
                                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                            />
                            {isValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
                        </div>
                        <p className={`text-xs mt-2 font-bold ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
                            {isValid ? "✓ Video found & linked successfully" : "Waiting for valid link..."}
                        </p>
                    </div>

                    {/* Video Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Video Details</h3>

                        {/* Playlist Selection */}
                        <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                            <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                                <ListVideo className="w-4 h-4" /> Add to Series / Playlist
                            </label>
                            <select 
                                name="playlist"
                                value={formData.playlist}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                            >
                                <option value="">Select a Playlist (Optional)</option>
                                {isLoadingPlaylists ? (
                                    <option disabled>Loading playlists...</option>
                                ) : (
                                    availablePlaylists.map(pl => (
                                        <option key={pl.id} value={pl.title}>{pl.title}</option>
                                    ))
                                )}
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Selecting a playlist will group this video with others in the series.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Video Title</label>
                            <input 
                                type="text" 
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter video title" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Category</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                >
                                    <option>Lecture</option>
                                    <option>Friday Sermon (Khutbah)</option>
                                    <option>Tafsir</option>
                                    <option>Event Highlight</option>
                                    <option>Documentary</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Date Recorded</label>
                                <input 
                                    type="date" 
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Short Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Briefly describe what this video is about..." 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            ></textarea>
                        </div>
                    </div>

                </div>

                {/* 3. RIGHT COLUMN: LIVE PREVIEW */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-brand-gold" />
                            Live Preview
                        </h3>

                        {/* Preview Card */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 transform transition-all hover:scale-[1.02]">

                            {/* Thumbnail Area */}
                            <div className="relative w-full aspect-video bg-black group">
                                {thumbnail ? (
                                    <>
                                        <Image 
                                            src={thumbnail} 
                                            alt="Preview" 
                                            fill 
                                            className="object-cover opacity-90"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <Youtube className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="text-xs">Preview will appear here</span>
                                    </div>
                                )}
                            </div>

                            {/* Info Area */}
                            <div className="p-5">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="inline-block px-2 py-1 bg-brand-gold text-white text-[10px] font-bold uppercase rounded shadow-sm">
                                        {formData.category}
                                    </span>
                                    {formData.playlist && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-sand text-brand-brown-dark text-[10px] font-bold uppercase rounded border border-brand-gold/20">
                                            <ListVideo className="w-3 h-3" /> Series
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-tight">
                                    {formData.title || "Video Title Placeholder"}
                                </h3>
                                {formData.playlist && (
                                    <p className="text-xs text-brand-gold font-bold uppercase tracking-wide mb-2">
                                        Part of: {formData.playlist}
                                    </p>
                                )}
                                <p className="font-lato text-sm text-brand-brown line-clamp-2 opacity-80">
                                    {formData.description || "The description you enter will appear here, giving users a quick summary of the lecture content."}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </form>
    );
}
