"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useModal } from '@/context/ModalContext';
import { 
    ArrowLeft, Save, Loader2, BarChart3, 
    MessageCircle, Mail, Link as LinkIcon, 
    Globe, Smartphone, CheckCircle
} from 'lucide-react';

export default function IntegrationsSettingsPage() {
    const { showSuccess } = useModal();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- CONFIGURATION STATE ---
    const [config, setConfig] = useState({
        analytics: {
            googleAnalyticsId: "",
            metaPixelId: ""
        },
        communication: {
            whatsappLink: "",
            telegramLink: ""
        },
        email: {
            provider: "Resend", // Default label
            notificationEmail: ""
        }
    });

    // --- FETCH SETTINGS ---
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "integrations");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
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

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "integrations"), {
                ...config,
                updatedAt: serverTimestamp()
            });
            
            showSuccess({
                title: "Integrations Updated",
                message: "Your external service connections have been saved."
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save integrations.");
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
                        <h1 className="font-agency text-4xl text-brand-brown-dark leading-none mb-1">Integrations</h1>
                        <p className="font-lato text-sm text-gray-500">Connect analytics, messaging, and email services.</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-gold text-white rounded-xl font-bold text-sm hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="space-y-8">

                {/* 1. ANALYTICS & TRACKING */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <h2 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-brand-gold" /> Analytics & Tracking
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Google Analytics ID</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={config.analytics.googleAnalyticsId} 
                                    onChange={(e) => updateConfig('analytics', 'googleAnalyticsId', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all font-mono text-gray-700" 
                                    placeholder="G-XXXXXXXXXX" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Meta Pixel ID (Optional)</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={config.analytics.metaPixelId} 
                                    onChange={(e) => updateConfig('analytics', 'metaPixelId', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all font-mono text-gray-700" 
                                    placeholder="1234567890" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. BROADCAST CHANNELS */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <h2 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-brand-gold" /> Broadcast Channels
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">WhatsApp Group Link</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="url" 
                                    value={config.communication.whatsappLink} 
                                    onChange={(e) => updateConfig('communication', 'whatsappLink', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-gray-700" 
                                    placeholder="https://chat.whatsapp.com/..." 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Telegram Channel Link</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="url" 
                                    value={config.communication.telegramLink} 
                                    onChange={(e) => updateConfig('communication', 'telegramLink', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700" 
                                    placeholder="https://t.me/..." 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. EMAIL SERVICE */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <h2 className="font-agency text-xl text-brand-brown-dark mb-6 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-brand-gold" /> Email Configuration
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email Provider</label>
                            <div className="relative">
                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                                <input 
                                    type="text" 
                                    value={config.email.provider} 
                                    readOnly
                                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed" 
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Currently configured via environment variables.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Admin Notification Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="email" 
                                    value={config.email.notificationEmail} 
                                    onChange={(e) => updateConfig('email', 'notificationEmail', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all text-gray-700" 
                                    placeholder="alerts@example.com" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
