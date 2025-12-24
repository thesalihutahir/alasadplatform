"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    PlusCircle, 
    Search, 
    Edit, 
    Trash2, 
    Play, 
    Headphones,
    Mic,
    LayoutGrid,
    List
} from 'lucide-react';

export default function ManagePodcastsPage() {

    const [activeTab, setActiveTab] = useState('episodes'); // 'episodes' or 'shows'

    // Mock Data: Shows (Series)
    const [shows, setShows] = useState([
        {
            id: 1,
            title: "The Young Believer",
            host: "Sheikh Muneer",
            count: 12,
            cover: "/hero.jpg"
        },
        {
            id: 2,
            title: "Faith & Finance",
            host: "Dr. Ahmed",
            count: 8,
            cover: "/hero.jpg"
        }
    ]);

    // Mock Data: Episodes
    const [episodes, setEpisodes] = useState([
        { 
            id: 1, 
            title: "Navigating Challenges as Muslim Youth", 
            show: "The Young Believer",
            ep: "05",
            date: "20 Dec 2024", 
            duration: "35:00",
            status: "Published",
            cover: "/hero.jpg"
        },
        { 
            id: 2, 
            title: "Business Ethics in the 21st Century", 
            show: "Faith & Finance", 
            ep: "12",
            date: "12 Dec 2024", 
            duration: "42:15",
            status: "Published",
            cover: "/hero.jpg"
        },
    ]);

    const handleDelete = (id, type) => {
        if (confirm(`Delete this ${type}?`)) {
            // Logic to delete
        }
    };

    return (
        <div className="space-y-6">

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
                        <button 
                            onClick={() => alert("Open Create Show Modal")}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md"
                        >
                            <Mic className="w-4 h-4" />
                            Create Show
                        </button>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* --- EPISODES VIEW --- */}
                {activeTab === 'episodes' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Episode</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Show</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {episodes.map((ep) => (
                                    <tr key={ep.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    <Image src={ep.cover} alt={ep.title} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1">{ep.title}</h3>
                                                    <p className="text-xs text-gray-400">EP {ep.ep}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-brand-brown bg-brand-sand/30 px-2 py-1 rounded">
                                                {ep.show}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-600 font-mono">{ep.duration}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{ep.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                {ep.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(ep.id, 'episode')} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- SHOWS VIEW --- */}
                {activeTab === 'shows' && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {shows.map((show) => (
                            <div key={show.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-brand-gold/30 flex gap-4 p-4 items-center bg-brand-sand/10">
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                                    <Image src={show.cover} alt={show.title} fill className="object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-agency text-lg text-brand-brown-dark leading-none mb-1">{show.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{show.host}</p>
                                    <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full font-bold text-brand-gold">
                                        {show.count} Episodes
                                    </span>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-brand-brown-dark"><Edit className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
