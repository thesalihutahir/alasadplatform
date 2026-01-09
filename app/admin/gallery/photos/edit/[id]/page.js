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
    Folder, 
    X, 
    Image as ImageIcon, 
    Loader2,
    Calendar,
    FileImage
} from 'lucide-react';

export default function EditPhotoPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Data State
    const [availableAlbums, setAvailableAlbums] = useState([]);

    const [formData, setFormData] = useState({
        name: '', // Photo Title/Caption
        albumId: '',
        createdAt: null
    });

    // Image File State
    const [imageFile, setImageFile] = useState(null); // New file to upload
    const [existingImageUrl, setExistingImageUrl] = useState(null); // Current URL

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // Helper: Format Date
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true
        }).format(date);
    };

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // A. Fetch Albums for Dropdown
                const qAlbums = query(collection(db, "gallery_albums"), orderBy("createdAt", "desc"));
                const albumsSnap = await getDocs(qAlbums);
                setAvailableAlbums(albumsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                // B. Fetch Photo Document
                const docRef = doc(db, "gallery_photos", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        name: data.name || '',
                        albumId: data.albumId || 'uncategorized',
                        createdAt: data.createdAt
                    });
                    
                    if (data.url) {
                        setExistingImageUrl(data.url);
                    }
                } else {
                    alert("Photo not found");
                    router.push('/admin/gallery');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle New File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Please upload a valid image file.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { 
                alert("File size exceeds 5MB limit.");
                return;
            }
            setImageFile(file);
        }
    };

    const removeNewFile = () => {
        setImageFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            alert("Please enter a caption for the photo.");
            return;
        }

        setIsSubmitting(true);

        try {
            let downloadURL = existingImageUrl;

            // 1. Upload New File (if selected)
            if (imageFile) {
                const storageRef = ref(storage, `gallery/${Date.now()}_edited_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            // 2. Prepare Update Data
            // Note: We also update albumTitle denormalized field if you used it in Upload page
            const selectedAlbumData = availableAlbums.find(a => a.id === formData.albumId);
            
            const updateData = {
                name: formData.name,
                albumId: formData.albumId,
                albumTitle: selectedAlbumData ? selectedAlbumData.title : "Stream",
                url: downloadURL,
                updatedAt: new Date().toISOString()
            };

            // 3. Update Firestore
            const docRef = doc(db, "gallery_photos", id);
            await updateDoc(docRef, updateData);

            showSuccess({
                title: "Photo Updated!",
                message: "Your changes have been saved successfully.",
                confirmText: "Return to Gallery",
                onConfirm: () => router.push('/admin/gallery')
            });

        } catch (error) {
            console.error("Error updating photo:", error);
            alert("Failed to update photo.");
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
                    <Link href="/admin/gallery" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Photo</h1>
                        <p className="font-lato text-sm text-gray-500">Update photo details or replace image.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/gallery">
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

                {/* LEFT: Image Preview & Replacement */}
                <div className="space-y-6">

                    {/* Image Preview Box */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-brand-gold" />
                            Image Preview
                        </h3>
                        
                        <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                            <Image 
                                src={imageFile ? URL.createObjectURL(imageFile) : (existingImageUrl || "/fallback.webp")} 
                                alt="Preview" 
                                fill 
                                className="object-contain" 
                            />
                            
                            {/* If new file selected, show badge */}
                            {imageFile && (
                                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                    New File Selected
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File Upload Control */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-3">
                            <FileImage className="w-4 h-4" /> Replace Image (Optional)
                        </label>

                        <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors ${
                            imageFile ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:border-brand-gold'
                        }`}>
                            {imageFile ? (
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-700 line-clamp-1">{imageFile.name}</p>
                                        <p className="text-[10px] text-gray-400">{(imageFile.size / (1024*1024)).toFixed(2)} MB</p>
                                    </div>
                                    <button type="button" onClick={removeNewFile} className="p-2 hover:bg-red-100 text-red-500 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-full py-4">
                                    <p className="text-xs text-gray-500 font-bold">Click to Select New Image</p>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>

                        {isSubmitting && imageFile && (
                            <div className="mt-4">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                                    <span>Uploading...</span>
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
                </div>

                {/* RIGHT: Metadata Inputs */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 h-fit">
                    <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Photo Details</h3>

                    {/* Album Selector */}
                    <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                            <Folder className="w-4 h-4" /> Assigned Album
                        </label>
                        <select 
                            name="albumId"
                            value={formData.albumId}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                        >
                            <option value="uncategorized">-- No Album (Stream Only) --</option>
                            {availableAlbums.map(alb => (
                                <option key={alb.id} value={alb.id}>{alb.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Caption/Name */}
                    <div>
                        <label className="block text-xs font-bold text-brand-brown mb-1">Caption / Title</label>
                        <textarea 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            rows="3"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            dir={getDir(formData.name)}
                        ></textarea>
                    </div>

                    {/* Read-Only Info */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span>Uploaded on: {formatDate(formData.createdAt)}</span>
                        </div>
                    </div>
                </div>

            </div>

        </form>
    );
}
