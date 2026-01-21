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

export default function EditAlbumPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Track original title for batch updates
    const [originalTitle, setOriginalTitle] = useState('');

    const [formData, setFormData] = useState({
        title: '',
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

    // 1. Fetch Album Data
    useEffect(() => {
        const fetchAlbum = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "gallery_albums", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        cover: data.cover || ''
                    });
                    setOriginalTitle(data.title);
                    if (data.cover) setImagePreview(data.cover);
                } else {
                    alert("Album not found");
                    router.push('/admin/gallery');
                }
            } catch (error) {
                console.error("Error fetching album:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlbum();
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
            alert("Please enter an Album Title.");
            return;
        }

        setIsSubmitting(true);

        try {
            let coverUrl = formData.cover;

            // 1. Upload NEW Cover (if selected)
            if (imageFile) {
                const storageRef = ref(storage, `album_covers/${Date.now()}_${imageFile.name}`);
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

            // 2. Update Album Doc
            const albumRef = doc(db, "gallery_albums", id);
            await updateDoc(albumRef, {
                ...formData,
                title: formData.title.trim(),
                description: formData.description.trim(),
                cover: coverUrl,
                updatedAt: new Date().toISOString()
            });

            // 3. SPECIAL: Update all linked photos if Title changed
            let message = "Album updated successfully.";
            
            if (originalTitle && originalTitle !== formData.title) {
                // Assuming you stored 'albumTitle' in photos collection. 
                // If you only stored 'albumId', this step is unnecessary.
                // But for completeness based on typical denormalization:
                const qPhotos = query(collection(db, "gallery_photos"), where("albumTitle", "==", originalTitle));
                const photoSnaps = await getDocs(qPhotos);
                
                if (!photoSnaps.empty) {
                    const batch = writeBatch(db);
                    photoSnaps.forEach((photoDoc) => {
                        batch.update(photoDoc.ref, { albumTitle: formData.title.trim() });
                    });
                    await batch.commit();
                    console.log(`Updated ${photoSnaps.size} photos to new album name.`);
                    message = `Album updated! Also renamed album for ${photoSnaps.size} linked photos.`;
                }
            }

            showSuccess({
                title: "Album Updated!",
                message: message,
                confirmText: "Return to Gallery",
                onConfirm: () => router.push('/admin/gallery')
            });

        } catch (error) {
            console.error("Error updating album:", error);
            alert("Failed to update album.");
        } finally {
            setIsSubmitting(false);
        }
    };
if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-12">

            {/* Header */}
            <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                <Link href="/admin/gallery" className="p-2 hover:bg-gray-200 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Album</h1>
                    <p className="font-lato text-sm text-gray-500">Update album details.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">

                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-1">Album Title</label>
                    <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        dir={getDir(formData.title)}
                    />
                    {originalTitle !== formData.title && (
                        <p className="text-[10px] text-orange-600 mt-1 font-bold">
                            Note: Changing the title will automatically update all linked photos.
                        </p>
                    )}
                </div>

                {/* Description */}
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

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-2">Album Cover Photo</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
                        imagePreview ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-brand-gold'
                    }`}>
                        {imagePreview ? (
                            <div className="relative w-full aspect-video max-w-[300px] rounded-lg overflow-hidden shadow-md mx-auto">
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
                                <p className="text-[10px] text-gray-400 mt-1">Recommended: Landscape (16:9)</p>
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
                    <Link href="/admin/gallery" className="flex-1">
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