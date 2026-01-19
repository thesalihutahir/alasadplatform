"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Save, Loader2, Upload, User, BadgeCheck, X } from 'lucide-react';

export default function EditTeamMemberPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        isLead: false
    });

    const [existingImage, setExistingImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // 1. Fetch Data
    useEffect(() => {
        const fetchMember = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "team_members", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        name: data.name || '',
                        role: data.role || '',
                        isLead: data.isLead || false
                    });
                    setExistingImage(data.image);
                } else {
                    alert("Team member not found.");
                    router.push('/admin/settings/team');
                }
            } catch (error) {
                console.error("Error fetching member:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMember();
    }, [id, router]);

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Submit Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.role) {
            alert("Name and Role are required.");
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = existingImage;

            // 1. Upload New Image (if selected)
            if (imageFile) {
                const storageRef = ref(storage, `team/${Date.now()}_${imageFile.name}`);
                await uploadBytesResumable(storageRef, imageFile);
                finalImageUrl = await getDownloadURL(storageRef);
            }

            // 2. Update Firestore
            const docRef = doc(db, "team_members", id);
            await updateDoc(docRef, {
                ...formData,
                image: finalImageUrl,
                updatedAt: serverTimestamp()
            });

            alert("Team member updated successfully!");
            router.push('/admin/settings/team');

        } catch (error) {
            console.error("Error updating member:", error);
            alert("Failed to update member.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-gold animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/settings/team" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="font-agency text-3xl text-brand-brown-dark">Edit Team Member</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                
                {/* Image Upload */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-brand-gold transition-colors group cursor-pointer shadow-inner">
                        
                        {/* Display Logic */}
                        {imagePreview ? (
                            <Image src={imagePreview} alt="New Preview" fill className="object-cover" />
                        ) : existingImage ? (
                            <Image src={existingImage} alt="Current" fill className="object-cover" />
                        ) : (
                            <div className="text-center p-2">
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1 group-hover:text-brand-gold" />
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Change Photo</span>
                            </div>
                        )}
                        
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>

                    {imagePreview && (
                        <button 
                            type="button" 
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"
                        >
                            <X className="w-3 h-3" /> Cancel Change
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                            />
                            <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role / Position</label>
                        <input 
                            type="text" 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                        />
                    </div>

                    {/* Is Lead Toggle */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${formData.isLead ? 'bg-brand-sand/20 border-brand-gold/50' : 'bg-gray-50 border-gray-100'}`}>
                        <input 
                            type="checkbox" 
                            name="isLead" 
                            checked={formData.isLead} 
                            onChange={handleChange} 
                            id="isLead"
                            className="w-5 h-5 text-brand-gold rounded focus:ring-brand-gold cursor-pointer accent-brand-gold"
                        />
                        <label htmlFor="isLead" className="flex items-center gap-2 cursor-pointer select-none flex-grow">
                            <BadgeCheck className={`w-5 h-5 ${formData.isLead ? 'text-brand-gold' : 'text-gray-400'}`} />
                            <div>
                                <span className="font-bold text-brand-brown-dark text-sm block">Team Lead</span>
                                <span className="text-xs text-gray-500 block">Display prominently at the top of the team page.</span>
                            </div>
                        </label>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-brand-brown-dark text-white font-bold rounded-xl hover:bg-brand-gold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Update Member
                </button>
            </form>
        </div>
    );
}