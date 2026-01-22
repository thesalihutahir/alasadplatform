"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Context
import { useModal } from '@/context/ModalContext';
// Icons
import { 
    ArrowLeft, Save, Loader2, UploadCloud, 
    LayoutTemplate, Image as ImageIcon, 
    Landmark, Hash, CreditCard, Eye, ChevronDown, Check, Globe, Lock
} from 'lucide-react';

// --- CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ options, value, onChange, icon: Icon }) => {
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

    const selectedLabel = options.find(opt => opt.value === value)?.label;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer transition-all hover:border-brand-gold/50 ${isOpen ? 'ring-2 ring-brand-gold/20 border-brand-gold bg-white' : ''}`}
            >
                <div className="flex items-center gap-2 text-brand-brown-dark">
                    {Icon && <Icon className="w-4 h-4 text-brand-gold" />}
                    <span>{selectedLabel}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {options.map((opt) => (
                        <div 
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`px-4 py-3 text-xs font-medium flex justify-between items-center cursor-pointer hover:bg-brand-sand/10 text-gray-600 ${value === opt.value ? 'bg-brand-sand/20 text-brand-brown-dark font-bold' : ''}`}
                        >
                            <span>{opt.label}</span>
                            {value === opt.value && <Check className="w-3 h-3 text-brand-gold" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function CreateFundPage() {
    const router = useRouter();
    const { showConfirm, showSuccess } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        tagline: '',
        description: '',
        status: 'Active', 
        visibility: 'Public', 
        bankDetails: {
            bankName: '',
            accountName: '',
            accountNumber: ''
        }
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // --- HANDLERS ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            bankDetails: { ...prev.bankDetails, [name]: value }
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return alert("Image is too large (Max 5MB)");
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const confirmSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description) {
            alert("Please fill in the Fund Title and Description.");
            return;
        }

        showConfirm({
            title: "Publish Fund?",
            message: "This will create a new donation fund visible to the public (if set to Public).",
            confirmText: "Yes, Publish",
            onConfirm: executeCreation
        });
    };

    const executeCreation = async () => {
        setIsSubmitting(true);

        try {
            let downloadURL = "/fallback.webp"; // Default fallback

            // 1. Upload Cover Image (Only if selected)
            if (imageFile) {
                const storageRef = ref(storage, `funds/${Date.now()}_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve();
                        }
                    );
                });
            }

            // 2. Save Fund to Firestore
            await addDoc(collection(db, "donation_funds"), {
                ...formData,
                coverImage: downloadURL,
                raised: 0, 
                donorCount: 0,
                createdAt: serverTimestamp()
            });

            showSuccess({
                title: "Fund Published!",
                message: "Donors can now contribute to this cause.",
                onConfirm: () => router.push('/admin/donations')
            });

        } catch (error) {
            console.error("Error creating fund:", error);
            alert("Failed to create fund.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-100 pb-6 pt-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/donations" className="p-3 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-brand-brown-dark">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-4xl text-brand-brown-dark leading-none mb-1">Create Impact Fund</h1>
                        <p className="font-lato text-sm text-gray-500">Launch a new donation category.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={confirmSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: MAIN CONTENT */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. General Info Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                            <LayoutTemplate className="w-5 h-5 text-brand-gold" /> Campaign Details
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Fund Title <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Annual Scholarship Fund" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all font-bold text-brand-brown-dark placeholder-gray-400" 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Short Tagline</label>
                                <input 
                                    type="text" 
                                    name="tagline"
                                    value={formData.tagline}
                                    onChange={handleChange}
                                    placeholder="e.g. Empowering the next generation" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all" 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Description <span className="text-red-500">*</span></label>
                                <textarea 
                                    name="description"
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Explain the cause, the goal, and how the funds will be used..." 
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all resize-none" 
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* 2. Financial Configuration (Bank Details) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        
                        <h2 className="font-agency text-xl text-brand-brown-dark mb-2 flex items-center gap-2 relative z-10">
                            <Landmark className="w-5 h-5 text-green-600" /> Manual Payment Channel
                        </h2>
                        <p className="text-xs text-gray-500 mb-6 relative z-10">
                            Donors selecting "Bank Transfer" will be shown these details.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Bank Name</label>
                                <div className="relative">
                                    <Landmark className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="bankName"
                                        value={formData.bankDetails.bankName}
                                        onChange={handleBankChange}
                                        placeholder="e.g. Jaiz Bank" 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Account Number</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="accountNumber"
                                        value={formData.bankDetails.accountNumber}
                                        onChange={handleBankChange}
                                        placeholder="e.g. 0000000000" 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-mono font-bold tracking-wider" 
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Account Name</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="accountName"
                                        value={formData.bankDetails.accountName}
                                        onChange={handleBankChange}
                                        placeholder="e.g. Al-Asad Education Foundation" 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT: SIDEBAR (Visuals & Settings) */}
                <div className="space-y-8">
                    
                    {/* Status & Visibility */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="font-agency text-xl text-brand-brown-dark mb-2">Fund Settings</h2>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Visibility</label>
                            <CustomSelect 
                                icon={Globe}
                                options={[
                                    { value: 'Public', label: 'Public (Visible to All)' },
                                    { value: 'Hidden', label: 'Hidden (Draft)' }
                                ]}
                                value={formData.visibility}
                                onChange={(val) => setFormData(prev => ({ ...prev, visibility: val }))}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                            <CustomSelect 
                                icon={Lock}
                                options={[
                                    { value: 'Active', label: 'Active (Accepting)' },
                                    { value: 'Paused', label: 'Paused (No Donations)' }
                                ]}
                                value={formData.status}
                                onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-brand-gold" /> Cover Image
                        </h2>
                        
                        <div className="relative group cursor-pointer">
                            <div className={`w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all flex flex-col items-center justify-center ${imagePreview ? 'border-brand-gold bg-black' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-brand-gold'}`}>
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover opacity-80" />
                                ) : (
                                    <div className="text-center text-gray-400 p-4">
                                        <UploadCloud className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <span className="text-xs font-bold uppercase tracking-wider block">Click to Upload</span>
                                        <span className="text-[10px] opacity-70">Optional. Default used if skipped.</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* Preview Card (Mini) */}
                    <div className="bg-brand-sand/20 rounded-3xl p-6 border border-brand-gold/20">
                        <h3 className="text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Live Preview
                        </h3>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                            <div className="relative w-full h-32 bg-gray-200">
                                <Image src={imagePreview || "/fallback.webp"} alt="Preview" fill className="object-cover" />
                            </div>
                            <div className="p-4">
                                <h4 className="font-agency text-xl text-brand-brown-dark mb-1 line-clamp-1">{formData.title || "Fund Title"}</h4>
                                <p className="text-[10px] font-bold text-brand-gold uppercase tracking-wide mb-2 line-clamp-1">{formData.tagline || "Tagline goes here"}</p>
                                <p className="text-xs text-gray-500 line-clamp-2">{formData.description || "Description..."}</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full py-4 bg-brand-brown-dark text-white rounded-xl font-bold text-sm hover:bg-brand-gold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSubmitting ? `Creating ${Math.round(uploadProgress)}%` : 'Publish Fund'}
                    </button>

                </div>
            </form>
        </div>
    );
}
