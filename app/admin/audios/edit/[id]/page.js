"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal & Components
import { useModal } from '@/context/ModalContext';
import CustomSelect from '@/components/CustomSelect'; 
import CustomDatePicker from '@/components/CustomDatePicker'; 

import { 
    ArrowLeft, 
    Save, 
    Music, 
    CheckCircle, 
    Loader2, 
    FileAudio, 
    X, 
    ListMusic, 
    AlertTriangle,
    Globe,
    User,
    Calendar as CalendarIcon
} from 'lucide-react';

export default function EditAudioPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Duplicate Check State
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [originalTitle, setOriginalTitle] = useState('');

    // Data State
    const [allSeries, setAllSeries] = useState([]);
    const [filteredSeries, setFilteredSeries] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        speaker: '',
        category: 'English', 
        series: '', 
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // File State
    const [audioFile, setAudioFile] = useState(null); 
    const [existingAudioUrl, setExistingAudioUrl] = useState(null); 
    const [existingFileName, setExistingFileName] = useState('');

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
                        series: data.series || '',
                        date: data.date || new Date().toISOString().split('T')[0],
                        description: data.description || '',
                    });
                    setOriginalTitle(data.title);

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

    // Check Duplicate Title (Excluding self)
    const checkDuplicateTitle = async (title) => {
        if (!title.trim() || title.trim() === originalTitle) {
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

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title') {
            checkDuplicateTitle(value);
        }
    };

    // Custom Select Handler
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        
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

        if (!formData.title || duplicateWarning) return;

        setIsSubmitting(true);

        try {
            let downloadURL = existingAudioUrl;
            let fileName = existingFileName;
            let fileSize = null; 

            // 1. Upload New File (if selected)
            if (audioFile) {
                const metadata = {
    contentType: audioFile.type,
    contentDisposition: `attachment; filename="${audioFile.name}"`
};

const uploadTask = uploadBytesResumable(storageRef, audioFile, metadata);

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

    // Series Options
    const seriesOptions = filteredSeries.map(s => ({
        value: s.title,
        label: s.title
    }));
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
                        disabled={isSubmitting || !!duplicateWarning || !formData.title} 
                        className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-colors shadow-md ${
                            !duplicateWarning && formData.title
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
                        <audio controls className="w-full rounded-lg" key={audioFile ? audioFile.name : existingAudioUrl}>
                            <source src={audioFile ? URL.createObjectURL(audioFile) : existingAudioUrl} />
                            Your browser does not support the audio element.
                        </audio>
                    </div>

                </div>

                {/* RIGHT COLUMN: METADATA */}
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
                        <CustomSelect 
                            label="Category (Language)"
                            options={CATEGORY_OPTIONS}
                            value={formData.category}
                            onChange={(val) => handleSelectChange('category', val)}
                            icon={Globe}
                            placeholder="Select Language"
                        />

                        {/* Series Selection (Dynamic Filter) */}
                        <div className="pt-2 border-t border-gray-100">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Series / Playlist (Optional)</label>
                            <CustomSelect 
                                options={seriesOptions}
                                value={formData.series}
                                onChange={(val) => handleSelectChange('series', val)}
                                icon={ListMusic}
                                placeholder={seriesOptions.length > 0 ? "Select Series" : "No series found"}
                            />
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                Showing series for: <span className="font-bold text-brand-gold">{formData.category}</span>
                            </p>
                        </div>

                        {/* Speaker */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Speaker / Author</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="speaker"
                                    value={formData.speaker}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <CustomDatePicker 
                            label="Date Recorded"
                            value={formData.date}
                            onChange={(val) => handleSelectChange('date', val)}
                            icon={CalendarIcon}
                        />

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
