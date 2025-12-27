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
    Book, 
    Library, 
    FileText, 
    Download, 
    MoreVertical,
    Loader2
} from 'lucide-react';

export default function ManageEbooksPage() {

    const [activeTab, setActiveTab] = useState('books'); 
    const [isLoading, setIsLoading] = useState(true);

    const [books, setBooks] = useState([]);
    const [collections, setCollections] = useState([]);

    // 1. FETCH BOOKS & COLLECTIONS
    useEffect(() => {
        setIsLoading(true);

        // Fetch Books
        const qBooks = query(collection(db, "ebooks"), orderBy("createdAt", "desc"));
        const unsubBooks = onSnapshot(qBooks, (snapshot) => {
            setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Collections
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

    // 2. HANDLE DELETE
    const handleDelete = async (id, type) => {
        if (!confirm(`Are you sure you want to delete this ${type}? This cannot be undone.`)) return;

        try {
            if (type === 'book') {
                await deleteDoc(doc(db, "ebooks", id));
            } else {
                await deleteDoc(doc(db, "ebook_collections", id));
            }
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete. Check console.");
        }
    };

    // Helper to count books in a collection
    const getCollectionCount = (collectionTitle) => {
        return books.filter(b => b.collection === collectionTitle).length;
    };

    return (
        <div className="space-y-6">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">eBook Library</h1>
                    <p className="font-lato text-sm text-gray-500">Manage digital books, research papers, and collections.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'books' ? (
                        <Link 
                            href="/admin/ebooks/new" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Upload Book
                        </Link>
                    ) : (
                        <Link 
                            href="/admin/ebooks/collections/new"
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md"
                        >
                            <Library className="w-4 h-4" />
                            Create Collection
                        </Link>
                    )}
                </div>
            </div>

            {/* 2. TABS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('books')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'books' 
                            ? 'bg-white text-brand-brown-dark shadow-sm' 
                            : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <Book className="w-4 h-4" /> All Books
                    </button>
                    <button 
                        onClick={() => setActiveTab('collections')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${
                            activeTab === 'collections' 
                            ? 'bg-white text-brand-brown-dark shadow-sm' 
                            : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <Library className="w-4 h-4" /> Collections
                    </button>
                </div>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`} 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                    />
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
                        {/* --- BOOKS VIEW --- */}
                        {activeTab === 'books' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Book Details</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Collection</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Format</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {books.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                    No books uploaded yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            books.map((book) => (
                                                <tr key={book.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm border border-gray-200">
                                                                <Image src={book.coverUrl || "/fallback.webp"} alt={book.title} fill className="object-cover" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1 max-w-[200px]">{book.title}</h3>
                                                                <p className="text-xs text-gray-400">{book.author}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {book.collection ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-brand-brown font-medium bg-brand-sand/30 px-2 py-1 rounded-md">
                                                                <Library className="w-3 h-3 text-brand-brown-dark" />
                                                                {book.collection}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Standalone</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1 text-xs text-gray-600 font-mono">
                                                            <FileText className="w-3 h-3 text-red-500" /> PDF • {book.fileSize || 'PDF'}
                                                        </div>
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
                                                                href={book.pdfUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" 
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                            <button 
                                                                onClick={() => handleDelete(book.id, 'book')} 
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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

                        {/* --- COLLECTIONS VIEW --- */}
                        {activeTab === 'collections' && (
                            <div className="p-6">
                                {collections.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Library className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No collections created yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {collections.map((col) => (
                                            <div key={col.id} className="group border border-gray-100 rounded-2xl p-4 flex gap-4 hover:shadow-lg transition-all bg-white relative">
                                                <div className="relative w-20 h-28 flex-shrink-0 shadow-md transform group-hover:-rotate-2 transition-transform">
                                                    <Image src={col.cover || "/fallback.webp"} alt={col.title} fill className="object-cover rounded" />
                                                    <div className="absolute top-1 -right-1 w-full h-full bg-gray-200 rounded -z-10 border border-gray-300"></div>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider mb-1 block">{col.category}</span>
                                                        <button onClick={() => handleDelete(col.id, 'collection')} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                    <h3 className="font-agency text-lg text-brand-brown-dark leading-tight mb-2 line-clamp-2">{col.title}</h3>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit">
                                                        <Book className="w-3 h-3" /> {getCollectionCount(col.title)} Books
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