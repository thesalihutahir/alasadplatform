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
{/* CONTENT AREA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></div>
                ) : (
                    <>
                        {/* --- POSTS TABLE --- */}
                        {activeTab === 'posts' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Details</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Series</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Lang</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPosts.map((post) => (
                                            <tr key={post.id} className="hover:bg-gray-50 group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-gray-100 relative overflow-hidden"><Image src={post.coverImage || "/fallback.webp"} alt="" fill className="object-cover" /></div>
                                                        <div>
                                                            <p className="font-bold text-sm text-brand-brown-dark line-clamp-1">{post.title}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase">{post.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => openMoveModal(post)} className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-brand-gold hover:text-white px-2 py-1 rounded transition-colors group/btn">
                                                        <FolderInput className="w-3 h-3" />
                                                        {post.series ? post.series : "No Series"}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">{post.language || 'English'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {/* Fixed View Link */}
                                                        <Link href={`/blogs/read/${post.id}`} target="_blank">
                                                            <button className="p-2 text-gray-400 hover:text-brand-brown-dark bg-gray-50 hover:bg-gray-100 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                                                        </Link>
                                                        <Link href={`/admin/blogs/edit/${post.id}`}>
                                                            <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        </Link>
                                                        <button onClick={() => handleDelete(post.id, 'post')} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* --- SERIES GRID --- */}
                        {activeTab === 'series' && (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {filteredSeries.map((item) => (
                                    <div key={item.id} className="group border border-gray-100 rounded-2xl p-4 flex gap-4 hover:shadow-lg transition-all bg-white relative">
                                        <div className="relative w-20 h-24 flex-shrink-0">
                                            <Image src={item.cover || "/fallback.webp"} alt="" fill className="object-cover rounded-lg" />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] font-bold text-brand-gold uppercase">{item.category}</span>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => openEditSeriesModal(item)} className="text-gray-400 hover:text-blue-600"><Edit className="w-3 h-3" /></button>
                                                        <button onClick={() => handleDelete(item.id, 'series')} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                                <h3 className="font-agency text-lg text-brand-brown-dark leading-tight mt-1 line-clamp-2">{item.title}</h3>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded self-start mt-2">
                                                {getSeriesCount(item.title)} Posts
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- MOVE POST MODAL --- */}
            {moveModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4">Move Article</h3>
                        <p className="text-sm text-gray-500 mb-4">Select a new series for <span className="font-bold text-black">"{selectedPost?.title}"</span></p>
                        
                        <select 
                            value={targetSeries} 
                            onChange={(e) => setTargetSeries(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        >
                            <option value="">No Series (Standalone)</option>
                            {series.map(s => <option key={s.id} value={s.title}>{s.title} ({s.category})</option>)}
                        </select>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setMoveModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleMovePost} disabled={isUpdating} className="px-4 py-2 bg-brand-gold text-white text-sm font-bold rounded-lg hover:bg-brand-brown-dark flex items-center gap-2">
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Move
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT SERIES MODAL --- */}
            {editSeriesModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-agency text-xl text-brand-brown-dark">Edit Series</h3>
                            <button onClick={() => setEditSeriesModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        
                        <form onSubmit={handleUpdateSeries} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Series Title</label>
                                <input type="text" value={editingSeries?.title} onChange={(e) => setEditingSeries({...editingSeries, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Category</label>
                                <select value={editingSeries?.category} onChange={(e) => setEditingSeries({...editingSeries, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                    <option value="Article">Article Series</option>
                                    <option value="News">News</option>
                                    <option value="Research">Research</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-2">Update Cover (Optional)</label>
                                <input type="file" accept="image/*" onChange={(e) => setSeriesCoverFile(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-sand file:text-brand-brown-dark hover:file:bg-brand-gold/20" />
                            </div>

                            <button type="submit" disabled={isUpdating} className="w-full py-3 bg-brand-brown-dark text-white font-bold rounded-xl mt-4 flex justify-center items-center gap-2">
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
