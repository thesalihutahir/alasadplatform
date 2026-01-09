"use client";

import React, { useState } from 'react';
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
    ArrowLeft, Save, Loader2, UploadCloud, FileText, Bell, BookOpen, 
    Image as ImageIcon, X, AlertTriangle
} from 'lucide-react';

export default function CreateContentPage() {
    const router = useRouter();
    const { showSuccess } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // 1. CONTENT TYPE SELECTOR
    const [contentType, setContentType] = useState('articles'); // 'articles', 'news', 'research'

    // 2. DUPLICATE CHECK
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    // 3. FORM STATE
    const [formData, setFormData] = useState({
        status: 'Draft',
        language: 'English',
        // Articles
        title: '',
        slug: '',
        author: 'Sheikh Dr. Muneer Ja\'afar',
        category: 'Faith',
        body: '',
        excerpt: '',
        // News
        headline: '',
        eventDate: new Date().toISOString().split('T')[0],
        shortDescription: '',
        // Research
        researchTitle: '',
        authors: '',
        abstract: '',
        researchType: 'Journal Article',
        publicationStatus: 'Published',
        doi: '',
    });

    // File State (Image for Article/News, PDF for Research)
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null); // For images

    // Helper: RTL
    const getDir = (text) => {
        if (!text) return 'ltr';
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    };

    // DUPLICATE CHECKER
    const checkDuplicate = async (val, fieldName) => {
        if (!val.trim()) { setDuplicateWarning(null); return; }
        
        setIsChecking(true);
        try {
            const q = query(collection(db, contentType), where(fieldName, "==", val.trim()));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setDuplicateWarning(`A ${contentType.slice(0, -1)} with this title already exists.`);
            } else {
                setDuplicateWarning(null);
            }
        } catch (error) {
            console.error("Error checking duplicate:", error);
        } finally {
            setIsChecking(false);
        }
    };

    // HANDLE CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Auto-generate slug and Check Duplicate
        if (name === 'title' || name === 'headline' || name === 'researchTitle') {
            const slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            setFormData(prev => ({ ...prev, [name]: value, slug }));
            checkDuplicate(value, name);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // FILE HANDLER
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            // Validation based on type
            if (contentType === 'research' && selected.type !== 'application/pdf') {
                alert("Please upload a PDF for research.");
                return;
            }
            if ((contentType !== 'research') && !selected.type.startsWith('image/')) {
                alert("Please upload an image file.");
                return;
            }
            
            setFile(selected);
            if (selected.type.startsWith('image/')) {
                setFilePreview(URL.createObjectURL(selected));
            }
        }
    };

    const removeFile = () => {
        setFile(null);
        setFilePreview(null);
    };

    // SUBMIT LOGIC
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (duplicateWarning) return;

        setIsSubmitting(true);

        try {
            let fileUrl = "";
            
            // Upload File
            if (file) {
                const folder = contentType === 'research' ? 'research_pdfs' : 'blog_images';
                const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);
                
                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                });

                await uploadTask;
                fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            }

            // Construct Data Payload
            let payload = {
                createdAt: serverTimestamp(),
                status: formData.status,
                language: formData.language,
                slug: formData.slug
            };

            if (contentType === 'articles') {
                payload = { ...payload, title: formData.title, author: formData.author, category: formData.category, body: formData.body, excerpt: formData.excerpt, featuredImage: fileUrl };
            } else if (contentType === 'news') {
                payload = { ...payload, headline: formData.headline, eventDate: formData.eventDate, shortDescription: formData.shortDescription, body: formData.body, featuredImage: fileUrl };
            } else if (contentType === 'research') {
                payload = { ...payload, researchTitle: formData.researchTitle, authors: formData.authors, abstract: formData.abstract, researchType: formData.researchType, publicationStatus: formData.publicationStatus, doi: formData.doi, pdfUrl: fileUrl };
            }

            // Save to Collection
            await addDoc(collection(db, contentType), payload);

            showSuccess({
                title: "Content Created",
                message: `${contentType === 'news' ? 'News' : contentType} published successfully.`,
                confirmText: "Return to List",
                onConfirm: () => router.push('/admin/blogs')
            });

        } catch (error) {
            console.error("Error:", error);
            alert("Failed to save content.");
        } finally {
            setIsSubmitting(false);
        }
    };
