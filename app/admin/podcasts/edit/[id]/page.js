"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal
import { useModal } from '@/context/ModalContext';

import { 
    ArrowLeft, 
    Save, 
    Youtube, 
    Mic, 
    CheckCircle, 
    Loader2,
    FileAudio,
    X,
    Play,
    ListMusic
} from 'lucide-react';

export default function EditPodcastPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Data State
    const [allShows, setAllShows] = useState([]);
    const [filteredShows, setFilteredShows] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        url: '', // YouTube URL
        show: '',
        category: 'English', // NEW: Language
        episodeNumber: '',
        season: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [videoId, setVideoId] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [isValid, setIsValid] = useState(false);
    
    // Audio File State
    const [audioFile, setAudioFile] = useState(null);
    const [existingAudioUrl, setExistingAudioUrl] = useState(null);

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

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // A. Fetch Shows
                const qShows = query(collection(db, "podcast_shows"), orderBy("createdAt", "desc"));
                const showsSnap = await getDocs(qShows);
                const showsData = showsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setAllShows(showsData);

                // B. Fetch Podcast Episode
                const docRef = doc(db, "podcasts", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || '',
                        url: data.url || '',
                        show: data.show || '',
                        category: data.category || 'English', // Load Category
                        episodeNumber: data.episodeNumber || '',
                        season: data.season || '',
                        description: data.description || '',
                        date: data.date || new Date().toISOString().split('T')[0]
                    });
                    
                    // Filter shows immediately based on loaded category
                    const initialFiltered = showsData.filter(s => s.category === (data.category || 'English'));
                    setFilteredShows(initialFiltered);

                    if (data.videoId) {
                        setVideoId(data.videoId);
                        setThumbnail(data.thumbnail);
                        setIsValid(true);
                    }
                    if (data.audioUrl) {
                        setExistingAudioUrl(data.audioUrl);
                    }
                } else {
                    alert("Podcast not found");
                    router.push('/admin/podcasts');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    // 2. Filter Shows when Category Changes
    useEffect(() => {
        if (allShows.length > 0) {
            const filtered = allShows.filter(s => s.category === formData.category);
            setFilteredShows(filtered);
        }
    }, [formData.category, allShows]);

    // Handle URL Change
    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, url }));

        const vidId = extractVideoId(url);
        if (vidId) {
            setVideoId(vidId);
            setThumbnail(`https://img.youtube.com/vi/${vidId}/hqdefault.jpg`); // Safe thumb
            setIsValid(true);
        } else {
            setVideoId(null);
            setThumbnail(null);
            setIsValid(false);
        }
    };

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                alert("File is too large. Max 50MB.");
                return;
            }
            setAudioFile(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Reset show if category changes (optional, but good UX)
        if (name === 'category') {
            setFormData(prev => ({ ...prev, show: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid || !videoId) {
            alert("Please ensure the YouTube URL is valid.");
            return;
        }

        setIsSubmitting(true);

        try {
            let audioDownloadUrl = existingAudioUrl;

            // 1. Upload NEW Audio File (if selected)
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

            // 2. Update Firestore
            const podcastRef = doc(db, "podcasts", id);
            await updateDoc(podcastRef, {
                ...formData,
                videoId: videoId,
                thumbnail: thumbnail,
                audioUrl: audioDownloadUrl,
                updatedAt: new Date().toISOString()
            });

            showSuccess({
                title: "Podcast Updated!",
                message: "Your changes have been saved successfully.",
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/podcasts')
            });

        } catch (error) {
            console.error("Error updating podcast:", error);
            alert("Failed to update podcast.");
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/podcasts" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Podcast</h1>
                        <p className="font-lato text-sm text-gray-500">Update episode details and media.</p>
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
                        disabled={!isValid || isSubmitting}
                        className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-colors shadow-md ${
                            isValid 
                            ? 'bg-brand-gold text-white hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: Media Inputs */}
                <div className="space-y-6">

                    {/* YouTube Input */}
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
                    </div>

                    {/* Audio File Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-3">
                            <FileAudio className="w-4 h-4" /> Replace Audio File (Optional)
                        </label>
                        
                        {/* Existing File Indicator */}
                        {existingAudioUrl && !audioFile && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-green-700">Audio File Exists</p>
                                    <p className="text-green-600">Upload new file below to replace it.</p>
                                </div>
                            </div>
                        )}

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
                                    <p className="text-xs text-gray-500 font-bold">Click to Upload New MP3</p>
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

                    {/* Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <Mic className="w-5 h-5 text-brand-gold" />
                            Episode Preview
                        </h3>
                        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                            {thumbnail ? (
                                <>
                                    <Image src={thumbnail} alt="Preview" fill className="object-cover opacity-90" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                            <Play className="w-5 h-5 text-white fill-current ml-1" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-400 text-sm flex flex-col items-center">
                                    <Youtube className="w-10 h-10 mb-2 opacity-50" />
                                    No video linked
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
                            {filteredShows.length > 0 ? (
                                filteredShows.map(show => (
                                    <option key={show.id} value={show.title}>{show.title}</option>
                                ))
                            ) : (
                                <option disabled>No shows found for {formData.category}</option>
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
