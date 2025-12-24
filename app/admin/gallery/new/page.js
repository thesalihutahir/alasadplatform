"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, UploadCloud, Folder, X, Image as ImageIcon } from 'lucide-react';

export default function UploadPhotosPage() {

    const availableAlbums = [
        { id: 1, title: "Ramadan Feeding 2024" },
        { id: 2, title: "Ma'ahad Graduation" },
        { id: 3, title: "Community Eid Fest" }
    ];

    const [selectedAlbum, setSelectedAlbum] = useState("");
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    // Handle File Selection (Multiple)
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles]);
            
            // Create previews
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    // Remove specific file
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (files.length === 0) {
            alert("Please select at least one photo.");
            return;
        }
        alert(`Uploading ${files.length} photos to album: ${selectedAlbum || "Uncategorized Stream"}`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex justify-between items-center gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/gallery" className="p-2 hover:bg-gray-200 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Upload Photos</h1>
                        <p className="font-lato text-sm text-gray-500">Add memories to the gallery.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100">Cancel</button>
                    <button type="submit" disabled={files.length === 0} className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-md text-white ${files.length > 0 ? 'bg-brand-gold hover:bg-brand-brown-dark' : 'bg-gray-300 cursor-not-allowed'}`}>
                        <Save className="w-4 h-4" /> Upload {files.length > 0 ? `(${files.length})` : ''}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: Upload & Album Settings */}
                <div className="space-y-6">
                    
                    {/* Album Selector */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <Folder className="w-4 h-4 text-brand-gold" /> Assign to Album
                        </label>
                        <select 
                            value={selectedAlbum} 
                            onChange={(e) => setSelectedAlbum(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                        >
                            <option value="">-- No Album (Stream Only) --</option>
                            {availableAlbums.map(alb => <option key={alb.id} value={alb.title}>{alb.title}</option>)}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-2">
                            Photos not assigned to an album will appear in the general "Recent Moments" stream.
                        </p>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div className="relative border-2 border-dashed border-brand-gold/30 bg-brand-sand/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center hover:bg-brand-sand/20 transition-colors h-64">
                        <UploadCloud className="w-12 h-12 text-brand-brown-dark mb-3" />
                        <h3 className="font-bold text-brand-brown-dark text-lg">Drag photos here</h3>
                        <p className="text-xs text-gray-500 mb-4">or click to browse</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                        <button type="button" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm pointer-events-none">
                            Select Files
                        </button>
                    </div>
                </div>

                {/* RIGHT: Preview Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2 mb-4 flex justify-between items-center">
                            <span>Selected Photos</span>
                            <span className="text-xs font-lato text-gray-400">{files.length} items</span>
                        </h3>

                        {files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                                <ImageIcon className="w-12 h-12 mb-2" />
                                <p className="text-sm">No photos selected yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100 shadow-sm">
                                        <Image src={src} alt="Preview" fill className="object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                                            <p className="text-[9px] text-white truncate text-center">{files[index].name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </form>
    );
}
