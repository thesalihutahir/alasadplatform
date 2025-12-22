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
    ExternalLink,
    PlayCircle
} from 'lucide-react';

export default function ManageVideosPage() {

    // Mock Data
    const [videos, setVideos] = useState([
        { 
            id: 1, 
            title: "Understanding the Rights of Neighbors", 
            youtubeId: "BYdCnmAgvhs",
            category: "Lecture", 
            date: "22 Dec 2024", 
            views: "1.2k",
            status: "Live",
            thumbnail: "/hero.jpg" // In real app, fetching from YouTube API or manual upload
        },
        { 
            id: 2, 
            title: "Ramadan Tafsir - Day 29", 
            youtubeId: "dQw4w9WgXcQ",
            category: "Tafsir", 
            date: "10 Apr 2024", 
            views: "850",
            status: "Live",
            thumbnail: "/hero.jpg"
        },
        { 
            id: 3, 
            title: "Community Outreach Highlights 2024", 
            youtubeId: "Ks-_Mh1QhMc",
            category: "Event", 
            date: "15 Jan 2024", 
            views: "320",
            status: "Hidden",
            thumbnail: "/hero.jpg"
        },
    ]);

    // Handle Delete
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this video?")) {
            setVideos(videos.filter(v => v.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            
            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Video Library</h1>
                    <p className="font-lato text-sm text-gray-500">Manage YouTube links, lectures, and event highlights.</p>
                </div>
                <Link 
                    href="/admin/videos/new" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                >
                    <PlusCircle className="w-4 h-4" />
                    Add New Video
                </Link>
            </div>

            {/* 2. FILTERS & SEARCH */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search videos by title..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                        <option>All Categories</option>
                        <option>Lectures</option>
                        <option>Tafsir</option>
                        <option>Events</option>
                    </select>
                </div>
            </div>

            {/* 3. VIDEO TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Video</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">YouTube ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {videos.map((video) => (
                                <tr key={video.id} className="hover:bg-gray-50 transition-colors group">
                                    
                                    {/* Video Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black group-hover:ring-2 ring-brand-gold/50 transition-all">
                                                <Image src={video.thumbnail} alt={video.title} fill className="object-cover opacity-80" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <PlayCircle className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1 max-w-[180px]">{video.title}</h3>
                                                <p className="text-xs text-gray-400">{video.date}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                                            {video.category}
                                        </span>
                                    </td>

                                    {/* YouTube ID */}
                                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                        {video.youtubeId}
                                    </td>

                                    {/* Views */}
                                    <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                        {video.views} <span className="text-[10px] font-normal text-gray-400">views</span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            video.status === 'Live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                video.status === 'Live' ? 'bg-green-500' : 'bg-gray-400'
                                            }`}></span>
                                            {video.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <a 
                                                href={`https://youtube.com/watch?v=${video.youtubeId}`} 
                                                target="_blank" 
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Open on YouTube"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(video.id)}
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
