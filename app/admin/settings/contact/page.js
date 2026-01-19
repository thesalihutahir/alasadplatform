"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; // Added serverTimestamp
import { Save, Loader2, ArrowLeft, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';

export default function ContactSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initial State
    const [data, setData] = useState({
        address: '',
        email: '',
        phone: '',
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
        whatsapp: ''
    });

    // 1. Fetch Existing Data
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "general_settings", "contact_info");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setData(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // 2. Handle Input Change
    const handleChange = (e) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // 3. Save Data
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Merge true allows us to add new fields later without overwriting everything
            await setDoc(doc(db, "general_settings", "contact_info"), {
                ...data,
                updatedAt: serverTimestamp() // Track last update
            }, { merge: true });
            
            alert("Contact details updated successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-gold" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark leading-none">Edit Contact Details</h1>
                    <p className="text-gray-500 text-sm mt-1">Update address, phone, and social links visible on the website.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. General Info Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-brand-brown-dark mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-brand-gold" /> General Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Office Address</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="address" 
                                    value={data.address} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                                    placeholder="e.g. Mani Road, Katsina" 
                                />
                                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Official Email</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={data.email} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                                    placeholder="info@alasad.org" 
                                />
                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                            <div className="relative">
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={data.phone} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                                    placeholder="+234..." 
                                />
                                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Social Media Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-brand-brown-dark mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-brand-gold" /> Social Media Links
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Facebook URL</label>
                            <div className="relative">
                                <input type="url" name="facebook" value={data.facebook} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" placeholder="https://facebook.com/..." />
                                <Facebook className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Twitter (X) URL</label>
                            <div className="relative">
                                <input type="url" name="twitter" value={data.twitter} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" placeholder="https://x.com/..." />
                                <Twitter className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Instagram URL</label>
                            <div className="relative">
                                <input type="url" name="instagram" value={data.instagram} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" placeholder="https://instagram.com/..." />
                                <Instagram className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">YouTube URL</label>
                            <div className="relative">
                                <input type="url" name="youtube" value={data.youtube} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" placeholder="https://youtube.com/..." />
                                <Youtube className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">WhatsApp Channel/Group</label>
                            <div className="relative">
                                <input type="url" name="whatsapp" value={data.whatsapp} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" placeholder="https://wa.me/..." />
                                <MessageCircle className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full py-4 bg-brand-brown-dark text-white font-bold rounded-xl hover:bg-brand-gold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 text-lg font-agency tracking-wide"
                >
                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Save Changes
                </button>
            </form>
        </div>
    );
}