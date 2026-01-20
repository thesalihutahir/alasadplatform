"use client";

import React, { useState, useEffect } from 'react';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import { 
    Search, 
    Trash2, 
    Loader2,
    CheckCircle,
    MessageCircle,
    User,
    Mail,
    Building2,
    Briefcase,
    Filter
} from 'lucide-react';

export default function ManagePartnersPage() {

    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All'); 
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Fetch Partners (Real-time)
    useEffect(() => {
        setIsLoading(true);
        // Ensure "partners" collection matches public page submission
        const q = query(collection(db, "partners"), orderBy("submittedAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Handle Status Update with "mailto" Trigger
    const handleStatusUpdate = async (partner, newStatus) => {
        try {
            // Update Firestore
            await updateDoc(doc(db, "partners", partner.id), { status: newStatus });

            // Prepare Email Draft
            let subject = "";
            let body = "";

            if (newStatus === 'Contacted') {
                subject = `Partnership Inquiry: ${partner.type} - Al-Asad Foundation`;
                body = `Dear ${partner.contactPerson},%0D%0A%0D%0AThank you for reaching out to Al-Asad Foundation regarding a potential partnership in "${partner.type}".%0D%0A%0D%0AWe have reviewed your proposal from ${partner.organization} and would like to schedule a brief meeting to discuss how we can collaborate effectively.%0D%0A%0D%0APlease let us know your availability.%0D%0A%0D%0ABest regards,%0D%0APartnerships Team`;
            } else if (newStatus === 'Partnered') {
                subject = `Official Partnership Welcome - Al-Asad Foundation`;
                body = `Dear ${partner.contactPerson},%0D%0A%0D%0AWe are thrilled to officially welcome ${partner.organization} as a partner of Al-Asad Foundation!%0D%0A%0D%0AWe look forward to a fruitful collaboration that drives meaningful impact.%0D%0A%0D%0ABest regards,%0D%0AAl-Asad Education Foundation`;
            }

            // Open Email Client
            if (subject) {
                window.location.href = `mailto:${partner.email}?subject=${subject}&body=${body}`;
            }

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    // 3. Handle Delete
    const handleDelete = async (id) => {
        if (!confirm("Delete this inquiry? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "partners", id));
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete.");
        }
    };

    // 4. Robust Filtering Logic
    const filteredPartners = partners.filter(p => {
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesSearch = p.organization?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Helper: Safe Date Formatting
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Handle Firestore Timestamp or standard Date object
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Partnership Inquiries</h1>
                    <p className="font-lato text-sm text-gray-500">Manage collaboration requests from organizations.</p>
                </div>

                <div className="flex gap-2">
                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-center shadow-sm min-w-[80px]">
                        <span className="block text-lg font-bold text-brand-gold">{partners.length}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-center shadow-sm min-w-[80px]">
                        <span className="block text-lg font-bold text-blue-600">
                            {partners.filter(p => p.status === 'New').length}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">New</span>
                    </div>
                </div>
            </div>

            {/* 2. FILTERS & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                
                {/* Status Tabs */}
                <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    {['All', 'New', 'Contacted', 'Partnered'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                statusFilter === status 
                                ? 'bg-white text-brand-brown-dark shadow-sm' 
                                : 'text-gray-500 hover:text-brand-brown-dark'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search organization or contact person..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                    />
                </div>
            </div>

            {/* 3. CONTENT LIST */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Organization</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Person</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPartners.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-medium">No inquiries found matching your filters.</td></tr>
                                ) : (
                                    filteredPartners.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors group">

                                            {/* Organization */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-brand-sand/30 rounded-full flex items-center justify-center text-brand-brown-dark flex-shrink-0">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-brand-brown-dark block text-sm">{p.organization}</span>
                                                        <span className="text-xs text-gray-400 line-clamp-1 max-w-[180px] overflow-hidden text-ellipsis" title={p.message}>{p.message}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Person */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                                        <User className="w-3 h-3 text-gray-400" /> {p.contactPerson}
                                                    </span>
                                                    <a href={`mailto:${p.email}`} className="text-xs text-brand-gold hover:underline flex items-center gap-1.5 mt-1">
                                                        <Mail className="w-3 h-3" /> {p.email}
                                                    </a>
                                                </div>
                                            </td>

                                            {/* Type */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                                                    <Briefcase className="w-3 h-3 text-gray-400" /> {p.type}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                    p.status === 'Partnered' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    p.status === 'Contacted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        p.status === 'Partnered' ? 'bg-green-500' :
                                                        p.status === 'Contacted' ? 'bg-blue-500' :
                                                        'bg-orange-500'
                                                    }`}></span>
                                                    {p.status}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-xs text-gray-500 font-mono">{formatDate(p.submittedAt)}</td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {p.status === 'New' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(p, 'Contacted')} 
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                            title="Mark Contacted & Email"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {p.status !== 'Partnered' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(p, 'Partnered')} 
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                                                            title="Mark as Partner"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        title="Delete Inquiry"
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
