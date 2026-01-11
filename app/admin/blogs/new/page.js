"use client";

import React, { useState, useEffect, useRef } from 'react';
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
    X, AlertTriangle, Link as LinkIcon, Building, Sparkles, Globe, ChevronDown, Check, Calendar
} from 'lucide-react';

// --- CONSTANTS ---
const ARTICLE_CATEGORIES = [
    { id: "Faith & Spirituality", en: "Faith & Spirituality", ar: "الإيمان والروحانيات", ha: "Imani da Ruhaniya" },
    { id: "Islam & Sufism", en: "Islam & Sufism", ar: "الإسلام والتصوف", ha: "Musulunci da Sufanci" },
    { id: "Education & Learning", en: "Education & Learning", ar: "التربية والتعليم", ha: "Ilimi da Tarbiyya" },
    { id: "Thoughts & Reflections", en: "Thoughts & Reflections", ar: "خواطر وتأملات", ha: "Tunani da Tsokaci" },
    { id: "History & Biographies", en: "History & Biographies", ar: "التاريخ والسير", ha: "Tarihi da Sira" }
];

const RESEARCH_TYPES = [
    { id: "Original Research", en: "Original Research", ar: "تحقيق", ha: "Bincike na Asali" },
    { id: "Textual Analysis", en: "Textual Analysis", ar: "شرح، تحليل، تفسير", ha: "Sharhi da Fashin Baki" },
    { id: "Literature Review", en: "Literature Review", ar: "دراسة نقدية", ha: "Bitaryar Ayyuka" },
    { id: "Comparative Study", en: "Comparative Study", ar: "مقارنة", ha: "Binciken Gwama" },
    { id: "Historical Research", en: "Historical Research", ar: "دراسة تاريخية", ha: "Binciken Tarihi" },
    { id: "Case Study", en: "Case Study", ar: "دراسة حالة", ha: "Nazarin Keɓaɓɓen Yanayi" },
    { id: "Theoretical / Conceptual Study", en: "Theoretical / Conceptual Study", ar: "تأصيل وتصور", ha: "Nazarin Tushe da Hasashe" },
    { id: "Applied Research", en: "Applied Research", ar: "دراسة تطبيقية", ha: "Bincike na Aiwatarwa" },
    { id: "Methodological Study", en: "Methodological Study", ar: "منهجية", ha: "Nazarin Manhaja" }
];

