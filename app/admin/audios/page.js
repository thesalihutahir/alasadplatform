"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

import { 
    PlusCircle, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Play, 
    Music,
    Download,
    ListMusic,
    LayoutList,
    MoreVertical,
    Mic,
    Loader2,
    X,
    Image as ImageIcon
} from 'lucide-react';

export default function ManageAudiosPage() {

    // State for Tabs
    const [activeTab, setActiveTab] = useState('audios'); // 'audios' or 'series'
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [audios, setAudios] = useState([]);
    const [audioSeries, setAudioSeries] = useState([]);

    // --- CREATE SERIES MODAL STATE ---
    // (Wait.. did we say we will do a separate page for this too? Let's stick to the consistent pattern if so.
    //  For now, I will keep the modal logic inline here as we haven't built a separate page for Series creation yet, 
    //  but I can easily switch it to a Link if you prefer consistency with Videos.)
    
    // Let's use a Modal here for simplicity as Series creation is just a title/category usually.
    const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
    const [isCreatingSeries, setIsCreatingSeries] = useState(false);
    const [newSeries, setNewSeries] = useState({
        title: '',
        category: 'General',
        cover: '/hero.jpg' // Default cover for audio series
    });

    // 1. FETCH AUDIOS & SERIES
    useEffect(() => {
        setIsLoading(true);

        // Fetch Audios
        const qAudios = query(collection(db, "audios"), orderBy("createdAt", "desc"));
        const unsubAudios = onSnapshot(qAudios, (snapshot) => {
            setAudios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Series
        const qSeries = query(collection(db, "audio_series"), orderBy("createdAt", "desc"));
        const unsubSeries = onSnapshot(qSeries, (snapshot) => {
            const seriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Calculate counts locally for now
            // (In a real app, you might increment a counter on the doc, but this works fine for <1000 items)
            // We need the audios loaded to count properly, but this runs in parallel. 
            // For simple display, we can just use the length of the filtered array in the render.
            setAudioSeries(seriesData);
            setIsLoading(false);
        });

        return () => {
            unsubAudios();
            unsubSeries();
        };
    }, []);

    // 2. HANDLE CREATE SERIES
    const handleSaveSeries = async (e) => {
        e.preventDefault();
        setIsCreatingSeries(true);

        try {
            if(!newSeries.title) {
                alert("Please enter a series title.");
                setIsCreatingSeries(false);
                return;
            }

            await addDoc(collection(db, "audio_series"), {
                ...newSeries,
                count: 0,
                status: "Active",
                createdAt: serverTimestamp()
            });

            alert("Audio Series created successfully!");
            setIsSeriesModalOpen(false);
            setNewSeries({ title: '', category: 'General', cover: '/hero.jpg' });

        } catch (error) {
            console.error("Error creating series:", error);
            alert("Failed to create series.");
        } finally {
            setIsCreatingSeries(false);
        }
    };

    // 3. HANDLE DELETE
    const handleDelete = async (id, type) => {
        if (!confirm(`Are you sure you want to delete this ${type}? This cannot be undone.`)) return;

        try {
            if (type === 'audio') {
                await deleteDoc(doc(db, "audios", id));
            } else {
                await deleteDoc(doc(db, "audio_series", id));
            }
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete.");
        }
    };

    // Helper to count tracks in a series
    const getSeriesCount = (seriesTitle) => {
        return audios.filter(a => a.series === seriesTitle).length;
    };

    return (
        <div className="space-y-6 relative">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Audio Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Upload and manage MP3 lectures, sermons, and series.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'audios' ? (
                        <Link 
                            href="/admin/audios/new" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Upload Audio
                        </Link>
                    ) : (
                        <button 
                            onClick={() => setIsSeriesModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md"
                        >
                            <ListMusic className="w-4 h-4" />
                            Create Series
                        </button>
                    )}
                </div>
            </div>

            {/* 2. TABS & FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('audios')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'audios' 
                            ? 'bg-white text-brand-brown-dark shadow-sm' 
                            : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <Music className="w-4 h-4" /> All Tracks
                    </button>
                    <button 
                        onClick={() => setActiveTab('series')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'series' 
                            ? 'bg-white text-brand-brown-dark shadow-sm' 
                            : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <ListMusic className="w-4 h-4" /> Series & Sets
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
            </div>

            {/* 3. CONTENT AREA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* --- AUDIOS VIEW --- */}
                        {activeTab === 'audios' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title / Speaker</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Series</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Specs</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {audios.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                                    No audio tracks uploaded yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            audios.map((audio) => (
                                                <tr key={audio.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                                <Play className="w-4 h-4 ml-0.5 fill-current" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1 max-w-[200px]">{audio.title}</h3>
                                                                <p className="text-xs text-gray-400">{audio.speaker}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {audio.series ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-brand-brown font-medium bg-brand-sand/30 px-2 py-1 rounded-md">
                                                                <ListMusic className="w-3 h-3 text-brand-brown-dark" />
                                                                {audio.series}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Single Track</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs text-gray-600 font-mono">
                                                            {audio.fileSize || 'Unknown Size'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {audio.date}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                            Published
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <a 
                                                                href={audio.audioUrl} 
                                                                target="_blank" 
                                                                download
                                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                            <button 
                                                                onClick={() => handleDelete(audio.id, 'audio')} 
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
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

                        {/* --- SERIES VIEW --- */}
                        {activeTab === 'series' && (
                            <div className="p-6">
                                {audioSeries.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No series created yet. Click "Create Series" to start.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {audioSeries.map((series) => (
                                            <div key={series.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30">
                                                {/* Cover - Square for Audio */}
                                                <div className="relative w-full aspect-square bg-gray-100">
                                                    <Image src={series.cover || "/hero.jpg"} alt={series.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="px-4 py-2 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/50 hover:bg-brand-gold hover:border-brand-gold transition-colors">
                                                            Manage Tracks
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                                        <Mic className="w-3 h-3" /> {getSeriesCount(series.title)}
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded">
                                                            {series.category}
                                                        </span>
                                                        <button className="text-gray-400 hover:text-brand-brown-dark"><MoreVertical className="w-4 h-4" /></button>
                                                    </div>
                                                    <h3 className="font-agency text-lg text-brand-brown-dark leading-tight mb-2 line-clamp-2 h-10">
                                                        {series.title}
                                                    </h3>
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2">
                                                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded font-bold uppercase">{series.status}</span>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleDelete(series.id, 'series')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
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

            {/* --- CREATE SERIES MODAL --- */}
            {isSeriesModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-agency text-xl text-brand-brown-dark">Create Audio Series</h3>
                            <button onClick={() => setIsSeriesModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSeries} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Series Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newSeries.title}
                                    onChange={(e) => setNewSeries({...newSeries, title: e.target.value})}
                                    placeholder="e.g. Tafsir Surah Yasin" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Category</label>
                                <select 
                                    value={newSeries.category}
                                    onChange={(e) => setNewSeries({...newSeries, category: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                >
                                    <option>General</option>
                                    <option>Tafsir</option>
                                    <option>Seerah</option>
                                    <option>Fiqh</option>
                                    <option>Ramadan</option>
                                </select>
                            </div>
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isCreatingSeries}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-md disabled:opacity-50"
                                >
                                    {isCreatingSeries ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isCreatingSeries ? 'Creating...' : 'Create Series'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
