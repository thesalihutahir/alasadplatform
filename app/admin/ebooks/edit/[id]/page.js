"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal & Components
import { useModal } from '@/context/ModalContext';
import CustomSelect from '@/components/CustomSelect'; 
import LogoReveal from '@/components/logo-reveal';

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
    Globe,
    BookOpen,
    Calendar as CalendarIcon
} from 'lucide-react';

export default function EditBookPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoadingCollections, setIsLoadingCollections] = useState(true);

    // Duplicate Check State
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [originalTitle, setOriginalTitle] = useState('');

    // Dynamic Collections State
    const [allCollections, setAllCollections] = useState([]);
    const [filteredCollections, setFilteredCollections] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        collection: '',
        language: 'English', 
        publisher: 'Al-Asad Education Foundation', 
        access: 'Free',
        year: new Date().getFullYear().toString(), 
        description: ''
    });

    // Publisher Selection State
    const [publisherType, setPublisherType] = useState('Al-Asad Education Foundation');

    // File States
    const [docFile, setDocFile] = useState(null); // New PDF/EPUB to upload
    const [coverFile, setCoverFile] = useState(null); // New Cover to upload
    
    // Existing Data States
    const [existingDocUrl, setExistingDocUrl] = useState(null);
    const [existingFileName, setExistingFileName] = useState('');
    const [existingCoverUrl, setExistingCoverUrl] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null); // For new or existing cover

    // Constants
    const LANGUAGE_OPTIONS = [
        { value: 'English', label: 'English' },
        { value: 'Hausa', label: 'Hausa' },
        { value: 'Arabic', label: 'Arabic' }
    ];

    const PUBLISHER_OPTIONS = [
        { value: 'Al-Asad Education Foundation', label: 'Al-Asad Education Foundation' },
        { value: 'External Publisher', label: 'External Publisher' }
    ];

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
                const qCol = query(collection(db, "ebook_collections"), orderBy("createdAt", "desc"));
                const colSnap = await getDocs(qCol);
                const collections = colSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllCollections(collections);

                // B. Fetch Book Document
                const docRef = doc(db, "ebooks", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        title: data.title || '',
                        author: data.author || '',
                        collection: data.collection || '',
                        language: data.language || 'English',
                        publisher: data.publisher || 'Al-Asad Education Foundation',
                        access: 'Free', // Defaulting as requested
                        year: data.year || new Date().getFullYear().toString(),
                        description: data.description || ''
                    });
                    setOriginalTitle(data.title);
                    
                    // Publisher Logic
                    const pub = data.publisher || 'Al-Asad Education Foundation';
                    if (pub === 'Al-Asad Education Foundation') {
                        setPublisherType('Al-Asad Education Foundation');
                    } else {
                        setPublisherType('External Publisher');
                    }

                    // Files
                    if (data.fileUrl) {
                        setExistingDocUrl(data.fileUrl);
                        setExistingFileName(data.fileName || "Existing Document");
                    }
                    if (data.coverUrl) {
                        setExistingCoverUrl(data.coverUrl);
                        setCoverPreview(data.coverUrl);
                    }

                    // Initial Filter
                    setFilteredCollections(collections.filter(c => c.category === (data.language || 'English')));
                } else {
                    alert("Book not found");
                    router.push('/admin/ebooks');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
                setIsLoadingCollections(false);
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

    // Check Duplicate Title
    const checkDuplicateTitle = async (title) => {
        if (!title.trim() || title.trim() === originalTitle) {
            setDuplicateWarning(null);
            return;
        }
        setIsChecking(true);
        try {
            const q = query(collection(db, "ebooks"), where("title", "==", title.trim()));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) setDuplicateWarning(`A book named "${title}" already exists.`);
            else setDuplicateWarning(null);
        } catch (error) {
            console.error("Error checking duplicate:", error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'title') checkDuplicateTitle(value);
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'language') {
            setFormData(prev => ({ ...prev, collection: '' }));
        }
    };

    const handlePublisherTypeChange = (value) => {
        setPublisherType(value);
        if (value === 'Al-Asad Education Foundation') {
            setFormData(prev => ({ ...prev, publisher: 'Al-Asad Education Foundation' }));
        } else {
            setFormData(prev => ({ ...prev, publisher: '' }));
        }
    };

    const handleDocChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['application/pdf', 'application/epub+zip'];
            if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.epub')) {
                alert("Please upload a PDF or EPUB file.");
                return;
            }
            if (file.size > 50 * 1024 * 1024) { 
                alert("File size exceeds 50MB limit.");
                return;
            }
            setDocFile(file);
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

    const removeDoc = () => setDocFile(null);
    
    // If user removes cover, revert to existing if available, else null
    const removeCover = () => {
        setCoverFile(null);
        setCoverPreview(existingCoverUrl || null); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || duplicateWarning) return;
        if (!formData.publisher.trim()) {
            alert("Please specify the publisher name.");
            return;
        }

        setIsSubmitting(true);

        try {
            let docUrl = existingDocUrl;
            let coverUrl = existingCoverUrl;
            let fileName = existingFileName;
            let fileFormat = null;
            let fileSize = null;

            const tasks = [];

            // 1. Upload New Document
            if (docFile) {
                const docRef = ref(storage, `ebooks/docs/${Date.now()}_${docFile.name}`);
                const docUploadTask = uploadBytesResumable(docRef, docFile);
                
                docUploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                });

                tasks.push(
                    new Promise((resolve, reject) => {
                        docUploadTask.then(async (snapshot) => {
                            const url = await getDownloadURL(snapshot.ref);
                            docUrl = url;
                            fileName = docFile.name;
                            fileFormat = docFile.name.split('.').pop().toUpperCase();
                            fileSize = (docFile.size / (1024 * 1024)).toFixed(2) + " MB";
                            resolve();
                        }).catch(reject);
                    })
                );
            }

            // 2. Upload New Cover
            if (coverFile) {
                const coverRef = ref(storage, `ebooks/covers/${Date.now()}_${coverFile.name}`);
                const coverUploadTask = uploadBytesResumable(coverRef, coverFile);
                
                tasks.push(
                    new Promise((resolve, reject) => {
                        coverUploadTask.then(async (snapshot) => {
                            coverUrl = await getDownloadURL(snapshot.ref);
                            resolve();
                        }).catch(reject);
                    })
                );
            }

            await Promise.all(tasks);

            // 3. Update Firestore
            const updateData = {
                ...formData,
                title: formData.title.trim(),
                publisher: formData.publisher.trim(),
                fileUrl: docUrl,
                coverUrl: coverUrl,
                updatedAt: new Date().toISOString()
            };

            // Only update file details if new file uploaded
            if (fileName && fileName !== existingFileName) {
                updateData.fileName = fileName;
                if(fileFormat) updateData.fileFormat = fileFormat;
                if(fileSize) updateData.fileSize = fileSize;
            }

            const docRef = doc(db, "ebooks", id);
            await updateDoc(docRef, updateData);

            showSuccess({
                title: "eBook Updated!",
                message: "Your changes have been saved successfully.",
                confirmText: "Return to Library",
                onConfirm: () => router.push('/admin/ebooks')
            });

        } catch (error) {
            console.error("Error updating ebook:", error);
            alert("Failed to update book.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Collection Options
    const collectionOptions = filteredCollections.map(c => ({
        value: c.title,
        label: c.title
    }));
if (isLoading) return <div className="h-screen flex items-center justify-center"><LogoReveal /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ebooks" className="p-2 hover:bg-gray-200 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Edit eBook</h1>
                        <p className="font-lato text-sm text-gray-500">Update publication details.</p>
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
                        disabled={isSubmitting || !!duplicateWarning} 
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-md text-white transition-colors ${
                            !duplicateWarning 
                            ? 'bg-brand-gold hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? `Saving...` : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Upload Zones */}
                <div className="space-y-6">

                    {/* Document Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-3">
                            <FileText className="w-4 h-4" /> Replace Document (Optional)
                        </label>

                        {/* Existing File Indicator */}
                        {existingDocUrl && !docFile && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-green-700 text-sm">Current File Active</p>
                                    <p className="text-green-600 text-xs truncate">{existingFileName}</p>
                                </div>
                            </div>
                        )}

                        <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center ${
                            docFile ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-brand-gold'
                        }`}>
                            {docFile ? (
                                <div>
                                    <FileText className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                                    <p className="font-bold text-brand-brown-dark text-sm truncate w-48">{docFile.name}</p>
                                    <p className="text-xs text-gray-500 mb-2">{(docFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    {!isSubmitting && (
                                        <button type="button" onClick={removeDoc} className="text-red-500 text-xs font-bold hover:underline mt-2">
                                            Cancel Replacement
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-full relative py-4">
                                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                    <h3 className="font-bold text-gray-700 text-sm mb-1">Click to Replace</h3>
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
                    </div>
                    
                    {/* Cover Image Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4">Book Cover</h3>
                        <div className={`relative w-full aspect-[2/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-brand-gold ${coverPreview ? 'border-none' : ''}`}>
                            {coverPreview ? (
                                <>
                                    <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                                    {!isSubmitting && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Click to Change</p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleCoverChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
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

                        {/* Filters Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <CustomSelect 
                                label="Language"
                                options={LANGUAGE_OPTIONS}
                                value={formData.language}
                                onChange={(val) => handleSelectChange('language', val)}
                                icon={Globe}
                                placeholder="Select Language"
                            />
                            
                            {/* Publication Year (Styled EXACTLY like CustomSelect) */}
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-2">PUBLICATION YEAR</label>
                                <div className="relative w-full">
                                    <div className="w-full pl-3 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center transition-all focus-within:border-brand-gold/50 focus-within:ring-2 focus-within:ring-brand-gold/20">
                                        <CalendarIcon className="w-4 h-4 text-brand-gold flex-shrink-0 mr-2" />
                                        <input 
                                            type="number" 
                                            name="year" 
                                            value={formData.year} 
                                            onChange={handleChange} 
                                            className="w-full bg-transparent border-none p-0 text-sm text-gray-700 font-medium placeholder-gray-500 focus:ring-0 focus:outline-none"
                                            placeholder="YYYY"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Publisher Logic */}
                        <div className="bg-brand-sand/10 p-4 rounded-xl border border-gray-100">
                            <CustomSelect 
                                label="Publisher Type"
                                options={PUBLISHER_OPTIONS}
                                value={publisherType}
                                onChange={handlePublisherTypeChange}
                                icon={BookOpen}
                                placeholder="Select Publisher"
                                className="mb-3"
                            />
                            
                            {/* Conditional Input for External Publisher */}
                            {publisherType === 'External Publisher' && (
                                <div className="animate-in fade-in slide-in-from-top-1">
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Enter Publisher Name</label>
                                    <input 
                                        type="text" 
                                        name="publisher"
                                        value={formData.publisher}
                                        onChange={handleChange}
                                        placeholder="e.g. Oxford University Press"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Collection Selector */}
                        <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                            <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                                <Library className="w-4 h-4" /> Add to Collection (Series)
                            </label>
                            {isLoadingCollections ? (
                                <div className="p-3 text-xs text-gray-400 text-center bg-gray-50 rounded-xl">Loading collections...</div>
                            ) : (
                                <CustomSelect 
                                    options={collectionOptions}
                                    value={formData.collection}
                                    onChange={(val) => handleSelectChange('collection', val)}
                                    icon={Library}
                                    placeholder={collectionOptions.length > 0 ? "Select a Collection..." : "No collections found"}
                                />
                            )}
                            <p className="text-[10px] text-gray-400 mt-2 text-center">
                                Showing collections for: <span className="font-bold text-brand-gold">{formData.language}</span>
                            </p>
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