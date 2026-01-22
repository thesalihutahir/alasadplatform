"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db, storage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Context for Custom Modal
import { useModal } from '@/context/ModalContext';
import { 
    ArrowLeft, Plus, Trash2, Loader2, UploadCloud, 
    User, BadgeCheck, X, Pencil, Camera, Users, Check, ChevronDown, Eye 
} from 'lucide-react';

// --- CUSTOM SELECT COMPONENT (Internal) ---
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

export default function TeamSettingsPage() {
    const { showConfirm, showSuccess } = useModal(); // Use Custom Modal
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // View Modal State
    const [viewMember, setViewMember] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        primaryRole: 'Esteemed Member',
        responsibilities: [] 
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // --- CONSTANTS ---
    const PRIMARY_ROLES = [
        "Team Lead", 
        "Operations Coordinator", 
        "Content Manager",
        "Financial Manager", 
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

    // --- FETCH MEMBERS ---
    useEffect(() => {
        const q = query(collection(db, "team_members"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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

    const isRoleTaken = (role) => {
        if (role === "Esteemed Member") return false;
        const takenBy = members.find(m => m.primaryRole === role);
        return takenBy ? takenBy.name : false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) { alert("Name is required."); return; }
        if (formData.responsibilities.length === 0) { alert("Select at least one responsibility."); return; }

        setIsSubmitting(true);
        try {
            let imageUrl = "/fallback.webp";
            if (imageFile) {
                const storageRef = ref(storage, `team/${Date.now()}_${imageFile.name}`);
                await uploadBytesResumable(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, "team_members"), { ...formData, image: imageUrl, createdAt: serverTimestamp() });
            
            // Reset Form
            setShowForm(false);
            setFormData({ name: '', primaryRole: 'Esteemed Member', responsibilities: [] });
            setImageFile(null);
            setImagePreview(null);
            
            showSuccess({
                title: "Member Added",
                message: "New team member has been successfully added.",
            });

        } catch (error) { 
            console.error("Error adding:", error); 
            alert("Failed to add member."); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const handleDelete = (id) => {
        showConfirm({
            title: "Delete Member?",
            message: "Are you sure you want to remove this team member? This action cannot be undone.",
            confirmText: "Yes, Delete",
            type: "danger",
            onConfirm: async () => {
                await deleteDoc(doc(db, "team_members", id));
                setViewMember(null); // Close view modal if open
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
if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-gold" /></div>;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">

            {/* --- HEADER --- */}
            <div className="mb-10 border-b border-gray-100 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/settings" className="p-3 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-brand-brown-dark">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-agency text-4xl text-brand-brown-dark leading-none mb-1">Media Team Directory</h1>
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)} 
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${showForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-brand-gold text-white hover:bg-brand-brown-dark'}`}
                    >
                        {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showForm ? "Cancel Adding" : "Add New Member"}
                    </button>
                </div>
                <p className="font-lato text-sm text-gray-500 mt-2 ml-14">Manage structure, roles, and responsibilities.</p>
            </div>

            {/* --- ADD MEMBER FORM --- */}
            {showForm && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sand/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 relative z-10">New Team Member Profile</h2>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="relative group cursor-pointer flex-shrink-0 mx-auto sm:mx-0">
                                    <div className={`w-28 h-28 rounded-2xl overflow-hidden border-4 transition-all shadow-sm ${imagePreview ? 'border-brand-gold' : 'border-gray-100 bg-gray-50'}`}>
                                        {imagePreview ? <Image src={imagePreview} alt="Preview" fill className="object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><Camera className="w-6 h-6 mb-1 opacity-50" /><span className="text-[9px] font-bold uppercase tracking-wider">Photo</span></div>}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex-grow w-full">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Full Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none font-bold text-gray-700 placeholder-gray-400" placeholder="e.g. Dr. Amina Yusuf" />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

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

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-3 block">Operational Responsibilities <span className="text-red-500">*</span></label>
                                <div className="flex flex-col gap-2">
                                    {OPERATIONAL_RESPONSIBILITIES.map((resp) => {
                                        const isSelected = formData.responsibilities.includes(resp);
                                        return (
                                            <div key={resp} onClick={() => toggleResponsibility(resp)} className={`cursor-pointer px-4 py-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-3 select-none ${isSelected ? 'bg-brand-brown-dark text-white border-brand-brown-dark shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-gold hover:text-brand-brown-dark'}`}>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>{isSelected && <div className="w-2 h-2 rounded-full bg-brand-brown-dark"></div>}</div>
                                                {resp}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-brand-gold text-white rounded-xl font-bold text-sm hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                                    {isSubmitting ? 'Saving Profile...' : 'Create Team Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Preview Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-brand-sand/20 rounded-3xl p-6 border-2 border-dashed border-brand-gold/30 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2 opacity-60"><Eye className="w-5 h-5" /> Public Preview</h3>
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-[280px] transform hover:scale-105 transition-transform duration-300">
                                <div className="relative w-full aspect-[4/5] bg-gray-200">
                                    <Image src={imagePreview || "/fallback.webp"} alt="Preview" fill className="object-cover" />
                                    {formData.primaryRole !== 'Esteemed Member' && <div className="absolute top-3 left-3 bg-brand-gold text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">{formData.primaryRole}</div>}
                                </div>
                                <div className="p-5 text-left">
                                    <h4 className="font-agency text-2xl text-brand-brown-dark leading-none mb-2">{formData.name || "Member Name"}</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {formData.responsibilities.length > 0 ? formData.responsibilities.slice(0, 3).map((r, i) => <span key={i} className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{r}</span>) : <span className="text-[10px] text-gray-400 italic">Responsibilities...</span>}
                                        {formData.responsibilities.length > 3 && <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">+{formData.responsibilities.length - 3}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MEMBERS GRID LIST --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                    <div key={member.id} onClick={() => setViewMember(member)} className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-brand-gold/30 hover:shadow-lg transition-all duration-300 flex items-start gap-5 relative cursor-pointer">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <Image src={member.image || "/fallback.webp"} alt={member.name} fill className="object-cover" />
                        </div>
                        <div className="flex-grow min-w-0 pt-1">
                            <h3 className="font-agency text-xl text-brand-brown-dark truncate leading-tight mb-1 group-hover:text-brand-gold transition-colors">{member.name}</h3>
                            <p className="text-xs font-bold text-brand-gold uppercase tracking-wide truncate mb-2">{member.primaryRole}</p>
                            <div className="flex flex-wrap gap-1">
                                {member.responsibilities?.slice(0, 2).map((res, idx) => <span key={idx} className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[80px]">{res}</span>)}
                                {member.responsibilities?.length > 2 && <span className="text-[9px] text-gray-400 px-1 py-0.5">+{member.responsibilities.length - 2}</span>}
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                            <Link href={`/admin/settings/team/edit/${member.id}`} onClick={(e) => e.stopPropagation()}>
                                <button className="p-1.5 text-gray-400 hover:text-brand-brown-dark hover:bg-gray-100 rounded-md transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                            </Link>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- VIEW MEMBER MODAL --- */}
            {viewMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setViewMember(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"><X className="w-5 h-5" /></button>
                        <div className="relative w-full aspect-square bg-gray-200">
                            <Image src={viewMember.image || "/fallback.webp"} alt={viewMember.name} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <h2 className="font-agency text-3xl mb-1">{viewMember.name}</h2>
                                <p className="text-sm font-bold text-brand-gold uppercase tracking-widest">{viewMember.primaryRole}</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><BadgeCheck className="w-4 h-4" /> Operational Responsibilities</h3>
                            <div className="flex flex-wrap gap-2">
                                {viewMember.responsibilities?.map((res, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-brand-sand/30 text-brand-brown-dark text-xs font-bold rounded-lg border border-brand-gold/10">
                                        {res}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <Link href={`/admin/settings/team/edit/${viewMember.id}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">Edit Profile</Link>
                                <button onClick={() => { handleDelete(viewMember.id); }} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {members.length === 0 && !showForm && (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-center">
                    <div className="w-16 h-16 bg-brand-sand/20 rounded-full flex items-center justify-center mb-4"><Users className="w-8 h-8 text-brand-gold opacity-50" /></div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Team Members Yet</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">Start building your team by adding profiles.</p>
                    <button onClick={() => setShowForm(true)} className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">Add First Member</button>
                </div>
            )}
        </div>
    );
}