const UI_TEXT = {
    English: {
        title: "Title", headline: "Headline", researchTitle: "Research Title",
        excerpt: "Excerpt / Summary", shortDesc: "Short Description", abstract: "Abstract",
        body: "Body Content", fullContent: "Full Narrative (Optional)",
        author: "Author", authors: "Authors / Contributors",
        category: "Category", type: "Research Type",
        tags: "Tags", institution: "Institution / Affiliation",
        date: "Date", year: "Publication Year",
        source: "Source", doi: "DOI / Link",
        pdfReq: "Research PDF (Required)", imgReq: "Featured Image (Recommended)",
        upload: "Click to Upload", remove: "Remove",
        phTitle: "Enter a descriptive title...", phName: "e.g. Salihu Tahir", phResearchName: "e.g. S. I. Tahir", phTags: "faith, life, ...",
        phBody: "Write your content here...", phSource: "e.g. Foundation Press",
        phHeadline: "Enter a catchy headline...", phAbstract: "Summary of the research..."
    },
    Arabic: {
        title: "العنوان", headline: "العنوان الرئيسي", researchTitle: "عنوان البحث",
        excerpt: "مقتطف / ملخص", shortDesc: "وصف قصير", abstract: "الملخص",
        body: "المحتوى", fullContent: "التفاصيل الكاملة (اختياري)",
        author: "المؤلف", authors: "المؤلفون / المساهمون",
        category: "التصنيف", type: "نوع البحث",
        tags: "الوسوم", institution: "المؤسسة / الانتماء",
        date: "التاريخ", year: "سنة النشر",
        source: "المصدر", doi: "رابط دائم / DOI",
        pdfReq: "ملف البحث (مطلوب)", imgReq: "صورة بارزة (موصى به)",
        upload: "اضغط للرفع", remove: "حذف",
        phTitle: "أدخل عنواناً واضحاً...", phName: "مثلاً: صالح طاهر", phResearchName: "مثلاً: طاهر بن صالح", phTags: "إيمان، حياة...",
        phBody: "اكتب المحتوى هنا...", phSource: "مثلاً: بيان صحفي",
        phHeadline: "أدخل عنواناً جذاباً...", phAbstract: "ملخص البحث..."
    },
    Hausa: {
        title: "Taken Rubutu", headline: "Babban Labari", researchTitle: "Taken Bincike",
        excerpt: "Takaitaccen Bayani", shortDesc: "Gajeren Bayani", abstract: "Tsokaci",
        body: "Abun Ciki", fullContent: "Cikakken Bayani (Na Zabi)",
        author: "Marubuci", authors: "Marubuta / Masu Bada Gudummawa",
        category: "Rukuni", type: "Nau'in Bincike",
        tags: "Alamomi (Tags)", institution: "Cibiya / Kungiya",
        date: "Kwanan Wata", year: "Shekarar Wallafa",
        source: "Majiya", doi: "Adireshin Yanar Gizo / DOI",
        pdfReq: "Takardar Bincike (Dole)", imgReq: "Hoto (Abin So)",
        upload: "Danna don Dorawa", remove: "Cire",
        phTitle: "Shigar da take...", phName: "Misali: Salihu Tahir", phResearchName: "Misali: S. I. Tahir", phTags: "imani, rayuwa...",
        phBody: "Rubuta anan...", phSource: "Misali: Sanarwar Jarida",
        phHeadline: "Shigar da babban labari...", phAbstract: "Tsokaci akan bincike..."
    }
};

