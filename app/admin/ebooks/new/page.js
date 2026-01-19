"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
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
    CheckCircle, 
    Image as ImageIcon,
    AlertTriangle,
    Calendar,
    Globe,
    Lock
} from 'lucide-react';

export default function UploadBookPage() {
    const router = useRouter();
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoadingCollections, setIsLoadingCollections] = useState(true);

    // Duplicate Check State
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    // Dynamic Collections State
    const [allCollections, setAllCollections] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        author: 'Sheikh Goni Dr. Muneer Ja\'afar',
        collection: '',
        language: 'English', 
        publisher: 'Al-Asad Foundation', // New Soft Filter
        access: 'Free', // New Soft Filter
        year: new Date().getFullYear().toString(), // New Soft Filter
        description: ''
    });

    // File States
    const [docFile, setDocFile] = useState(null); // PDF or EPUB
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    // Helper: Auto-Detect Arabic
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // 1. Fetch Collections on Mount
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const q = query(collection(db, "ebook_collections"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const collections = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllCollections(collections);
                // Initial filter
                setFilteredCollections(collections.filter(c => c.category === 'English'));
            } catch (error) {
                console.error("Error fetching collections:", error);
            } finally {
                setIsLoadingCollections(false);
            }
        };

        fetchCollections();
    }, []);

    // 2. Filter Collections when Language Changes
    useEffect(() => {
        if (allCollections.length > 0) {
            const filtered = allCollections.filter(c => c.category === formData.language);
            setFilteredCollections(filtered);
            setFormData(prev => ({ ...prev, collection: '' })); 
        }
    }, [formData.language, allCollections]);

    // Check Duplicate Title
    const checkDuplicateTitle = async (title) => {
        if (!title.trim()) {
            setDuplicateWarning(null);
            return;
        }
        setIsChecking(true);
        try {
            const q = query(collection(db, "ebooks"), where("title", "==", title.trim()));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setDuplicateWarning(`A book named "${title}" already exists.`);
            } else {
                setDuplicateWarning(null);
            }
        } catch (error) {
            console.error("Error checking duplicate:", error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title') {
            checkDuplicateTitle(value);
        }
    };

    // Handle Document Selection (PDF/EPUB)
    const handleDocChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'application/epub+zip'];
            if (!validTypes.includes(file.type) && !file.name.endsWith('.epub')) {
                alert("Please upload a PDF or EPUB file.");
                return;
            }
            if (file.size > 50 * 1024 * 1024) { // 50MB Limit
                alert("File size exceeds 50MB limit.");
                return;
            }
            setDocFile(file);

            // Auto-fill title
            if (!formData.title) {
                const autoTitle = file.name.replace(/\.(pdf|epub)$/i, "");
                setFormData(prev => ({ ...prev, title: autoTitle }));
                checkDuplicateTitle(autoTitle);
            }
        }
    };

    // Handle Cover Selection
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

    const removeDoc = () => setDocFile(null);
    const removeCover = () => {
        setCoverFile(null);
        setCoverPreview(null);
    };
