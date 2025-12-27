"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

import { 
    PlusCircle, 
    Search, 
    Edit, 
    Trash2, 
    Mic, 
    LayoutGrid, 
    List,
    Loader2
} from 'lucide-react';

export default function ManagePodcastsPage() {

    const [activeTab, setActiveTab] = useState('episodes'); // 'episodes' or 'shows'
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [episodes, setEpisodes] = useState([]);
    const [shows, setShows] = useState([]);

    // 1. FETCH DATA (Real-time)
    useEffect(() => {
        setIsLoading(true);

        // Fetch Episodes
        const qEpisodes = query(collection(db, "podcasts"), orderBy("createdAt", "desc"));
        const unsubEpisodes = onSnapshot(qEpisodes, (snapshot) => {
            setEpisodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Shows
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

    // 2. HANDLE DELETE
    const handleDelete = async (id, type) => {
        if (!confirm(`Are you sure you want to delete this ${type}? This cannot be undone.`)) return;

        try {
            if (type === 'episode') {
                await deleteDoc(doc(db, "podcasts", id));
            } else {
                await deleteDoc(doc(db, "podcast_shows", id));
            }
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete.");
        }
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

            {/* 2. TABS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('episodes')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'episodes' 
                            ? 'bg-white text-brand-brown-dark shadow-sm' 
                            : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <List className="w-4 h-4" /> Episodes
                    </button>
                    <button 
                        onClick={() => setActiveTab('shows')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'shows' 
                            ? 'bg-white text-brand-brown-dark shadow-sm' 
                            : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" /> Shows
                    </button>
                </div>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder={`Search ${activeTab}...`} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                </div>
            </div>

            {/* 3. CONTENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
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
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Show</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {episodes.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No episodes uploaded yet.</td></tr>
                                        ) : (
                                            episodes.map((ep) => (
                                                <tr key={ep.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                                <Image src={ep.thumbnail || "/fallback.webp"} alt={ep.title} fill className="object-cover" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1">{ep.title}</h3>
                                                                <p className="text-xs text-gray-400">EP {ep.episodeNumber || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-medium text-brand-brown bg-brand-sand/30 px-2 py-1 rounded">
                                                            {ep.show}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{ep.date}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Published
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(ep.id, 'episode')} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
                                {shows.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No shows created yet. Click "Create Show" to start.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {shows.map((show) => (
                                            <div key={show.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30 flex gap-4 p-4 items-center bg-brand-sand/10">
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                                                    <Image src={show.cover || "/fallback.webp"} alt={show.title} fill className="object-cover" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-agency text-lg text-brand-brown-dark leading-none mb-1">{show.title}</h3>
                                                    <p className="text-xs text-gray-500 mb-2">{show.host}</p>
                                                    <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full font-bold text-brand-gold">
                                                        {show.count || 0} Episodes
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button onClick={() => handleDelete(show.id, 'show')} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3 h-3" /></button>
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