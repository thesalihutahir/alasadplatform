"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// UploadThing
import { UploadButton } from '@/lib/uploadthing';

import { 
    ArrowLeft, 
    Save, 
    LayoutList, 
    X,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';

export default function CreatePlaylistPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        cover: '' // UploadThing URL
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title) {
            alert("Please enter a playlist title.");
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "video_playlists"), {
                ...formData,
                count: 0, 
                status: "Active",
                cover: formData.cover || "/hero.jpg", 
                createdAt: serverTimestamp()
            });

            alert("Playlist created successfully!");
            router.push('/admin/videos'); // Redirect back to list

        } catch (error) {
            console.error("Error creating playlist:", error);
            alert("Failed to create playlist.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-12">

            {/* Header */}
            <div className="flex items-center gap-4 py-4 border-b border-gray-200">
                <Link href="/admin/videos" className="p-2 hover:bg-gray-200 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Create Playlist</h1>
                    <p className="font-lato text-sm text-gray-500">Group related videos into a series.</p>
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
                        placeholder="e.g. Tafsir Surah Al-Baqarah 2024" 
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
                        <option>Seerah</option>
                        <option>Ramadan</option>
                        <option>Event</option>
                    </select>
                </div>

                {/* Cover Image Upload */}
                <div>
                    <label className="block text-xs font-bold text-brand-brown mb-2">Cover Image</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-white hover:border-brand-gold transition-colors">
                        {formData.cover ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
                                <Image src={formData.cover} alt="Cover Preview" fill className="object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, cover: '' }))}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="py-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-400">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <UploadButton
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        if (res && res[0]) {
                                            setFormData(prev => ({ ...prev, cover: res[0].url }));
                                        }
                                    }}
                                    onUploadError={(error) => alert(`Error! ${error.message}`)}
                                    appearance={{
                                        button: "bg-brand-brown-dark text-white text-xs px-4 py-2 rounded-lg font-bold"
                                    }}
                                    content={{ button({ ready }) { return ready ? 'Upload Cover Image' : 'Loading...' } }}
                                />
                                <p className="text-[10px] text-gray-400 mt-3">Recommended: 16:9 Aspect Ratio (e.g. 1280x720)</p>
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
                        {isSubmitting ? 'Creating...' : 'Create Playlist'}
                    </button>
                </div>

            </div>
        </form>
    );
}
