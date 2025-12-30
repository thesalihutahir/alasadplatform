"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, writeBatch, where, getDocs } from 'firebase/firestore';
// Global Modal Context
import { useModal } from '@/context/ModalContext';
// Custom Loader (LogoReveal)
import Loader from '@/components/Loader'; 

import { 
    PlusCircle, Search, Edit, Trash2, PlayCircle, ListVideo, 
    LayoutList, Filter, X, ArrowUpDown, CalendarClock, 
    Info, ChevronRight, AlertTriangle
} from 'lucide-react';

export default function ManageVideosPage() {
    const router = useRouter();
    const { showSuccess, showConfirm } = useModal(); 

    const [activeTab, setActiveTab] = useState('videos'); 
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    // Modal State
    const [selectedPlaylist, setSelectedPlaylist] = useState(null); // For Playlist Info Modal

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
    // 3. ACTIONS
    const handleDelete = (id, type) => {
        // Standard Delete (Playlist Only or Single Video)
        const message = type === 'playlist' 
            ? "Warning: Deleting this playlist will NOT delete the videos inside it (they will become 'Single Videos'). Continue?"
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

    // SPECIAL: Delete Entire Series (Playlist + Videos)
    const handleDeleteSeries = (playlist) => {
        showConfirm({
            title: "Delete ENTIRE Series?",
            message: `DANGER: This will delete the playlist "${playlist.title}" AND ALL ${playlist.realCount} videos inside it. This cannot be undone.`,
            confirmText: "Yes, Delete Everything",
            cancelText: "Cancel",
            type: 'danger',
            onConfirm: async () => {
                try {
                    // 1. Find all videos in this playlist
                    const q = query(collection(db, "videos"), where("playlist", "==", playlist.title));
                    const snapshot = await getDocs(q);

                    // 2. Batch Delete
                    const batch = writeBatch(db);
                    
                    // Delete playlist
                    const playlistRef = doc(db, "video_playlists", playlist.id);
                    batch.delete(playlistRef);

                    // Delete all videos
                    snapshot.docs.forEach((doc) => {
                        batch.delete(doc.ref);
                    });

                    await batch.commit();
                    
                    setSelectedPlaylist(null); // Close modal
                    showSuccess({ title: "Series Deleted", message: "The playlist and all its videos were deleted.", confirmText: "Done" });

                } catch (error) {
                    console.error("Error deleting series:", error);
                    alert("Failed to delete series.");
                }
            }
        });
    };

    const handleEdit = (id, type) => {
        router.push(type === 'playlist' ? `/admin/videos/playlists/edit/${id}` : `/admin/videos/edit/${id}`);
    };

    // Quick View Modal (Video)
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
                </div>
            ),
            confirmText: "Close"
        });
    };
return (
        <div className="space-y-6 relative">

            {/* --- NEW: PLAYLIST DETAILS MODAL --- */}
            {selectedPlaylist && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div className="flex gap-4">
                                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-sm border border-white">
                                    <Image src={selectedPlaylist.cover || "/fallback.webp"} alt="Cover" fill className="object-cover" />
                                </div>
                                <div dir={getDir(selectedPlaylist.title)}>
                                    <h3 className="font-agency text-2xl text-brand-brown-dark leading-none mb-2">{selectedPlaylist.title}</h3>
                                    <div className="flex gap-2" dir="ltr">
                                        <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase rounded-md">
                                            {selectedPlaylist.category}
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md">
                                            {selectedPlaylist.realCount} Videos
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPlaylist(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body: Scrollable Video List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {videos.filter(v => v.playlist === selectedPlaylist.title).length > 0 ? (
                                videos.filter(v => v.playlist === selectedPlaylist.title).map((vid, idx) => (
                                    <div key={vid.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all group">
                                        <span className="text-xs font-bold text-gray-300 w-6">{idx + 1}</span>
                                        <div className="relative w-16 aspect-video rounded-md overflow-hidden bg-black flex-shrink-0">
                                            <Image src={vid.thumbnail || "/fallback.webp"} alt="Thumb" fill className="object-cover opacity-80" />
                                        </div>
                                        <div className="flex-grow min-w-0" dir={getDir(vid.title)}>
                                            <p className="text-sm font-bold text-gray-700 line-clamp-1">{vid.title}</p>
                                            <p className="text-[10px] text-gray-400 font-lato" dir="ltr">{formatUploadTime(vid.createdAt)}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(vid.id, 'video')} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg">
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => handleDelete(vid.id, 'video')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <ListVideo className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No videos in this playlist yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer: Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <button 
                                onClick={() => handleDeleteSeries(selectedPlaylist)}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Entire Series
                            </button>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleEdit(selectedPlaylist.id, 'playlist')}
                                    className="px-6 py-2.5 bg-brand-gold text-white text-xs font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-sm"
                                >
                                    Edit Playlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN PAGE CONTENT --- */}

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

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button 
                        onClick={() => { setActiveTab('videos'); setSearchTerm(''); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'videos' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <PlayCircle className="w-4 h-4" /> Videos
                    </button>
                    <button 
                        onClick={() => { setActiveTab('playlists'); setSearchTerm(''); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'playlists' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <LayoutList className="w-4 h-4" /> Playlists
                    </button>
                </div>

                <div className="flex flex-col w-full xl:w-auto gap-3">
                    <div className="flex flex-row gap-2 w-full">
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full md:w-40 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                            >
                                <option value="All">All</option>
                                <option value="English">English</option>
                                <option value="Hausa">Hausa</option>
                                <option value="Arabic">Arabic</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors flex-1 md:flex-none"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                        </button>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={`Search by title...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader />
                    </div>
                ) : (
                    <>
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
                                                            <h3 className={`font-bold text-brand-brown-dark text-sm min-w-[150px] cursor-pointer hover:text-brand-gold ${getDir(video.title) === 'rtl' ? 'font-tajawal' : ''}`} onClick={() => handleQuickView(video)}>
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
                                                        {video.playlist ? <span className="text-xs font-bold text-brand-brown bg-brand-sand px-2 py-1 rounded-md">{video.playlist}</span> : <span className="text-xs text-gray-400">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleQuickView(video)} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg md:hidden"><Info className="w-4 h-4" /></button>
                                                            <button onClick={() => handleEdit(video.id, 'video')} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(video.id, 'video')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

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
                                            <div 
                                                key={list.id} 
                                                onClick={() => setSelectedPlaylist(list)} // CLICK TO OPEN MODAL
                                                className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30 cursor-pointer"
                                            >
                                                <div className="relative w-full aspect-video bg-gray-100">
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
                                                            <h3 className={`font-agency text-lg text-brand-brown-dark leading-tight line-clamp-2 ${getDir(list.title) === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
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
                                                            {/* Delete Icon (Safe Delete) */}
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(list.id, 'playlist'); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
