"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
    Save, 
    Globe, 
    Lock, 
    Shield, 
    ToggleLeft, 
    ToggleRight, 
    Smartphone, 
    Mail, 
    MapPin,
    User,
    Camera,
    CheckCircle
} from 'lucide-react';
// Import Auth to simulate updating the user context
import { useAuth } from '@/context/AuthContext'; 

export default function SettingsPage() {

    const { user } = useAuth(); // Get current user data

    // Mock Settings State
    const [siteConfig, setSiteConfig] = useState({
        contactEmail: "info@alasadfoundation.org",
        contactPhone: "+234 800 000 0000",
        address: "No 12, Katsina GRA, Katsina State",
        maintenanceMode: false
    });

    // Profile State
    const [profileData, setProfileData] = useState({
        displayName: user?.displayName || "Admin User",
        email: user?.email || "admin@alasad.org",
        photoURL: user?.photoURL || null
    });

    const [profilePreview, setProfilePreview] = useState(profileData.photoURL);

    const handleConfigChange = (e) => {
        setSiteConfig({ ...siteConfig, [e.target.name]: e.target.value });
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setProfilePreview(url);
            setProfileData({ ...profileData, photoURL: url });
        }
    };

    const toggleMaintenance = () => {
        setSiteConfig(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
    };

    const handleSave = () => {
        alert("Settings & Profile Updated Successfully! (Frontend Demo)");
        // In real app: await updateUserProfile(profileData);
    };

    // Helper for initials
    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'A';

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            
            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4 sticky top-0 bg-gray-50 z-20 pt-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">System Settings</h1>
                    <p className="font-lato text-sm text-gray-500">Manage your profile, global configurations, and security.</p>
                </div>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark transition-colors shadow-md"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 2. LEFT COL: PROFILE SETTINGS */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <User className="w-5 h-5 text-brand-gold" />
                            My Profile
                        </h3>

                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-24 h-24 rounded-full bg-brand-brown-dark text-white flex items-center justify-center text-3xl font-bold border-4 border-gray-100 shadow-md overflow-hidden group">
                                {profilePreview ? (
                                    <Image src={profilePreview} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <span>{getInitials(profileData.displayName)}</span>
                                )}
                                
                                {/* Overlay Upload Button */}
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Click image to change</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Display Name</label>
                                <input 
                                    type="text" 
                                    name="displayName"
                                    value={profileData.displayName}
                                    onChange={handleProfileChange}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. MIDDLE & RIGHT COL: SITE CONFIG & SECURITY */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* General Site Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Globe className="w-5 h-5 text-brand-gold" />
                            General Site Information
                        </h3>
                        <p className="text-xs text-gray-400 mb-6">
                            These details will update the Footer and Contact page dynamically.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Public Contact Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="email" 
                                        name="contactEmail"
                                        value={siteConfig.contactEmail}
                                        onChange={handleConfigChange}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Official Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="contactPhone"
                                        value={siteConfig.contactPhone}
                                        onChange={handleConfigChange}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-brand-brown mb-1">Office Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="address"
                                        value={siteConfig.address}
                                        onChange={handleConfigChange}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & System */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Security */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Lock className="w-5 h-5 text-brand-gold" />
                                Security
                            </h3>
                            <div className="space-y-3">
                                <input type="password" placeholder="Current Password" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                                <input type="password" placeholder="New Password" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                                <button className="w-full py-2 bg-gray-100 text-gray-600 font-bold text-xs rounded-lg hover:bg-gray-200 transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </div>

                        {/* System Control */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Shield className="w-5 h-5 text-brand-gold" />
                                System
                            </h3>
                            <div className="flex items-center justify-between mt-6">
                                <div>
                                    <h4 className="font-bold text-brand-brown text-sm">Maintenance Mode</h4>
                                    <p className="text-xs text-gray-400">Take site offline.</p>
                                </div>
                                <button onClick={toggleMaintenance} className={`transition-colors ${siteConfig.maintenanceMode ? 'text-brand-gold' : 'text-gray-300'}`}>
                                    {siteConfig.maintenanceMode ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
}
