"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
// Global Modal Context
import { useModal } from '@/context/ModalContext';

import { 
    PlusCircle, 
    Search, 
    Edit, 
    Trash2, 
    PlayCircle, 
    ListVideo, 
    LayoutList, 
    Loader2,
    Filter,
    X,
    ArrowUpDown, 
    CalendarClock,
    Info // New icon for Quick View
} from 'lucide-react';

export default function ManageVideosPage() {
    const router = useRouter();
    const { showSuccess, showConfirm } = useModal(); 

    const [activeTab, setActiveTab] = useState('videos'); 
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('desc'); 

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // Helper: Format Date
    const formatUploadTime = (timestamp) => {
        if (!timestamp) return <span className="text-gray-300 italic">Processing...</span>;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: 'numeric', minute: 'numeric', hour12: true
        }).format(date).replace(',', '').replace(' at', ' •');
    };

    // 1. FETCH DATA
    useEffect(() => {
        setIsLoading(true);
        const qVideos = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const unsubVideos = onSnapshot(qVideos, (snapshot) => {
            setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qPlaylists = query(collection(db, "video_playlists"), orderBy("createdAt", "desc"));
        const unsubPlaylists = onSnapshot(qPlaylists, (snapshot) => {
            setPlaylists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => {
            unsubVideos();
            unsubPlaylists();
        };
    }, []);

    // 2. PROCESS CONTENT
    const getProcessedContent = () => {
        const term = searchTerm.toLowerCase();
        let content = [];

        if (activeTab === 'videos') {
            content = videos.filter(video => {
                const matchesSearch = 
                    video.title.toLowerCase().includes(term) || 
                    (video.playlist && video.playlist.toLowerCase().includes(term));
                const matchesCategory = categoryFilter === 'All' || video.category === categoryFilter;
                return matchesSearch && matchesCategory;
            });
        } else {
            const playlistsWithCounts = playlists.map(pl => ({
                ...pl,
                realCount: videos.filter(v => v.playlist === pl.title).length
            }));
            content = playlistsWithCounts.filter(playlist => {
                const matchesSearch = playlist.title.toLowerCase().includes(term);
                const matchesCategory = categoryFilter === 'All' || playlist.category === categoryFilter;
                return matchesSearch && matchesCategory;
            });
        }

        return content.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    };

    const filteredContent = getProcessedContent();

    // 3. ACTIONS & MODAL LOGIC
    const handleDelete = (id, type) => {
        const message = type === 'playlist' 
            ? "Warning: Deleting this playlist will NOT delete videos inside it. Continue?"
            : "Are you sure you want to delete this video? This cannot be undone.";

        showConfirm({
            title: `Delete ${type === 'playlist' ? 'Playlist' : 'Video'}?`,
            message: message,
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            type: 'danger', 
            onConfirm: async () => {
                try {
                    if (type === 'video') await deleteDoc(doc(db, "videos", id));
                    else await deleteDoc(doc(db, "video_playlists", id));
                    
                    showSuccess({ title: "Deleted!", message: "Item deleted successfully.", confirmText: "Okay" });
                } catch (error) {
                    console.error("Error deleting:", error);
                    alert("Failed to delete.");
                }
            }
        });
    };

    const handleEdit = (id, type) => {
        router.push(type === 'playlist' ? `/admin/videos/playlists/edit/${id}` : `/admin/videos/edit/${id}`);
    };

    // Quick View Modal Logic
    const handleQuickView = (item) => {
        showSuccess({
            title: "Quick Info",
            message: (
                <div className="text-left space-y-3 mt-2 text-sm">
                    <div dir={getDir(item.title)}>
                        <p className="text-xs font-bold text-gray-400 uppercase">Title</p>
                        <p className="font-bold text-brand-brown-dark">{item.title}</p>
                    </div>
                    {item.date && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Recorded Date</p>
                            <p className="font-medium">{item.date}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Uploaded On</p>
                        <p className="font-medium">{formatUploadTime(item.createdAt)}</p>
                    </div>
                    {item.playlist && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Playlist</p>
                            <p className="font-medium">{item.playlist}</p>
                        </div>
                    )}
                </div>
            ),
            confirmText: "Close"
        });
    };
return (
        <div className="space-y-6">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Video Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Manage your library, playlists, and lecture series.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'videos' ? (
                        <Link 
                            href="/admin/videos/new" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Upload Video
                        </Link>
                    ) : (
                        <Link 
                            href="/admin/videos/playlists/new"
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md"
                        >
                            <ListVideo className="w-4 h-4" />
                            Create Playlist
                        </Link>
                    )}
                </div>
            </div>

            {/* 2. TABS & FILTERS TOOLBAR */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button 
                        onClick={() => { setActiveTab('videos'); setSearchTerm(''); setCategoryFilter('All'); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'videos' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <PlayCircle className="w-4 h-4" /> Videos
                    </button>
                    <button 
                        onClick={() => { setActiveTab('playlists'); setSearchTerm(''); setCategoryFilter('All'); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'playlists' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <LayoutList className="w-4 h-4" /> Playlists
                    </button>
                </div>

                {/* Filters & Sorting - RESPONSIVE ROW */}
                <div className="flex flex-col w-full xl:w-auto gap-3">
                    
                    <div className="flex flex-row gap-2 w-full">
                        {/* Category Dropdown */}
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full md:w-40 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer appearance-none font-bold text-gray-600"
                            >
                                <option value="All">All</option>
                                <option value="English">English</option>
                                <option value="Hausa">Hausa</option>
                                <option value="Arabic">Arabic</option>
                            </select>
                        </div>

                        {/* Sorting Button */}
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors flex-1 md:flex-none"
                            title={sortOrder === 'desc' ? "Sort: Newest First" : "Sort: Oldest First"}
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={`Search by title...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. CONTENT AREA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* VIDEOS VIEW */}
                        {activeTab === 'videos' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Video</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Language</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Playlist</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredContent.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No videos found.</td></tr>
                                        ) : (
                                            filteredContent.map((video) => (
                                                <tr key={video.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black cursor-pointer" onClick={() => handleQuickView(video)}>
                                                                <Image src={video.thumbnail || "/fallback.webp"} alt={video.title} fill className="object-cover opacity-80" />
                                                            </div>
                                                            {/* UPDATED: Full title visibility (no line-clamp) */}
                                                            <h3 
                                                                className={`font-bold text-brand-brown-dark text-sm min-w-[150px] cursor-pointer hover:text-brand-gold ${getDir(video.title) === 'rtl' ? 'font-tajawal' : ''}`} 
                                                                title="Click for Details"
                                                                onClick={() => handleQuickView(video)}
                                                            >
                                                                {video.title}
                                                            </h3>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                            video.category === 'English' ? 'bg-blue-100 text-blue-700' :
                                                            video.category === 'Hausa' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            {video.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        {video.playlist ? (
                                                            <span className="text-xs font-bold text-brand-brown bg-brand-sand px-2 py-1 rounded-md">
                                                                {video.playlist}
                                                            </span>
                                                        ) : <span className="text-xs text-gray-400">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleQuickView(video)} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg md:hidden" title="Info">
                                                                <Info className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleEdit(video.id, 'video')} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg" title="Edit">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(video.id, 'video')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* PLAYLISTS VIEW */}
                        {activeTab === 'playlists' && (
                            <div className="p-6">
                                {filteredContent.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <LayoutList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No playlists found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredContent.map((list) => (
                                            <div key={list.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30">
                                                <div className="relative w-full aspect-video bg-gray-100 cursor-pointer" onClick={() => handleQuickView(list)}>
                                                    <Image src={list.cover || "/fallback.webp"} alt={list.title} fill className="object-cover" />
                                                    <div className="absolute top-2 left-2">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${
                                                            list.category === 'English' ? 'bg-blue-600 text-white' :
                                                            list.category === 'Hausa' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                                                        }`}>
                                                            {list.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-4" dir={getDir(list.title)}>
                                                    <div className="flex justify-between items-start gap-4" dir="ltr">
                                                        <div>
                                                            <h3 className={`font-agency text-lg text-brand-brown-dark leading-tight ${getDir(list.title) === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                                                {list.title}
                                                            </h3>
                                                            <div className="mt-2 space-y-1">
                                                                <p className="text-xs text-brand-gold font-bold flex items-center gap-1">
                                                                    <ListVideo className="w-3 h-3" /> {list.realCount} Videos
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                    <CalendarClock className="w-3 h-3" /> {formatUploadTime(list.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleEdit(list.id, 'playlist')} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(list.id, 'playlist')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}