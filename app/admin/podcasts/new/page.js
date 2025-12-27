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
    Mic, 
    CheckCircle, 
    Loader2 
} from 'lucide-react';

export default function AddPodcastPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingShows, setIsLoadingShows] = useState(true);

    // Dynamic Shows State
    const [availableShows, setAvailableShows] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        url: '', // YouTube URL
        show: '',
        episodeNumber: '',
        season: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [videoId, setVideoId] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [isValid, setIsValid] = useState(false);

    // 1. Fetch Shows on Mount
    useEffect(() => {
        const fetchShows = async () => {
            try {
                const q = query(collection(db, "podcast_shows"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const shows = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailableShows(shows);
            } catch (error) {
                console.error("Error fetching shows:", error);
            } finally {
                setIsLoadingShows(false);
            }
        };

        fetchShows();
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
        if (!formData.title || !formData.show) {
            alert("Please fill in the title and select a show.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare Data
            const podcastData = {
                ...formData,
                videoId: videoId,
                thumbnail: thumbnail,
                createdAt: serverTimestamp(),
                plays: 0
            };

            // Save to Firestore
            await addDoc(collection(db, "podcasts"), podcastData);

            alert("Episode published successfully!");
            router.push('/admin/podcasts');

        } catch (error) {
            console.error("Error saving podcast:", error);
            alert("Failed to save podcast. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/podcasts" className="p-2 hover:bg-gray-200 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Upload Episode</h1>
                        <p className="font-lato text-sm text-gray-500">Add a new episode (YouTube Audio) to a show.</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href="/admin/podcasts" className="flex-1 md:flex-none">
                        <button type="button" className="w-full px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 text-center justify-center">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={!isValid || isSubmitting} 
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-md text-white transition-colors ${
                            isValid 
                            ? 'bg-brand-gold hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: YouTube Input & Preview */}
                <div className="space-y-6">

                    {/* URL Input */}
                    <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${isValid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            YouTube Link (Audio Source)
                        </label>
                        <div className="relative">
                            <Youtube className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isValid ? 'text-red-600' : 'text-gray-400'}`} />
                            <input 
                                type="text" 
                                name="url"
                                value={formData.url}
                                onChange={handleUrlChange}
                                placeholder="Paste YouTube URL here..." 
                                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                            />
                            {isValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
                        </div>
                        <p className={`text-xs mt-2 font-bold ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
                            {isValid ? "✓ Source linked successfully" : "Waiting for valid link..."}
                        </p>
                    </div>

                    {/* Thumbnail Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <Mic className="w-5 h-5 text-brand-gold" />
                            Episode Preview
                        </h3>
                        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                            {thumbnail ? (
                                <Image 
                                    src={thumbnail} 
                                    alt="Preview" 
                                    fill 
                                    className="object-cover" 
                                />
                            ) : (
                                <div className="text-gray-400 text-sm flex flex-col items-center">
                                    <Youtube className="w-10 h-10 mb-2 opacity-50" />
                                    No video linked yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Metadata */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Episode Details</h3>

                    {/* Show Selector */}
                    <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                            <Mic className="w-4 h-4" /> Select Show
                        </label>
                        <select 
                            name="show" 
                            value={formData.show} 
                            onChange={handleChange} 
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                        >
                            <option value="">Select a Podcast Show...</option>
                            {isLoadingShows ? (
                                <option disabled>Loading shows...</option>
                            ) : (
                                availableShows.map(show => (
                                    <option key={show.id} value={show.title}>{show.title}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-brand-brown mb-1">Episode Title</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Episode No.</label>
                            <input 
                                type="number" 
                                name="episodeNumber" 
                                value={formData.episodeNumber} 
                                onChange={handleChange} 
                                placeholder="e.g. 05" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Season</label>
                            <input 
                                type="number" 
                                name="season" 
                                value={formData.season} 
                                onChange={handleChange} 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-brand-brown mb-1">Publish Date</label>
                        <input 
                            type="date" 
                            name="date" 
                            value={formData.date} 
                            onChange={handleChange} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-brand-brown mb-1">Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows="3" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        ></textarea>
                    </div>
                </div>
            </div>
        </form>
    );
}