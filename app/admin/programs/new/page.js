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
    UploadCloud, 
    X,
    MapPin,
    Users,
    Loader2,
    Image as ImageIcon,
    Target
} from 'lucide-react';

export default function CreateProgramPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Educational Support', // Default to first pillar
        status: 'Active',
        location: '',
        beneficiaries: '',
        excerpt: '',
        content: '',
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

        if (!formData.title || !formData.excerpt) {
            alert("Title and Short Summary are required.");
            return;
        }

        setIsSubmitting(true);

        try {
            let coverUrl = ""; 

            // 1. Upload Cover Image (if selected)
            if (imageFile) {
                const storageRef = ref(storage, `programs/covers/${Date.now()}_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                // Wait for upload to complete
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

                coverUrl = await getDownloadURL(uploadTask.snapshot.ref);
            }

            // 2. Save Program Data
            await addDoc(collection(db, "programs"), {
                ...formData,
                coverImage: coverUrl,
                createdAt: serverTimestamp()
            });

            alert("Program published successfully!");
            router.push('/admin/programs');

        } catch (error) {
            console.error("Error creating program:", error);
            alert("Failed to create program.");
        } finally {
            setIsSubmitting(false);
        }
    };
return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/programs" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">New Program</h1>
                        <p className="font-lato text-sm text-gray-500">Launch a new initiative under a core pillar.</p>
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
                        {isSubmitting ? `Publishing...` : 'Publish Program'}
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
                            placeholder="e.g. Rural School Renovation Phase 1" 
                            className="w-full text-2xl font-agency font-bold text-brand-brown-dark placeholder-gray-300 border-none focus:ring-0 p-0 focus:outline-none"
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Short Summary (Excerpt)</label>
                        <textarea 
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows="2"
                            placeholder="A brief overview displayed on cards..." 
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
                            placeholder="Describe the objectives, strategy, and expected outcomes..."
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
                                    placeholder="e.g. Katsina City"
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
                                    placeholder="e.g. 500 Students"
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
                                    <p className="text-xs text-gray-500 text-center px-4 font-bold">Click to Upload</p>
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

                </div>
            </div>
        </form>
    );
}