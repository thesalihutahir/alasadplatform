"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Context for Custom Modal
import { useModal } from '@/context/ModalContext';
import { 
    ArrowLeft, Save, Trash2, Loader2, UploadCloud, 
    User, BadgeCheck, X, Camera, Eye, Check, ChevronDown 
} from 'lucide-react';

// --- CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ options, value, onChange, placeholder, disabled, icon: Icon }) => {
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
        <div className="relative w-full" ref={dropdownRef}>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full pl-4 pr-10 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-gold/50'} ${isOpen ? 'ring-2 ring-brand-gold/20 border-brand-gold bg-white' : ''}`}
            >
                <div className="flex items-center gap-2 truncate text-brand-brown-dark">
                    {Icon && <Icon className="w-4 h-4 text-brand-gold flex-shrink-0" />}
                    <span>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {options.map((opt) => (
                        <div 
                            key={opt.value}
                            onClick={() => { 
                                if (!opt.disabled) {
                                    onChange(opt.value); 
                                    setIsOpen(false); 
                                }
                            }}
                            className={`px-4 py-3 text-xs font-medium flex justify-between items-center ${opt.disabled ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-brand-sand/10 text-gray-600'} ${value === opt.value ? 'bg-brand-sand/20 text-brand-brown-dark font-bold' : ''}`}
                        >
                            <span className="truncate">{opt.label}</span>
                            {value === opt.value && <Check className="w-3 h-3 text-brand-gold flex-shrink-0" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function EditTeamMemberPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const { showSuccess, showConfirm } = useModal(); // Use Custom Modal Hook

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingMembers, setExistingMembers] = useState([]);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        primaryRole: 'Esteemed Member',
        responsibilities: [] 
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);

    // --- CONSTANTS ---
    const PRIMARY_ROLES = [
        "Team Lead", // Updated
        "Operations Coordinator", 
        "Content Manager",
        "Financial Manager", // Added
        "Public Relations Officer", 
        "Livestream Lead", 
        "Creative Director",
        "Esteemed Member"
    ];

    const OPERATIONAL_RESPONSIBILITIES = [
        "Livestream Operator", "Photographer", "Videographer", "Video Editor",
        "Audio & Sound Manager", "Graphic Designer", "Content Writer",
        "Translator / Language Editor", "Equipment & Assets Officer",
        "Media Quality Reviewer", "Media Archivist", "Web Content Admin",
        "Web Platform Manager"
    ];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // 1. Fetch Current Member
                const docRef = doc(db, "team_members", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        name: data.name || '',
                        primaryRole: data.primaryRole || 'Esteemed Member',
                        responsibilities: data.responsibilities || []
                    });
                    setOriginalImage(data.image);
                    setImagePreview(data.image);
                } else {
                    router.push('/admin/settings/team');
                }

                // 2. Fetch All Members (For Role Validation)
                const q = query(collection(db, "team_members"));
                const querySnapshot = await getDocs(q);
                setExistingMembers(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    // --- HANDLERS ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const toggleResponsibility = (role) => {
        setFormData(prev => {
            const exists = prev.responsibilities.includes(role);
            if (exists) return { ...prev, responsibilities: prev.responsibilities.filter(r => r !== role) };
            else return { ...prev, responsibilities: [...prev.responsibilities, role] };
        });
    };

    // Role Logic: Check if taken by SOMEONE ELSE
    const isRoleTaken = (role) => {
        if (role === "Esteemed Member") return false;
        const takenBy = existingMembers.find(m => m.primaryRole === role && m.id !== id);
        return takenBy ? takenBy.name : false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) { alert("Name is required."); return; }
        if (formData.responsibilities.length === 0) { alert("Select at least one responsibility."); return; }

        setIsSubmitting(true);
        try {
            let imageUrl = originalImage;

            // Upload new image if selected
            if (imageFile) {
                const storageRef = ref(storage, `team/${Date.now()}_${imageFile.name}`);
                await uploadBytesResumable(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const docRef = doc(db, "team_members", id);
            await updateDoc(docRef, {
                ...formData,
                image: imageUrl,
                updatedAt: new Date()
            });

            showSuccess({
                title: "Profile Updated",
                message: "Team member details updated successfully.",
                confirmText: "Back to List",
                onConfirm: () => router.push('/admin/settings/team')
            });

        } catch (error) {
            console.error("Error updating:", error);
            alert("Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        showConfirm({
            title: "Delete Member?",
            message: "Are you sure you want to remove this member? This cannot be undone.",
            confirmText: "Yes, Delete",
            type: "danger",
            onConfirm: async () => {
                await deleteDoc(doc(db, "team_members", id));
                router.push('/admin/settings/team');
            }
        });
    };

    const roleOptions = PRIMARY_ROLES.map(role => {
        const takenBy = isRoleTaken(role);
        return { 
            value: role, 
            label: role + (takenBy ? ` (Assigned to ${takenBy})` : ''), 
            disabled: !!takenBy 
        };
    });
if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-gold" /></div>;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-100 pb-6 pt-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/settings/team" className="p-3 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-brand-brown-dark">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-4xl text-brand-brown-dark leading-none mb-1">Edit Profile</h1>
                        <p className="font-lato text-sm text-gray-500">Update team member details and roles.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/settings/team">
                        <button className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button onClick={handleDelete} className="px-6 py-3 rounded-xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                {/* LEFT: FORM INPUTS */}
                <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sand/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 relative z-10">Member Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                        {/* 1. Name & Photo */}
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="relative group cursor-pointer flex-shrink-0 mx-auto sm:mx-0">
                                <div className={`w-28 h-28 rounded-2xl overflow-hidden border-4 transition-all shadow-sm ${imagePreview ? 'border-brand-gold' : 'border-gray-100 bg-gray-50'}`}>
                                    <Image src={imagePreview || "/fallback.webp"} alt="Preview" width={112} height={112} className="object-cover w-full h-full" />
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs backdrop-blur-sm">
                                    Change
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>

                            <div className="flex-grow w-full">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Full Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none font-bold text-gray-700 placeholder-gray-400" 
                                        placeholder="e.g. Salihu Tahir" 
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* 2. Primary Role */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">Primary Role (Optional)</label>
                            <CustomSelect 
                                options={roleOptions} 
                                value={formData.primaryRole} 
                                onChange={(val) => setFormData({...formData, primaryRole: val})} 
                                placeholder="Select Primary Role" 
                                icon={BadgeCheck} 
                            />
                        </div>

                        {/* 3. Operational Responsibilities */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-3 block">Operational Responsibilities <span className="text-red-500">*</span></label>
                            <div className="flex flex-col gap-2">
                                {OPERATIONAL_RESPONSIBILITIES.map((resp) => {
                                    const isSelected = formData.responsibilities.includes(resp);
                                    return (
                                        <div 
                                            key={resp}
                                            onClick={() => toggleResponsibility(resp)}
                                            className={`cursor-pointer px-4 py-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-3 select-none ${
                                                isSelected 
                                                ? 'bg-brand-brown-dark text-white border-brand-brown-dark shadow-md' 
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-gold hover:text-brand-brown-dark'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-brand-brown-dark"></div>}
                                            </div>
                                            {resp}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full py-3.5 bg-brand-gold text-white rounded-xl font-bold text-sm hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isSubmitting ? 'Saving Changes...' : 'Update Member Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT: PREVIEW CARD */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-brand-sand/20 rounded-3xl p-6 border-2 border-dashed border-brand-gold/30 flex flex-col items-center justify-center text-center sticky top-6">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2 opacity-60">
                            <Eye className="w-5 h-5" /> Live Preview
                        </h3>

                        {/* THE CARD */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-[280px] transform hover:scale-105 transition-transform duration-300">
                            <div className="relative w-full aspect-[4/5] bg-gray-200">
                                <Image 
                                    src={imagePreview || "/fallback.webp"} 
                                    alt="Preview" 
                                    fill 
                                    className="object-cover" 
                                />
                                {/* Role Badge */}
                                {formData.primaryRole !== 'Esteemed Member' && (
                                    <div className="absolute top-3 left-3 bg-brand-gold text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                                        {formData.primaryRole}
                                    </div>
                                )}
                            </div>
                            <div className="p-5 text-left">
                                <h4 className="font-agency text-2xl text-brand-brown-dark leading-none mb-2">
                                    {formData.name || "Member Name"}
                                </h4>
                                
                                {/* Responsibilities Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {formData.responsibilities.length > 0 ? (
                                        formData.responsibilities.slice(0, 3).map((r, i) => (
                                            <span key={i} className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                {r}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-gray-400 italic">Responsibilities...</span>
                                    )}
                                    {formData.responsibilities.length > 3 && (
                                        <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                            +{formData.responsibilities.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}