// --- CUSTOM DROPDOWN COMPONENT ---
const CustomSelect = ({ label, options, value, onChange, placeholder, dir }) => {
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
        <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all hover:border-brand-gold/50 ${isOpen ? 'ring-2 ring-brand-gold/20 border-brand-gold' : ''}`}
                dir={dir}
            >
                <span className={`${!selectedOption ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {options.map((opt) => (
                        <div 
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-brand-sand/10 flex justify-between items-center ${value === opt.value ? 'bg-brand-sand/20 text-brand-brown-dark font-bold' : 'text-gray-600'}`}
                            dir={dir}
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

// --- CUSTOM DATE PICKER COMPONENT ---
const CustomDatePicker = ({ label, value, onChange }) => {
    return (
        <div className="relative group">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>
            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm flex justify-between items-center transition-all group-hover:border-brand-gold/50 relative">
                <span className={`${!value ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
                    {value || "Select Date..."}
                </span>
                <Calendar className="w-4 h-4 text-gray-400" />
                {/* The native date input sits on top, invisible, triggering the OS calendar */}
                <input 
                    type="date" 
                    value={value} 
                    onChange={onChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
            </div>
        </div>
    );
};
export default function CreateBlogPage() {
    const router = useRouter();
    const { showSuccess } = useModal();

    // --- UI STATE ---
    const [contentType, setContentType] = useState('articles'); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [duplicateWarning, setDuplicateWarning] = useState(null);

    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        // Common
        status: 'Draft',
        language: 'English',
        slug: '',
        
        // Articles
        title: '',
        author: '',
        category: 'Faith & Spirituality',
        body: '',
        excerpt: '',
        tags: '', 
        readTime: 0, 

        // News
        headline: '',
        eventDate: new Date().toISOString().split('T')[0],
        source: '',
        shortDescription: '',
        
        // Research
        researchTitle: '',
        authors: '', 
        institution: '', 
        publicationYear: new Date().getFullYear(),
        abstract: '',
        researchType: 'Original Research',
        doi: '',
    });

    // --- FILES STATE ---
    const [mainFile, setMainFile] = useState(null); 
    const [filePreview, setFilePreview] = useState(null); 

    // --- HELPERS ---
    const t = UI_TEXT[formData.language] || UI_TEXT.English; 
    const isRTL = formData.language === 'Arabic';

    const generateSlug = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

    const formatInput = (text) => {
        if (!text) return "";
        if (formData.language !== 'Arabic') {
            return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        }
        return text;
    };

    // --- AUTOMATION EFFECTS ---
    useEffect(() => {
        if (contentType === 'articles' && formData.body) {
            const words = formData.body.trim().split(/\s+/).length;
            const time = Math.ceil(words / 200);
            setFormData(prev => ({ ...prev, readTime: time }));
        }
    }, [formData.body, contentType]);

    // --- VALIDATION ---
    const isFormValid = () => {
        if (duplicateWarning) return false;
        if (contentType === 'articles') return formData.title && formData.author && formData.body && formData.excerpt;
        if (contentType === 'news') return formData.headline && formData.eventDate && formData.shortDescription;
        if (contentType === 'research') return formData.researchTitle && formData.authors && formData.abstract && formData.publicationYear && mainFile;
        return false;
    };

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'title' || name === 'headline' || name === 'researchTitle') {
            const slug = generateSlug(value);
            setFormData(prev => ({ ...prev, [name]: value, slug }));
            checkDuplicate(value, name);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (['title', 'headline', 'researchTitle', 'author', 'authors'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: formatInput(value) }));
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const checkDuplicate = async (val, fieldName) => {
        if (!val.trim()) { setDuplicateWarning(null); return; }
        try {
            const q = query(collection(db, contentType), where(fieldName, "==", val.trim()));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) setDuplicateWarning("Duplicate found.");
            else setDuplicateWarning(null);
        } catch (error) { console.error(error); }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        if (contentType === 'research' && selected.type !== 'application/pdf') {
            alert("Research requires a PDF document.");
            return;
        }
        if (contentType !== 'research' && !['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(selected.type)) {
            alert("Please upload a valid image (JPG, PNG, WEBP, SVG).");
            return;
        }

        setMainFile(selected);
        if (selected.type.startsWith('image/')) setFilePreview(URL.createObjectURL(selected));
        else setFilePreview(null);
    };

    const handleSubmit = async (e, status = 'Published') => {
        if(e) e.preventDefault();
        if (status === 'Published') setIsSubmitting(true);
        else setIsSavingDraft(true);

        try {
            let fileUrl = "";
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

            let payload = {
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: status,
                language: formData.language,
                slug: formData.slug
            };

            if (contentType === 'articles') {
                payload = { ...payload, title: formData.title, author: formData.author, category: formData.category, body: formData.body, excerpt: formData.excerpt, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean), featuredImage: fileUrl, readTime: formData.readTime };
            } else if (contentType === 'news') {
                payload = { ...payload, headline: formData.headline, eventDate: formData.eventDate, source: formData.source, shortDescription: formData.shortDescription, body: formData.body, featuredImage: fileUrl };
            } else if (contentType === 'research') {
                payload = { ...payload, researchTitle: formData.researchTitle, authors: formData.authors, institution: formData.institution, publicationYear: formData.publicationYear, researchType: formData.researchType, abstract: formData.abstract, doi: formData.doi, pdfUrl: fileUrl };
            }

            await addDoc(collection(db, contentType), payload);

            showSuccess({
                title: status === 'Draft' ? "Draft Saved" : "Published Successfully",
                message: `${contentType.toUpperCase()} has been saved.`,
                onConfirm: () => router.push('/admin/blogs')
            });

        } catch (error) {
            console.error("Error:", error);
            alert("Failed to save.");
        } finally {
            setIsSubmitting(false);
            setIsSavingDraft(false);
        }
    };

    // --- DROPDOWN OPTIONS ---
    const getCategoryOptions = () => ARTICLE_CATEGORIES.map(cat => ({
        value: cat.id,
        label: formData.language === 'English' ? cat.en : formData.language === 'Arabic' ? cat.ar : cat.ha
    }));

    const getResearchTypeOptions = () => RESEARCH_TYPES.map(type => ({
        value: type.id,
        label: formData.language === 'English' ? type.en : formData.language === 'Arabic' ? type.ar : type.ha
    }));
    return (
        <div className="max-w-6xl mx-auto pb-20 font-lato">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blogs" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-6 h-6 text-gray-600" /></Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">New Content</h1>
                        <p className="font-lato text-sm text-gray-500">Create content for the foundation.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={(e) => handleSubmit(e, 'Draft')} disabled={isSavingDraft || isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50">
                        {isSavingDraft && <Loader2 className="w-4 h-4 animate-spin" />} Save Draft
                    </button>
                    <button type="button" onClick={(e) => handleSubmit(e, 'Published')} disabled={isSubmitting || isSavingDraft || !isFormValid()} className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-md transition-colors ${!isFormValid() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand-gold text-white hover:bg-brand-brown-dark'}`}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? `Publishing ${Math.round(uploadProgress)}%` : 'Publish'}
                    </button>
                </div>
            </div>

            {/* LANGUAGE & MODE */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 mt-6">
                {/* Language Selector */}
                <div className="md:col-span-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-5 h-5 text-brand-gold" />
                        <span className="text-sm font-bold text-gray-700">Content Language</span>
                    </div>
                    <div className="flex gap-2">
                        {['English', 'Hausa', 'Arabic'].map(lang => (
                            <button key={lang} onClick={() => setFormData(prev => ({ ...prev, language: lang }))} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.language === lang ? 'bg-brand-brown-dark text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mode Switcher */}
                <div className="md:col-span-8 grid grid-cols-3 gap-4">
                    {['articles', 'news', 'research'].map((type) => (
                        <button key={type} onClick={() => { setContentType(type); setDuplicateWarning(null); }} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${contentType === type ? 'border-brand-gold bg-brand-gold/10 text-brand-brown-dark' : 'border-gray-100 bg-white text-gray-400 hover:border-brand-gold/50'}`}>
                            {type === 'articles' && <FileText className="w-5 h-5 mb-2" />}
                            {type === 'news' && <Bell className="w-5 h-5 mb-2" />}
                            {type === 'research' && <BookOpen className="w-5 h-5 mb-2" />}
                            <span className="uppercase font-bold text-xs tracking-wider">{type}</span>
                        </button>
                    ))}
                </div>
            </div>

            <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: INPUTS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        
                        {/* ARTICLES */}
                        {contentType === 'articles' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.title} <span className="text-red-500">*</span></label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} onBlur={handleBlur} placeholder={t.phTitle} className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${isRTL ? 'text-right font-tajawal' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} />
                                    {duplicateWarning && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.excerpt} <span className="text-red-500">*</span></label>
                                    <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows="3" placeholder={t.excerpt} className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${isRTL ? 'text-right font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.body} <span className="text-red-500">*</span></label>
                                    <textarea name="body" value={formData.body} onChange={handleChange} rows="15" placeholder={t.phBody} className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-gold/50 ${isRTL ? 'text-right font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}></textarea>
                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400"><span>Markdown Supported</span><span className="flex items-center gap-1 text-brand-gold"><Sparkles className="w-3 h-3"/> {formData.readTime} min read (Auto)</span></div>
                                </div>
                            </>
                        )}

                        {/* NEWS */}
                        {contentType === 'news' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-orange-600 uppercase mb-2">{t.headline} <span className="text-red-500">*</span></label>
                                    <input type="text" name="headline" value={formData.headline} onChange={handleChange} onBlur={handleBlur} placeholder={t.phHeadline} className={`w-full p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${isRTL ? 'text-right font-tajawal' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} />
                                    {duplicateWarning && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.source}</label>
                                    <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder={t.phSource} className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.shortDesc} <span className="text-red-500">*</span></label>
                                    <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="3" className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${isRTL ? 'text-right font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.fullContent}</label>
                                    <textarea name="body" value={formData.body} onChange={handleChange} rows="10" className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${isRTL ? 'text-right font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}></textarea>
                                </div>
                            </>
                        )}

                        {/* RESEARCH */}
                        {contentType === 'research' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 uppercase mb-2">{t.researchTitle} <span className="text-red-500">*</span></label>
                                    <input type="text" name="researchTitle" value={formData.researchTitle} onChange={handleChange} onBlur={handleBlur} className={`w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isRTL ? 'text-right font-tajawal' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} />
                                    {duplicateWarning && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> {duplicateWarning}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.authors} <span className="text-red-500">*</span></label>
                                        <input type="text" name="authors" value={formData.authors} onChange={handleChange} onBlur={handleBlur} placeholder={t.phResearchName} className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.institution}</label>
                                        <input type="text" name="institution" value={formData.institution} onChange={handleChange} className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.abstract} <span className="text-red-500">*</span></label>
                                    <textarea name="abstract" value={formData.abstract} onChange={handleChange} rows="6" placeholder={t.phAbstract} className={`w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isRTL ? 'text-right font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.doi}</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                        <input type="text" name="doi" value={formData.doi} onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: META */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                        <h4 className="font-bold text-brand-brown-dark text-sm border-b border-gray-100 pb-2">Publishing Meta</h4>
                        
                        {contentType === 'articles' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.author} <span className="text-red-500">*</span></label>
                                    <input type="text" name="author" value={formData.author} onChange={handleChange} onBlur={handleBlur} placeholder={t.phName} className={`w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} />
                                </div>
                                <CustomSelect label={t.category} options={getCategoryOptions()} value={formData.category} onChange={(val) => handleSelectChange('category', val)} placeholder="Select..." dir={isRTL ? 'rtl' : 'ltr'} />
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.tags}</label>
                                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder={t.phTags} className={`w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'} />
                                </div>
                            </>
                        )}

                        {contentType === 'news' && (
                            <CustomDatePicker 
                                label={<span>{t.date} <span className="text-red-500">*</span></span>}
                                value={formData.eventDate} 
                                onChange={handleChange} // Uses native input event
                            />
                        )}

                        {contentType === 'research' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.year} <span className="text-red-500">*</span></label>
                                    <input type="number" name="publicationYear" value={formData.publicationYear} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <CustomSelect label={t.type} options={getResearchTypeOptions()} value={formData.researchType} onChange={(val) => handleSelectChange('researchType', val)} placeholder="Select..." dir={isRTL ? 'rtl' : 'ltr'} />
                            </>
                        )}
                    </div>

                    {/* File Upload */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-bold text-brand-brown mb-3 uppercase">
                            {contentType === 'research' ? t.pdfReq : t.imgReq}
                        </label>
                        <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-colors min-h-[180px] ${mainFile ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-brand-gold'}`}>
                            {mainFile ? (
                                <div className="w-full relative">
                                    {filePreview ? <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 shadow-sm"><Image src={filePreview} alt="Preview" fill className="object-cover" /></div> : <FileText className="w-12 h-12 text-green-600 mx-auto mb-2" />}
                                    <p className="text-xs font-bold truncate px-2 text-brand-brown-dark">{mainFile.name}</p>
                                    <button type="button" onClick={() => { setMainFile(null); setFilePreview(null); }} className="mt-3 text-red-500 text-xs font-bold hover:underline">{t.remove}</button>
                                </div>
                            ) : (
                                <div className="relative w-full">
                                    <UploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-bold">{t.upload}</p>
                                    <p className="text-xs text-gray-400 mt-1">{contentType === 'research' ? 'PDF only' : 'JPG, PNG, WEBP, SVG'}</p>
                                    <input type="file" accept={contentType === 'research' ? "application/pdf" : "image/jpeg, image/png, image/webp, image/svg+xml"} onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            )}
                        </div>
                        {isSubmitting && mainFile && (
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden"><div className="bg-brand-gold h-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div></div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
