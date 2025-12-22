"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    PlusCircle, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Play, 
    Music,
    Download
} from 'lucide-react';

export default function ManageAudiosPage() {

    // Mock Data
    const [audios, setAudios] = useState([
        { 
            id: 1, 
            title: "Khutbah: The Rights of Neighbors", 
            speaker: "Sheikh Muneer Ja'afar",
            category: "Friday Sermon", 
            date: "22 Dec 2024", 
            duration: "25:00",
            size: "12 MB",
            status: "Published"
        },
        { 
            id: 2, 
            title: "Tafsir Surah Yasin - Part 4", 
            speaker: "Sheikh Muneer Ja'afar",
            category: "Tafsir Series", 
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
            date: "10 Mar 2024", 
            duration: "40:15",
            size: "32 MB",
            status: "Draft"
        },
    ]);

    // Handle Delete
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this audio file?")) {
            setAudios(audios.filter(a => a.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            
            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Audio Library</h1>
                    <p className="font-lato text-sm text-gray-500">Upload and manage MP3 lectures, sermons, and series.</p>
                </div>
                <Link 
                    href="/admin/audios/new" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                >
                    <PlusCircle className="w-4 h-4" />
                    Upload New Audio
                </Link>
            </div>

            {/* 2. FILTERS & SEARCH */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by title or speaker..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                        <option>All Categories</option>
                        <option>Friday Khutbah</option>
                        <option>Tafsir Series</option>
                        <option>Fiqh Classes</option>
                    </select>
                </div>
            </div>

            {/* 3. AUDIO TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title / Speaker</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tech Specs</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {audios.map((audio) => (
                                <tr key={audio.id} className="hover:bg-gray-50 transition-colors group">
                                    
                                    {/* Title & Speaker */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                                                <Play className="w-4 h-4 ml-0.5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1">{audio.title}</h3>
                                                <p className="text-xs text-gray-400">{audio.speaker}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-6 py-4">
                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-purple-100">
                                            {audio.category}
                                        </span>
                                    </td>

                                    {/* Tech Specs (Duration/Size) */}
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-600 font-mono">
                                            <span className="font-bold">{audio.duration}</span> • {audio.size}
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {audio.date}
                                    </td>

                                    {/* Status */}
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

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download Source">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(audio.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
