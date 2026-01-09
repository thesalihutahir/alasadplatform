"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal
import { useModal } from '@/context/ModalContext';

import { 
    ArrowLeft, 
    Save, 
    Music, 
    CheckCircle, 
    Loader2, 
    Trash2, 
    ListMusic,
    AlertTriangle
} from 'lucide-react';

export default function UploadAudioPage() {
    const router = useRouter();
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoadingSeries, setIsLoadingSeries] = useState(true);

    // Duplicate Check State
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    // Dynamic Series State
    const [allSeries, setAllSeries] = useState([]);
    const [filteredSeries, setFilteredSeries] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        speaker: 'Sheikh Goni Dr. Muneer Ja\'afar',
        category: 'English', // Changed to Language
        genre: 'Friday Sermon', // Renamed old category to genre for clarity
        series: '', 
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // File State
    const [audioFile, setAudioFile] = useState(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // 1. Fetch Series on Mount
    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const q = query(collection(db, "audio_series"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const seriesList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllSeries(seriesList);
                // Initial filter
                setFilteredSeries(seriesList.filter(s => s.category === 'English'));
            } catch (error) {
                console.error("Error fetching series:", error);
            } finally {
                setIsLoadingSeries(false);
            }
        };

        fetchSeries();
    }, []);

    // 2. Filter Series when Category Changes
    useEffect(() => {
        if (allSeries.length > 0) {
            const filtered = allSeries.filter(s => s.category === formData.category);
            setFilteredSeries(filtered);
            setFormData(prev => ({ ...prev, series: '' })); // Reset series selection
        }
    }, [formData.category, allSeries]);

    // Check Duplicate Title
    const checkDuplicateTitle = async (title) => {
        if (!title.trim()) {
            setDuplicateWarning(null);
            return;
        }
        
        setIsChecking(true);
        try {
            const q = query(collection(db, "audios"), where("title", "==", title.trim()));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setDuplicateWarning(`A track named "${title}" already exists.`);
            } else {
                setDuplicateWarning(null);
            }
        } catch (error) {
            console.error("Error checking duplicate:", error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title') {
            checkDuplicateTitle(value);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                alert("Please upload a valid audio file.");
                return;
            }
            if (file.size > 50 * 1024 * 1024) { // 50MB Limit
                alert("File size exceeds 50MB limit.");
                return;
            }

            setAudioFile(file);
            setAudioPreviewUrl(URL.createObjectURL(file)); 
            
            // Auto-fill title if empty
            if (!formData.title) {
                const autoTitle = file.name.replace(/\.[^/.]+$/, "");
                setFormData(prev => ({ ...prev, title: autoTitle }));
                checkDuplicateTitle(autoTitle);
            }
        }
    };

    const removeFile = () => {
        if(confirm("Are you sure you want to remove this audio?")) {
            setAudioFile(null);
            setAudioPreviewUrl(null);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!audioFile) {
            alert("Please select an audio file first.");
            return;
        }
        if (!formData.title || duplicateWarning) {
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload File to Firebase Storage
            const storageRef = ref(storage, `audios/${Date.now()}_${audioFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, audioFile);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                }, 
                (error) => {
                    console.error("Upload failed:", error);
                    alert("Upload failed. Please try again.");
                    setIsSubmitting(false);
                }, 
                async () => {
                    // Upload Complete
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // 2. Save Metadata to Firestore
                    await addDoc(collection(db, "audios"), {
                        ...formData,
                        title: formData.title.trim(),
                        audioUrl: downloadURL,
                        fileName: audioFile.name,
                        fileSize: (audioFile.size / (1024 * 1024)).toFixed(2) + " MB",
                        createdAt: serverTimestamp(),
                        plays: 0,
                        downloads: 0
                    });

                    showSuccess({
                        title: "Audio Published!",
                        message: "Your new audio track has been uploaded successfully.",
                        confirmText: "Return to Library",
                        onConfirm: () => router.push('/admin/audios')
                    });
                }
            );

        } catch (error) {
            console.error("Error saving audio:", error);
            alert("Failed to save audio.");
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/audios" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Upload Audio</h1>
                        <p className="font-lato text-sm text-gray-500">Add a new lecture or sermon to the library.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/audios">
                        <button type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit"
                        disabled={isSubmitting || !audioFile || !!duplicateWarning || !formData.title} 
                        className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-colors shadow-md ${
                            audioFile && !duplicateWarning && formData.title
                            ? 'bg-brand-gold text-white hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Uploading...' : 'Upload & Publish'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 2. LEFT COLUMN: FILE UPLOAD ZONE */}
                <div className="space-y-6">

                    <div className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors min-h-[320px] ${
                        audioFile ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300 hover:border-brand-gold hover:bg-brand-sand/10'
                    }`}>

                        {audioFile ? (
                            // File Selected State
                            <div className="w-full">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h3 className="font-bold text-brand-brown-dark text-lg truncate px-4">{audioFile.name}</h3>
                                <p className="text-sm text-gray-500 mb-6">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>

                                {/* Progress Bar */}
                                {isSubmitting && (
                                    <div className="w-full max-w-xs mx-auto mb-4">
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-brand-gold transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}% Uploaded</p>
                                    </div>
                                )}

                                {!isSubmitting && (
                                    <button 
                                        type="button" 
                                        onClick={removeFile}
                                        className="flex items-center justify-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-lg mx-auto transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Remove File
                                    </button>
                                )}
                            </div>
                        ) : (
                            // Empty State
                            <div className="flex flex-col items-center w-full relative">
                                <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                                    <Music className="w-10 h-10" />
                                </div>
                                <h3 className="font-bold text-gray-700 text-lg mb-1">Click to Upload MP3</h3>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
                                    Supported formats: MP3, WAV, AAC. <br/> Max size: 50MB.
                                </p>
                                <input 
                                    type="file" 
                                    accept="audio/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    {/* Audio Player Preview */}
                    {audioPreviewUrl && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                                <Music className="w-5 h-5 text-brand-gold" />
                                File Preview
                            </h3>
                            <audio controls className="w-full rounded-lg" key={audioPreviewUrl}>
                                <source src={audioPreviewUrl} />
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}

                </div>

                {/* 3. RIGHT COLUMN: METADATA */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Audio Details</h3>

                        {/* Title & Duplicate Warning */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Title</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. The Importance of Zakat" 
                                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${
                                        duplicateWarning ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                                    }`}
                                    dir={getDir(formData.title)}
                                />
                                {isChecking && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    </div>
                                )}
                            </div>
                            {duplicateWarning && (
                                <div className="mt-2 flex items-start gap-2 text-xs font-bold text-orange-700 animate-in fade-in slide-in-from-top-1">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span>{duplicateWarning}</span>
                                </div>
                            )}
                        </div>

                        {/* Category (Language) */}
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

                        {/* Series Selection (Dynamic Filter) */}
                        <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                            <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                                <ListMusic className="w-4 h-4" /> Add to Series (Playlist)
                            </label>
                            <select 
                                name="series"
                                value={formData.series}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                            >
                                <option value="">Select a Series (Optional)</option>
                                {isLoadingSeries ? (
                                    <option disabled>Loading...</option>
                                ) : (
                                    filteredSeries.length > 0 ? (
                                        filteredSeries.map(s => (
                                            <option key={s.id} value={s.title}>{s.title}</option>
                                        ))
                                    ) : (
                                        <option disabled>No series found for {formData.category}</option>
                                    )
                                )}
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Group this track with others (e.g., "Tafsir Part 1" goes into "Tafsir Series").
                            </p>
                        </div>

                        {/* Speaker */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Speaker / Author</label>
                            <input 
                                type="text" 
                                name="speaker"
                                value={formData.speaker}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Genre</label>
                                <select 
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                >
                                    <option>Friday Sermon</option>
                                    <option>Tafsir Series</option>
                                    <option>Fiqh Class</option>
                                    <option>General Lecture</option>
                                    <option>Seerah</option>
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
                            <label className="block text-xs font-bold text-brand-brown mb-1">Description (Optional)</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Brief context about the lecture..." 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                dir={getDir(formData.description)}
                            ></textarea>
                        </div>
                    </div>
                </div>

            </div>

        </form>
    );
}
