"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useModal } from '@/context/ModalContext';
import { 
    ArrowLeft, Save, Loader2, UploadCloud, LayoutTemplate, 
    Type, Megaphone, MonitorPlay, FileText, Calendar, 
    ToggleLeft, ToggleRight, Check, Image as ImageIcon
} from 'lucide-react';

export default function HomepageEditorPage() {
    const { showSuccess } = useModal();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- CONFIGURATION STATE ---
    const [config, setConfig] = useState({
        hero: {
            headline: "",
            subtext: "",
            image: "",
            primaryButtonText: "Get Involved",
            primaryButtonLink: "/get-involved"
        },
        ticker: {
            enabled: false,
            text: "",
            link: ""
        },
        sections: {
            showUpdates: true,
            showLectures: true,
            showEvents: true,
            showAudios: true
        },
        featured: {
            articleId: "",
            audioId: ""
        }
    });

    // --- CONTENT OPTIONS (For Selectors) ---
    const [articles, setArticles] = useState([]);
    const [audios, setAudios] = useState([]);

    const [heroImageFile, setHeroImageFile] = useState(null);
    const [heroImagePreview, setHeroImagePreview] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Homepage Settings
                const docRef = doc(db, "settings", "homepage");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(prev => ({ ...prev, ...docSnap.data() }));
                    if (docSnap.data().hero?.image) {
                        setHeroImagePreview(docSnap.data().hero.image);
                    }
                }

                // 2. Fetch Recent Articles (for selection)
                const articlesQ = query(collection(db, "articles"), orderBy("createdAt", "desc"), limit(20));
                const articlesSnap = await getDocs(articlesQ);
                setArticles(articlesSnap.docs.map(d => ({ id: d.id, title: d.data().title })));

                // 3. Fetch Recent Audios (for selection)
                const audiosQ = query(collection(db, "audio_library"), orderBy("uploadedAt", "desc"), limit(20));
                const audiosSnap = await getDocs(audiosQ);
                setAudios(audiosSnap.docs.map(d => ({ id: d.id, title: d.data().title })));

            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- HANDLERS ---
    
    // Generic Nested Update
    const updateConfig = (section, key, value) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeroImageFile(file);
            setHeroImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let heroImageUrl = config.hero.image;

            // Upload new Hero Image if selected
            if (heroImageFile) {
                const storageRef = ref(storage, `settings/hero_${Date.now()}`);
                await uploadBytesResumable(storageRef, heroImageFile);
                heroImageUrl = await getDownloadURL(storageRef);
            }

            // Save to Firestore
            const finalConfig = {
                ...config,
                hero: { ...config.hero, image: heroImageUrl }
            };

            await setDoc(doc(db, "settings", "homepage"), finalConfig);
            setConfig(finalConfig); // Update local state with new URL
            
            showSuccess({
                title: "Homepage Updated",
                message: "Changes have been published to the live site."
            });

        } catch (error) {
            console.error("Error saving:", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-gold" /></div>;
  return (
        <div className="max-w-5xl mx-auto pb-20 px-4">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-100 pb-6 pt-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/settings" className="p-3 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-brand-brown-dark">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-4xl text-brand-brown-dark leading-none mb-1">Homepage Editor</h1>
                        <p className="font-lato text-sm text-gray-500">Customize layout, hero banner, and featured content.</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-gold text-white rounded-xl font-bold text-sm hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Publishing..." : "Save Changes"}
                </button>
            </div>

            <div className="space-y-8">

                {/* 1. ANNOUNCEMENT TICKER */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-agency text-xl text-brand-brown-dark flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-brand-gold" /> Announcement Bar
                        </h2>
                        <button 
                            onClick={() => updateConfig('ticker', 'enabled', !config.ticker.enabled)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${config.ticker.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        >
                            {config.ticker.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            {config.ticker.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>
                    
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${!config.ticker.enabled && 'opacity-50 pointer-events-none'}`}>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Announcement Text</label>
                            <input 
                                type="text" 
                                value={config.ticker.text} 
                                onChange={(e) => updateConfig('ticker', 'text', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all font-bold" 
                                placeholder="e.g. Join us for the Annual Conference!" 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Link (Optional)</label>
                            <input 
                                type="text" 
                                value={config.ticker.link} 
                                onChange={(e) => updateConfig('ticker', 'link', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all" 
                                placeholder="e.g. /events/annual-conference" 
                            />
                        </div>
                    </div>
                </div>

                {/* 2. HERO SECTION */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <h2 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                        <LayoutTemplate className="w-5 h-5 text-brand-gold" /> Hero Section
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Headline</label>
                                <input 
                                    type="text" 
                                    value={config.hero.headline} 
                                    onChange={(e) => updateConfig('hero', 'headline', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all font-agency text-xl font-bold text-brand-brown-dark" 
                                    placeholder="Main Hero Title" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Subtext</label>
                                <textarea 
                                    rows="3"
                                    value={config.hero.subtext} 
                                    onChange={(e) => updateConfig('hero', 'subtext', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all resize-none" 
                                    placeholder="Subtitle or brief description..." 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Button Text</label>
                                    <input 
                                        type="text" 
                                        value={config.hero.primaryButtonText} 
                                        onChange={(e) => updateConfig('hero', 'primaryButtonText', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Button Link</label>
                                    <input 
                                        type="text" 
                                        value={config.hero.primaryButtonLink} 
                                        onChange={(e) => updateConfig('hero', 'primaryButtonLink', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Preview/Upload */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Hero Background Image</label>
                            <div className="relative group cursor-pointer h-64 w-full rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-brand-gold transition-all">
                                {heroImagePreview ? (
                                    <>
                                        <Image src={heroImagePreview} alt="Hero" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-2">
                                                <UploadCloud className="w-4 h-4" /> Change Image
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                        <span className="text-xs">Click to Upload</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SECTION VISIBILITY & FEATURED CONTENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Section Toggles */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <h2 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                            <Type className="w-5 h-5 text-brand-gold" /> Section Visibility
                        </h2>
                        <div className="space-y-4">
                            {[
                                { key: 'showUpdates', label: 'Latest Updates Section' },
                                { key: 'showLectures', label: 'Featured Lecture Section' },
                                { key: 'showAudios', label: 'Audio Library Section' },
                                { key: 'showEvents', label: 'Upcoming Events Section' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                    <button 
                                        onClick={() => updateConfig('sections', item.key, !config.sections[item.key])}
                                        className={`transition-colors ${config.sections[item.key] ? 'text-green-600' : 'text-gray-400'}`}
                                    >
                                        {config.sections[item.key] ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Featured Content Picker */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <h2 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                            <MonitorPlay className="w-5 h-5 text-brand-gold" /> Featured Content
                        </h2>
                        
                        <div className="space-y-6">
                            {/* Featured Article */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Featured Article
                                </label>
                                <select 
                                    value={config.featured.articleId} 
                                    onChange={(e) => updateConfig('featured', 'articleId', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:border-brand-gold outline-none"
                                >
                                    <option value="">-- Select Article to Feature --</option>
                                    {articles.map(a => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Featured Audio */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <MonitorPlay className="w-3 h-3" /> Featured Audio Lecture
                                </label>
                                <select 
                                    value={config.featured.audioId} 
                                    onChange={(e) => updateConfig('featured', 'audioId', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:border-brand-gold outline-none"
                                >
                                    <option value="">-- Select Audio to Feature --</option>
                                    {audios.map(a => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 italic">
                            Note: Selected content will be highlighted in their respective sections on the homepage.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
    }
