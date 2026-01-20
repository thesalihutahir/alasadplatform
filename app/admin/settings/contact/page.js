"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useModal } from '@/context/ModalContext'; // Custom Modal Context
import { 
    Save, 
    Loader2, 
    ArrowLeft, 
    MapPin, 
    Phone, 
    Mail, 
    Facebook, 
    Twitter, 
    Instagram, 
    Youtube, 
    MessageCircle,
    Send,
    AlertTriangle,
    Navigation // Icon for Map
} from 'lucide-react';

export default function ContactSettingsPage() {
    const { showSuccess } = useModal(); 
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false); 

    // Initial State
    const [data, setData] = useState({
        address: '',
        email: '',
        phone: '',
        mapLatitude: '', // New: Map Lat
        mapLongitude: '', // New: Map Lng
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
        whatsapp: '',
        telegram: ''
    });

    // 1. Fetch Existing Data
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                if (!db) return; 

                const docRef = doc(db, "general_settings", "contact_info");
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const savedData = docSnap.data();
                    setData({
                        address: savedData.address || '',
                        email: savedData.email || '',
                        phone: savedData.phone || '',
                        mapLatitude: savedData.mapLatitude || '',
                        mapLongitude: savedData.mapLongitude || '',
                        facebook: savedData.facebook || '',
                        twitter: savedData.twitter || '',
                        instagram: savedData.instagram || '',
                        youtube: savedData.youtube || '',
                        whatsapp: savedData.whatsapp || '',
                        telegram: savedData.telegram || ''
                    });
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
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Trigger Confirmation
    const handlePreSubmit = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    // 4. Final Save Execution
    const executeSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const docRef = doc(db, "general_settings", "contact_info");
            
            await setDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true });
            
            // Trigger Custom Success Modal
            showSuccess({
                title: "Settings Saved",
                message: "Public contact information and map location have been updated.",
                confirmText: "Okay, Great"
            });

        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 relative">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark leading-none">Edit Contact Details</h1>
                    <p className="text-gray-500 text-sm mt-1">Update contact info, map location, and social links.</p>
                </div>
            </div>

            <form onSubmit={handlePreSubmit} className="space-y-8">
                
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
                                    value={data.address || ''} 
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
                                    value={data.email || ''} 
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
                                    value={data.phone || ''} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                                    placeholder="+234..." 
                                />
                                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Map Configuration (New Section) */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-brand-brown-dark mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-brand-gold" /> Map Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Latitude</label>
                            <input 
                                type="text" 
                                name="mapLatitude" 
                                value={data.mapLatitude || ''} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                                placeholder="e.g. 12.970758" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Longitude</label>
                            <input 
                                type="text" 
                                name="mapLongitude" 
                                value={data.mapLongitude || ''} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all" 
                                placeholder="e.g. 7.636398" 
                            />
                        </div>
                        <div className="md:col-span-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                            <span className="font-bold">Tip:</span> Go to Google Maps, right-click on your location, and click the numbers (e.g., 12.97..., 7.63...) to copy them. Paste the first number in Latitude and the second in Longitude.
                        </div>
                    </div>
                </div>

                {/* 3. Social Media Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-brand-brown-dark mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-brand-gold" /> Social Media Links
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Facebook URL</label>
                            <div className="relative">
                                <input 
                                    type="url" 
                                    name="facebook" 
                                    value={data.facebook || ''} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="https://facebook.com/..." 
                                />
                                <Facebook className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Twitter (X) URL</label>
                            <div className="relative">
                                <input 
                                    type="url" 
                                    name="twitter" 
                                    value={data.twitter || ''} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="https://x.com/..." 
                                />
                                <Twitter className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Instagram URL</label>
                            <div className="relative">
                                <input 
                                    type="url" 
                                    name="instagram" 
                                    value={data.instagram || ''} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="https://instagram.com/..." 
                                />
                                <Instagram className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">YouTube URL</label>
                            <div className="relative">
                                <input 
                                    type="url" 
                                    name="youtube" 
                                    value={data.youtube || ''} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="https://youtube.com/..." 
                                />
                                <Youtube className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">WhatsApp Channel</label>
                            <div className="relative">
                                <input 
                                    type="url" 
                                    name="whatsapp" 
                                    value={data.whatsapp || ''} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="https://wa.me/..." 
                                />
                                <MessageCircle className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Telegram Channel</label>
                            <div className="relative">
                                <input 
                                    type="url" 
                                    name="telegram" 
                                    value={data.telegram || ''} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="https://t.me/..." 
                                />
                                <Send className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
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

            {/* --- VERIFICATION MODAL --- */}
            {showConfirm && (
                <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-2">Confirm Updates?</h3>
                            <p className="text-gray-500 font-lato text-sm mb-8">
                                You are about to update public contact information. These changes will be visible on the website immediately.
                            </p>
                            
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={executeSave}
                                    className="flex-1 py-3 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-lg"
                                >
                                    Yes, Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
