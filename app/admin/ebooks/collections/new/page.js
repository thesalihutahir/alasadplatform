"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { 
    ArrowLeft, 
    Save, 
    Library, 
    X, 
    Image as ImageIcon, 
    Loader2
} from 'lucide-react';

export default function CreateCollectionPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        description: '',
        cover: '' // Firebase URL
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title) {
            alert("Please enter a Collection Title.");
            return;
        }

        setIsSubmitting(true);

        try {
            let coverUrl = "/fallback.webp"; // Default

            // 1. Upload Cover Image (if selected)
            if (imageFile) {
                const storageRef = ref(storage, `ebook_collection_covers/${Date.now()}_${imageFile.name}`);
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

            // 2. Save Collection Metadata
            await addDoc(collection(db, "ebook_collections"), {
                ...formData,
                cover: coverUrl,
                status: "Active",
                bookCount: 0,
                createdAt: serverTimestamp()
            });

            alert("Collection created successfully!");
            router.push('/admin/ebooks'); 

        } catch (error) {
            console.error("Error creating collection:", error);
            alert("Failed to create collection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-12">

            {/* Header */}
            <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                <Link href="/admin/ebooks" className="p-2 hover:bg-gray-200 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Create Book Collection</h1>
                    <p className="font-lato text-sm text-gray-500">Group books into a series or volume set.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                
                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-1">Collection Title</label>
                    <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Tafsir Series" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-1">Category</label>
                    <select 
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    >
                        <option>General</option>
                        <option>Tafsir</option>
                        <option>Fiqh</option>
                        <option>Aqeedah</option>
                    </select>
                </div>

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-2">Collection Cover Art</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
                        imagePreview ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-brand-gold'
                    }`}>
                        {imagePreview ? (
                            <div className="relative w-full aspect-[2/3] max-w-[200px] rounded-lg overflow-hidden shadow-md mx-auto">
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
                                <p className="text-sm text-gray-500 font-bold">Click to Upload Cover</p>
                                <p className="text-[10px] text-gray-400 mt-1">Recommended: Portrait (2:3)</p>
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
                    <Link href="/admin/ebooks" className="flex-1">
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
                        {isSubmitting ? 'Creating...' : 'Create Collection'}
                    </button>
                </div>

            </div>
        </form>
    );
}