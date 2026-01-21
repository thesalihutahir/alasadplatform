"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal Context
import { useModal } from '@/context/ModalContext';
import LogoReveal from '@/components/logo-reveal'; 

import { 
    PlusCircle, Search, Trash2, Image as ImageIcon, 
    Folder, FolderPlus, Loader2, X, Calendar, UploadCloud,
    Edit, Info, LayoutGrid, List, Filter, ArrowUpDown, ChevronDown, Check
} from 'lucide-react';

// --- CUSTOM DROPDOWN COMPONENT (Internal) ---
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
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 min-w-[140px]">
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

export default function ManageGalleryPage() {
    const router = useRouter();
    const { showSuccess, showConfirm } = useModal(); 

    const [activeTab, setActiveTab] = useState('photos'); 
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [photos, setPhotos] = useState([]);
    const [albums, setAlbums] = useState([]);

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // --- MODAL STATES ---
    const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null); // For Album Details Modal

    // --- CREATE ALBUM FORM STATE ---
    const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [newAlbum, setNewAlbum] = useState({
        title: '',
        description: '',
        cover: ''
    });
    const [albumCoverFile, setAlbumCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

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

        const qPhotos = query(collection(db, "gallery_photos"), orderBy("createdAt", "desc"));
        const unsubPhotos = onSnapshot(qPhotos, (snapshot) => {
            setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qAlbums = query(collection(db, "gallery_albums"), orderBy("createdAt", "desc"));
        const unsubAlbums = onSnapshot(qAlbums, (snapshot) => {
            setAlbums(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => {
            unsubPhotos();
            unsubAlbums();
        };
    }, []);
// 2. PROCESS CONTENT
    const getProcessedContent = () => {
        const term = searchTerm.toLowerCase();
        let content = [];

        if (activeTab === 'photos') {
            content = photos.filter(photo => {
                const matchesSearch = 
                    (photo.name && photo.name.toLowerCase().includes(term)) || 
                    (photo.albumTitle && photo.albumTitle.toLowerCase().includes(term));
                return matchesSearch;
            });
        } else {
            // Albums
            const albumsWithCounts = albums.map(alb => ({
                ...alb,
                realCount: photos.filter(p => p.albumId === alb.id).length
            }));

            content = albumsWithCounts.filter(alb => {
                const matchesSearch = alb.title.toLowerCase().includes(term);
                return matchesSearch;
            });
        }
        return content;
    };

    const filteredContent = getProcessedContent();
    const totalItems = filteredContent.length;

    // 3. ACTIONS
    const handleDelete = (id, type) => {
        const message = type === 'album' 
            ? "Warning: Deleting this album will NOT delete the photos inside it (they will become 'uncategorized'). Continue?"
            : "Are you sure you want to delete this photo? This cannot be undone.";

        showConfirm({
            title: `Delete ${type === 'album' ? 'Album' : 'Photo'}?`,
            message: message,
            confirmText: "Yes, Delete",
            cancelText: "Cancel",
            type: 'danger', 
            onConfirm: async () => {
                try {
                    if (type === 'photo') await deleteDoc(doc(db, "gallery_photos", id));
                    else await deleteDoc(doc(db, "gallery_albums", id));

                    showSuccess({ title: "Deleted!", message: "Item deleted successfully.", confirmText: "Okay" });
                } catch (error) {
                    console.error("Error deleting:", error);
                    alert("Failed to delete.");
                }
            }
        });
    };

    // SPECIAL: Delete Entire Album + Photos
    const handleDeleteEntireAlbum = (targetAlbum) => {
        showConfirm({
            title: "Delete ENTIRE Album?",
            message: `DANGER: This will delete the album "${targetAlbum.title}" AND ALL ${targetAlbum.realCount} photos inside it. This cannot be undone.`,
            confirmText: "Yes, Delete Everything",
            cancelText: "Cancel",
            type: 'danger',
            onConfirm: async () => {
                try {
                    const q = query(collection(db, "gallery_photos"), where("albumId", "==", targetAlbum.id));
                    const snapshot = await getDocs(q);

                    const batch = writeBatch(db);
                    const albumRef = doc(db, "gallery_albums", targetAlbum.id);
                    batch.delete(albumRef);

                    snapshot.docs.forEach((doc) => {
                        batch.delete(doc.ref);
                    });

                    await batch.commit();

                    setSelectedAlbum(null);
                    showSuccess({ title: "Album Deleted", message: "The album and all its photos were deleted.", confirmText: "Done" });

                } catch (error) {
                    console.error("Error deleting album:", error);
                    alert("Failed to delete album.");
                }
            }
        });
    };

    const handleEdit = (id, type) => {
        router.push(type === 'album' ? `/admin/gallery/albums/edit/${id}` : `/admin/gallery/photos/edit/${id}`);
    };

    // Quick View Photo
    const handleQuickView = (item) => {
        showSuccess({
            title: "Photo Details",
            message: (
                <div className="text-left space-y-3 mt-2 text-sm">
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                        <Image src={item.url} alt="View" fill className="object-contain" />
                    </div>
                    {item.name && (
                        <div dir={getDir(item.name)}>
                            <p className="text-xs font-bold text-gray-400 uppercase">Caption</p>
                            <p className="font-bold text-brand-brown-dark">{item.name}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Uploaded On</p>
                        <p className="font-medium">{formatUploadTime(item.createdAt)}</p>
                    </div>
                </div>
            ),
            confirmText: "Close"
        });
    };

    // --- CREATE ALBUM HANDLERS ---
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAlbumCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveAlbum = async (e) => {
        e.preventDefault();
        if (!newAlbum.title) { alert("Please enter title"); return; }

        setIsCreatingAlbum(true);
        try {
            let coverUrl = "/fallback.webp";
            if (albumCoverFile) {
                const storageRef = ref(storage, `album_covers/${Date.now()}_${albumCoverFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, albumCoverFile);
                uploadTask.on('state_changed', (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100));
                await uploadTask;
                coverUrl = await getDownloadURL(uploadTask.snapshot.ref);
            }

            await addDoc(collection(db, "gallery_albums"), {
                ...newAlbum,
                cover: coverUrl,
                status: "Active",
                photoCount: 0,
                createdAt: serverTimestamp()
            });

            setIsCreateAlbumOpen(false);
            setNewAlbum({ title: '', description: '', cover: '' });
            setAlbumCoverFile(null);
            setCoverPreview(null);
            setUploadProgress(0);
            showSuccess({ title: "Album Created!", message: "New album added successfully.", confirmText: "Okay" });

        } catch (error) {
            console.error("Error creating album:", error);
            alert("Failed to create album.");
        } finally {
            setIsCreatingAlbum(false);
        }
    };
return (
        <div className="space-y-6 relative max-w-7xl mx-auto pb-12">

            {/* --- ALBUM DETAILS MODAL --- */}
            {selectedAlbum && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div className="flex gap-4">
                                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-sm border border-white">
                                    <Image src={selectedAlbum.cover || "/fallback.webp"} alt="Cover" fill className="object-cover" />
                                </div>
                                <div dir={getDir(selectedAlbum.title)}>
                                    <h3 className="font-agency text-2xl text-brand-brown-dark leading-none mb-2">{selectedAlbum.title}</h3>
                                    <div className="flex gap-2" dir="ltr">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md">
                                            {selectedAlbum.realCount} Photos
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAlbum(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {photos.filter(p => p.albumId === selectedAlbum.id).length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {photos.filter(p => p.albumId === selectedAlbum.id).map((photo) => (
                                        <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <Image src={photo.url} alt="Photo" fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => handleEdit(photo.id, 'photo')} className="p-1.5 bg-white rounded-full hover:text-brand-gold text-gray-600"><Edit className="w-3 h-3" /></button>
                                                <button onClick={() => handleDelete(photo.id, 'photo')} className="p-1.5 bg-white rounded-full hover:text-red-600 text-gray-600"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No photos in this album yet.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <button onClick={() => handleDeleteEntireAlbum(selectedAlbum)} className="flex items-center gap-2 text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" /> Delete Entire Album
                            </button>
                            <button onClick={() => handleEdit(selectedAlbum.id, 'album')} className="px-6 py-2.5 bg-brand-gold text-white text-xs font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-sm">
                                Edit Album
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CREATE ALBUM MODAL (Quick Access) --- */}
            {isCreateAlbumOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-agency text-xl text-brand-brown-dark">Create New Album</h3>
                            <button onClick={() => setIsCreateAlbumOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveAlbum} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Album Title</label>
                                <input 
                                    type="text" 
                                    value={newAlbum.title}
                                    onChange={(e) => setNewAlbum({...newAlbum, title: e.target.value})}
                                    placeholder="e.g. Annual Conference 2024" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                            </div>

                            {/* Cover Upload */}
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-2">Cover Photo</label>
                                <div className="relative w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center overflow-hidden hover:border-brand-gold transition-colors">
                                    {coverPreview ? (
                                        <>
                                            <Image src={coverPreview} alt="Preview" fill className="object-cover" />
                                            <button type="button" onClick={() => { setAlbumCoverFile(null); setCoverPreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md z-10"><X className="w-3 h-3" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-xs text-gray-500">Click to Upload Cover</p>
                                            <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isCreatingAlbum}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-md disabled:opacity-50"
                                >
                                    {isCreatingAlbum ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                                    {isCreatingAlbum ? `Creating ${Math.round(uploadProgress)}%` : 'Create Album'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MAIN PAGE CONTENT --- */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Gallery Manager</h1>
                    <p className="font-lato text-sm text-gray-500">Organize event photos, manage albums, and highlights.</p>
                </div>
                <div className="flex gap-2 h-10">
                    <div className="bg-white border border-gray-100 px-4 rounded-xl text-center shadow-sm min-w-[80px] flex flex-col justify-center h-full">
                        <span className="block text-lg font-bold text-brand-gold leading-none">{totalItems}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider leading-none mt-0.5">Total</span>
                    </div>
                    {activeTab === 'photos' ? (
                        <Link 
                            href="/admin/gallery/new" 
                            className="flex items-center justify-center gap-2 px-5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md h-full"
                        >
                            <PlusCircle className="w-4 h-4" /> Upload Photos
                        </Link>
                    ) : (
                        <Link 
                            href="/admin/gallery/albums/new"
                            className="flex items-center justify-center gap-2 px-5 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors shadow-md h-full"
                        >
                            <FolderPlus className="w-4 h-4" /> Create Album
                        </Link>
                    )}
                </div>
            </div>

            {/* TABS & FILTERS */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative z-20">

                {/* Tabs */}
                <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    <button 
                        onClick={() => { setActiveTab('photos'); setSearchTerm(''); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'photos' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" /> All Photos
                    </button>
                    <button 
                        onClick={() => { setActiveTab('albums'); setSearchTerm(''); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'albums' ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'
                        }`}
                    >
                        <Folder className="w-4 h-4" /> Event Albums
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col w-full xl:w-auto gap-3">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`} 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
                    </div>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 scale-75"><LogoReveal /></div>
                ) : (
                    <>
                        {/* --- PHOTOS GRID VIEW --- */}
                        {activeTab === 'photos' && (
                            <div className="p-6">
                                {filteredContent.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No photos found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {filteredContent.map((photo) => (
                                            <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer border border-gray-200" onClick={() => handleQuickView(photo)}>
                                                <Image src={photo.url} alt="Gallery Photo" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                    <p className="text-white/70 text-[10px] truncate mb-2">{photo.name || 'Untitled'}</p>
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(photo.id, 'photo'); }} className="p-1.5 bg-white rounded-full text-gray-600 hover:text-brand-gold"><Edit className="w-3 h-3" /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(photo.id, 'photo'); }} className="p-1.5 bg-white rounded-full text-gray-600 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- ALBUMS VIEW --- */}
                        {activeTab === 'albums' && (
                            <div className="p-6">
                                {filteredContent.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Folder className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No albums found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {filteredContent.map((album) => (
                                            <div key={album.id} onClick={() => setSelectedAlbum(album)} className="group cursor-pointer">
                                                <div className="relative w-full aspect-[4/3] mb-3">
                                                    {/* Stack Effect */}
                                                    <div className="absolute top-0 left-2 right-2 bottom-2 bg-gray-200 rounded-xl transform translate-y-2 group-hover:translate-y-3 transition-transform"></div>
                                                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-gray-300 rounded-xl transform translate-y-1 group-hover:translate-y-1.5 transition-transform"></div>

                                                    {/* Cover */}
                                                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white group-hover:border-brand-gold/50 transition-colors">
                                                        <Image src={album.cover || "/fallback.webp"} alt={album.title} fill className="object-cover" />

                                                        {/* Actions */}
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={(e) => {e.stopPropagation(); handleDelete(album.id, 'album')}} className="bg-white p-1.5 rounded-lg shadow text-gray-500 hover:text-red-600">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className={`font-agency text-lg text-brand-brown-dark leading-tight group-hover:text-brand-gold transition-colors truncate ${getDir(album.title) === 'rtl' ? 'font-tajawal font-bold' : ''}`}>
                                                    {album.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {formatUploadTime(album.createdAt).split('•')[0]}
                                                    </p>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <p className="text-xs text-brand-gold font-bold">{album.realCount} Photos</p>
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