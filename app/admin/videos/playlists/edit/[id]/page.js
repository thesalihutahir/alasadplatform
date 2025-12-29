"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal Context
import { useModal } from '@/context/ModalContext';

import { 
    ArrowLeft, 
    Save, 
    X, 
    Image as ImageIcon, 
    Loader2
} from 'lucide-react';

export default function EditPlaylistPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showSuccess } = useModal(); // Access global modal

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Store original title to check for renames
    const [originalTitle, setOriginalTitle] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: 'English',
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

    // 1. Fetch Playlist Data
    useEffect(() => {
        const fetchPlaylist = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "video_playlists", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || '',
                        category: data.category || 'English',
                        cover: data.cover || ''
                    });
                    setOriginalTitle(data.title);
                    if (data.cover) setImagePreview(data.cover);
                } else {
                    alert("Playlist not found");
                    router.push('/admin/videos');
                }
            } catch (error) {
                console.error("Error loading playlist:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylist();
    }, [id, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({ ...prev, cover: '' })); // Mark for removal
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            alert("Please enter a playlist title.");
            return;
        }

        setIsSubmitting(true);

        try {
            let coverUrl = formData.cover;

            // 1. Upload New Image (if selected)
            if (imageFile) {
                const storageRef = ref(storage, `playlist_covers/${Date.now()}_${imageFile.name}`);
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

            // 2. Update Playlist Doc
            const playlistRef = doc(db, "video_playlists", id);
            await updateDoc(playlistRef, {
                title: formData.title,
                category: formData.category,
                cover: coverUrl,
                updatedAt: new Date().toISOString()
            });

            // 3. SPECIAL: Update all child videos if Title changed
            let message = "Playlist details have been updated successfully.";
            
            if (originalTitle && originalTitle !== formData.title) {
                const qVideos = query(collection(db, "videos"), where("playlist", "==", originalTitle));
                const videoSnaps = await getDocs(qVideos);
                
                // Batch update allows multiple writes (up to 500)
                const batch = writeBatch(db);
                videoSnaps.forEach((videoDoc) => {
                    batch.update(videoDoc.ref, { playlist: formData.title });
                });
                await batch.commit();
                console.log(`Updated ${videoSnaps.size} videos to new playlist name.`);
                message = `Playlist updated! Also updated ${videoSnaps.size} linked videos to the new playlist name.`;
            }

            // Show Success Modal
            showSuccess({
                title: "Playlist Updated!",
                message: message,
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/videos')
            });

        } catch (error) {
            console.error("Error updating playlist:", error);
            alert("Failed to update playlist.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-12">

            {/* Header */}
            <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                <Link href="/admin/videos" className="p-2 hover:bg-gray-200 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Playlist</h1>
                    <p className="font-lato text-sm text-gray-500">Update playlist details.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                
                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-1">Playlist Title</label>
                    <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        dir={getDir(formData.title)} // Auto-RTL
                    />
                    {originalTitle !== formData.title && (
                        <p className="text-[10px] text-orange-600 mt-1 font-bold">
                            Note: Changing the title will automatically update all videos in this playlist.
                        </p>
                    )}
                </div>

                {/* Category (Language) */}
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

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-2">Cover Image</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
                        imagePreview ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-brand-gold'
                    }`}>
                        {imagePreview ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                                <Image src={imagePreview} alt="Cover Preview" fill className="object-cover" />
                                <button 
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {isSubmitting && imageFile && (
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
                                <p className="text-sm text-gray-500 font-bold">Click to Upload Cover</p>
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
                    <Link href="/admin/videos" className="flex-1">
                        <button type="button" className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-md disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </form>
    );
}
