"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, writeBatch, where, getDocs } from 'firebase/firestore';
// Global Modal Context
import { useModal } from '@/context/ModalContext';
// Custom Loader
import Loader from '@/components/Loader'; 

import { 
    PlusCircle, Search, Edit, Trash2, Book, Library, 
    FileText, Download, Loader2, Filter, X, ArrowUpDown, 
    CalendarClock, Info, ChevronRight, AlertTriangle
} from 'lucide-react';

export default function ManageEbooksPage() {
    const router = useRouter();
    const { showSuccess, showConfirm } = useModal(); 

    const [activeTab, setActiveTab] = useState('books'); 
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [books, setBooks] = useState([]);
    const [collections, setCollections] = useState([]);

    // Modal State
    const [selectedCollection, setSelectedCollection] = useState(null);

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All'); // Acts as Language Filter
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

    // 1. FETCH DATA
    useEffect(() => {
        setIsLoading(true);

        const qBooks = query(collection(db, "ebooks"), orderBy("createdAt", "desc"));
        const unsubBooks = onSnapshot(qBooks, (snapshot) => {
            setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qCollections = query(collection(db, "ebook_collections"), orderBy("createdAt", "desc"));
        const unsubCollections = onSnapshot(qCollections, (snapshot) => {
            setCollections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => {
            unsubBooks();
            unsubCollections();
        };
    }, []);

    // 2. PROCESS CONTENT
    const getProcessedContent = () => {
        const term = searchTerm.toLowerCase();
        let content = [];

        if (activeTab === 'books') {
            content = books.filter(book => {
                const matchesSearch = 
                    book.title.toLowerCase().includes(term) || 
                    (book.collection && book.collection.toLowerCase().includes(term));
                // Filter by Book Language
                const matchesCategory = categoryFilter === 'All' || book.language === categoryFilter;
                return matchesSearch && matchesCategory;
            });
        } else {
            // Collections
            const collectionsWithCounts = collections.map(col => ({
                ...col,
                realCount: books.filter(b => b.collection === col.title).length
            }));
            content = collectionsWithCounts.filter(col => {
                const matchesSearch = col.title.toLowerCase().includes(term);
                // Filter by Collection Category (Language)
                const matchesCategory = categoryFilter === 'All' || col.category === categoryFilter;
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
        const message = type === 'collection' 
            ? "Warning: Deleting this collection will NOT delete the books inside it (they will become 'Standalone'). Continue?"
            : "Are you sure you want to delete this book? This cannot be undone.";

        showConfirm({
            title: `Delete ${type === 'collection' ? 'Collection' : 'Book'}?`,
            message: message,
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            type: 'danger', 
            onConfirm: async () => {
                try {
                    if (type === 'book') await deleteDoc(doc(db, "ebooks", id));
                    else await deleteDoc(doc(db, "ebook_collections", id));
                    
                    showSuccess({ title: "Deleted!", message: "Item deleted successfully.", confirmText: "Okay" });
                } catch (error) {
                    console.error("Error deleting:", error);
                    alert("Failed to delete.");
                }
            }
        });
    };

    // SPECIAL: Delete Entire Collection + Books
    const handleDeleteCollection = (targetCollection) => {
        showConfirm({
            title: "Delete ENTIRE Collection?",
            message: `DANGER: This will delete the collection "${targetCollection.title}" AND ALL ${targetCollection.realCount} books inside it. This cannot be undone.`,
            confirmText: "Yes, Delete Everything",
            cancelText: "Cancel",
            type: 'danger',
            onConfirm: async () => {
                try {
                    const q = query(collection(db, "ebooks"), where("collection", "==", targetCollection.title));
                    const snapshot = await getDocs(q);

                    const batch = writeBatch(db);
                    const colRef = doc(db, "ebook_collections", targetCollection.id);
                    batch.delete(colRef);

                    snapshot.docs.forEach((doc) => {
                        batch.delete(doc.ref);
                    });

                    await batch.commit();
                    
                    setSelectedCollection(null);
                    showSuccess({ title: "Collection Deleted", message: "The collection and all its books were deleted.", confirmText: "Done" });

                } catch (error) {
                    console.error("Error deleting collection:", error);
                    alert("Failed to delete collection.");
                }
            }
        });
    };

    const handleEdit = (id, type) => {
        router.push(type === 'collection' ? `/admin/ebooks/collections/edit/${id}` : `/admin/ebooks/edit/${id}`);
    };

    // Quick View Modal
    const handleQuickView = (item) => {
        showSuccess({
            title: "Book Info",
            message: (
                <div className="text-left space-y-3 mt-2 text-sm">
                    <div dir={getDir(item.title)}>
                        <p className="text-xs font-bold text-gray-400 uppercase">Title</p>
                        <p className="font-bold text-brand-brown-dark">{item.title}</p>
                    </div>
                    {item.collection && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Collection</p>
                            <p className="font-medium">{item.collection}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Uploaded On</p>
                        <p className="font-medium">{formatUploadTime(item.createdAt)}</p>
                    </div>
                    {item.fileSize && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">File Size</p>
                            <p className="font-medium">{item.fileSize}</p>
                        </div>
                    )}
                </div>
            ),
            confirmText: "Close"
        });
    };
return (
        <div className="space-y-6 relative">

            {/* --- COLLECTION DETAILS MODAL --- */}
            {selectedCollection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div className="flex gap-4">
                                <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 shadow-sm border border-white">
                                    <Image src={selectedCollection.cover || "/fallback.webp"} alt="Cover" fill className="object-cover" />
                                </div>
                                <div dir={getDir(selectedCollection.title)}>
                                    <h3 className="font-agency text-2xl text-brand-brown-dark leading-none mb-2">{selectedCollection.title}</h3>
                                    <div className="flex gap-2" dir="ltr">
                                        <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase rounded-md">
                                            {selectedCollection.category}
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md">
                                            {selectedCollection.realCount} Books
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCollection(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {books.filter(b => b.collection === selectedCollection.title).length > 0 ? (
                                books.filter(b => b.collection === selectedCollection.title).map((book, idx) => (
                                    <div key={book.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all group">
                                        <span className="text-xs font-bold text-gray-300 w-6">{idx + 1}</span>
                                        <div className="w-8 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                                            <Image src={book.coverUrl || "/fallback.webp"} alt="Cover" fill className="object-cover" />
                                        </div>
                                        <div className="flex-grow min-w-0" dir={getDir(book.title)}>
                                            <p className="text-sm font-bold text-gray-700 line-clamp-1">{book.title}</p>
                                            <p className="text-[10px] text-gray-400 font-lato" dir="ltr">{formatUploadTime(book.createdAt)}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(book.id, 'book')} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg"><Edit className="w-3 h-3" /></button>
                                            <button onClick={() => handleDelete(book.id, 'book')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <Library className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No books in this collection yet.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <button onClick={() => handleDeleteCollection(selectedCollection)} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" /> Delete Entire Collection
                            </button>
                            <button onClick={() => handleEdit(selectedCollection.id, 'collection')} className="px-6 py-2.5 bg-brand-gold text-white text-xs font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-sm">
                                Edit Collection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">eBook Library</h1>
                    <p className="font-lato text-sm text-gray-500">Manage digital books, research papers, and collections.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'books' ? (
                        <Link href="/admin/ebooks/new" className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md">
                            <PlusCircle className="w-4 h-4" /> Upload Book
                        </Link>
                    ) : (
                        <Link href="/admin/ebooks/collections/new" className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md">
                            <Library className="w-4 h-4" /> Create Collection
                        </Link>
                    )}
                </div>
            </div>

            {/* TABS & FILTERS */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button onClick={() => { setActiveTab('books'); setSearchTerm(''); }} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'books' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'}`}>
                        <Book className="w-4 h-4" /> All Books
                    </button>
                    <button onClick={() => { setActiveTab('collections'); setSearchTerm(''); }} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'collections' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'}`}>
                        <Library className="w-4 h-4" /> Collections
                    </button>
                </div>

                <div className="flex flex-col w-full xl:w-auto gap-3">
                    <div className="flex flex-row gap-2 w-full">
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full md:w-40 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer">
                                <option value="All">All</option>
                                <option value="English">English</option>
                                <option value="Hausa">Hausa</option>
                                <option value="Arabic">Arabic</option>
                            </select>
                        </div>
                        <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors flex-1 md:flex-none">
                            <ArrowUpDown className="w-4 h-4" />
                            <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                        </button>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64"><Loader /></div>
                ) : (
                    <>
                        {activeTab === 'books' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Book</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Language</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Collection</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredContent.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">No books found.</td></tr>
                                        ) : (
                                            filteredContent.map((book) => (
                                                <tr key={book.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm border border-gray-200 cursor-pointer" onClick={() => handleQuickView(book)}>
                                                                <Image src={book.coverUrl || "/fallback.webp"} alt={book.title} fill className="object-cover" />
                                                            </div>
                                                            <div className="min-w-[150px]">
                                                                <h3 className={`font-bold text-brand-brown-dark text-sm cursor-pointer hover:text-brand-gold ${getDir(book.title) === 'rtl' ? 'font-tajawal' : ''}`} onClick={() => handleQuickView(book)}>
                                                                    {book.title}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                                                        <FileText className="w-3 h-3 text-red-500" /> {book.fileSize || 'PDF'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                            book.language === 'English' ? 'bg-blue-100 text-blue-700' :
                                                            book.language === 'Hausa' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            {book.language || 'English'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        {book.collection ? <span className="text-xs font-bold text-brand-brown bg-brand-sand/30 px-2 py-1 rounded-md">{book.collection}</span> : <span className="text-xs text-gray-400 italic">Standalone</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => handleQuickView(book)} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg md:hidden"><Info className="w-4 h-4" /></button>
                                                            <a href={book.pdfUrl} target="_blank" className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><Download className="w-4 h-4" /></a>
                                                            <button onClick={() => handleEdit(book.id, 'book')} className="p-2 text-gray-400 hover:text-brand-gold hover:bg-brand-sand rounded-lg"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDelete(book.id, 'book')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'collections' && (
                            <div className="p-6">
                                {filteredContent.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Library className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No collections found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredContent.map((col) => (
                                            <div key={col.id} onClick={() => setSelectedCollection(col)} className="group border border-gray-100 rounded-2xl p-4 flex gap-4 hover:shadow-lg transition-all bg-white relative cursor-pointer">
                                                <div className="relative w-20 h-28 flex-shrink-0 shadow-md transform group-hover:-rotate-2 transition-transform">
                                                    <Image src={col.cover || "/fallback.webp"} alt={col.title} fill className="object-cover rounded" />
                                                    <div className="absolute top-1 -right-1 w-full h-full bg-gray-200 rounded -z-10 border border-gray-300"></div>
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase shadow-sm ${
                                                            col.category === 'English' ? 'bg-blue-100 text-blue-700' :
                                                            col.category === 'Hausa' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            {col.category}
                                                        </span>
                                                        <button onClick={(e) => {e.stopPropagation(); handleDelete(col.id, 'collection')}} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                    <h3 className={`font-agency text-lg text-brand-brown-dark leading-tight mb-2 line-clamp-2 ${getDir(col.title) === 'rtl' ? 'font-tajawal font-bold' : ''}`}>{col.title}</h3>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit">
                                                        <Book className="w-3 h-3" /> {col.realCount} Books
                                                    </span>
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
