"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { 
    PlusCircle, Search, Edit, Trash2, Eye, BookOpen, 
    ScrollText, LayoutList, Loader2, MoreVertical, 
    FolderInput, Save, X, UploadCloud, CheckCircle
} from 'lucide-react';

export default function ManageBlogsPage() {

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('posts');
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [series, setSeries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals State
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // Post to move
    const [targetSeries, setTargetSeries] = useState('');

    const [editSeriesModalOpen, setEditSeriesModalOpen] = useState(false);
    const [editingSeries, setEditingSeries] = useState(null); // Series to edit
    const [seriesCoverFile, setSeriesCoverFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // 1. FETCH DATA (Real-time)
    useEffect(() => {
        setIsLoading(true);
        // Posts
        const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const unsubPosts = onSnapshot(qPosts, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        // Series
        const qSeries = query(collection(db, "blog_series"), orderBy("createdAt", "desc"));
        const unsubSeries = onSnapshot(qSeries, (snapshot) => {
            setSeries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });
        return () => { unsubPosts(); unsubSeries(); };
    }, []);

    // 2. ACTIONS
    const handleDelete = async (id, type) => {
        if (!confirm(`Permanently delete this ${type}?`)) return;
        try {
            await deleteDoc(doc(db, type === 'post' ? "posts" : "blog_series", id));
        } catch (error) { alert("Delete failed."); }
    };

    // --- MOVE POST LOGIC ---
    const openMoveModal = (post) => {
        setSelectedPost(post);
        setTargetSeries(post.series || '');
        setMoveModalOpen(true);
    };

    const handleMovePost = async () => {
        if (!selectedPost) return;
        setIsUpdating(true);
        try {
            const postRef = doc(db, "posts", selectedPost.id);
            await updateDoc(postRef, { series: targetSeries });
            setMoveModalOpen(false);
            setTargetSeries('');
            setSelectedPost(null);
        } catch (error) { console.error(error); alert("Failed to move post."); } 
        finally { setIsUpdating(false); }
    };

    // --- EDIT SERIES LOGIC ---
    const openEditSeriesModal = (seriesItem) => {
        setEditingSeries({ ...seriesItem });
        setSeriesCoverFile(null);
        setEditSeriesModalOpen(true);
    };

    const handleUpdateSeries = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            let coverUrl = editingSeries.cover;
            
            if (seriesCoverFile) {
                const storageRef = ref(storage, `blog_series_covers/${Date.now()}_${seriesCoverFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, seriesCoverFile);
                await uploadTask;
                coverUrl = await getDownloadURL(uploadTask.snapshot.ref);
            }

            const seriesRef = doc(db, "blog_series", editingSeries.id);
            await updateDoc(seriesRef, {
                title: editingSeries.title,
                category: editingSeries.category,
                cover: coverUrl,
                updatedAt: serverTimestamp()
            });

            setEditSeriesModalOpen(false);
            setEditingSeries(null);
        } catch (error) { console.error(error); alert("Failed to update series."); }
        finally { setIsUpdating(false); }
    };

    // Filter Logic
    const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredSeries = series.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

    // Helper: Count posts in series
    const getSeriesCount = (seriesTitle) => posts.filter(p => p.series === seriesTitle).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Blog Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Manage articles, move posts between series, and edit collections.</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'posts' ? (
                        <Link href="/admin/blogs/new" className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md">
                            <PlusCircle className="w-4 h-4" /> New Post
                        </Link>
                    ) : (
                        <Link href="/admin/blogs/series/new" className="flex items-center gap-2 px-5 py-2.5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md">
                            <BookOpen className="w-4 h-4" /> New Series
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'posts' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500'}`}>
                        <ScrollText className="w-4 h-4" /> Posts
                    </button>
                    <button onClick={() => setActiveTab('series')} className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'series' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500'}`}>
                        <LayoutList className="w-4 h-4" /> Series
                    </button>
                </div>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                </div>
            </div>
