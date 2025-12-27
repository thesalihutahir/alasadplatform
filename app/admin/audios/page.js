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
    Trash2, 
    Play, 
    Music,
    Download,
    ListMusic,
    MoreVertical,
    Mic,
    Loader2
} from 'lucide-react';

export default function ManageAudiosPage() {

    const [activeTab, setActiveTab] = useState('audios'); 
    const [isLoading, setIsLoading] = useState(true);

    const [audios, setAudios] = useState([]);
    const [audioSeries, setAudioSeries] = useState([]);

    useEffect(() => {
        setIsLoading(true);

        const qAudios = query(collection(db, "audios"), orderBy("createdAt", "desc"));
        const unsubAudios = onSnapshot(qAudios, (snapshot) => {
            setAudios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qSeries = query(collection(db, "audio_series"), orderBy("createdAt", "desc"));
        const unsubSeries = onSnapshot(qSeries, (snapshot) => {
            setAudioSeries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => {
            unsubAudios();
            unsubSeries();
        };
    }, []);

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
                        <Link 
                            href="/admin/audios/series/new"
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md"
                        >
                            <ListMusic className="w-4 h-4" />
                            Create Series
                        </Link>
                    )}
                </div>
            </div>

            {/* 2. TABS & FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('audios')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'audios' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <Music className="w-4 h-4" /> All Tracks
                    </button>
                    <button 
                        onClick={() => setActiveTab('series')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'series' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <ListMusic className="w-4 h-4" /> Series & Sets
                    </button>
                </div>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder={`Search ${activeTab}...`} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
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
                        {/* --- AUDIOS LIST --- */}
                        {activeTab === 'audios' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title / Speaker</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Series</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {audios.length === 0 ? (
                                            <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No audio tracks uploaded yet.</td></tr>
                                        ) : (
                                            audios.map((audio) => (
                                                <tr key={audio.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center flex-shrink-0">
                                                                <Play className="w-4 h-4 ml-0.5 fill-current" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1 max-w-[200px]">{audio.title}</h3>
                                                                <p className="text-xs text-gray-400">{audio.speaker}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs text-brand-brown bg-brand-sand/30 px-2 py-1 rounded-md">
                                                            {audio.series || 'Single Track'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{audio.date}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <a href={audio.audioUrl} target="_blank" download className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Download className="w-4 h-4" /></a>
                                                            <button onClick={() => handleDelete(audio.id, 'audio')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- SERIES GRID --- */}
                        {activeTab === 'series' && (
                            <div className="p-6">
                                {audioSeries.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No series created yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {audioSeries.map((series) => (
                                            <div key={series.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30">
                                                <div className="relative w-full aspect-square bg-gray-100">
                                                    <Image src={series.cover || "/fallback.webp"} alt={series.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                                        <Mic className="w-3 h-3" /> {getSeriesCount(series.title)}
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded">{series.category}</span>
                                                        <button onClick={() => handleDelete(series.id, 'series')} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                    <h3 className="font-agency text-lg text-brand-brown-dark leading-tight line-clamp-2">{series.title}</h3>
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
