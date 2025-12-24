"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    PlusCircle, 
    Search, 
    Trash2, 
    Image as ImageIcon, 
    Folder, 
    MoreVertical,
    Edit,
    FolderPlus,
    Grid,
    CheckSquare
} from 'lucide-react';

export default function ManageGalleryPage() {

    const [activeTab, setActiveTab] = useState('photos'); // 'photos' or 'albums'

    // Mock Data: Albums
    const [albums, setAlbums] = useState([
        {
            id: 1,
            title: "Ramadan Feeding 2024",
            count: 45,
            date: "Mar 2024",
            cover: "/hero.jpg"
        },
        {
            id: 2,
            title: "Ma'ahad Graduation",
            count: 120,
            date: "Jan 2024",
            cover: "/hero.jpg"
        },
        {
            id: 3,
            title: "Community Eid Fest",
            count: 85,
            date: "Apr 2024",
            cover: "/hero.jpg"
        }
    ]);

    // Mock Data: Photos
    const [photos, setPhotos] = useState([
        { id: 1, title: "Sheikh Speaking", album: "Ramadan Feeding", date: "22 Dec", src: "/hero.jpg" },
        { id: 2, title: "Crowd Shot", album: "Ramadan Feeding", date: "22 Dec", src: "/hero.jpg" },
        { id: 3, title: "Award Presentation", album: "Graduation", date: "15 Jan", src: "/hero.jpg" },
        { id: 4, title: "Student Reciting", album: "Graduation", date: "15 Jan", src: "/hero.jpg" },
        { id: 5, title: "Food Distribution", album: "Community Eid", date: "10 Apr", src: "/hero.jpg" },
        { id: 6, title: "Mosque Construction", album: "-", date: "05 Feb", src: "/hero.jpg" },
    ]);

    const handleDelete = (id, type) => {
        if (confirm(`Delete this ${type}?`)) {
            if (type === 'photo') setPhotos(photos.filter(p => p.id !== id));
            else setAlbums(albums.filter(a => a.id !== id));
        }
    };

    return (
        <div className="space-y-6">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Gallery Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Organize event photos, manage albums, and highlights.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'photos' ? (
                        <Link 
                            href="/admin/gallery/new" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Upload Photos
                        </Link>
                    ) : (
                        <button 
                            onClick={() => alert("Open Create Album Modal")}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md"
                        >
                            <FolderPlus className="w-4 h-4" />
                            Create Album
                        </button>
                    )}
                </div>
            </div>

            {/* 2. TABS & FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('photos')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'photos' 
                            ? 'bg-white text-brand-brown-dark shadow-sm' 
                            : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" /> All Photos
                    </button>
                    <button 
                        onClick={() => setActiveTab('albums')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'albums' 
                            ? 'bg-white text-brand-brown-dark shadow-sm' 
                            : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <Folder className="w-4 h-4" /> Event Albums
                    </button>
                </div>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder={`Search ${activeTab}...`} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                </div>
            </div>

            {/* 3. CONTENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* --- PHOTOS GRID VIEW --- */}
                {activeTab === 'photos' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Recent Uploads</h3>
                            <button className="text-xs text-brand-gold font-bold flex items-center gap-1 hover:underline">
                                <CheckSquare className="w-3 h-3" /> Select Multiple
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {photos.map((photo) => (
                                <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer">
                                    <Image src={photo.src} alt={photo.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        <p className="text-white text-xs font-bold truncate">{photo.title}</p>
                                        <p className="text-white/70 text-[10px] truncate">{photo.album}</p>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(photo.id, 'photo'); }}
                                            className="absolute top-2 right-2 bg-white/20 backdrop-blur p-1.5 rounded-full hover:bg-red-500 text-white transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ALBUMS VIEW --- */}
                {activeTab === 'albums' && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {albums.map((album) => (
                            <div key={album.id} className="group cursor-pointer">
                                {/* Folder Visual */}
                                <div className="relative w-full aspect-[4/3] mb-3">
                                    {/* Stack Effect */}
                                    <div className="absolute top-0 left-2 right-2 bottom-2 bg-gray-200 rounded-xl transform translate-y-2 group-hover:translate-y-3 transition-transform"></div>
                                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-gray-300 rounded-xl transform translate-y-1 group-hover:translate-y-1.5 transition-transform"></div>
                                    
                                    {/* Cover */}
                                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white group-hover:border-brand-gold/50 transition-colors">
                                        <Image src={album.cover} alt={album.title} fill className="object-cover" />
                                        
                                        {/* Actions Overlay */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="bg-white p-1.5 rounded-lg shadow text-gray-500 hover:text-blue-600"><Edit className="w-3 h-3" /></button>
                                            <button onClick={(e) => {e.stopPropagation(); handleDelete(album.id, 'album')}} className="bg-white p-1.5 rounded-lg shadow text-gray-500 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                        
                                        {/* Count Badge */}
                                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> {album.count}
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <h3 className="font-agency text-lg text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors">
                                    {album.title}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">{album.date}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
