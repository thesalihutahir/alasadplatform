"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, writeBatch, where, getDocs, limit, startAfter, endBefore, limitToLast } from 'firebase/firestore';
// Context
import { useModal } from '@/context/ModalContext';
import LogoReveal from '@/components/logo-reveal'; 

import { 
    PlusCircle, Search, Edit, Trash2, PlayCircle, ListVideo, 
    LayoutList, Filter, X, ArrowUpDown, CalendarClock, 
    Info, ChevronRight, AlertTriangle, Eye, Video, 
    ChevronDown, Check, ChevronLeft
} from 'lucide-react';

// --- CUSTOM DROPDOWN COMPONENT (Internal) ---
const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className || ''}`} ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full pl-3 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all hover:border-brand-gold/50 ${isOpen ? 'ring-2 ring-brand-gold/20 border-brand-gold' : ''}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {Icon && <Icon className="w-4 h-4 text-brand-gold flex-shrink-0" />}
                    <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 min-w-[140px]">
                    {options.map((opt) => (
                        <div 
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-brand-sand/10 flex justify-between items-center ${value === opt.value ? 'bg-brand-sand/20 text-brand-brown-dark font-bold' : 'text-gray-600'}`}
                        >
                            {opt.label}
                            {value === opt.value && <Check className="w-3 h-3 text-brand-gold" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function ManageVideosPage() {
    const router = useRouter();
    const { showSuccess, showConfirm } = useModal(); 

    const [activeTab, setActiveTab] = useState('videos'); 
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    // Modal State
    const [selectedPlaylist, setSelectedPlaylist] = useState(null); 
    const [selectedVideo, setSelectedVideo] = useState(null); // For Quick View Modal

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('desc'); 

    // Pagination State (Client-side simulation for filtered content is simpler and smoother for < 1000 items)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

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

    // 2. PROCESS CONTENT & PAGINATION
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

        const sorted = content.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        // Pagination Logic
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = sorted.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(sorted.length / itemsPerPage);

        return { currentItems, totalPages, totalItems: sorted.length };
    };

    const { currentItems: filteredContent, totalPages, totalItems } = getProcessedContent();

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, activeTab]);

    // 3. ACTIONS
    const handleDelete = (id, type) => {
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
                    else {
                        await deleteDoc(doc(db, "video_playlists", id));
                        setSelectedPlaylist(null); 
                    }
                    if (selectedVideo) setSelectedVideo(null); // Close video modal if open
                    showSuccess({ title: "Deleted!", message: "Item deleted successfully.", confirmText: "Okay" });
                } catch (error) {
                    console.error("Error deleting:", error);
                    alert("Failed to delete.");
                }
            }
        });
    };

    const handleDeleteSeries = (playlist) => {
        showConfirm({
            title: "Delete ENTIRE Series?",
            message: `DANGER: This will delete the playlist "${playlist.title}" AND ALL ${playlist.realCount} videos inside it. This cannot be undone.`,
            confirmText: "Yes, Delete Everything",
            cancelText: "Cancel",
            type: 'danger',
            onConfirm: async () => {
                try {
                    const q = query(collection(db, "videos"), where("playlist", "==", playlist.title));
                    const snapshot = await getDocs(q);
                    const batch = writeBatch(db);
                    batch.delete(doc(db, "video_playlists", playlist.id));
                    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
                    await batch.commit();
                    
                    setSelectedPlaylist(null); 
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

    // Filter Options
    const categoryOptions = [
        { value: "All", label: "All Categories" },
        { value: "English", label: "English" },
        { value: "Hausa", label: "Hausa" },
        { value: "Arabic", label: "Arabic" }
    ];
    return (
        <div className="space-y-6 relative max-w-7xl mx-auto pb-12">

            {/* --- PLAYLIST DETAILS MODAL --- */}
            {selectedPlaylist && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div className="flex gap-4 w-full">
                                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-sm border border-white flex-shrink-0">
                                    <Image src={selectedPlaylist.cover || "/fallback.webp"} alt="Cover" fill className="object-cover" />
                                </div>
                                <div className="flex-grow" dir={getDir(selectedPlaylist.title)}>
                                    <h3 className="font-agency text-2xl text-brand-brown-dark leading-none mb-2">{selectedPlaylist.title}</h3>
                                    <div className="flex gap-2" dir="ltr">
                                        <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase rounded-md">{selectedPlaylist.category}</span>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md">{selectedPlaylist.realCount} Videos</span>
                                    </div>
                                    {selectedPlaylist.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{selectedPlaylist.description}</p>}
                                </div>
                            </div>
                            <button onClick={() => setSelectedPlaylist(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Videos in this Series</h4>
                            {videos.filter(v => v.playlist === selectedPlaylist.title).length > 0 ? (
                                videos.filter(v => v.playlist === selectedPlaylist.title).map((vid, idx) => (
                                    <div key={vid.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all group">
                                        <span className="text-xs font-bold text-gray-300 w-6 text-center">{idx + 1}</span>
                                        <div className="relative w-16 aspect-video rounded-md overflow-hidden bg-black flex-shrink-0">
                                            <Image src={vid.thumbnail || "/fallback.webp"} alt="Thumb" fill className="object-cover opacity-80" />
                                        </div>
                                        <div className="flex-grow min-w-0" dir={getDir(vid.title)}>
                                            <p className="text-sm font-bold text-gray-700 line-clamp-1">{vid.title}</p>
                                            <p className="text-[10px] text-gray-400 font-lato" dir="ltr">{formatUploadTime(vid.createdAt)}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(vid.id, 'video')} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg"><Edit className="w-3 h-3" /></button>
                                            <button onClick={() => handleDelete(vid.id, 'video')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl"><ListVideo className="w-10 h-10 mx-auto mb-2 opacity-20" /><p className="text-sm">No videos in this playlist yet.</p></div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <button onClick={() => handleDelete(selectedPlaylist.id, 'playlist')} className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors">Delete Playlist Only</button>
                            <div className="flex gap-3">
                                <button onClick={() => handleDeleteSeries(selectedPlaylist)} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors"><Trash2 className="w-4 h-4" /> Delete All</button>
                                <button onClick={() => handleEdit(selectedPlaylist.id, 'playlist')} className="px-6 py-2 bg-brand-gold text-white text-xs font-bold rounded-lg hover:bg-brand-brown-dark transition-colors shadow-sm">Edit Playlist</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VIDEO DETAILS MODAL --- */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-brand-brown-dark px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-agency text-xl">Video Details</h3>
                            <button onClick={() => setSelectedVideo(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md">
                                <iframe src={`https://www.youtube.com/embed/${selectedVideo.videoId}`} title="Preview" className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
                            </div>
                            <div dir={getDir(selectedVideo.title)}>
                                <h4 className="font-bold text-lg text-brand-brown-dark">{selectedVideo.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{selectedVideo.description || "No description provided."}</p>
                            </div>
                            <div className="flex gap-4 text-xs font-mono text-gray-400 border-t border-gray-100 pt-3">
                                <span>{selectedVideo.category}</span><span>•</span><span>{selectedVideo.date}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => handleDelete(selectedVideo.id, 'video')} className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                            <button onClick={() => handleEdit(selectedVideo.id, 'video')} className="px-6 py-2 bg-brand-gold text-white font-bold text-sm rounded-lg hover:bg-brand-brown-dark transition-colors shadow-sm">Edit Video</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Video Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Manage your library, playlists, and lecture series.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-center shadow-sm min-w-[80px]">
                        <span className="block text-lg font-bold text-brand-gold">{totalItems}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
                    </div>
                    {activeTab === 'videos' ? (
                        <Link href="/admin/videos/new" className="flex items-center gap-2 px-5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md h-full"><PlusCircle className="w-4 h-4" /> Upload Video</Link>
                    ) : (
                        <Link href="/admin/videos/playlists/new" className="flex items-center gap-2 px-5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md h-full"><ListVideo className="w-4 h-4" /> Create Playlist</Link>
                    )}
                </div>
            </div>

            {/* --- FILTERS TOOLBAR --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    <button onClick={() => { setActiveTab('videos'); setSearchTerm(''); }} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'videos' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'}`}><PlayCircle className="w-4 h-4" /> Videos</button>
                    <button onClick={() => { setActiveTab('playlists'); setSearchTerm(''); }} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'playlists' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'}`}><LayoutList className="w-4 h-4" /> Playlists</button>
                </div>
                <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
                    <div className="relative flex-1 sm:flex-none sm:w-40 min-w-[160px]">
                        <CustomSelect options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} icon={Filter} placeholder="Category" />
                    </div>
                    <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"><ArrowUpDown className="w-4 h-4" /> <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span></button>
                    <div className="relative flex-grow sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                    </div>
                </div>
            </div>

            {/* --- LIST VIEW --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 scale-75"><LogoReveal /></div>
                ) : (
                    <>
                        {/* VIDEOS LIST */}
                        {activeTab === 'videos' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
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
                                            <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400">No videos found.</td></tr>
                                        ) : (
                                            filteredContent.map((video) => (
                                                <tr key={video.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                                                                <Image src={video.thumbnail || "/fallback.webp"} alt={video.title} fill className="object-cover opacity-80" />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors"><PlayCircle className="w-4 h-4 text-white opacity-80" /></div>
                                                            </div>
                                                            <h3 className={`font-bold text-brand-brown-dark text-sm min-w-[150px] group-hover:text-brand-gold transition-colors ${getDir(video.title) === 'rtl' ? 'font-tajawal' : ''}`}>{video.title}</h3>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${video.category === 'English' ? 'bg-blue-100 text-blue-700' : video.category === 'Hausa' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{video.category}</span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        {video.playlist ? <span className="text-xs font-bold text-brand-brown bg-brand-sand px-2 py-1 rounded-md border border-brand-gold/20">{video.playlist}</span> : <span className="text-xs text-gray-400">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => setSelectedVideo(video)} className="p-2 text-gray-400 hover:text-brand-brown-dark bg-gray-100 rounded-lg"><Eye className="w-4 h-4" /></button>
                                                            <button onClick={() => handleEdit(video.id, 'video')} className="p-2 text-gray-400 hover:text-brand-gold bg-gray-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(video.id, 'video')} className="p-2 text-gray-400 hover:text-red-600 bg-gray-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* PLAYLISTS GRID */}
                        {activeTab === 'playlists' && (
                            <div className="p-6">
                                {filteredContent.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400"><LayoutList className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No playlists found.</p></div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredContent.map((list) => (
                                            <div key={list.id} onClick={() => setSelectedPlaylist(list)} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30 cursor-pointer bg-white">
                                                <div className="relative w-full aspect-video bg-gray-100">
                                                    <Image src={list.cover || "/fallback.webp"} alt={list.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                                    <div className="absolute top-2 left-2 flex gap-1"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${list.category === 'English' ? 'bg-blue-600 text-white' : list.category === 'Hausa' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>{list.category}</span></div>
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full border border-white/20">View Details</span></div>
                                                </div>
                                                <div className="p-4" dir={getDir(list.title)}>
                                                    <div className="flex justify-between items-start gap-4" dir="ltr">
                                                        <div className="flex-grow">
                                                            <h3 className={`font-agency text-lg text-brand-brown-dark leading-tight line-clamp-2 mb-2 ${getDir(list.title) === 'rtl' ? 'font-tajawal font-bold' : ''}`}>{list.title}</h3>
                                                            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                                <span className="flex items-center gap-1 text-brand-gold"><ListVideo className="w-3 h-3" /> {list.realCount} Videos</span>
                                                                <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {formatUploadTime(list.createdAt).split('•')[0]}</span>
                                                            </div>
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

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-sm font-bold text-gray-500">Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

        </div>
    );
}
