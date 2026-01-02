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
// Custom Loader
import Loader from '@/components/Loader'; 

import { 
    PlusCircle, Search, Edit, Trash2, Mic, LayoutGrid, 
    List, Loader2, Filter, X, ArrowUpDown, CalendarClock, Info
} from 'lucide-react';

export default function ManagePodcastsPage() {
    const router = useRouter();
    const { showSuccess, showConfirm } = useModal(); 

    const [activeTab, setActiveTab] = useState('episodes'); 
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [episodes, setEpisodes] = useState([]);
    const [shows, setShows] = useState([]);

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

    // 1. FETCH DATA (Real-time)
    useEffect(() => {
        setIsLoading(true);

        const qEpisodes = query(collection(db, "podcasts"), orderBy("createdAt", "desc"));
        const unsubEpisodes = onSnapshot(qEpisodes, (snapshot) => {
            setEpisodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qShows = query(collection(db, "podcast_shows"), orderBy("createdAt", "desc"));
        const unsubShows = onSnapshot(qShows, (snapshot) => {
            setShows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => {
            unsubEpisodes();
            unsubShows();
        };
    }, []);

    // 2. PROCESS CONTENT
    const getProcessedContent = () => {
        const term = searchTerm.toLowerCase();
        let content = [];

        if (activeTab === 'episodes') {
            content = episodes.filter(ep => {
                const matchesSearch = ep.title.toLowerCase().includes(term) || (ep.show && ep.show.toLowerCase().includes(term));
                // Assuming episodes don't have a direct 'category' field, we filter by 'show' or skip category filter for episodes
                // Or if episodes inherit category, logic goes here. For now, simple search.
                return matchesSearch;
            });
        } else {
            // Shows
            const showsWithCounts = shows.map(show => ({
                ...show,
                realCount: episodes.filter(ep => ep.show === show.title).length
            }));
            
            content = showsWithCounts.filter(show => {
                const matchesSearch = show.title.toLowerCase().includes(term) || show.host.toLowerCase().includes(term);
                const matchesCategory = categoryFilter === 'All' || show.category === categoryFilter;
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
        const message = type === 'show' 
            ? "Warning: Deleting this show will NOT delete the episodes inside it. They will become orphaned. Continue?"
            : "Are you sure you want to delete this episode? This cannot be undone.";

        showConfirm({
            title: `Delete ${type === 'show' ? 'Show' : 'Episode'}?`,
            message: message,
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            type: 'danger',
            onConfirm: async () => {
                try {
                    if (type === 'episode') await deleteDoc(doc(db, "podcasts", id));
                    else await deleteDoc(doc(db, "podcast_shows", id));
                    
                    showSuccess({ title: "Deleted!", message: "Item deleted successfully.", confirmText: "Okay" });
                } catch (error) {
                    console.error("Error deleting:", error);
                    alert("Failed to delete.");
                }
            }
        });
    };

    const handleEdit = (id, type) => {
        router.push(type === 'show' ? `/admin/podcasts/shows/edit/${id}` : `/admin/podcasts/edit/${id}`);
    };

    // Quick View Modal
    const handleQuickView = (item) => {
        showSuccess({
            title: "Quick Info",
            message: (
                <div className="text-left space-y-3 mt-2 text-sm">
                    <div dir={getDir(item.title)}>
                        <p className="text-xs font-bold text-gray-400 uppercase">Title</p>
                        <p className="font-bold text-brand-brown-dark">{item.title}</p>
                    </div>
                    {item.show && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Show</p>
                            <p className="font-medium">{item.show}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Published On</p>
                        <p className="font-medium">{formatUploadTime(item.createdAt)}</p>
                    </div>
                </div>
            ),
            confirmText: "Close"
        });
    };
    return (
        <div className="space-y-6 relative">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Podcast Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Manage shows, episodes, and audio streams.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'episodes' ? (
                        <Link 
                            href="/admin/podcasts/new" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                        >
                            <PlusCircle className="w-4 h-4" />
                            New Episode
                        </Link>
                    ) : (
                        <Link 
                            href="/admin/podcasts/shows/new"
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md"
                        >
                            <Mic className="w-4 h-4" />
                            Create Show
                        </Link>
                    )}
                </div>
            </div>

            {/* 2. TABS & FILTERS TOOLBAR */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button 
                        onClick={() => { setActiveTab('episodes'); setSearchTerm(''); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'episodes' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <List className="w-4 h-4" /> Episodes
                    </button>
                    <button 
                        onClick={() => { setActiveTab('shows'); setSearchTerm(''); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'shows' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" /> Shows
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col w-full xl:w-auto gap-3">
                    <div className="flex flex-row gap-2 w-full">
                        {/* Only Show Category Filter for Shows Tab */}
                        {activeTab === 'shows' && (
                            <div className="relative flex-1 md:flex-none">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                                <select 
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full md:w-40 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                                >
                                    <option value="All">All</option>
                                    <option value="General">General</option>
                                    <option value="Tafsir">Tafsir</option>
                                    <option value="Interviews">Interviews</option>
                                </select>
                            </div>
                        )}
                        
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
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                    </div>
                </div>
            </div>

            {/* 3. CONTENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {/* --- EPISODES VIEW --- */}
                        {activeTab === 'episodes' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Episode</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Show</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredContent.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No episodes found.</td></tr>
                                        ) : (
                                            filteredContent.map((ep) => (
                                                <tr key={ep.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer" onClick={() => handleQuickView(ep)}>
                                                                <Image src={ep.thumbnail || "/fallback.webp"} alt={ep.title} fill className="object-cover" />
                                                            </div>
                                                            <div className="min-w-[150px]">
                                                                <h3 
                                                                    className={`font-bold text-brand-brown-dark text-sm cursor-pointer hover:text-brand-gold ${getDir(ep.title) === 'rtl' ? 'font-tajawal' : ''}`}
                                                                    onClick={() => handleQuickView(ep)}
                                                                >
                                                                    {ep.title}
                                                                </h3>
                                                                <p className="text-[10px] text-gray-400 font-bold">EP {ep.episodeNumber || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        {ep.show ? (
                                                            <span className="text-xs font-bold text-brand-brown bg-brand-sand/30 px-2 py-1 rounded">
                                                                {ep.show}
                                                            </span>
                                                        ) : <span className="text-xs text-gray-400">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                                        {formatUploadTime(ep.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => handleQuickView(ep)} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg md:hidden"><Info className="w-4 h-4" /></button>
                                                            <button onClick={() => handleEdit(ep.id, 'episode')} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(ep.id, 'episode')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- SHOWS VIEW --- */}
                        {activeTab === 'shows' && (
                            <div className="p-6">
                                {filteredContent.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No shows found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredContent.map((show) => (
                                            <div key={show.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30 flex gap-4 p-4 items-center bg-brand-sand/10 cursor-pointer" onClick={() => handleEdit(show.id, 'show')}>
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md border border-white">
                                                    <Image src={show.cover || "/fallback.webp"} alt={show.title} fill className="object-cover" />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h3 className="font-agency text-lg text-brand-brown-dark leading-none mb-1 truncate">{show.title}</h3>
                                                    <p className="text-xs text-gray-500 mb-2 truncate">{show.host}</p>
                                                    <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full font-bold text-brand-gold">
                                                        {show.realCount} Episodes
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(show.id, 'show'); }} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-white rounded-lg">
                                                        <Edit className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(show.id, 'show'); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
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