return (
        <div className="max-w-6xl mx-auto pb-12">
            
            {/* HEADER */}
            <div className="flex items-center justify-between py-6 border-b border-gray-200 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blogs" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Create Content</h1>
                        <p className="font-lato text-sm text-gray-500">Publish new articles, news, or research.</p>
                    </div>
                </div>
            </div>

            {/* TYPE SELECTOR */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {['articles', 'news', 'research'].map((type) => (
                    <button
                        key={type}
                        onClick={() => { setContentType(type); setDuplicateWarning(null); }}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            contentType === type 
                            ? 'border-brand-gold bg-brand-gold/10 text-brand-brown-dark' 
                            : 'border-gray-100 bg-white text-gray-400 hover:border-brand-gold/50'
                        }`}
                    >
                        {type === 'articles' && <FileText className="w-6 h-6 mb-2" />}
                        {type === 'news' && <Bell className="w-6 h-6 mb-2" />}
                        {type === 'research' && <BookOpen className="w-6 h-6 mb-2" />}
                        <span className="uppercase font-bold text-xs tracking-wider">{type}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: UPLOADS & META */}
                <div className="space-y-6">
                    
                    {/* Language & Status */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Language</label>
                            <select name="language" value={formData.language} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                                <option>English</option>
                                <option>Hausa</option>
                                <option>Arabic</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                                <option>Draft</option>
                                <option>Published</option>
                                <option>Archived</option>
                            </select>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-brand-brown mb-3">
                            {contentType === 'research' ? 'Research PDF' : 'Featured Image'}
                        </label>
                        <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors min-h-[200px] ${
                            file ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-brand-gold'
                        }`}>
                            {file ? (
                                <div className="w-full relative">
                                    {filePreview ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2">
                                            <Image src={filePreview} alt="Preview" fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <FileText className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                    )}
                                    <p className="text-xs font-bold truncate px-2">{file.name}</p>
                                    <button type="button" onClick={removeFile} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 m-1">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-full">
                                    <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 font-bold">Click to Upload</p>
                                    <input 
                                        type="file" 
                                        accept={contentType === 'research' ? "application/pdf" : "image/*"}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    />
                                </div>
                            )}
                        </div>
                        {isSubmitting && file && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-brand-gold h-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                            </div>
                        )}
                    </div>
                </div>
{/* RIGHT COLUMN: CONTENT FIELDS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        
                        {/* --- ARTICLE FIELDS --- */}
                        {contentType === 'articles' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50" dir={getDir(formData.title)} />
                                    {duplicateWarning && <div className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</div>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-brand-brown mb-1">Author</label>
                                        <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-brand-brown mb-1">Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                            <option>Faith</option><option>Education</option><option>Technology</option><option>Community</option><option>Reflections</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Excerpt</label>
                                    <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" dir={getDir(formData.excerpt)}></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Body Content</label>
                                    <textarea name="body" value={formData.body} onChange={handleChange} rows="10" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" dir={getDir(formData.body)}></textarea>
                                </div>
                            </>
                        )}

                        {/* --- NEWS FIELDS --- */}
                        {contentType === 'news' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Headline</label>
                                    <input type="text" name="headline" value={formData.headline} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50" dir={getDir(formData.headline)} />
                                    {duplicateWarning && <div className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</div>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Event Date</label>
                                    <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Short Description</label>
                                    <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" dir={getDir(formData.shortDescription)}></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Full Content (Optional)</label>
                                    <textarea name="body" value={formData.body} onChange={handleChange} rows="6" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" dir={getDir(formData.body)}></textarea>
                                </div>
                            </>
                        )}

                        {/* --- RESEARCH FIELDS --- */}
                        {contentType === 'research' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Research Title</label>
                                    <input type="text" name="researchTitle" value={formData.researchTitle} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50" dir={getDir(formData.researchTitle)} />
                                    {duplicateWarning && <div className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</div>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-brand-brown mb-1">Authors</label>
                                        <input type="text" name="authors" value={formData.authors} onChange={handleChange} placeholder="e.g. T. Salihu" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-brand-brown mb-1">Type</label>
                                        <select name="researchType" value={formData.researchType} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                            <option>Journal Article</option><option>Conference Paper</option><option>Thesis</option><option>Report</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Abstract</label>
                                    <textarea name="abstract" value={formData.abstract} onChange={handleChange} rows="6" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" dir={getDir(formData.abstract)}></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">DOI / Link</label>
                                    <input type="text" name="doi" value={formData.doi} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-gray-100">
                            <button 
                                type="submit" 
                                disabled={isSubmitting || duplicateWarning}
                                className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-colors shadow-md ${
                                    isSubmitting || duplicateWarning ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand-gold text-white hover:bg-brand-brown-dark'
                                }`}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isSubmitting ? 'Publishing...' : 'Publish Content'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}