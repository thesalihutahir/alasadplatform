"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { 
    ArrowLeft, 
    Save, 
    X,
    MapPin,
    Users,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';

export default function EditProgramPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Educational Support',
        status: 'Active',
        location: '',
        beneficiaries: '',
        excerpt: '',
        content: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingCoverUrl, setExistingCoverUrl] = useState(null);

    // 1. Fetch Existing Data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "programs", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || '',
                        category: data.category || 'Educational Support',
                        status: data.status || 'Active',
                        location: data.location || '',
                        beneficiaries: data.beneficiaries || '',
                        excerpt: data.excerpt || '',
                        content: data.content || '',
                    });
                    if (data.coverImage) {
                        setExistingCoverUrl(data.coverImage);
                        setImagePreview(data.coverImage);
                    }
                } else {
                    alert("Program not found.");
                    router.push('/admin/programs');
                }
            } catch (error) {
                console.error("Error fetching program:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        // Revert to existing if available, else null
        setImagePreview(existingCoverUrl || null);
    };
const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.excerpt) {
            alert("Title and Short Summary are required.");
            return;
        }

        setIsSubmitting(true);

        try {
            let finalCoverUrl = existingCoverUrl;

            // 1. Upload New Cover Image (if selected)
            if (imageFile) {
                const storageRef = ref(storage, `programs/covers/${Date.now()}_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        () => resolve()
                    );
                });

                finalCoverUrl = await getDownloadURL(uploadTask.snapshot.ref);
            }

            // 2. Update Firestore
            const docRef = doc(db, "programs", id);
            await updateDoc(docRef, {
                ...formData,
                coverImage: finalCoverUrl,
                updatedAt: serverTimestamp()
            });

            alert("Program updated successfully!");
            router.push('/admin/programs');

        } catch (error) {
            console.error("Error updating program:", error);
            alert("Failed to update program.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/programs" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Program</h1>
                        <p className="font-lato text-sm text-gray-500">Update program details and status.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/programs">
                        <button type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-md disabled:opacity-70"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2. LEFT COLUMN: CONTENT */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Title */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Program Title</label>
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full text-2xl font-agency font-bold text-brand-brown-dark placeholder-gray-300 border-none focus:ring-0 p-0 focus:outline-none"
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Short Summary</label>
                        <textarea 
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows="2"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        ></textarea>
                    </div>

                    {/* Detailed Content */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Description</label>
                        <div className="border-b border-gray-100 pb-2 mb-4 flex gap-2">
                             <span className="text-xs text-gray-400 italic">Markdown Supported</span>
                        </div>
                        <textarea 
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className="flex-grow w-full resize-none border-none focus:ring-0 p-0 focus:outline-none text-base leading-relaxed text-gray-700"
                        ></textarea>
                    </div>
                </div>

                {/* 3. RIGHT COLUMN: SETTINGS */}
                <div className="space-y-6">

                    {/* Classification */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Classification</h3>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Program Type (Pillar)</label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            >
                                <option value="Educational Support">Educational Support</option>
                                <option value="Community Development">Community Development</option>
                                <option value="Training & Innovation">Training & Innovation</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Current Status</label>
                            <select 
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            >
                                <option value="Upcoming">Coming Soon / Upcoming</option>
                                <option value="Active">Active / Ongoing</option>
                                <option value="Completed">Ended / Completed</option>
                                <option value="Paused">Halted / Paused</option>
                            </select>
                        </div>
                    </div>

                    {/* Impact Metrics */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Quick Facts</h3>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Target Beneficiaries</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="beneficiaries"
                                    value={formData.beneficiaries}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Cover Image</h3>

                        <div className="relative w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-brand-gold transition-colors">
                            {imagePreview ? (
                                <>
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                    {/* Show remove button only if it's a new file, or if we want to clear the preview (logic: set to null, though submitting null won't delete old image in this specific implementation, but allows re-selecting) */}
                                    <button 
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4 w-full h-full relative">
                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2 group-hover:text-brand-gold" />
                                    <p className="text-xs text-gray-500 text-center px-4 font-bold">Click to Replace</p>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    />
                                </div>
                            )}
                        </div>
                        {imageFile && isSubmitting && (
                            <p className="text-center text-xs text-brand-gold font-bold">Uploading New Image...</p>
                        )}
                    </div>

                </div>
            </div>
        </form>
    );
}