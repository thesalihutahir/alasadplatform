"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext'; 
import CustomSelect from '@/components/CustomSelect';
import { generateTransactionReport, generateReceipt } from '@/lib/pdfGenerator';
import { logAudit } from '@/lib/audit'; // Import Audit
import { 
    collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
    Search, Plus, TrendingUp, Users, Clock, 
    CreditCard, Landmark, CheckCircle, X, 
    Trash2, Edit, Eye, Filter, RefreshCw, 
    AlertTriangle, ArrowUpRight, Copy, ShieldCheck, Flag, 
    FileBarChart, Calendar, Download, ChevronRight, FileText, Lock
} from 'lucide-react';

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
        <div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-xl sm:text-2xl font-agency font-bold text-brand-brown-dark">{value}</h3>
            {sub && <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} flex-shrink-0`}>
            <Icon className="w-5 h-5" />
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Success: 'bg-green-100 text-green-700 border-green-200',
        Pending: 'bg-orange-50 text-orange-600 border-orange-100',
        Failed: 'bg-red-50 text-red-600 border-red-100',
        Cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
        Flagged: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[status] || styles.Cancelled}`}>
            {status}
        </span>
    );
};

export default function AdminDonationsPage() {
    const { user } = useAuth();
    const { showConfirm, showSuccess } = useModal();
    
    // PERMISSIONS CHECK
    const canManage = user?.role === 'super_admin' || user?.role === 'finance_admin';

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('reconciliation');
    const [donations, setDonations] = useState([]);
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedWorkItem, setSelectedWorkItem] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [methodFilter, setMethodFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [viewDonation, setViewDonation] = useState(null);
    const [viewFund, setViewFund] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        const qDonations = query(collection(db, "donations"), orderBy("createdAt", "desc"));
        const unsubDonations = onSnapshot(qDonations, (snapshot) => {
            setDonations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        const qFunds = query(collection(db, "donation_funds"));
        const unsubFunds = onSnapshot(qFunds, (snapshot) => {
            setFunds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubDonations(); unsubFunds(); };
    }, []);

    // --- CALCULATIONS & FILTERING ---
    const totalRaised = donations.filter(d => d.status === 'Success').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pendingCount = donations.filter(d => d.status === 'Pending').length;
    const successCount = donations.filter(d => d.status === 'Success').length;
    const uniqueDonors = new Set(donations.filter(d => d.status === 'Success').map(d => d.donorEmail)).size;

    const filteredDonations = donations.filter(d => {
        const matchesSearch = (d.donorName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (d.reference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (d.donorEmail || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
        const matchesMethod = methodFilter === 'All' || d.method === methodFilter;
        
        let matchesDate = true;
        if (startDate || endDate) {
            const rowDate = d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : new Date();
            rowDate.setHours(0,0,0,0);
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0,0,0,0);
                if (rowDate < start) matchesDate = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23,59,59,999);
                if (rowDate > end) matchesDate = false;
            }
        }
        return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });

    const pendingQueue = donations.filter(d => d.status === 'Pending');

    const getMonthlyStatements = () => {
        const stats = {};
        donations.forEach(d => {
            if (d.status !== 'Success') return;
            const date = d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : new Date();
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!stats[key]) {
                stats[key] = { 
                    month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
                    total: 0, count: 0, donors: new Set() 
                };
            }
            stats[key].total += Number(d.amount);
            stats[key].count += 1;
            stats[key].donors.add(d.donorEmail);
        });
        return Object.values(stats).sort((a, b) => new Date(b.month) - new Date(a.month));
    };

    // --- ACTIONS ---
    const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied!"); };

    const handleVerifyBank = async (donation) => {
        if (!canManage) return;
        showConfirm({
            title: "Confirm Payment Receipt",
            message: `Verify ₦${Number(donation.amount).toLocaleString()} from ${donation.donorName}?`,
            confirmText: "Yes, Confirm",
            onConfirm: async () => {
                setProcessingAction(true);
                try {
                    await updateDoc(doc(db, "donations", donation.id), {
                        status: 'Success',
                        verifiedAt: serverTimestamp(),
                        verifiedByUid: user.uid,
                        verifiedByEmail: user.email,
                        updatedAt: serverTimestamp()
                    });
                    
                    await logAudit({
                        action: 'DONATION_VERIFIED',
                        entityType: 'donation',
                        entityId: donation.id,
                        summary: `Verified bank transfer of ₦${donation.amount} from ${donation.donorName}`,
                        actor: user,
                        before: { status: 'Pending' },
                        after: { status: 'Success' }
                    });

                    setSelectedWorkItem(null);
                    showSuccess({ title: "Verified", message: "Donation marked as success." });
                } catch (error) { console.error(error); } finally { setProcessingAction(false); }
            }
        });
    };

    const handleReverifyPaystack = async (donation) => {
        if (!canManage) return;
        setProcessingAction(true);
        try {
            const res = await fetch('/api/paystack/verify', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ reference: donation.reference })
            });
            const data = await res.json();
            if (data.success) {
                await logAudit({
                    action: 'PAYSTACK_REVERIFIED',
                    entityType: 'donation',
                    entityId: donation.id,
                    summary: `Manually re-verified Paystack ref ${donation.reference}`,
                    actor: user
                });
                showSuccess({ title: "Verified!", message: "Paystack confirmed receipt." });
                setSelectedWorkItem(null);
            } else {
                alert(`Paystack Response: ${data.message}`);
            }
        } catch (error) { alert("Connection Error"); } finally { setProcessingAction(false); }
    };

    const handleDelete = async (id, type) => {
        if (user.role !== 'super_admin') return; // Only super admin deletes
        showConfirm({
            title: "Delete Record?",
            message: "This is a finance record. Deletion is usually not recommended.",
            confirmText: "Delete Forever",
            onConfirm: async () => {
                await deleteDoc(doc(db, type === 'fund' ? "donation_funds" : "donations", id));
                await logAudit({
                    action: 'ENTITY_DELETED',
                    entityType: type,
                    entityId: id,
                    summary: `Deleted ${type} record`,
                    actor: user
                });
                if (type === 'donation') setViewDonation(null);
                if (type === 'fund') setViewFund(null);
            }
        });
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 p-4 sm:p-6 lg:p-8 font-lato">
            
            {/* TOP HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-agency font-bold text-brand-brown-dark">Donation Manager</h1>
                        {!canManage && (
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Read-Only Mode
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm">Financial overview & reconciliation</p>
                </div>
                {canManage && (
                    <div className="flex gap-3">
                        <Link href="/admin/donations/funds/new" className="w-full md:w-auto bg-brand-brown-dark text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-brand-gold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-brown-dark/20">
                            <Plus className="w-4 h-4" /> Create Fund
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Raised" value={`₦${totalRaised.toLocaleString()}`} sub={`${successCount} successful`} icon={TrendingUp} color="bg-green-100 text-green-600" />
                <StatCard title="Pending Action" value={pendingCount} sub="Requires verification" icon={Clock} color="bg-orange-100 text-orange-600" />
                <StatCard title="Active Donors" value={uniqueDonors} sub="Unique contributors" icon={Users} color="bg-blue-100 text-blue-600" />
                <StatCard title="Active Funds" value={funds.length} sub="Campaigns running" icon={Landmark} color="bg-purple-100 text-purple-600" />
            </div>

            {/* TABS */}
            <div className="bg-white rounded-t-2xl border-b border-gray-200 px-4 sm:px-6 flex items-center gap-2 sm:gap-8 overflow-x-auto no-scrollbar">
                {[
                    { id: 'reconciliation', label: 'Reconciliation', icon: ShieldCheck, badge: pendingCount },
                    { id: 'transactions', label: 'Transactions', icon: Filter },
                    { id: 'funds', label: 'Funds', icon: Landmark },
                    { id: 'statements', label: 'Statements', icon: FileBarChart },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap px-2
                        ${activeTab === tab.id ? 'border-brand-brown-dark text-brand-brown-dark' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                    >
                        <tab.icon className="w-4 h-4" /> 
                        {tab.label} 
                        {tab.badge > 0 && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px]">{tab.badge}</span>}
                    </button>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 border-t-0 min-h-[500px]">
                
                {/* --- TAB: RECONCILIATION --- */}
                {activeTab === 'reconciliation' && (
                    <div className="flex flex-col lg:flex-row h-[600px] overflow-hidden">
                        <div className={`lg:w-1/3 border-r border-gray-100 flex flex-col ${selectedWorkItem ? 'hidden lg:flex' : 'flex'} h-full`}>
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 text-sm uppercase">Pending Queue ({pendingQueue.length})</h3>
                            </div>
                            <div className="overflow-y-auto flex-grow">
                                {pendingQueue.length === 0 ? (
                                    <div className="p-10 text-center text-gray-400 h-full flex flex-col justify-center items-center">
                                        <CheckCircle className="w-12 h-12 mb-3 text-green-200" />
                                        <p>All caught up!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {pendingQueue.map(item => (
                                            <div key={item.id} onClick={() => setSelectedWorkItem(item)} className={`p-4 cursor-pointer hover:bg-brand-sand/10 transition-colors ${selectedWorkItem?.id === item.id ? 'bg-brand-sand/20 border-l-4 border-brand-gold' : 'border-l-4 border-transparent'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-gray-800">₦{Number(item.amount).toLocaleString()}</span>
                                                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">{new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="text-sm text-gray-600 truncate max-w-[60%]">{item.donorName || "Anonymous"}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border capitalize flex items-center gap-1 ${item.method === 'paystack' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                        {item.method === 'paystack' ? <CreditCard className="w-3 h-3" /> : <Landmark className="w-3 h-3" />}
                                                        {item.method}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`lg:w-2/3 bg-gray-50/50 p-4 sm:p-8 overflow-y-auto ${selectedWorkItem ? 'flex' : 'hidden lg:flex'} flex-col`}>
                            {selectedWorkItem ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
                                    <button onClick={() => setSelectedWorkItem(null)} className="lg:hidden mb-4 text-gray-500 flex items-center gap-2 text-sm font-bold"><ChevronRight className="w-4 h-4 rotate-180" /> Back to Queue</button>
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ref ID</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <h2 className="font-mono text-sm sm:text-lg font-bold text-brand-brown-dark">{selectedWorkItem.reference}</h2>
                                                <button onClick={() => copyToClipboard(selectedWorkItem.reference)} className="text-gray-400 hover:text-brand-gold"><Copy className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <StatusBadge status={selectedWorkItem.status} />
                                    </div>

                                    <div className="text-center py-8 bg-brand-sand/10 rounded-xl mb-8 border border-brand-gold/20 border-dashed">
                                        <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-1">Amount</p>
                                        <h1 className="text-4xl sm:text-5xl font-agency font-bold text-brand-brown-dark">₦{Number(selectedWorkItem.amount).toLocaleString()}</h1>
                                        <p className="text-xs text-gray-500 mt-2">Fund: <span className="font-bold">{selectedWorkItem.fundTitle}</span></p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-2">Donor Details</p>
                                            <div className="space-y-1">
                                                <p className="font-bold text-gray-800">{selectedWorkItem.donorName || "Anonymous"}</p>
                                                <p className="text-sm text-gray-600 break-all">{selectedWorkItem.donorEmail}</p>
                                                <p className="text-sm text-gray-600">{selectedWorkItem.donorPhone || "No Phone"}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-2">Payment Method</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                {selectedWorkItem.method === 'paystack' ? <CreditCard className="w-5 h-5 text-blue-500" /> : <Landmark className="w-5 h-5 text-green-500" />}
                                                <span className="capitalize font-bold text-gray-700">{selectedWorkItem.method}</span>
                                            </div>
                                            {selectedWorkItem.bankProofUrl ? (
                                                <a href={selectedWorkItem.bankProofUrl} target="_blank" className="text-xs text-blue-600 underline hover:text-blue-800 flex items-center gap-1"><FileText className="w-3 h-3" /> View Receipt</a>
                                            ) : <span className="text-xs text-gray-400 italic">No receipt uploaded</span>}
                                        </div>
                                    </div>

                                    {canManage ? (
                                        <div className="flex flex-col gap-3">
                                            {selectedWorkItem.method === 'bank' && (
                                                <button onClick={() => handleVerifyBank(selectedWorkItem)} disabled={processingAction} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2">
                                                    {processingAction ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} Confirm Receipt
                                                </button>
                                            )}
                                            {selectedWorkItem.method === 'paystack' && (
                                                <button onClick={() => handleReverifyPaystack(selectedWorkItem)} disabled={processingAction} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2">
                                                    {processingAction ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />} Re-Verify Status
                                                </button>
                                            )}
                                            {user.role === 'super_admin' && (
                                                <button onClick={() => handleDelete(selectedWorkItem.id, 'donation')} className="w-full py-3 bg-white border border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 flex justify-center items-center gap-2 text-xs uppercase tracking-widest">
                                                    <Trash2 className="w-4 h-4" /> Reject & Delete
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-100 rounded-xl text-center text-sm text-gray-500 italic">
                                            You are in read-only mode. Contact Finance Admin for actions.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-500"><ArrowUpRight className="w-8 h-8" /></div>
                                    <p className="font-bold text-center">Select a transaction</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: TRANSACTIONS --- */}
                {activeTab === 'transactions' && (
                    <div className="p-4 sm:p-6 space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="lg:col-span-2 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20" />
                                </div>
                                <CustomSelect options={[{value:'All', label:'All Statuses'}, {value:'Success', label:'Success'}, {value:'Pending', label:'Pending'}, {value:'Failed', label:'Failed'}]} value={statusFilter} onChange={setStatusFilter} icon={Filter} />
                                <CustomSelect options={[{value:'All', label:'All Methods'}, {value:'paystack', label:'Paystack'}, {value:'bank', label:'Bank Transfer'}]} value={methodFilter} onChange={setMethodFilter} icon={CreditCard} />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 uppercase flex-shrink-0">Filter Date Range:</span>
                                <div className="flex flex-1 gap-2 w-full">
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/20" />
                                    <span className="text-gray-400 self-center">-</span>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/20" />
                                </div>
                                <button onClick={handleDownloadReport} className="w-full sm:w-auto px-6 py-2 bg-brand-brown-dark text-white rounded-lg text-sm font-bold shadow-md hover:bg-brand-gold transition-colors flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" /> Download PDF Report
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold border-b border-gray-100">
                                    <tr><th className="px-6 py-4">Details</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Fund</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {filteredDonations.map(d => (
                                        <tr key={d.id} onClick={() => setViewDonation(d)} className="hover:bg-gray-50 cursor-pointer">
                                            <td className="px-6 py-4"><div className="font-bold text-gray-800">{d.donorName || "Anonymous"}</div><div className="text-xs text-gray-500 font-mono">{d.reference}</div></td>
                                            <td className="px-6 py-4 font-bold text-brand-brown-dark">₦{Number(d.amount).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-600">{d.fundTitle || 'General'}</td>
                                            <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                                            <td className="px-6 py-4 text-right"><button className="p-2 bg-gray-100 rounded-lg hover:bg-brand-sand/30 text-gray-500"><Eye className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB: STATEMENTS & FUNDS (Abbreviated for brevity, logic identical to previous) --- */}
                {/* Copied from previous logic, ensuring funds tab allows Edit/Delete only if canManage */}
                {activeTab === 'funds' && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {funds.map(fund => (
                            <div key={fund.id} onClick={() => setViewFund(fund)} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                                <div className="h-40 bg-gray-200 relative">
                                    <Image src={fund.coverImage || "/fallback.webp"} alt={fund.title} fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white"><h3 className="font-bold text-lg mb-1">{fund.title}</h3></div>
                                </div>
                                <div className="p-5 flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Raised so far</span>
                                    <span className="font-bold text-brand-brown-dark">₦{donations.filter(d => d.fundId === fund.id && d.status === 'Success').reduce((a,b) => a + Number(b.amount), 0).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {activeTab === 'statements' && (
                    <div className="p-6">
                        <div className="bg-brand-brown-dark text-white p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-[url('/pattern.png')] bg-cover bg-blend-overlay">
                            <div><h2 className="text-2xl font-agency mb-2">Financial Statements</h2><p className="text-white/70 text-sm max-w-md">Comprehensive breakdown of all inflows grouped by period.</p></div>
                            <button onClick={() => generateTransactionReport(donations, "All Time", "Full Account Statement")} className="bg-brand-gold text-brand-brown-dark px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-white transition-colors"><Download className="w-4 h-4" /> Export All as PDF</button>
                        </div>
                        <div className="space-y-4">
                            {getMonthlyStatements().map((stat, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between hover:shadow-md transition-all gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-12 h-12 bg-brand-sand/20 rounded-xl flex items-center justify-center text-brand-brown-dark"><Calendar className="w-6 h-6" /></div>
                                        <div><h3 className="font-bold text-lg text-gray-800">{stat.month}</h3><p className="text-xs text-gray-500">{stat.count} Transactions • {stat.donors.size} Unique Donors</p></div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0"><p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Inflow</p><h2 className="text-2xl font-agency font-bold text-green-600">₦{stat.total.toLocaleString()}</h2></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL: VIEW TRANSACTION --- */}
            {viewDonation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-gray-50 p-6 flex justify-between items-start border-b border-gray-100">
                            <div><h3 className="font-agency text-2xl text-brand-brown-dark">Transaction Details</h3><p className="text-xs text-gray-500 font-mono mt-1">{viewDonation.reference}</p></div>
                            <button onClick={() => setViewDonation(null)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="text-center"><p className="text-xs text-gray-400 font-bold uppercase mb-2">Amount</p><h1 className="text-4xl font-bold text-brand-brown-dark">₦{Number(viewDonation.amount).toLocaleString()}</h1><div className="mt-4 flex justify-center"><StatusBadge status={viewDonation.status} /></div></div>
                            <div className="space-y-4 bg-brand-sand/10 p-5 rounded-2xl">
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Fund</span><span className="font-bold text-gray-800">{viewDonation.fundTitle}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Method</span><span className="font-bold text-gray-800 capitalize">{viewDonation.method}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-bold text-gray-800">{new Date(viewDonation.createdAt?.seconds * 1000).toLocaleDateString()}</span></div>
                                <div className="flex justify-between text-sm pt-4 border-t border-gray-200"><span className="text-gray-500">Donor</span><span className="font-bold text-gray-800">{viewDonation.donorName}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span className="font-bold text-gray-800">{viewDonation.donorEmail}</span></div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {viewDonation.status === 'Success' && (
                                    <button onClick={() => generateReceipt(viewDonation)} className="w-full py-3 text-brand-brown-dark bg-brand-gold/10 font-bold text-sm border border-brand-gold/50 rounded-xl hover:bg-brand-gold hover:text-white transition-all flex justify-center items-center gap-2"><FileText className="w-4 h-4" /> Download Official Receipt</button>
                                )}
                                {canManage && user.role === 'super_admin' && viewDonation.status !== 'Success' && (
                                    <button onClick={() => handleDelete(viewDonation.id, 'donation')} className="w-full py-3 text-red-500 font-bold text-sm border border-red-100 rounded-xl hover:bg-red-50">Delete Record</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: VIEW FUND (Only editable if canManage) --- */}
            {viewFund && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setViewFund(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 backdrop-blur-md"><X className="w-5 h-5" /></button>
                        <div className="relative h-48 bg-gray-200">
                            <Image src={viewFund.coverImage || "/fallback.webp"} alt={viewFund.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6 text-white"><h2 className="font-agency text-3xl mb-1">{viewFund.title}</h2></div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div><h3 className="text-xs font-bold text-gray-400 uppercase mb-2">About this Fund</h3><p className="text-sm text-gray-600 leading-relaxed">{viewFund.description}</p></div>
                            {canManage && (
                                <div className="flex gap-3 pt-4">
                                    <Link href={`/admin/donations/funds/edit/${viewFund.id}`} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-center text-sm hover:bg-gray-200">Edit Fund</Link>
                                    <button onClick={() => handleDelete(viewFund.id, 'fund')} className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl text-center text-sm hover:bg-red-100">Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
