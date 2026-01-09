"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal Context
import { useModal } from '@/context/ModalContext';

import { 
    ArrowLeft, 
    Save, 
    Youtube, 
    Mic, 
    CheckCircle, 
    Loader2,
    AlertTriangle,
    FileAudio,
    X,
    Play,
    ListMusic // Icon for Category/Show
} from 'lucide-react';

export default function AddPodcastPage() {
    const router = useRouter();
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingShows, setIsLoadingShows] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Dynamic Shows State
    const [allShows, setAllShows] = useState([]);
    const [filteredShows, setFilteredShows] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        url: '', // YouTube URL
        show: '',
        category: 'English', // NEW: Language Category
        episodeNumber: '',
        season: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [videoId, setVideoId] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [isValid, setIsValid] = useState(false);

    // Audio File State (For Download Feature)
    const [audioFile, setAudioFile] = useState(null);

    // Duplicate Check State
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

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
                setAllShows(shows);
                // Initial filter
                setFilteredShows(shows.filter(s => s.category === 'English'));
            } catch (error) {
                console.error("Error fetching shows:", error);
            } finally {
                setIsLoadingShows(false);
            }
        };

        fetchShows();
    }, []);

    // 2. Filter Shows when Category Changes
    useEffect(() => {
        if (allShows.length > 0) {
            const filtered = allShows.filter(s => s.category === formData.category);
            setFilteredShows(filtered);
            // Reset selected show if it doesn't match the new category
            setFormData(prev => ({ ...prev, show: '' }));
        }
    }, [formData.category, allShows]);

    // Helper: Extract YouTube ID
    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Smart Duplicate Check
    const checkDuplicate = async (id) => {
        setIsCheckingDuplicate(true);
        setDuplicateWarning(null);
        try {
            const q = query(collection(db, "podcasts"), where("videoId", "==", id));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setDuplicateWarning(`Duplicate Found: This episode already exists in your library.`);
            }
        } catch (error) {
            console.error("Error checking duplicate:", error);
        } finally {
            setIsCheckingDuplicate(false);
        }
    };

    // Handle URL Change
    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, url }));
        setDuplicateWarning(null);

        const id = extractVideoId(url);
        if (id) {
            setVideoId(id);
            // Use hqdefault.jpg for safety (no black screens)
            setThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
            setIsValid(true);
            checkDuplicate(id);
        } else {
            setVideoId(null);
            setThumbnail(null);
            setIsValid(false);
        }
    };

    // Handle Audio File
    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                alert("File is too large. Max 50MB.");
                return;
            }
            setAudioFile(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid || !videoId || duplicateWarning) {
            return;
        }
        if (!formData.title) {
            alert("Please fill in the episode title.");
            return;
        }

        setIsSubmitting(true);

        try {
            let audioDownloadUrl = null;

            // 1. Upload Audio File (if selected)
            if (audioFile) {
                const storageRef = ref(storage, `podcast_audios/${Date.now()}_${audioFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, audioFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            audioDownloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            // 2. Prepare Data
            const podcastData = {
                ...formData,
                videoId: videoId,
                thumbnail: thumbnail,
                audioUrl: audioDownloadUrl, // For the download button
                createdAt: serverTimestamp(),
                plays: 0
            };

            // 3. Save to Firestore
            await addDoc(collection(db, "podcasts"), podcastData);

            showSuccess({
                title: "Episode Published!",
                message: "Your new episode has been successfully added.",
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/podcasts')
            });

        } catch (error) {
            console.error("Error saving podcast:", error);
            alert("Failed to save podcast.");
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/podcasts" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Upload Episode</h1>
                        <p className="font-lato text-sm text-gray-500">Add a new episode (YouTube Audio) to a show.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/podcasts">
                        <button type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={!isValid || isSubmitting || !!duplicateWarning}
                        className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-colors shadow-md ${
                            isValid && !duplicateWarning
                            ? 'bg-brand-gold text-white hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: YouTube Input, Duplicate Check & Audio File */}
                <div className="space-y-6">

                    {/* YouTube Input */}
                    <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${
                        duplicateWarning ? 'bg-orange-50 border-orange-200' :
                        isValid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
                    }`}>
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
                        
                        <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs font-bold ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
                                {isCheckingDuplicate ? "Checking library..." : isValid ? "✓ Source linked successfully" : "Waiting for valid link..."}
                            </p>
                        </div>

                        {/* Duplicate Warning */}
                        {duplicateWarning && (
                            <div className="mt-3 flex items-start gap-2 text-xs font-bold text-orange-700 bg-orange-100 p-2 rounded-lg border border-orange-200 animate-in fade-in slide-in-from-top-1">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>{duplicateWarning}</span>
                            </div>
                        )}
                    </div>

                    {/* Audio File Upload (For Download Button) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-3">
                            <FileAudio className="w-4 h-4" /> Upload MP3 (For Download)
                        </label>
                        
                        <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors ${
                            audioFile ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:border-brand-gold'
                        }`}>
                            {audioFile ? (
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <FileAudio className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-700 line-clamp-1">{audioFile.name}</p>
                                            <p className="text-[10px] text-gray-400">{(audioFile.size / (1024*1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setAudioFile(null)} className="text-gray-400 hover:text-red-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-full py-4">
                                    <FileAudio className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 font-bold">Upload MP3 for Download</p>
                                    <input 
                                        type="file" 
                                        accept=".mp3, .wav"
                                        onChange={handleAudioChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                        {isSubmitting && audioFile && (
                            <div className="mt-3">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                                    <span>Uploading Audio...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                        className="bg-brand-gold h-1.5 rounded-full transition-all duration-300" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <Mic className="w-5 h-5 text-brand-gold" />
                            Episode Preview
                        </h3>
                        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                            {thumbnail ? (
                                <>
                                    <Image 
                                        src={thumbnail} 
                                        alt="Preview" 
                                        fill 
                                        className="object-cover opacity-90" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                            <Play className="w-5 h-5 text-white fill-current ml-1" />
                                        </div>
                                    </div>
                                </>
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 h-fit">
                    <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Episode Details</h3>

                    {/* Category (Language) Selector */}
                    <div>
                        <label className="block text-xs font-bold text-brand-brown mb-1">Category (Language)</label>
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        >
                            <option>English</option>
                            <option>Hausa</option>
                            <option>Arabic</option>
                        </select>
                    </div>

                    {/* Show Selector (Filtered by Category) */}
                    <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                            <ListMusic className="w-4 h-4" /> Select Show
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
                                filteredShows.length > 0 ? (
                                    filteredShows.map(show => (
                                        <option key={show.id} value={show.title}>{show.title}</option>
                                    ))
                                ) : (
                                    <option disabled>No shows found for {formData.category}</option>
                                )
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
                            dir={getDir(formData.title)}
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
                            rows="4" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            dir={getDir(formData.description)}
                        ></textarea>
                    </div>
                </div>
            </div>
        </form>
    );
}