const handleSubmit = async (e) => {
        e.preventDefault();

        if (!docFile || !coverFile) {
            alert("Please upload both a Document (PDF/EPUB) and a Cover Image.");
            return;
        }
        if (!formData.title || duplicateWarning) {
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload Document
            const docRef = ref(storage, `ebooks/docs/${Date.now()}_${docFile.name}`);
            const docUploadTask = uploadBytesResumable(docRef, docFile);

            // 2. Upload Cover
            const coverRef = ref(storage, `ebooks/covers/${Date.now()}_${coverFile.name}`);
            const coverUploadTask = uploadBytesResumable(coverRef, coverFile);

            // Track Doc progress
            docUploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            });

            await Promise.all([docUploadTask, coverUploadTask]);

            const docUrl = await getDownloadURL(docUploadTask.snapshot.ref);
            const coverUrl = await getDownloadURL(coverUploadTask.snapshot.ref);

            // 3. Save Metadata
            await addDoc(collection(db, "ebooks"), {
                ...formData,
                title: formData.title.trim(),
                fileUrl: docUrl, // Renamed from pdfUrl to generic fileUrl
                coverUrl: coverUrl,
                fileName: docFile.name,
                fileFormat: docFile.name.split('.').pop().toUpperCase(), // PDF or EPUB
                fileSize: (docFile.size / (1024 * 1024)).toFixed(2) + " MB",
                createdAt: serverTimestamp(),
                downloads: 0,
                reads: 0
            });

            showSuccess({
                title: "eBook Published!",
                message: "Your new publication has been uploaded successfully.",
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/ebooks')
            });

        } catch (error) {
            console.error("Error saving ebook:", error);
            alert("Failed to save book. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ebooks" className="p-2 hover:bg-gray-200 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Upload eBook</h1>
                        <p className="font-lato text-sm text-gray-500">Add a new publication to the library.</p>
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
                        disabled={isSubmitting || !docFile || !coverFile || !!duplicateWarning} 
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-md text-white transition-colors ${
                            (docFile && coverFile && !duplicateWarning) 
                            ? 'bg-brand-gold hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? `Uploading ${Math.round(uploadProgress)}%` : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Upload Zones */}
                <div className="space-y-6">

                    {/* Document Upload */}
                    <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors h-48 flex flex-col items-center justify-center ${
                        docFile ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300 hover:border-brand-gold'
                    }`}>
                        {docFile ? (
                            <div>
                                <FileText className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                <p className="font-bold text-brand-brown-dark text-sm truncate w-48">{docFile.name}</p>
                                <p className="text-xs text-gray-500 mb-2">{(docFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                {!isSubmitting && (
                                    <button type="button" onClick={removeDoc} className="text-red-500 text-xs font-bold hover:underline mt-2">
                                        Change File
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full relative">
                                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                                <h3 className="font-bold text-gray-700 text-sm mb-2">Upload Book</h3>
                                <p className="text-xs text-gray-400">PDF or EPUB (Max 50MB)</p>
                                <input 
                                    type="file" 
                                    accept=".pdf,.epub"
                                    onChange={handleDocChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    {/* Cover Image Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4">Book Cover</h3>
                        <div className={`relative w-full aspect-[2/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-brand-gold ${coverPreview ? 'border-none' : ''}`}>
                            {coverPreview ? (
                                <>
                                    <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                                    {!isSubmitting && (
                                        <button 
                                            type="button" 
                                            onClick={removeCover} 
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
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

                {/* RIGHT: Metadata */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Publication Details</h3>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Title</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Tafsir Surah Al-Baqarah"
                                    className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${
                                        duplicateWarning ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                                    }`} 
                                    dir={getDir(formData.title)}
                                />
                                {isChecking && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>}
                            </div>
                            {duplicateWarning && (
                                <div className="mt-2 flex items-start gap-2 text-xs font-bold text-orange-700">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> <span>{duplicateWarning}</span>
                                </div>
                            )}
                        </div>

                        {/* Filters Row 1 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Language</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select 
                                        name="language" 
                                        value={formData.language} 
                                        onChange={handleChange} 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50"
                                    >
                                        <option>English</option>
                                        <option>Hausa</option>
                                        <option>Arabic</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Access Type</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select 
                                        name="access" 
                                        value={formData.access} 
                                        onChange={handleChange} 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50"
                                    >
                                        <option>Free</option>
                                        <option>Members Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Filters Row 2 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Publisher</label>
                                <select 
                                    name="publisher" 
                                    value={formData.publisher} 
                                    onChange={handleChange} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50"
                                >
                                    <option>Al-Asad Foundation</option>
                                    <option>External Publisher</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Publication Year</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="number" 
                                        name="year" 
                                        value={formData.year} 
                                        onChange={handleChange} 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Collection Selector */}
                        <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                            <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                                <Library className="w-4 h-4" /> Add to Collection (Series)
                            </label>
                            <select 
                                name="collection" 
                                value={formData.collection} 
                                onChange={handleChange} 
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                            >
                                <option value="">Select a Collection (Optional)</option>
                                {isLoadingCollections ? (
                                    <option disabled>Loading...</option>
                                ) : (
                                    filteredCollections.length > 0 ? (
                                        filteredCollections.map(col => <option key={col.id} value={col.title}>{col.title}</option>)
                                    ) : (
                                        <option disabled>No collections found for {formData.language}</option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Description</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows="4" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50"
                                dir={getDir(formData.description)}
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}