"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal Context
import { useModal } from '@/context/ModalContext';

import { 
    ArrowLeft, 
    Save, 
    Mic, 
    X, 
    Image as ImageIcon, 
    Loader2,
    AlertTriangle
} from 'lucide-react';

export default function CreatePodcastShowPage() {
    const router = useRouter();
    const { showSuccess } = useModal(); 

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Duplicate Check State
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        host: 'Al-Asad Foundation',
        category: 'English', // Default to English
        description: '', 
        cover: '' 
    });

    // Image File State
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // Check Duplicate Title
    const checkDuplicateTitle = async (title) => {
        if (!title.trim()) {
            setDuplicateWarning(null);
            return;
        }
        
        setIsChecking(true);
        try {
            const q = query(collection(db, "podcast_shows"), where("title", "==", title.trim()));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setDuplicateWarning(`A show named "${title}" already exists.`);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                alert("Image size must be less than 5MB");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent submission if duplicate exists or title empty
        if (!formData.title || duplicateWarning) {
            return;
        }

        setIsSubmitting(true);

        try {
            let coverUrl = "/fallback.webp"; 

            // 1. Upload Cover Image (if selected)
            if (imageFile) {
                const storageRef = ref(storage, `podcast_covers/${Date.now()}_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            coverUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            // 2. Save Show Metadata
            await addDoc(collection(db, "podcast_shows"), {
                ...formData,
                title: formData.title.trim(),
                description: formData.description.trim(),
                cover: coverUrl,
                status: "Active",
                episodeCount: 0,
                createdAt: serverTimestamp()
            });

            // Show Success Modal
            showSuccess({
                title: "Podcast Show Created!",
                message: "Your new podcast show has been launched successfully.",
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/podcasts')
            });

        } catch (error) {
            console.error("Error creating show:", error);
            alert("Failed to create show.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-12">

            {/* Header */}
            <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                <Link href="/admin/podcasts" className="p-2 hover:bg-gray-200 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Create Podcast Show</h1>
                    <p className="font-lato text-sm text-gray-500">Launch a new audio series or program.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">

                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-1">Show Title</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. The Daily Reminders" 
                            className={`w-full bg-gray-50 border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${
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

                    {/* DUPLICATE WARNING */}
                    {duplicateWarning && (
                        <div className="mt-2 flex items-start gap-2 text-xs font-bold text-orange-700 animate-in fade-in slide-in-from-top-1">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>{duplicateWarning}</span>
                        </div>
                    )}
                </div>

                {/* Host */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-1">Host / Speaker</label>
                    <input 
                        type="text" 
                        name="host"
                        value={formData.host}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        dir={getDir(formData.host)}
                    />
                </div>

                {/* Category (UPDATED TO LANGUAGE SYSTEM) */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-1">Category (Language)</label>
                    <select 
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    >
                        <option>English</option>
                        <option>Hausa</option>
                        <option>Arabic</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-1">Description (Optional)</label>
                    <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="What is this show about?" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        dir={getDir(formData.description)}
                    ></textarea>
                </div>

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-2">Show Cover Art</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
                        imagePreview ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-brand-gold'
                    }`}>
                        {imagePreview ? (
                            <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden shadow-md mx-auto">
                                <Image src={imagePreview} alt="Cover Preview" fill className="object-cover" />
                                <button 
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {isSubmitting && (
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] text-center py-1">
                                        Uploading: {Math.round(uploadProgress)}%
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-4 relative w-full">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-400">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <p className="text-sm text-gray-500 font-bold">Click to Upload Art</p>
                                <p className="text-[10px] text-gray-400 mt-1">Required: Square (1:1)</p>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                    <Link href="/admin/podcasts" className="flex-1">
                        <button type="button" className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !!duplicateWarning || !formData.title}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-colors shadow-md ${
                            isSubmitting || !!duplicateWarning || !formData.title
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-brand-gold text-white hover:bg-brand-brown-dark'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Creating...' : 'Create Show'}
                    </button>
                </div>

            </div>
        </form>
    );
}
