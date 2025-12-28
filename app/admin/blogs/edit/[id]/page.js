"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Utilities
import { compressImage } from '@/utils/compressImage';
import Loader from '@/components/Loader';

import { 
    ArrowLeft, 
    Save, 
    X, 
    FileText, 
    LayoutList, 
    UploadCloud,
    CheckCircle,
    Globe
} from 'lucide-react';

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams(); 
    const postId = params.id;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Data State
    const [allSeries, setAllSeries] = useState([]);
    const [filteredSeries, setFilteredSeries] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '', 
        category: 'Article',
        language: 'English', 
        series: '', 
        author: '', 
        readTime: '', // Will be number
        date: '', 
        tags: '',
        status: 'Published',
        coverImage: '',
        pdfUrl: '',
        pdfName: ''
    });

    // File States (for new uploads)
    const [newCoverFile, setNewCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [newPdfFile, setNewPdfFile] = useState(null);

    // 1. Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Series List
                const qSeries = query(collection(db, "blog_series"), orderBy("createdAt", "desc"));
                const seriesSnapshot = await getDocs(qSeries);
                const seriesList = seriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllSeries(seriesList);

                // Fetch Post Data
                if (postId) {
                    const docRef = doc(db, "posts", postId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({
                            ...data,
                            tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
                            language: data.language || 'English'
                        });
                        if (data.coverImage) setCoverPreview(data.coverImage);
                    } else {
                        alert("Post not found!");
                        router.push('/admin/blogs');
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [postId, router]);

    // 2. Filter Series
    useEffect(() => {
        const filtered = allSeries.filter(series => {
            const catMatch = series.category === formData.category;
            const langMatch = series.language ? series.language === formData.language : true;
            return catMatch && langMatch;
        });
        setFilteredSeries(filtered);
    }, [formData.category, formData.language, allSeries]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle New Cover Image
    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setNewCoverFile(compressed);
                setCoverPreview(URL.createObjectURL(compressed));
            } catch (error) {
                console.error("Compression failed", error);
                setNewCoverFile(file);
                setCoverPreview(URL.createObjectURL(file));
            }
        }
    };

    // Handle New PDF
    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                alert("PDF too large (Max 20MB)");
                return;
            }
            setNewPdfFile(file);
        }
    };

    const removeCover = () => {
        setFormData(prev => ({ ...prev, coverImage: '' }));
        setCoverPreview(null);
        setNewCoverFile(null);
    };

    const removePdf = () => {
        setFormData(prev => ({ ...prev, pdfUrl: '', pdfName: '' }));
        setNewPdfFile(null);
    };

    // Handle Update
    const handleUpdate = async (e, status = 'Published') => {
        if(e) e.preventDefault();
        
        if (status === 'Published') setIsSubmitting(true);
        else setIsSavingDraft(true);

        try {
            let finalCoverUrl = formData.coverImage;
            let finalPdfUrl = formData.pdfUrl;
            let finalPdfName = formData.pdfName;

            // 1. Upload New Cover
            if (newCoverFile) {
                const coverRef = ref(storage, `blog_covers/${Date.now()}_${newCoverFile.name}`);
                const coverTask = uploadBytesResumable(coverRef, newCoverFile);

                coverTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                });

                await coverTask;
                finalCoverUrl = await getDownloadURL(coverTask.snapshot.ref);
            }

            // 2. Upload New PDF
            if (newPdfFile) {
                const pdfRef = ref(storage, `blog_pdfs/${Date.now()}_${newPdfFile.name}`);
                await uploadBytesResumable(pdfRef, newPdfFile);
                finalPdfUrl = await getDownloadURL(pdfRef);
                finalPdfName = newPdfFile.name;
            }

            // 3. Update Firestore
            const docRef = doc(db, "posts", postId);
            await updateDoc(docRef, {
                ...formData,
                status: status,
                coverImage: finalCoverUrl,
                pdfUrl: finalPdfUrl,
                pdfName: finalPdfName,
                updatedAt: serverTimestamp(),
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            });

            alert(`Post ${status === 'Draft' ? 'saved as draft' : 'updated'} successfully!`);
            router.push('/admin/blogs');

        } catch (error) {
            console.error("Error updating post:", error);
            alert("Failed to update post.");
        } finally {
            setIsSubmitting(false);
            setIsSavingDraft(false);
        }
    };

    if (isLoading) {
        return <Loader size="lg" className="h-[50vh]" />;
    }

    return (
        <form className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blogs" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Post</h1>
                        <p className="font-lato text-sm text-gray-500">Update content, fix typos, or replace images.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={(e) => handleUpdate(e, 'Draft')}
                        disabled={isSavingDraft || isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {isSavingDraft && <Loader size="xs" />} Save Draft
                    </button>
                    <button 
                        type="button" 
                        onClick={(e) => handleUpdate(e, 'Published')}
                        disabled={isSubmitting || isSavingDraft}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-md disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader size="xs" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Saving...' : 'Update Post'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: CONTENT */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Post Title</label>
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full text-2xl font-agency font-bold text-brand-brown-dark placeholder-gray-300 border-none focus:ring-0 p-0 focus:outline-none"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Excerpt</label>
                        <textarea 
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows="2"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                        ></textarea>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Main Content</label>
                        <textarea 
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className="flex-grow w-full resize-none border-none focus:ring-0 p-0 focus:outline-none text-base leading-relaxed text-gray-700"
                        ></textarea>
                    </div>

                    {/* PDF Section */}
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 border-dashed">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600"><FileText className="w-6 h-6" /></div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-blue-800 text-sm">Attached PDF</h3>
                                <p className="text-xs text-blue-600">
                                    {formData.pdfName || (newPdfFile ? newPdfFile.name : "No PDF attached")}
                                </p>
                            </div>
                            <div className="relative">
                                {formData.pdfName || newPdfFile ? (
                                    <button type="button" onClick={removePdf} className="text-red-500 hover:text-red-700 text-xs font-bold underline">Remove</button>
                                ) : (
                                    <>
                                        <label htmlFor="pdf-upload" className="cursor-pointer bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-blue-700">Upload New</label>
                                        <input id="pdf-upload" type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: METADATA */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Publishing</h3>

                        {/* Language Selection */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Language</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select 
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                                >
                                    <option value="English">English</option>
                                    <option value="Hausa">Hausa</option>
                                    <option value="Arabic">Arabic</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                <option value="Article">Article</option>
                                <option value="News">News</option>
                                <option value="Research">Research</option>
                            </select>
                        </div>

                        {/* Series Selection (Filtered) */}
                        <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20 mb-4">
                            <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                                <LayoutList className="w-4 h-4" /> Series
                            </label>
                            <select 
                                name="series"
                                value={formData.series}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                            >
                                <option value="">None</option>
                                {filteredSeries.length > 0 ? (
                                    filteredSeries.map(s => <option key={s.id} value={s.title}>{s.title}</option>)
                                ) : (
                                    <option disabled>No matches found</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Read Time (Minutes)</label>
                            <input 
                                type="number" 
                                min="1"
                                name="readTime" 
                                value={formData.readTime} 
                                onChange={handleChange} 
                                placeholder="e.g. 5"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Author</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Cover Image</h3>
                        <div className="relative w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden">
                            {coverPreview ? (
                                <>
                                    <Image src={coverPreview} alt="Preview" fill className="object-cover" />
                                    <button type="button" onClick={removeCover} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 z-10"><X className="w-4 h-4" /></button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4 w-full h-full relative">
                                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500 font-bold mb-1">Click to Replace</p>
                                    <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-brand-brown mb-1">Tags (Comma Separated)</label>
                        <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    </div>
                </div>

            </div>
        </form>
    );
}
