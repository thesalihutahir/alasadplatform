"use client";

import React, { useState, useEffect } from 'react';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
// Context
import { useModal } from '@/context/ModalContext';
import LogoReveal from '@/components/logo-reveal'; 

import { 
    Search, 
    Trash2, 
    Loader2, 
    CheckCircle,
    XCircle, 
    MessageCircle,
    User,
    Mail,
    Building2,
    Briefcase,
    Eye,
    RefreshCcw,
    X,
    AlertTriangle,
    Calendar,
    FileText,
    Phone,
    Globe
} from 'lucide-react';

export default function ManagePartnersPage() {
    const { showSuccess } = useModal();

    // --- STATE ---
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All'); 
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [viewPartner, setViewPartner] = useState(null); 
    const [actionConfig, setActionConfig] = useState(null); 
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Fetch Partners
    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "partners"), orderBy("submittedAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- HELPER: Generate Email URL ---
    const generateEmailUrl = (partner, status) => {
        let subject = "";
        let body = "";

        if (status === 'Contacted') {
            subject = `Partnership Inquiry: ${partner.type} - Al-Asad Foundation`;
            body = `Dear ${partner.contactPerson},%0D%0A%0D%0AThank you for reaching out to Al-Asad Foundation regarding a potential partnership in "${partner.type}".%0D%0A%0D%0AWe have reviewed your proposal from ${partner.organization} and would like to schedule a brief meeting to discuss how we can collaborate effectively.%0D%0A%0D%0APlease let us know your availability.%0D%0A%0D%0ABest regards,%0D%0APartnerships Team`;
        } 
        else if (status === 'Partnered') {
            subject = `Official Partnership Welcome - Al-Asad Foundation`;
            body = `Dear ${partner.contactPerson},%0D%0A%0D%0AWe are thrilled to officially welcome ${partner.organization} as a partner of Al-Asad Foundation!%0D%0A%0D%0AWe look forward to a fruitful collaboration that drives meaningful impact.%0D%0A%0D%0ABest regards,%0D%0AAl-Asad Education Foundation`;
        }
        else if (status === 'Declined') {
            subject = `Update regarding your Partnership Inquiry - Al-Asad Foundation`;
            body = `Dear ${partner.contactPerson},%0D%0A%0D%0AThank you for your interest in partnering with Al-Asad Foundation and for sharing your proposal regarding ${partner.type}.%0D%0A%0D%0AAfter careful review, we regret to inform you that we are unable to proceed with this partnership at this time, as our current resources are fully committed to existing initiatives.%0D%0A%0D%0AWe appreciate the work ${partner.organization} is doing and wish you continued success.%0D%0A%0D%0ABest regards,%0D%0AAl-Asad Education Foundation`;
        }

        return `mailto:${partner.email}?subject=${subject}&body=${body}`;
    };

    // --- ACTIONS ---

    // 1. Trigger Confirmation Modal
    const confirmAction = (type, partner, payload = null) => {
        setActionConfig({ type, partner, payload });
    };

    // 2. Execute Action (After Confirmation)
    const executeAction = async () => {
        if (!actionConfig) return;
        setIsProcessing(true);
        const { type, partner, payload } = actionConfig;

        try {
            if (type === 'delete') {
                await deleteDoc(doc(db, "partners", partner.id));
                showSuccess({ title: "Deleted", message: "Partnership inquiry removed successfully." });
            } 
            else if (type === 'update') {
                await updateDoc(doc(db, "partners", partner.id), { status: payload });
                
                const mailUrl = generateEmailUrl(partner, payload);
                if (mailUrl) window.location.href = mailUrl;

                showSuccess({ title: "Status Updated", message: `Partner marked as ${payload}. Email client opened.` });
            } 
            else if (type === 'resend') {
                const mailUrl = generateEmailUrl(partner, partner.status);
                if (mailUrl) window.location.href = mailUrl;
            }

            setActionConfig(null);
            if(viewPartner) setViewPartner(null); 

        } catch (error) {
            console.error("Action failed:", error);
            alert("An error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredPartners = partners.filter(p => {
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesSearch = p.organization?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">

            {/* HEADER */}
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
                        <span className="block text-lg font-bold text-blue-600">{partners.filter(p => p.status === 'New').length}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">New</span>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    {['All', 'New', 'Contacted', 'Partnered', 'Declined'].map(status => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === status ? 'bg-white text-brand-brown-dark shadow-sm' : 'text-gray-500 hover:text-brand-brown-dark'}`}>
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 scale-75"><LogoReveal /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Organization</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Contact Person</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPartners.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-400">No inquiries found.</td></tr>
                                ) : (
                                    filteredPartners.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setViewPartner(p)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-brand-sand/30 rounded-full flex items-center justify-center text-brand-brown-dark"><Building2 className="w-5 h-5" /></div>
                                                    <div><span className="font-bold text-brand-brown-dark block text-sm">{p.organization}</span><span className="text-xs text-gray-400">{p.orgType || p.type}</span></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col"><span className="text-sm font-bold text-gray-700">{p.contactPerson}</span><span className="text-xs text-brand-gold">{p.email}</span></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                    p.status === 'Partnered' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                    p.status === 'Contacted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                    p.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        p.status === 'Partnered' ? 'bg-green-500' : 
                                                        p.status === 'Contacted' ? 'bg-blue-500' : 
                                                        p.status === 'Declined' ? 'bg-red-500' :
                                                        'bg-orange-500'
                                                    }`}></span>{p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-mono">{formatDate(p.submittedAt)}</td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => setViewPartner(p)} className="p-2 text-gray-400 hover:text-brand-brown-dark hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {p.status === 'New' && (
                                                        <button onClick={() => confirmAction('update', p, 'Contacted')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Contact">
                                                            <MessageCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {p.status !== 'Partnered' && p.status !== 'Declined' && (
                                                        <>
                                                            <button onClick={() => confirmAction('update', p, 'Partnered')} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => confirmAction('update', p, 'Declined')} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Decline">
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {p.status !== 'New' && (
                                                        <button onClick={() => confirmAction('resend', p)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Resend Email">
                                                            <RefreshCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => confirmAction('delete', p)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

            {/* --- VIEW DETAILS MODAL --- */}
            {viewPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="bg-brand-brown-dark px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
                            <h3 className="font-agency text-xl">Application Details</h3>
                            <button onClick={() => setViewPartner(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        
                        {/* Content Scrollable */}
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Updated Header Layout: No Avatar */}
                            <div className="border-b border-gray-100 pb-4">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{viewPartner.organization}</h2>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">{viewPartner.orgType}</span>
                                    <span className="inline-block bg-brand-gold/10 text-brand-gold text-xs px-2 py-1 rounded border border-brand-gold/20">{viewPartner.type}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-gray-400 text-xs uppercase mb-1">Contact Person</span><div className="flex items-center gap-2 font-semibold text-gray-700"><User className="w-4 h-4" /> {viewPartner.contactPerson}</div></div>
                                <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-gray-400 text-xs uppercase mb-1">Email</span><div className="flex items-center gap-2 font-semibold text-gray-700 break-all"><Mail className="w-4 h-4" /> {viewPartner.email}</div></div>
                                <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-gray-400 text-xs uppercase mb-1">Phone Number</span><div className="flex items-center gap-2 font-semibold text-gray-700"><Phone className="w-4 h-4" /> {viewPartner.phone}</div></div>
                                <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-gray-400 text-xs uppercase mb-1">Country</span><div className="flex items-center gap-2 font-semibold text-gray-700"><Globe className="w-4 h-4" /> {viewPartner.country}</div></div>
                                <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-gray-400 text-xs uppercase mb-1">Submitted On</span><div className="flex items-center gap-2 font-semibold text-gray-700"><Calendar className="w-4 h-4" /> {formatDate(viewPartner.submittedAt)}</div></div>
                                <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-gray-400 text-xs uppercase mb-1">Current Status</span><div className="flex items-center gap-2 font-semibold text-brand-gold"><CheckCircle className="w-4 h-4" /> {viewPartner.status}</div></div>
                            </div>

                            <div>
                                <span className="block text-gray-400 text-xs uppercase mb-2 flex items-center gap-1"><FileText className="w-3 h-3"/> Message / Proposal</span>
                                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100 max-h-40 overflow-y-auto">{viewPartner.message}</div>
                            </div>
                        </div>

                        {/* Footer Fixed */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-2 flex-wrap flex-shrink-0">
                            <button onClick={() => confirmAction('delete', viewPartner)} className="px-3 py-2 text-red-600 font-bold text-xs hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                            {viewPartner.status === 'New' && <button onClick={() => confirmAction('update', viewPartner, 'Contacted')} className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Mark Contacted</button>}
                            
                            {viewPartner.status !== 'Partnered' && viewPartner.status !== 'Declined' && (
                                <>
                                    <button onClick={() => confirmAction('update', viewPartner, 'Declined')} className="px-3 py-2 bg-orange-100 text-orange-700 font-bold text-xs rounded-lg hover:bg-orange-200 transition-colors shadow-sm border border-orange-200">Decline</button>
                                    <button onClick={() => confirmAction('update', viewPartner, 'Partnered')} className="px-3 py-2 bg-green-600 text-white font-bold text-xs rounded-lg hover:bg-green-700 transition-colors shadow-sm">Approve</button>
                                </>
                            )}
                            
                            {viewPartner.status !== 'New' && <button onClick={() => confirmAction('resend', viewPartner)} className="px-3 py-2 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700 transition-colors shadow-sm">Resend Email</button>}
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONFIRMATION MODAL --- */}
            {actionConfig && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-gray-100 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${actionConfig.type === 'delete' ? 'bg-red-100 text-red-600' : 'bg-brand-gold/20 text-brand-gold'}`}>
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-2">
                                {actionConfig.type === 'delete' ? 'Delete Inquiry?' : actionConfig.type === 'resend' ? 'Resend Email?' : 'Update Status?'}
                            </h3>
                            <p className="text-gray-500 font-lato text-sm mb-6">
                                {actionConfig.type === 'delete' ? "This action cannot be undone. Are you sure?" : 
                                 actionConfig.type === 'resend' ? `This will open your email client to resend the '${actionConfig.partner.status}' message.` :
                                 `Marking this partner as '${actionConfig.payload}' will open your email client to send a notification.`}
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setActionConfig(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={executeAction} disabled={isProcessing} className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 ${actionConfig.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-brown-dark hover:bg-brand-gold'}`}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
