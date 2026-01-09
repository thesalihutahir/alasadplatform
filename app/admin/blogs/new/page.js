"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Context
import { useModal } from '@/context/ModalContext';

import { 
    ArrowLeft, Save, Loader2, UploadCloud, 
    FileText, Bell, BookOpen, 
    X, AlertTriangle, MapPin, Link as LinkIcon, Building
} from 'lucide-react';

export default function CreateContentPage() {
    const router = useRouter();
    const { showSuccess } = useModal();
    
    // --- UI STATE ---
    const [contentType, setContentType] = useState('articles'); // Default mode
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [duplicateWarning, setDuplicateWarning] = useState(null);

    // --- FORM DATA STATE ---
    const [formData, setFormData] = useState({
        // Cross-Cutting
        status: 'Draft',
        language: 'English',
        slug: '',
        
        // Articles
        title: '',
        author: 'Sheikh Dr. Muneer Ja\'afar', // Default author
        category: 'Reflections',
        body: '',
        excerpt: '',
        tags: '', 

        // News
        headline: '',
        eventDate: new Date().toISOString().split('T')[0],
        location: '', 
        source: '', 
        shortDescription: '',
        
        // Research
        researchTitle: '',
        authors: '', 
        institution: '', 
        publicationYear: new Date().getFullYear(),
        abstract: '',
        researchType: 'Journal Article',
        doi: '',
    });

    // --- FILES STATE ---
    const [mainFile, setMainFile] = useState(null); // Image for Article/News, PDF for Research
    const [filePreview, setFilePreview] = useState(null); // For Image Preview

    // --- HELPER: Slugify ---
    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     
            .replace(/[^\w\-]+/g, '') 
            .replace(/\-\-+/g, '-');  
    };

    // --- HELPER: RTL Detection ---
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // --- CHECK DUPLICATE ---
    const checkDuplicate = async (val, fieldName) => {
        if (!val.trim()) { setDuplicateWarning(null); return; }
        try {
            const q = query(collection(db, contentType), where(fieldName, "==", val.trim()));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setDuplicateWarning(`A record with this title already exists in ${contentType}.`);
            } else {
                setDuplicateWarning(null);
            }
        } catch (error) {
            console.error("Duplicate check error", error);
        }
    };

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Auto-Slug Logic
        if (name === 'title' || name === 'headline' || name === 'researchTitle') {
            const slug = generateSlug(value);
            setFormData(prev => ({ ...prev, [name]: value, slug }));
            checkDuplicate(value, name);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        // Validation
        if (contentType === 'research' && selected.type !== 'application/pdf') {
            alert("Research requires a PDF document.");
            return;
        }
        if (contentType !== 'research' && !selected.type.startsWith('image/')) {
            alert("Please upload a valid image file (JPG, PNG, WEBP).");
            return;
        }

        setMainFile(selected);
        
        // Preview logic
        if (selected.type.startsWith('image/')) {
            setFilePreview(URL.createObjectURL(selected));
        } else {
            setFilePreview(null);
        }
    };

    const handleModeSwitch = (mode) => {
        setContentType(mode);
        setDuplicateWarning(null);
        setMainFile(null);
        setFilePreview(null);
        setUploadProgress(0);
    };

    // --- SUBMIT LOGIC ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (duplicateWarning) return;

        setIsSubmitting(true);

        try {
            let fileUrl = "";
            
            // 1. Upload File
            if (mainFile) {
                const folder = contentType === 'research' ? 'research_pdfs' : 'blog_images';
                const storageRef = ref(storage, `${folder}/${Date.now()}_${mainFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, mainFile);
                
                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                });

                await uploadTask;
                fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            }

            // 2. Prepare Payload (Strict Separation)
            let payload = {
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: formData.status,
                language: formData.language,
                slug: formData.slug
            };

            if (contentType === 'articles') {
                payload = {
                    ...payload,
                    title: formData.title,
                    author: formData.author,
                    category: formData.category,
                    body: formData.body,
                    excerpt: formData.excerpt,
                    tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                    featuredImage: fileUrl,
                    readTime: Math.ceil(formData.body.split(' ').length / 200) // Auto-calc read time
                };
            } else if (contentType === 'news') {
                payload = {
                    ...payload,
                    headline: formData.headline,
                    eventDate: formData.eventDate,
                    location: formData.location,
                    source: formData.source,
                    shortDescription: formData.shortDescription,
                    body: formData.body, // Optional extended content
                    featuredImage: fileUrl
                };
            } else if (contentType === 'research') {
                payload = {
                    ...payload,
                    researchTitle: formData.researchTitle,
                    authors: formData.authors,
                    institution: formData.institution,
                    publicationYear: formData.publicationYear,
                    researchType: formData.researchType,
                    abstract: formData.abstract,
                    doi: formData.doi,
                    pdfUrl: fileUrl
                };
            }

            // 3. Save to Specific Collection
            await addDoc(collection(db, contentType), payload);

            showSuccess({
                title: "Content Published!",
                message: `Successfully added to ${contentType.toUpperCase()} library.`,
                confirmText: "Go to Dashboard",
                onConfirm: () => router.push('/admin/blogs')
            });

        } catch (error) {
            console.error("Submission Error:", error);
            alert("Failed to save content. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="max-w-6xl mx-auto pb-20">
            
            {/* HEADER */}
            <div className="flex items-center gap-4 py-6 border-b border-gray-200 mb-8">
                <Link href="/admin/blogs" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-brand-brown-dark transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Content Studio</h1>
                    <p className="font-lato text-sm text-gray-500">Select content type and fill in the details.</p>
                </div>
            </div>

            {/* MODE SWITCHER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <button
                    onClick={() => handleModeSwitch('articles')}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                        contentType === 'articles' 
                        ? 'border-brand-gold bg-brand-gold/5 shadow-md' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${contentType === 'articles' ? 'bg-brand-gold text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className={`font-agency text-xl ${contentType === 'articles' ? 'text-brand-brown-dark' : 'text-gray-500'}`}>Article</h3>
                    <p className="text-xs text-gray-400 mt-1">Reflective, educational, and timeless content.</p>
                </button>

                <button
                    onClick={() => handleModeSwitch('news')}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                        contentType === 'news' 
                        ? 'border-orange-500 bg-orange-50 shadow-md' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${contentType === 'news' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <Bell className="w-5 h-5" />
                    </div>
                    <h3 className={`font-agency text-xl ${contentType === 'news' ? 'text-orange-700' : 'text-gray-500'}`}>News & Update</h3>
                    <p className="text-xs text-gray-400 mt-1">Time-sensitive announcements and reports.</p>
                </button>

                <button
                    onClick={() => handleModeSwitch('research')}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                        contentType === 'research' 
                        ? 'border-blue-600 bg-blue-50 shadow-md' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${contentType === 'research' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className={`font-agency text-xl ${contentType === 'research' ? 'text-blue-800' : 'text-gray-500'}`}>Research</h3>
                    <p className="text-xs text-gray-400 mt-1">Academic papers, theses, and formal documents.</p>
                </button>
            </div>

            {/* THE FORM */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* --- LEFT COLUMN: CONTENT INPUTS --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        
                        {/* ================= ARTICLES FORM ================= */}
                        {contentType === 'articles' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Article Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleChange} 
                                        placeholder="Enter an engaging title..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                        dir={getDir(formData.title)}
                                        required
                                    />
                                    {duplicateWarning && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Excerpt (Summary)</label>
                                    <textarea 
                                        name="excerpt" 
                                        value={formData.excerpt} 
                                        onChange={handleChange} 
                                        rows="3" 
                                        placeholder="A short summary for search results and previews..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                        dir={getDir(formData.excerpt)}
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Body Content</label>
                                    <textarea 
                                        name="body" 
                                        value={formData.body} 
                                        onChange={handleChange} 
                                        rows="15" 
                                        placeholder="Write your article here..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                        dir={getDir(formData.body)}
                                        required
                                    ></textarea>
                                </div>
                            </>
                        )}

                        {/* ================= NEWS FORM ================= */}
                        {contentType === 'news' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-orange-600 uppercase mb-2">News Headline</label>
                                    <input 
                                        type="text" 
                                        name="headline" 
                                        value={formData.headline} 
                                        onChange={handleChange} 
                                        placeholder="Headlines should be catchy and precise..."
                                        className="w-full p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50" 
                                        dir={getDir(formData.headline)}
                                        required
                                    />
                                    {duplicateWarning && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="text" 
                                                name="location" 
                                                value={formData.location} 
                                                onChange={handleChange} 
                                                placeholder="e.g. Lafia, Nigeria"
                                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Source / Attribution</label>
                                        <input 
                                            type="text" 
                                            name="source" 
                                            value={formData.source} 
                                            onChange={handleChange} 
                                            placeholder="e.g. Press Release"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Short Description (Lead)</label>
                                    <textarea 
                                        name="shortDescription" 
                                        value={formData.shortDescription} 
                                        onChange={handleChange} 
                                        rows="3" 
                                        placeholder="The main point of the news story..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        dir={getDir(formData.shortDescription)}
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Narrative (Optional)</label>
                                    <textarea 
                                        name="body" 
                                        value={formData.body} 
                                        onChange={handleChange} 
                                        rows="10" 
                                        placeholder="Extended details, quotes, and background info..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        dir={getDir(formData.body)}
                                    ></textarea>
                                </div>
                            </>
                        )}

                        {/* ================= RESEARCH FORM ================= */}
                        {contentType === 'research' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Research Title</label>
                                    <input 
                                        type="text" 
                                        name="researchTitle" 
                                        value={formData.researchTitle} 
                                        onChange={handleChange} 
                                        placeholder="Full academic title of the paper..."
                                        className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                                        dir={getDir(formData.researchTitle)}
                                        required
                                    />
                                    {duplicateWarning && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Authors / Contributors</label>
                                        <input 
                                            type="text" 
                                            name="authors" 
                                            value={formData.authors} 
                                            onChange={handleChange} 
                                            placeholder="e.g. T. Salihu, A. Bello"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Institution / Affiliation</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="text" 
                                                name="institution" 
                                                value={formData.institution} 
                                                onChange={handleChange} 
                                                placeholder="e.g. University of Madinah"
                                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Abstract</label>
                                    <textarea 
                                        name="abstract" 
                                        value={formData.abstract} 
                                        onChange={handleChange} 
                                        rows="6" 
                                        placeholder="A concise summary of the research..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        dir={getDir(formData.abstract)}
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">DOI / Permanent Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                        <input 
                                            type="text" 
                                            name="doi" 
                                            value={formData.doi} 
                                            onChange={handleChange} 
                                            placeholder="https://doi.org/10.1000/xyz123"
                                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {/* --- RIGHT COLUMN: META & ACTIONS --- */}
                <div className="space-y-6">
                    
                    {/* Publishing Meta */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                        <h4 className="font-bold text-brand-brown-dark text-sm border-b border-gray-100 pb-2">Publishing Meta</h4>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Language</label>
                            <select name="language" value={formData.language} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none">
                                <option>English</option>
                                <option>Hausa</option>
                                <option>Arabic</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none">
                                <option>Draft</option>
                                <option>Published</option>
                                <option>Archived</option>
                            </select>
                        </div>

                        {/* Article Specific Meta */}
                        {contentType === 'articles' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Author</label>
                                    <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                                        <option>Reflections</option>
                                        <option>Faith</option>
                                        <option>Education</option>
                                        <option>Technology</option>
                                        <option>Community</option>
                                        <option>History</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tags</label>
                                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="comma, separated" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                </div>
                            </>
                        )}

                        {/* News Specific Meta */}
                        {contentType === 'news' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Event Date</label>
                                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                            </div>
                        )}

                        {/* Research Specific Meta */}
                        {contentType === 'research' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Publication Year</label>
                                    <input type="number" name="publicationYear" value={formData.publicationYear} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Research Type</label>
                                    <select name="researchType" value={formData.researchType} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                                        <option>Journal Article</option>
                                        <option>Conference Paper</option>
                                        <option>Thesis</option>
                                        <option>Report</option>
                                        <option>Working Paper</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* File Upload */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-brand-brown mb-3 uppercase">
                            {contentType === 'research' ? 'Research Document (PDF)' : 'Featured Image'}
                        </label>
                        
                        <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors min-h-[180px] ${
                            mainFile ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-brand-gold'
                        }`}>
                            {mainFile ? (
                                <div className="w-full relative">
                                    {filePreview ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 shadow-sm">
                                            <Image src={filePreview} alt="Preview" fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <FileText className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                    )}
                                    <p className="text-xs font-bold truncate px-2 text-brand-brown-dark">{mainFile.name}</p>
                                    <p className="text-[10px] text-gray-400">{(mainFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button 
                                        type="button" 
                                        onClick={() => { setMainFile(null); setFilePreview(null); }} 
                                        className="mt-3 text-red-500 text-xs font-bold hover:underline"
                                    >
                                        Remove & Replace
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-full">
                                    <UploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-bold">Click to Upload</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {contentType === 'research' ? 'PDF only (Max 20MB)' : 'JPG, PNG, WEBP (Max 5MB)'}
                                    </p>
                                    <input 
                                        type="file" 
                                        accept={contentType === 'research' ? "application/pdf" : "image/*"}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    />
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {isSubmitting && mainFile && (
                            <div className="mt-4">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                                    <span>Uploading...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-brand-gold h-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting || duplicateWarning || (!mainFile && contentType === 'research')} // Require PDF for research
                        className={`w-full flex items-center justify-center gap-2 py-4 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                            isSubmitting || duplicateWarning 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-brand-gold text-white hover:bg-brand-brown-dark'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSubmitting ? 'Publishing...' : 'Publish Content'}
                    </button>

                </div>
            </form>
        </div>
    );
}
