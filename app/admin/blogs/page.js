"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
// Global Modal & Loader
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/Loader'; 

import { 
    PlusCircle, Search, Edit, Trash2, 
    FileText, Bell, BookOpen, 
    Filter, X, ArrowUpDown, Calendar,
    Globe // Icon for Language
} from 'lucide-react';

export default function ManageBlogsPage() {
    const router = useRouter();
    const { showSuccess, showConfirm } = useModal(); 

    const [activeTab, setActiveTab] = useState('articles'); // 'articles', 'news', 'research'
    const [isLoading, setIsLoading] = useState(true);
    const [contentList, setContentList] = useState([]);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [languageFilter, setLanguageFilter] = useState('All'); // NEW: Language Filter
    const [sortOrder, setSortOrder] = useState('desc');

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // Helper: Format Date
    const formatDate = (timestamp) => {
        if (!timestamp) return <span className="text-gray-300 italic">...</span>;
        // Handle both Firestore Timestamp and Date string/object
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(date);
    };

    // 1. FETCH DATA BASED ON TAB
    useEffect(() => {
        setIsLoading(true);
        const collectionName = activeTab; // 'articles', 'news', 'research'
        
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setContentList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab]);

    // 2. PROCESS CONTENT (Filter & Sort)
    const filteredContent = contentList.filter(item => {
        const title = item.title || item.headline || item.researchTitle || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
        
        // News might not have language, so we handle that gracefully
        const itemLang = item.language || 'English'; 
        const matchesLanguage = languageFilter === 'All' || itemLang === languageFilter;

        return matchesSearch && matchesLanguage;
    }).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // 3. DELETE ACTION
    const handleDelete = (id) => {
        showConfirm({
            title: "Delete Content?",
            message: "This action cannot be undone.",
            type: 'danger',
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, activeTab, id));
                    showSuccess({ title: "Deleted", message: "Content removed successfully.", confirmText: "Okay" });
                } catch (error) {
                    console.error("Delete error:", error);
                    alert("Failed to delete.");
                }
            }
        });
    };

    // 4. EDIT ACTION
    const handleEdit = (id) => {
        // We pass the type as a query param so the edit page knows what layout to load
        router.push(`/admin/blogs/edit/${id}?type=${activeTab}`);
    };

    return (
        <div className="space-y-6 relative">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Content Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Manage articles, news, and research publications.</p>
                </div>
                <Link 
                    href="/admin/blogs/new" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                >
                    <PlusCircle className="w-4 h-4" /> Create New
                </Link>
            </div>

            {/* TABS & TOOLBAR */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button onClick={() => setActiveTab('articles')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'articles' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'}`}>
                        <FileText className="w-4 h-4" /> Articles
                    </button>
                    <button onClick={() => setActiveTab('news')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'news' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'}`}>
                        <Bell className="w-4 h-4" /> News
                    </button>
                    <button onClick={() => setActiveTab('research')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'research' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'}`}>
                        <BookOpen className="w-4 h-4" /> Research
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col w-full xl:w-auto gap-3">
                    <div className="flex flex-row gap-2 w-full">
                        {/* Language Filter */}
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="w-full md:w-40 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer">
                                <option value="All">All Langs</option>
                                <option value="English">English</option>
                                <option value="Hausa">Hausa</option>
                                <option value="Arabic">Arabic</option>
                            </select>
                        </div>
                        {/* Sort */}
                        <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors flex-1 md:flex-none">
                            <ArrowUpDown className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                    </div>
                </div>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64"><Loader /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lang</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredContent.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No content found.</td></tr>
                                ) : (
                                    filteredContent.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className={`font-bold text-brand-brown-dark text-sm line-clamp-1 ${getDir(item.title || item.headline) === 'rtl' ? 'font-tajawal' : ''}`}>
                                                    {item.title || item.headline || item.researchTitle}
                                                </p>
                                                {/* Sub-label */}
                                                <p className="text-xs text-gray-400">
                                                    {activeTab === 'research' ? item.authors : (item.category || formatDate(item.eventDate))}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    item.language === 'English' ? 'bg-blue-100 text-blue-700' :
                                                    item.language === 'Hausa' ? 'bg-green-100 text-green-700' : 
                                                    item.language === 'Arabic' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {item.language || 'English'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {activeTab === 'research' && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{item.researchType}</span>}
                                                {activeTab === 'articles' && <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded">{item.author}</span>}
                                                {activeTab === 'news' && <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {formatDate(item.eventDate)}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    item.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleEdit(item.id)} className="p-2 text-gray-400 hover:text-brand-gold"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
