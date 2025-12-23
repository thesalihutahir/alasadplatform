"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    Mic
} from 'lucide-react';

export default function ManageAudiosPage() {

    // State for Tabs
    const [activeTab, setActiveTab] = useState('audios'); // 'audios' or 'series'

    // Mock Data: Audio Series (Playlists)
    const [audioSeries, setAudioSeries] = useState([
        {
            id: 1,
            title: "Tafsir Surah Yasin (Complete)",
            count: 12,
            category: "Tafsir",
            status: "Completed",
            cover: "/hero.jpg"
        },
        {
            id: 2,
            title: "Ramadan Daily Reminders",
            count: 29,
            category: "General",
            status: "Active",
            cover: "/hero.jpg"
        }
    ]);

    // Mock Data: Audios
    const [audios, setAudios] = useState([
        { 
            id: 1, 
            title: "Khutbah: The Rights of Neighbors", 
            speaker: "Sheikh Muneer Ja'afar",
            category: "Friday Sermon", 
            series: "-", // No Series
            date: "22 Dec 2024", 
            duration: "25:00",
            size: "12 MB",
            status: "Published"
        },
        { 
            id: 2, 
            title: "Tafsir Surah Yasin - Part 4", 
            speaker: "Sheikh Muneer Ja'afar",
            category: "Tafsir", 
            series: "Tafsir Surah Yasin", // Linked Series
            date: "15 Dec 2024", 
            duration: "55:30",
            size: "45 MB",
            status: "Published"
        },
        { 
            id: 3, 
            title: "Fiqh of Fasting (Ramadan Prep)", 
            speaker: "Ustaz Ibrahim",
            category: "Fiqh Class", 
            series: "Ramadan Daily Reminders",
            date: "10 Mar 2024", 
            duration: "40:15",
            size: "32 MB",
            status: "Draft"
        },
    ]);

    // Handle Delete
    const handleDelete = (id, type) => {
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            if (type === 'audio') {
                setAudios(audios.filter(a => a.id !== id));
            } else {
                setAudioSeries(audioSeries.filter(s => s.id !== id));
            }
        }
    };

    return (
        <div className="space-y-6">

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
                            onClick={() => alert("Open Create Series Modal")}
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
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
                                {audios.map((audio) => (
                                    <tr key={audio.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1">{audio.title}</h3>
                                                    <p className="text-xs text-gray-400">{audio.speaker}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {audio.series !== '-' ? (
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
                                                <span className="font-bold">{audio.duration}</span> • {audio.size}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {audio.date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                audio.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    audio.status === 'Published' ? 'bg-green-500' : 'bg-gray-400'
                                                }`}></span>
                                                {audio.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(audio.id, 'audio')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- SERIES VIEW --- */}
                {activeTab === 'series' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {audioSeries.map((series) => (
                                <div key={series.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30">
                                    {/* Cover - Square for Audio */}
                                    <div className="relative w-full aspect-square bg-gray-100">
                                        <Image src={series.cover} alt={series.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="px-4 py-2 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full border border-white/50 hover:bg-brand-gold hover:border-brand-gold transition-colors">
                                                Manage Tracks
                                            </button>
                                        </div>
                                        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                                            <Mic className="w-3 h-3" /> {series.count}
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
                                                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-3 h-3" /></button>
                                                <button onClick={() => handleDelete(series.id, 'series')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}
