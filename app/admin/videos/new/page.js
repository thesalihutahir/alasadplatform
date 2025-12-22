"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    ArrowLeft, 
    Save, 
    Youtube, 
    PlayCircle,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function AddVideoPage() {
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        category: 'Lecture',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [videoId, setVideoId] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [isValid, setIsValid] = useState(false);

    // Helper: Extract YouTube ID from various URL formats
    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Handle URL Change & Auto-Fetch Thumbnail
    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, url }));
        
        const id = extractVideoId(url);
        if (id) {
            setVideoId(id);
            // YouTube Standard Thumbnail URL
            setThumbnail(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
            setIsValid(true);
        } else {
            setVideoId(null);
            setThumbnail(null);
            setIsValid(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid) {
            alert("Please enter a valid YouTube URL first.");
            return;
        }
        alert(`Video "${formData.title}" ready for upload! (ID: ${videoId})`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
            
            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/videos" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Add New Video</h1>
                        <p className="font-lato text-sm text-gray-500">Link a YouTube video to your library.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={!isValid}
                        className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-colors shadow-md ${
                            isValid 
                            ? 'bg-brand-gold text-white hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <Save className="w-4 h-4" />
                        Publish Video
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 2. LEFT COLUMN: INPUT FIELDS */}
                <div className="space-y-6">
                    
                    {/* YouTube URL Input */}
                    <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${isValid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            YouTube Link
                        </label>
                        <div className="relative">
                            <Youtube className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isValid ? 'text-red-600' : 'text-gray-400'}`} />
                            <input 
                                type="text" 
                                name="url"
                                value={formData.url}
                                onChange={handleUrlChange}
                                placeholder="Paste YouTube URL here (e.g. https://youtu.be/...)" 
                                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
                            />
                            {isValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
                        </div>
                        <p className={`text-xs mt-2 font-bold ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
                            {isValid ? "✓ Video found & linked successfully" : "Waiting for valid link..."}
                        </p>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Video Details</h3>
                        
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Video Title</label>
                            <input 
                                type="text" 
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter video title"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Category</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                >
                                    <option>Lecture</option>
                                    <option>Friday Sermon (Khutbah)</option>
                                    <option>Tafsir</option>
                                    <option>Event Highlight</option>
                                    <option>Documentary</option>
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
                            <label className="block text-xs font-bold text-brand-brown mb-1">Short Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Briefly describe what this video is about..." 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                            ></textarea>
                        </div>
                    </div>

                </div>

                {/* 3. RIGHT COLUMN: LIVE PREVIEW */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-brand-gold" />
                            Live Preview
                        </h3>
                        
                        {/* The Preview Card (Mimics Public Site) */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 transform transition-all hover:scale-[1.02]">
                            
                            {/* Facade/Thumbnail Area */}
                            <div className="relative w-full aspect-video bg-black group">
                                {thumbnail ? (
                                    <>
                                        <Image 
                                            src={thumbnail} 
                                            alt="Preview" 
                                            fill 
                                            className="object-cover opacity-90"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <Youtube className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="text-xs">Preview will appear here</span>
                                    </div>
                                )}
                            </div>

                            {/* Details Area */}
                            <div className="p-5">
                                <span className="inline-block px-2 py-1 bg-brand-gold text-white text-[10px] font-bold uppercase rounded mb-3 shadow-sm">
                                    {formData.category}
                                </span>
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-tight">
                                    {formData.title || "Video Title Placeholder"}
                                </h3>
                                <p className="font-lato text-sm text-brand-brown line-clamp-2 opacity-80">
                                    {formData.description || "The description you enter will appear here, giving users a quick summary of the lecture content."}
                                </p>
                            </div>
                        </div>

                        {!isValid && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-xl flex gap-3 items-start">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700 leading-relaxed">
                                    <strong>Tip:</strong> Paste a valid link first. The system will automatically fetch the high-quality thumbnail from YouTube. You don't need to upload an image manually!
                                </p>
                            </div>
                        )}

                    </div>
                </div>

            </div>

        </form>
    );
}
