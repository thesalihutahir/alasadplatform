"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
// Global Modal & Loader
import { useModal } from '@/context/ModalContext';
import LogoReveal from '@/components/logo-reveal';

import { 
    PlusCircle, Search, Edit, Trash2, 
    FileText, Bell, BookOpen, 
    Filter, X, ArrowUpDown, Calendar,
    Globe, ChevronDown, Check, Eye, User, Layers
} from 'lucide-react';

// --- CUSTOM DROPDOWN COMPONENT ---
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
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 min-w-[140px]">
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

export default function ManageBlogsPage() {
    const router = useRouter();
    const { showSuccess, showConfirm } = useModal(); 

    const [activeTab, setActiveTab] = useState('articles'); 
    const [isLoading, setIsLoading] = useState(true);
    const [contentList, setContentList] = useState([]);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [languageFilter, setLanguageFilter] = useState('All'); 
    const [sortOrder, setSortOrder] = useState('desc');

    // Modal State
    const [viewItem, setViewItem] = useState(null);

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // Helper: Format Date
    const formatDate = (timestamp) => {
        if (!timestamp) return <span className="text-gray-300 italic">...</span>;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return new Intl.DateTimeFormat('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(date);
    };

    // 1. FETCH DATA BASED ON TAB
    useEffect(() => {
        setIsLoading(true);
        const collectionName = activeTab; 
        
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setContentList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab]);

    // 2. PROCESS CONTENT
    const filteredContent = contentList.filter(item => {
        const title = item.title || item.headline || item.researchTitle || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
        
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
                    if(viewItem) setViewItem(null); // Close modal if open
                } catch (error) {
                    console.error("Delete error:", error);
                    alert("Failed to delete.");
                }
            }
        });
    };

    // 4. EDIT ACTION
    const handleEdit = (id) => {
        router.push(`/admin/blogs/edit/${id}?type=${activeTab}`);
    };

    const languageOptions = [
        { value: "All", label: "All Langs" },
        { value: "English", label: "English" },
        { value: "Hausa", label: "Hausa" },
        { value: "Arabic", label: "Arabic" }
    ];
return (
        <div className="space-y-6 relative max-w-full overflow-hidden pb-12">
            
            {/* HEADER & COUNTER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Content Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Manage articles, news, and research publications.</p>
                </div>
                
                {/* Updated Action Bar with Flex Stretch */}
                <div className="flex gap-2 h-10">
                    <div className="bg-white border border-gray-100 px-4 rounded-xl text-center shadow-sm min-w-[80px] flex flex-col justify-center h-full">
                        <span className="block text-lg font-bold text-brand-gold leading-none">{contentList.length}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider leading-none mt-0.5">Total</span>
                    </div>

                    <Link 
                        href="/admin/blogs/new" 
                        className="flex items-center justify-center gap-2 px-5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md h-full"
                    >
                        <PlusCircle className="w-4 h-4" /> Create New
                    </Link>
                </div>
            </div>

            {/* TABS & TOOLBAR */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                
                {/* Tabs */}
                <div className="flex w-full xl:w-auto bg-gray-50 p-1 rounded-lg overflow-x-auto scrollbar-hide">
                    {['articles', 'news', 'research'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold transition-all capitalize whitespace-nowrap ${
                                activeTab === tab ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                            }`}
                        >
                            {tab === 'articles' && <FileText className="w-3 h-3" />}
                            {tab === 'news' && <Bell className="w-3 h-3" />}
                            {tab === 'research' && <BookOpen className="w-3 h-3" />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0 min-w-[140px]">
                            <CustomSelect 
                                options={languageOptions} 
                                value={languageFilter} 
                                onChange={setLanguageFilter} 
                                icon={Filter}
                                placeholder="Language"
                            />
                        </div>
                        <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="flex items-center justify-center px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                            <ArrowUpDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search title..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                    </div>
                </div>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64"><LogoReveal /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-5/12">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lang</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredContent.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No content found.</td></tr>
                                ) : (
                                    filteredContent.map((item) => (
                                        <tr 
                                            key={item.id} 
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            onClick={() => setViewItem(item)}
                                        >
                                            <td className="px-6 py-4">
                                                <p className={`font-bold text-brand-brown-dark text-sm line-clamp-2 md:line-clamp-1 ${getDir(item.title || item.headline) === 'rtl' ? 'font-tajawal' : ''}`}>
                                                    {item.title || item.headline || item.researchTitle}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 md:hidden">
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
                                            <td className="px-6 py-4 text-xs text-gray-500 hidden md:table-cell">
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
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setViewItem(item)} className="p-2 text-gray-400 hover:text-brand-brown-dark bg-gray-50 sm:bg-transparent rounded-lg"><Eye className="w-4 h-4" /></button>
                                                    <button onClick={() => handleEdit(item.id)} className="p-2 text-gray-400 hover:text-brand-gold bg-gray-50 sm:bg-transparent rounded-lg"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 sm:bg-transparent rounded-lg"><Trash2 className="w-4 h-4" /></button>
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

            {/* --- VIEW DETAILS MODAL --- */}
            {viewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-brand-brown-dark px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
                            <h3 className="font-agency text-xl capitalize">{activeTab} Details</h3>
                            <button onClick={() => setViewItem(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div>
                                <h2 className={`text-2xl font-bold text-gray-800 mb-2 ${getDir(viewItem.title || viewItem.headline || viewItem.researchTitle) === 'rtl' ? 'font-tajawal text-right' : ''}`}>
                                    {viewItem.title || viewItem.headline || viewItem.researchTitle}
                                </h2>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1"><Globe className="w-4 h-4 text-brand-gold" /> {viewItem.language}</div>
                                    <div className="flex items-center gap-1"><Layers className="w-4 h-4 text-brand-gold" /> {viewItem.category || viewItem.researchType || 'News'}</div>
                                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-brand-gold" /> {formatDate(viewItem.eventDate || viewItem.createdAt)}</div>
                                    {viewItem.author && <div className="flex items-center gap-1"><User className="w-4 h-4 text-brand-gold" /> {viewItem.author}</div>}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Excerpt</h4>
                                <p className={`text-sm text-gray-600 leading-relaxed italic ${getDir(viewItem.excerpt) === 'rtl' ? 'font-tajawal text-right' : ''}`}>{viewItem.excerpt || "No excerpt available."}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Full Content</h4>
                                <div className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${getDir(viewItem.content || viewItem.body) === 'rtl' ? 'font-tajawal text-right' : ''}`}>
                                    {viewItem.content || viewItem.body}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                            <button onClick={() => handleDelete(viewItem.id)} className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                            <button onClick={() => handleEdit(viewItem.id)} className="px-6 py-2 bg-brand-gold text-white font-bold text-sm rounded-lg hover:bg-brand-brown-dark transition-colors shadow-sm">Edit Content</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}