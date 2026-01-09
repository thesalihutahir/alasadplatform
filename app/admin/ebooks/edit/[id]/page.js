"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal
import { useModal } from '@/context/ModalContext';

import { 
    ArrowLeft, 
    Save, 
    UploadCloud, 
    FileText, 
    Library, 
    Loader2, 
    X, 
    Image as ImageIcon
} from 'lucide-react';

export default function EditBookPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Data State
    const [allCollections, setAllCollections] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        collection: '',
        category: 'Tafsir', // Topic
        language: 'English', // Language
        description: ''
    });

    // File States
    const [pdfFile, setPdfFile] = useState(null); // New PDF
    const [coverFile, setCoverFile] = useState(null); // New Cover
    
    // Existing Data States
    const [existingPdfUrl, setExistingPdfUrl] = useState(null);
    const [existingPdfName, setExistingPdfName] = useState('');
    const [existingCoverUrl, setExistingCoverUrl] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null); // For new cover preview

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // A. Fetch Collections
                const qCollections = query(collection(db, "ebook_collections"), orderBy("createdAt", "desc"));
                const colSnap = await getDocs(qCollections);
                const collectionsData = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setAllCollections(collectionsData);

                // B. Fetch Book Document
                const docRef = doc(db, "ebooks", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || '',
                        author: data.author || '',
                        collection: data.collection || '',
                        category: data.category || 'Tafsir',
                        language: data.language || 'English',
                        description: data.description || ''
                    });

                    // Set initial filter based on loaded language
                    const initialFiltered = collectionsData.filter(c => c.category === (data.language || 'English'));
                    setFilteredCollections(initialFiltered);

                    if (data.pdfUrl) {
                        setExistingPdfUrl(data.pdfUrl);
                        setExistingPdfName(data.fileName || "Current PDF File");
                    }
                    if (data.coverUrl) {
                        setExistingCoverUrl(data.coverUrl);
                    }
                } else {
                    alert("Book not found");
                    router.push('/admin/ebooks');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    // 2. Filter Collections when Language Changes
    useEffect(() => {
        if (allCollections.length > 0) {
            const filtered = allCollections.filter(c => c.category === formData.language);
            setFilteredCollections(filtered);
        }
    }, [formData.language, allCollections]);

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset collection if language changes
        if (name === 'language') {
            setFormData(prev => ({ ...prev, collection: '' }));
        }
    };

    // Handle File Changes
    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert("Please upload a PDF file.");
                return;
            }
            if (file.size > 50 * 1024 * 1024) { 
                alert("PDF size exceeds 50MB limit.");
                return;
            }
            setPdfFile(file);
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Please upload a valid image file.");
                return;
            }
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const removeNewPdf = () => setPdfFile(null);
    const removeNewCover = () => {
        setCoverFile(null);
        setCoverPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title) {
            alert("Please enter a book title.");
            return;
        }

        setIsSubmitting(true);

        try {
            let pdfUrl = existingPdfUrl;
            let coverUrl = existingCoverUrl;
            let fileName = existingPdfName;
            let fileSize = null; // Update only if new file

            const uploadTasks = [];

            // 1. Upload New PDF (if selected)
            if (pdfFile) {
                const pdfRef = ref(storage, `ebooks/pdfs/${Date.now()}_${pdfFile.name}`);
                const pdfTask = uploadBytesResumable(pdfRef, pdfFile);
                
                // Track PDF progress
                pdfTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                });

                uploadTasks.push(
                    pdfTask.then(async (snap) => {
                        pdfUrl = await getDownloadURL(snap.ref);
                        fileName = pdfFile.name;
                        fileSize = (pdfFile.size / (1024 * 1024)).toFixed(2) + " MB";
                    })
                );
            }

            // 2. Upload New Cover (if selected)
            if (coverFile) {
                const coverRef = ref(storage, `ebooks/covers/${Date.now()}_${coverFile.name}`);
                uploadTasks.push(
                    uploadBytesResumable(coverRef, coverFile).then(async (snap) => {
                        coverUrl = await getDownloadURL(snap.ref);
                    })
                );
            }

            await Promise.all(uploadTasks);

            // 3. Prepare Update Data
            const updateData = {
                ...formData,
                title: formData.title.trim(),
                pdfUrl: pdfUrl,
                coverUrl: coverUrl,
                fileName: fileName,
                updatedAt: new Date().toISOString()
            };

            if (fileSize) {
                updateData.fileSize = fileSize;
            }

            // 4. Update Firestore
            const docRef = doc(db, "ebooks", id);
            await updateDoc(docRef, updateData);

            showSuccess({
                title: "Book Updated!",
                message: "Your changes have been saved successfully.",
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/ebooks')
            });

        } catch (error) {
            console.error("Error updating book:", error);
            alert("Failed to update book.");
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ebooks" className="p-2 hover:bg-gray-200 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Edit eBook</h1>
                        <p className="font-lato text-sm text-gray-500">Update book details or replace files.</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href="/admin/ebooks" className="flex-1 md:flex-none">
                        <button type="button" className="w-full px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 text-center justify-center">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-md disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? `Saving ${Math.round(uploadProgress)}%` : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: File Replacements */}
                <div className="space-y-6">

                    {/* PDF Replacement */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-3">
                            <FileText className="w-4 h-4" /> Replace PDF (Optional)
                        </label>

                        {/* Existing File Info */}
                        {existingPdfUrl && !pdfFile && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-green-700 text-xs">Current File Active</p>
                                    <p className="text-green-600 text-[10px] truncate">{existingPdfName}</p>
                                </div>
                            </div>
                        )}

                        <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors h-32 flex flex-col items-center justify-center ${
                            pdfFile ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-300 hover:border-brand-gold'
                        }`}>
                            {pdfFile ? (
                                <div>
                                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                                    <p className="font-bold text-brand-brown-dark text-xs truncate w-40">{pdfFile.name}</p>
                                    <button type="button" onClick={removeNewPdf} className="text-red-500 text-[10px] font-bold hover:underline mt-1">
                                        Remove New File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-full relative">
                                    <UploadCloud className="w-8 h-8 text-gray-400 mb-1" />
                                    <p className="text-xs text-gray-500 font-bold">Upload New PDF</p>
                                    <input 
                                        type="file" 
                                        accept="application/pdf"
                                        onChange={handlePdfChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cover Replacement */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-3">
                            <ImageIcon className="w-4 h-4" /> Replace Cover (Optional)
                        </label>

                        <div className={`relative w-full aspect-[2/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-brand-gold ${coverPreview || existingCoverUrl ? 'border-none' : ''}`}>
                            {coverPreview || existingCoverUrl ? (
                                <>
                                    <Image 
                                        src={coverPreview || existingCoverUrl} 
                                        alt="Cover" 
                                        fill 
                                        className="object-cover" 
                                    />
                                    {/* Badge for new file */}
                                    {coverPreview && (
                                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">
                                            New
                                        </div>
                                    )}
                                    {/* Upload trigger on top of image */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="relative">
                                            <p className="text-white text-xs font-bold border border-white px-3 py-1 rounded-full cursor-pointer">Change</p>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleCoverChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        {coverPreview && (
                                            <button 
                                                type="button" 
                                                onClick={removeNewCover} 
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 z-20"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full p-4 relative">
                                    <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-500 text-center px-4">Click to Upload Cover</p>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleCoverChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Metadata Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Book Details</h3>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Book Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                dir={getDir(formData.title)}
                            />
                        </div>

                        {/* Language & Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Language</label>
                                <select 
                                    name="language" 
                                    value={formData.language} 
                                    onChange={handleChange} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                >
                                    <option>English</option>
                                    <option>Hausa</option>
                                    <option>Arabic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Category (Topic)</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                >
                                    <option>Tafsir</option>
                                    <option>Fiqh</option>
                                    <option>Aqeedah</option>
                                    <option>History</option>
                                    <option>General</option>
                                </select>
                            </div>
                        </div>

                        {/* Collection Selector (Filtered) */}
                        <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                            <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                                <Library className="w-4 h-4" /> Add to Collection
                            </label>
                            <select 
                                name="collection" 
                                value={formData.collection} 
                                onChange={handleChange} 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                            >
                                <option value="">Select a Collection (Optional)</option>
                                {filteredCollections.length > 0 ? (
                                    filteredCollections.map(col => (
                                        <option key={col.id} value={col.title}>{col.title}</option>
                                    ))
                                ) : (
                                    <option disabled>No collections found for {formData.language}</option>
                                )}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Description</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows="4" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                dir={getDir(formData.description)}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
