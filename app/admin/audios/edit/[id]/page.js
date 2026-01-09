"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal
import { useModal } from '@/context/ModalContext';

import { 
    ArrowLeft, 
    Save, 
    Music, 
    CheckCircle, 
    Loader2, 
    FileAudio, 
    X,
    ListMusic
} from 'lucide-react';

export default function EditAudioPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Data State
    const [allSeries, setAllSeries] = useState([]);
    const [filteredSeries, setFilteredSeries] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        speaker: '',
        category: 'English', // Language
        genre: 'Friday Sermon', 
        series: '', 
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // File State
    const [audioFile, setAudioFile] = useState(null); // New file to upload
    const [existingAudioUrl, setExistingAudioUrl] = useState(null); // Current file URL
    const [existingFileName, setExistingFileName] = useState('');

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // A. Fetch All Series
                const qSeries = query(collection(db, "audio_series"), orderBy("createdAt", "desc"));
                const seriesSnap = await getDocs(qSeries);
                const seriesData = seriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setAllSeries(seriesData);

                // B. Fetch Audio Document
                const docRef = doc(db, "audios", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || '',
                        speaker: data.speaker || '',
                        category: data.category || 'English',
                        genre: data.genre || 'Friday Sermon',
                        series: data.series || '',
                        date: data.date || new Date().toISOString().split('T')[0],
                        description: data.description || '',
                    });

                    // Set initial filter based on loaded category
                    const initialFiltered = seriesData.filter(s => s.category === (data.category || 'English'));
                    setFilteredSeries(initialFiltered);

                    if (data.audioUrl) {
                        setExistingAudioUrl(data.audioUrl);
                        setExistingFileName(data.fileName || "Existing Audio File");
                    }
                } else {
                    alert("Audio track not found");
                    router.push('/admin/audios');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    // 2. Filter Series when Category Changes
    useEffect(() => {
        if (allSeries.length > 0) {
            const filtered = allSeries.filter(s => s.category === formData.category);
            setFilteredSeries(filtered);
        }
    }, [formData.category, allSeries]);

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset series if category changes (optional UX choice)
        if (name === 'category') {
            setFormData(prev => ({ ...prev, series: '' }));
        }
    };

    // Handle New File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                alert("Please upload a valid audio file.");
                return;
            }
            if (file.size > 50 * 1024 * 1024) { 
                alert("File size exceeds 50MB limit.");
                return;
            }
            setAudioFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title) {
            alert("Please enter a title.");
            return;
        }

        setIsSubmitting(true);

        try {
            let downloadURL = existingAudioUrl;
            let fileName = existingFileName;
            let fileSize = null; // Don't update size if we don't change file

            // 1. Upload New File (if selected)
            if (audioFile) {
                const storageRef = ref(storage, `audios/${Date.now()}_${audioFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, audioFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            fileName = audioFile.name;
                            fileSize = (audioFile.size / (1024 * 1024)).toFixed(2) + " MB";
                            resolve();
                        }
                    );
                });
            }

            // 2. Prepare Update Data
            const updateData = {
                ...formData,
                title: formData.title.trim(),
                audioUrl: downloadURL,
                fileName: fileName,
                updatedAt: new Date().toISOString()
            };

            // Only update fileSize if a new file was uploaded
            if (fileSize) {
                updateData.fileSize = fileSize;
            }

            // 3. Update Firestore
            const docRef = doc(db, "audios", id);
            await updateDoc(docRef, updateData);

            showSuccess({
                title: "Audio Updated!",
                message: "Your changes have been saved successfully.",
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/audios')
            });

        } catch (error) {
            console.error("Error updating audio:", error);
            alert("Failed to update audio.");
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
                    <Link href="/admin/audios" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Audio</h1>
                        <p className="font-lato text-sm text-gray-500">Update audio details and file.</p>
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
                        disabled={isSubmitting} 
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-md disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: File Replacement */}
                <div className="space-y-6">

                    {/* File Upload Box */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-3">
                            <FileAudio className="w-4 h-4" /> Replace Audio File (Optional)
                        </label>

                        {/* Existing File Indicator */}
                        {existingAudioUrl && !audioFile && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-green-700 text-sm">Current File Active</p>
                                    <p className="text-green-600 text-xs truncate">{existingFileName}</p>
                                </div>
                            </div>
                        )}

                        {/* Upload Area */}
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
                                    <p className="text-xs text-gray-500 font-bold">Upload New MP3 to Replace</p>
                                    <input 
                                        type="file" 
                                        accept=".mp3, .wav"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Upload Progress */}
                        {isSubmitting && audioFile && (
                            <div className="mt-4">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                                    <span>Uploading New File...</span>
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

                    {/* Audio Player Preview */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <Music className="w-5 h-5 text-brand-gold" />
                            File Preview
                        </h3>
                        {/* If a new file is selected, we create a temporary URL.
                           Otherwise, we play the existing URL.
                        */}
                        <audio controls className="w-full rounded-lg" key={audioFile ? audioFile.name : existingAudioUrl}>
                            <source src={audioFile ? URL.createObjectURL(audioFile) : existingAudioUrl} />
                            Your browser does not support the audio element.
                        </audio>
                    </div>

                </div>

                {/* RIGHT: Metadata Inputs */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Audio Details</h3>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Title</label>
                            <input 
                                type="text" 
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                dir={getDir(formData.title)}
                            />
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
                                {filteredSeries.length > 0 ? (
                                    filteredSeries.map(s => (
                                        <option key={s.id} value={s.title}>{s.title}</option>
                                    ))
                                ) : (
                                    <option disabled>No series found for {formData.category}</option>
                                )}
                            </select>
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
