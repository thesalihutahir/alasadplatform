"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getCountFromServer } from 'firebase/firestore'; 
// Context
import { useAuth } from '@/context/AuthContext';

import { 
    Users, 
    FileText, 
    Video, 
    Mic, 
    Handshake,
    Heart,
    Activity,
    Clock,
    Loader2
} from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    
    // Data State
    const [stats, setStats] = useState({
        donations: 0,
        volunteers: 0,
        partners: 0,
        articles: 0,
        videos: 0,
        audios: 0
    });
    
    const [auditLogs, setAuditLogs] = useState([]);

    // --- FETCH DASHBOARD DATA ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Fetch Counts (Using Server Count for performance)
                const [
                    donationsSnap, 
                    volunteersSnap, 
                    partnersSnap, 
                    articlesSnap, 
                    videosSnap, 
                    audiosSnap
                ] = await Promise.all([
                    getCountFromServer(collection(db, "donations")),
                    getCountFromServer(collection(db, "volunteers")),
                    getCountFromServer(collection(db, "partners")),
                    getCountFromServer(collection(db, "articles")), // Corrected from 'posts'
                    getCountFromServer(collection(db, "videos")),
                    getCountFromServer(collection(db, "audios"))
                ]);

                setStats({
                    donations: donationsSnap.data().count,
                    volunteers: volunteersSnap.data().count,
                    partners: partnersSnap.data().count,
                    articles: articlesSnap.data().count,
                    videos: videosSnap.data().count,
                    audios: audiosSnap.data().count
                });

            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        // 2. Real-time Audit Log Listener
        const qAudit = query(collection(db, "audit_logs"), orderBy("createdAt", "desc"), limit(10));
        const unsubscribeAudit = onSnapshot(qAudit, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAuditLogs(logs);
            setLoading(false); // Stop loading once logs are in
        });

        fetchStats();

        return () => unsubscribeAudit();
    }, []);

    // --- HELPERS ---

    // Format Date to Nigerian Time (WAT)
    const formatNigerianTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        
        return new Intl.DateTimeFormat('en-NG', {
            weekday: 'short',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: 'Africa/Lagos'
        }).format(date);
    };

    // Convert Action Code to Conversational Text
    const getConversationalText = (log) => {
        const actor = log.actor?.displayName || "System";
        const actionMap = {
            'CONTENT_CREATED': `published a new ${log.entityType || 'item'}`,
            'DONATION_VERIFIED': `verified a donation`,
            'PAYSTACK_REVERIFIED': `re-checked a Paystack transaction`,
            'ENTITY_DELETED': `deleted a ${log.entityType}`,
            'PROFILE_UPDATED': `updated their profile`,
            'ADMIN_ROLE_CHANGED': `changed an admin role`,
            'ADMIN_STATUS_CHANGED': `updated an admin status`,
            'LOGIN': `logged into the dashboard`
        };

        const actionText = actionMap[log.action] || `performed ${log.action?.toLowerCase().replace(/_/g, ' ')}`;
        return { actor, actionText };
    };

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">

            {/* 1. WELCOME HEADER */}
            <div className="flex flex-col gap-1">
                <h1 className="font-agency text-4xl text-brand-brown-dark">Dashboard Overview</h1>
                <p className="font-lato text-sm text-gray-500">
                    Welcome back, {user?.displayName}. Here is the latest activity on the platform.
                </p>
            </div>

            {/* 2. AUDIT LOG FEED (Conversational) */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-brand-brown-dark/5 px-6 py-4 border-b border-brand-brown-dark/10 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-brown-dark" />
                    <h3 className="font-bold text-brand-brown-dark text-sm uppercase tracking-widest">Live Activity Feed</h3>
                </div>
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {auditLogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No recent activity recorded.</div>
                    ) : (
                        auditLogs.map((log) => {
                            const { actor, actionText } = getConversationalText(log);
                            return (
                                <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-brand-sand/30 flex items-center justify-center text-brand-brown-dark font-bold text-xs flex-shrink-0 border border-brand-gold/20">
                                        {log.actor?.displayName?.charAt(0) || "S"}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-gray-800 text-sm leading-relaxed">
                                            <span className="font-bold text-brand-brown-dark">{actor}</span> {actionText}.
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                {formatNigerianTime(log.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 3. STATS GRID */}
            <div>
                <h3 className="font-agency text-xl text-gray-400 mb-4 px-1">Platform Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Donations (Primary) */}
                    <Link href="/admin/donations" className="bg-gradient-to-br from-brand-brown-dark to-[#5a3e1e] p-6 rounded-2xl shadow-lg shadow-brand-brown-dark/20 text-white flex items-center justify-between group transition-transform hover:scale-[1.02]">
                        <div>
                            <p className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-1">Total Donations</p>
                            <h3 className="font-agency text-4xl">{stats.donations}</h3>
                            <p className="text-white/60 text-xs mt-1">Recorded transactions</p>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-brown-dark transition-colors">
                            <Heart className="w-6 h-6" />
                        </div>
                    </Link>

                    {/* Volunteers */}
                    <Link href="/admin/volunteers" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Volunteers</p>
                            <h3 className="font-agency text-3xl text-gray-800">{stats.volunteers}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Users className="w-6 h-6" />
                        </div>
                    </Link>

                    {/* Partners */}
                    <Link href="/admin/partners" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-purple-200 transition-all">
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Partners</p>
                            <h3 className="font-agency text-3xl text-gray-800">{stats.partners}</h3>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Handshake className="w-6 h-6" />
                        </div>
                    </Link>

                    {/* Content Stats */}
                    <Link href="/admin/blogs" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all">
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Articles & News</p>
                            <h3 className="font-agency text-3xl text-gray-800">{stats.articles}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                    </Link>

                    <Link href="/admin/videos" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-red-200 transition-all">
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Videos</p>
                            <h3 className="font-agency text-3xl text-gray-800">{stats.videos}</h3>
                        </div>
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <Video className="w-6 h-6" />
                        </div>
                    </Link>

                    <Link href="/admin/audios" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-orange-200 transition-all">
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Audio Lectures</p>
                            <h3 className="font-agency text-3xl text-gray-800">{stats.audios}</h3>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <Mic className="w-6 h-6" />
                        </div>
                    </Link>

                </div>
            </div>

        </div>
    );
}