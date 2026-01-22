"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db, storage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useModal } from '@/context/ModalContext';
import { 
    ArrowLeft, Plus, Trash2, Loader2, UploadCloud, 
    User, Briefcase, X, Pencil, Camera, Eye, 
    Check, ChevronDown, ListOrdered, EyeOff, FileText, ArrowUp, ArrowDown
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
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`px-4 py-3 text-xs font-medium flex justify-between items-center cursor-pointer hover:bg-brand-sand/10 text-gray-600 ${value === opt.value ? 'bg-brand-sand/20 text-brand-brown-dark font-bold' : ''}`}
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

export default function LeadershipManagerPage() {
    const { showConfirm, showSuccess } = useModal();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMember, setViewMember] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        bio: '', 
        visibility: 'Visible'
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const q = query(collection(db, "leadership_members"), orderBy("order", "asc"));
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

    const toggleVisibility = async (member, e) => {
        e.stopPropagation();
        const newStatus = member.visibility === 'Visible' ? 'Hidden' : 'Visible';
        try {
            await updateDoc(doc(db, "leadership_members", member.id), { visibility: newStatus });
        } catch (error) {
            console.error("Error toggling visibility:", error);
        }
    };

    // --- REORDER LOGIC ---
    const moveMember = async (index, direction, e) => {
        e.stopPropagation(); // Prevent opening modal
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === members.length - 1) return;

        const currentMember = members[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const swapMember = members[swapIndex];

        try {
            const currentOrder = currentMember.order;
            const swapOrder = swapMember.order;

            await updateDoc(doc(db, "leadership_members", currentMember.id), { order: swapOrder });
            await updateDoc(doc(db, "leadership_members", swapMember.id), { order: currentOrder });
        } catch (error) {
            console.error("Failed to reorder", error);
            alert("Failed to reorder items.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.position || !formData.bio) { 
            alert("Name, Position, and Biography are required."); 
            return; 
        }

        setIsSubmitting(true);
        try {
            let imageUrl = "/fallback.webp";
            if (imageFile) {
                const storageRef = ref(storage, `leadership/${Date.now()}_${imageFile.name}`);
                await uploadBytesResumable(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            // Calculate Order: Place at the end of the list
            const maxOrder = members.length > 0 ? Math.max(...members.map(m => m.order || 0)) : 0;
            const newOrder = maxOrder + 1;

            await addDoc(collection(db, "leadership_members"), { 
                ...formData, 
                order: newOrder,
                image: imageUrl, 
                createdAt: serverTimestamp() 
            });

            // Reset
            setShowForm(false);
            setFormData({ name: '', position: '', bio: '', visibility: 'Visible' });
            setImageFile(null);
            setImagePreview(null);

            showSuccess({
                title: "Leader Added",
                message: "New leadership profile created successfully."
            });

        } catch (error) { 
            console.error("Error adding:", error); 
            alert("Failed to add profile."); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const handleDelete = (id) => {
        showConfirm({
            title: "Delete Profile?",
            message: "This will remove this member from the public leadership page.",
            confirmText: "Yes, Delete",
            type: "danger",
            onConfirm: async () => {
                await deleteDoc(doc(db, "leadership_members", id));
                setViewMember(null);
            }
        });
    };
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
                        <h1 className="font-agency text-4xl text-brand-brown-dark leading-none mb-1">Leadership Directory</h1>
                    </div>
                    <button 
                        onClick={() => setShowForm(!showForm)} 
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${showForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-brand-gold text-white hover:bg-brand-brown-dark'}`}
                    >
                        {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showForm ? "Cancel Adding" : "Add Leader"}
                    </button>
                </div>
                <p className="font-lato text-sm text-gray-500 mt-2 ml-14">Manage executive profiles and hierarchy.</p>
            </div>

            {/* --- ADD MEMBER FORM --- */}
            {showForm && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sand/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 relative z-10">New Leadership Profile</h2>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            
                            {/* Photo & Name */}
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="relative group cursor-pointer flex-shrink-0 mx-auto sm:mx-0">
                                    <div className={`w-28 h-28 rounded-2xl overflow-hidden border-4 transition-all shadow-sm ${imagePreview ? 'border-brand-gold' : 'border-gray-100 bg-gray-50'}`}>
                                        {imagePreview ? <Image src={imagePreview} alt="Preview" fill className="object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><Camera className="w-6 h-6 mb-1 opacity-50" /><span className="text-[9px] font-bold uppercase tracking-wider">Photo</span></div>}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                                <div className="flex-grow w-full space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Full Name <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none font-bold text-gray-700 placeholder-gray-400" placeholder="e.g. Sheikh Ibrahim" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Title / Position <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none font-bold text-gray-700 placeholder-gray-400" placeholder="e.g. Chairman / Founder" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio Field */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Biography <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                    <textarea 
                                        rows="4"
                                        value={formData.bio} 
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none font-bold text-gray-700 placeholder-gray-400 resize-none" 
                                        placeholder="Brief introduction and background..." 
                                    />
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="grid grid-cols-1">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">Visibility</label>
                                    <CustomSelect 
                                        options={[{ value: 'Visible', label: 'Visible to Public' }, { value: 'Hidden', label: 'Hidden (Draft)' }]} 
                                        value={formData.visibility} 
                                        onChange={(val) => setFormData({...formData, visibility: val})} 
                                        placeholder="Select Status" 
                                        icon={Eye} 
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-brand-gold text-white rounded-xl font-bold text-sm hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                                    {isSubmitting ? 'Saving Profile...' : 'Save Leadership Profile'}
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
                                </div>
                                <div className="p-5 text-left border-t border-gray-100">
                                    <h4 className="font-agency text-2xl text-brand-brown-dark leading-none mb-1">{formData.name || "Leader Name"}</h4>
                                    <p className="text-xs font-bold text-brand-gold uppercase tracking-wide mb-3">{formData.position || "Position Title"}</p>
                                    <p className="text-xs text-gray-500 line-clamp-3 italic">
                                        {formData.bio || "Biography preview will appear here..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LEADERSHIP GRID LIST (IMPROVED UI) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {members.map((member, index) => (
                    <div key={member.id} onClick={() => setViewMember(member)} className={`group bg-white p-4 sm:p-5 rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 flex items-start gap-4 relative cursor-pointer ${member.visibility === 'Hidden' ? 'border-gray-200 opacity-70' : 'border-gray-100 hover:border-brand-gold/30'}`}>
                        {/* Order Controls */}
                        <div className="flex flex-col gap-1 pr-3 border-r border-gray-100 justify-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={(e) => moveMember(index, 'up', e)} 
                                disabled={index === 0}
                                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-brown-dark disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-center text-gray-300 font-mono">{index + 1}</span>
                            <button 
                                onClick={(e) => moveMember(index, 'down', e)} 
                                disabled={index === members.length - 1}
                                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-brown-dark disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                <ArrowDown className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Image */}
                        <div className="relative w-16 h-16 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <Image src={member.image || "/fallback.webp"} alt={member.name} fill className="object-cover" />
                        </div>

                        {/* Content (Text Wrap Enabled) */}
                        <div className="flex-grow min-w-0 pt-1">
                            <h3 className="font-agency text-lg sm:text-xl text-brand-brown-dark leading-tight mb-1 break-words">
                                {member.name}
                            </h3>
                            <p className="text-xs font-bold text-brand-gold uppercase tracking-wide mb-2 leading-snug break-words">
                                {member.position}
                            </p>
                            {member.visibility === 'Hidden' && (
                                <span className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded border border-red-100 font-bold flex items-center gap-1 w-fit">
                                    <EyeOff className="w-3 h-3" /> Hidden
                                </span>
                            )}
                        </div>
                        
                        {/* Quick Actions Overlay (Visible by default on mobile, Hover on Desktop) */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-gray-100 lg:border-none">
                            <button onClick={(e) => toggleVisibility(member, e)} className={`p-1.5 rounded-md transition-colors ${member.visibility === 'Visible' ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' : 'text-blue-600 bg-blue-50'}`} title="Toggle Visibility">
                                {member.visibility === 'Visible' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <Link href={`/admin/settings/leadership/edit/${member.id}`} onClick={(e) => e.stopPropagation()}>
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
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setViewMember(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"><X className="w-5 h-5" /></button>
                        <div className="relative w-full aspect-[4/5] bg-gray-200">
                            <Image src={viewMember.image || "/fallback.webp"} alt={viewMember.name} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <h2 className="font-agency text-3xl mb-1">{viewMember.name}</h2>
                                <p className="text-sm font-bold text-brand-gold uppercase tracking-widest">{viewMember.position}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-white space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Biography</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{viewMember.bio}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    Display Order: <span className="font-bold text-gray-800">{viewMember.order}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/admin/settings/leadership/edit/${viewMember.id}`} className="px-4 py-2 bg-white border border-gray-200 hover:border-brand-gold text-gray-700 font-bold rounded-xl text-xs transition-colors shadow-sm">Edit</Link>
                                    <button onClick={() => { handleDelete(viewMember.id); setViewMember(null); }} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 transition-colors">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {members.length === 0 && !showForm && (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-center">
                    <div className="w-16 h-16 bg-brand-sand/20 rounded-full flex items-center justify-center mb-4"><Briefcase className="w-8 h-8 text-brand-gold opacity-50" /></div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Leaders Added</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">Create profiles for the leadership team.</p>
                    <button onClick={() => setShowForm(true)} className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">Add First Leader</button>
                </div>
            )}
        </div>
    );
}