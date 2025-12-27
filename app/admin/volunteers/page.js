"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import { 
    Search, 
    Trash2, 
    Loader2,
    CheckCircle,
    XCircle,
    Phone,
    MapPin,
    MessageCircle,
    Mail
} from 'lucide-react';

export default function ManageVolunteersPage() {

    const [volunteers, setVolunteers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All'); 

    // 1. Fetch Volunteers
    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "volunteers"), orderBy("submittedAt", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setVolunteers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Handle Status Update with "mailto" Trigger
    const handleStatusUpdate = async (volunteer, newStatus) => {
        try {
            // Update Database
            await updateDoc(doc(db, "volunteers", volunteer.id), { status: newStatus });

            // Prepare Notification Text
            let subject = "";
            let body = "";

            if (newStatus === 'Approved') {
                subject = "Application Approved - Al-Asad Foundation";
                body = `Dear ${volunteer.fullName},%0D%0A%0D%0ACongratulations! We are pleased to inform you that your application to volunteer with Al-Asad Foundation has been approved.%0D%0A%0D%0AWe will be in touch shortly regarding the next steps.%0D%0A%0D%0AJazakumullahu Khairan.`;
            } else if (newStatus === 'Rejected') {
                subject = "Update on your Application - Al-Asad Foundation";
                body = `Dear ${volunteer.fullName},%0D%0A%0D%0AThank you for your interest in volunteering with us. Unfortunately, we are unable to proceed with your application at this time.%0D%0A%0D%0AWe appreciate your intention to serve.`;
            }

            // Open Email Client
            if (subject) {
                window.location.href = `mailto:${volunteer.email}?subject=${subject}&body=${body}`;
            }

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    // 3. Handle Delete
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this application?")) return;
        try {
            await deleteDoc(doc(db, "volunteers", id));
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete.");
        }
    };

    const filteredVolunteers = statusFilter === 'All' 
        ? volunteers 
        : volunteers.filter(v => v.status === statusFilter);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Volunteer Applications</h1>
                    <p className="font-lato text-sm text-gray-500">Review and manage community volunteers.</p>
                </div>
                
                <div className="flex gap-2">
                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-center shadow-sm">
                        <span className="block text-lg font-bold text-brand-gold">{volunteers.length}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-center shadow-sm">
                        <span className="block text-lg font-bold text-blue-600">
                            {volunteers.filter(v => v.status === 'Pending').length}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Pending</span>
                    </div>
                </div>
            </div>

            {/* 2. FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                                statusFilter === status 
                                ? 'bg-white text-brand-brown-dark shadow-sm' 
                                : 'text-gray-500 hover:text-brand-brown-dark'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search by name..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                </div>
            </div>

            {/* 3. CONTENT LIST */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Volunteer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role & Availability</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredVolunteers.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No volunteers found.</td></tr>
                                ) : (
                                    filteredVolunteers.map((vol) => (
                                        <tr key={vol.id} className="hover:bg-gray-50 transition-colors group">
                                            
                                            {/* Name & Contact */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-brand-brown-dark">{vol.fullName}</span>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {vol.phone}</span>
                                                        <span className="hidden md:flex items-center gap-1"><MapPin className="w-3 h-3" /> {vol.location}</span>
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        {/* Quick Contact Buttons */}
                                                        <a href={`https://wa.me/234${vol.phone.substring(1)}`} target="_blank" className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Chat on WhatsApp">
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                        </a>
                                                        <a href={`mailto:${vol.email}`} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Send Email">
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department Info */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-600 block">{vol.department}</span>
                                                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded inline-block mt-1">
                                                    {vol.availability}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    vol.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    vol.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        vol.status === 'Approved' ? 'bg-green-500' :
                                                        vol.status === 'Rejected' ? 'bg-red-500' :
                                                        'bg-blue-500'
                                                    }`}></span>
                                                    {vol.status}
                                                </span>
                                                <div className="text-[10px] text-gray-400 mt-1 pl-1">
                                                    Applied: {formatDate(vol.submittedAt)}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {vol.status !== 'Approved' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(vol, 'Approved')} 
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Approve & Notify"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {vol.status !== 'Rejected' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(vol, 'Rejected')}
                                                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Reject & Notify"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDelete(vol.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}