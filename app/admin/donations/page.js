"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext'; // Ensure you have this context
import { 
    collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
    Search, Plus, TrendingUp, Users, Clock, 
    CreditCard, Landmark, CheckCircle, X, 
    Trash2, Edit, Eye, Filter, RefreshCw, 
    AlertTriangle, ArrowUpRight, Copy, ShieldCheck, Flag
} from 'lucide-react';

// --- SUB-COMPONENTS ---

// 1. Stat Card
const StatCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start justify-between shadow-sm">
        <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-agency font-bold text-brand-brown-dark">{value}</h3>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
    </div>
);

// 2. Status Badge
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
    
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('reconciliation'); // Default to work queue
    const [donations, setDonations] = useState([]);
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Reconciliation State
    const [selectedWorkItem, setSelectedWorkItem] = useState(null);
    const [processingAction, setProcessingAction] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [methodFilter, setMethodFilter] = useState('All');

    // --- FETCH DATA ---
    useEffect(() => {
        // 1. Fetch Donations
        const qDonations = query(collection(db, "donations"), orderBy("createdAt", "desc"));
        const unsubDonations = onSnapshot(qDonations, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDonations(data);
            setLoading(false);
        });

        // 2. Fetch Funds (for reference)
        const qFunds = query(collection(db, "donation_funds"));
        const unsubFunds = onSnapshot(qFunds, (snapshot) => {
            setFunds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubDonations();
            unsubFunds();
        };
    }, []);

    // --- COMPUTED STATS ---
    const totalRaised = donations.filter(d => d.status === 'Success').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const pendingCount = donations.filter(d => d.status === 'Pending').length;
    const successCount = donations.filter(d => d.status === 'Success').length;
    const uniqueDonors = new Set(donations.filter(d => d.status === 'Success').map(d => d.donorEmail)).size;

    // --- FILTER LOGIC ---
    const filteredDonations = donations.filter(d => {
        const matchesSearch = (d.donorName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (d.reference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (d.donorEmail || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
        const matchesMethod = methodFilter === 'All' || d.method === methodFilter;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const pendingQueue = donations.filter(d => d.status === 'Pending');

    // --- ACTIONS ---

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const handleVerifyBank = async (donation) => {
        if (!confirm(`Confirm receipt of ₦${donation.amount.toLocaleString()} from ${donation.donorName}?`)) return;
        setProcessingAction(true);
        try {
            await updateDoc(doc(db, "donations", donation.id), {
                status: 'Success',
                verifiedAt: serverTimestamp(),
                verifiedByUid: user?.uid || 'admin',
                verifiedByEmail: user?.email || 'System',
                updatedAt: serverTimestamp()
            });
            setSelectedWorkItem(null);
            alert("Payment Verified Successfully");
        } catch (error) {
            console.error("Error verifying:", error);
            alert("Failed to verify.");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleReverifyPaystack = async (donation) => {
        setProcessingAction(true);
        try {
            const res = await fetch('/api/paystack/verify', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ reference: donation.reference })
            });
            const data = await res.json();
            if (data.success) {
                alert("Paystack Confirmed: Payment Received!");
                setSelectedWorkItem(null); // Close panel as it moves out of pending
            } else {
                alert(`Paystack Response: ${data.message}`);
            }
        } catch (error) {
            alert("Server Error: Could not reach Paystack.");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleFlagDonation = async (donation) => {
        const reason = prompt("Enter reason for flagging this transaction:");
        if (!reason) return;
        
        try {
            await updateDoc(doc(db, "donations", donation.id), {
                status: 'Flagged',
                flagReason: reason,
                flaggedBy: user?.email,
                updatedAt: serverTimestamp()
            });
            alert("Transaction Flagged for Review");
        } catch (error) {
            alert("Error flagging transaction");
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 p-6">
            
            {/* 1. TOP STATS HEADER */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
                <div>
                    <h1 className="text-3xl font-agency font-bold text-brand-brown-dark">Donation Manager</h1>
                    <p className="text-gray-500 text-sm">Overview of platform financial activities</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/donations/funds/new" className="bg-brand-brown-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-gold transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Fund
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Raised" value={`₦${totalRaised.toLocaleString()}`} sub={`${successCount} successful donations`} icon={TrendingUp} color="bg-green-100 text-green-600" />
                <StatCard title="Pending Action" value={pendingCount} sub="Requires verification" icon={Clock} color="bg-orange-100 text-orange-600" />
                <StatCard title="Active Donors" value={uniqueDonors} sub="Unique contributors" icon={Users} color="bg-blue-100 text-blue-600" />
                <StatCard title="Active Funds" value={funds.length} sub="Campaigns running" icon={Landmark} color="bg-purple-100 text-purple-600" />
            </div>

            {/* 2. TABS NAVIGATION */}
            <div className="bg-white rounded-t-2xl border-b border-gray-200 px-6 flex items-center gap-8 mb-0">
                <button onClick={() => setActiveTab('reconciliation')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reconciliation' ? 'border-brand-brown-dark text-brand-brown-dark' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                    <ShieldCheck className="w-4 h-4" /> Reconciliation <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px]">{pendingCount}</span>
                </button>
                <button onClick={() => setActiveTab('transactions')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'transactions' ? 'border-brand-brown-dark text-brand-brown-dark' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                    <Filter className="w-4 h-4" /> Transactions
                </button>
                <button onClick={() => setActiveTab('funds')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'funds' ? 'border-brand-brown-dark text-brand-brown-dark' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                    <Landmark className="w-4 h-4" /> Funds
                </button>
            </div>

            {/* 3. MAIN CONTENT AREA */}
            <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 border-t-0 min-h-[500px]">
                
                {/* --- TAB: RECONCILIATION (QUEUE) --- */}
                {activeTab === 'reconciliation' && (
                    <div className="flex flex-col lg:flex-row h-[600px]">
                        {/* LEFT: The Queue */}
                        <div className="lg:w-1/3 border-r border-gray-100 overflow-y-auto">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                <h3 className="font-bold text-gray-700 text-sm uppercase">Pending Queue ({pendingQueue.length})</h3>
                            </div>
                            {pendingQueue.length === 0 ? (
                                <div className="p-10 text-center text-gray-400">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-200" />
                                    <p>All caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {pendingQueue.map(item => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => setSelectedWorkItem(item)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedWorkItem?.id === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-800">₦{Number(item.amount).toLocaleString()}</span>
                                                <span className="text-[10px] bg-gray-200 px-1.5 rounded text-gray-600">{new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate mb-1">{item.donorName || "Anonymous"}</p>
                                            <div className="flex items-center gap-2 mt-2">
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

                        {/* RIGHT: Detail Panel */}
                        <div className="lg:w-2/3 bg-gray-50/50 p-8 overflow-y-auto">
                            {selectedWorkItem ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction ID</span>
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-mono text-lg font-bold text-brand-brown-dark">{selectedWorkItem.reference}</h2>
                                                <button onClick={() => copyToClipboard(selectedWorkItem.reference)} className="text-gray-400 hover:text-brand-gold"><Copy className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <StatusBadge status={selectedWorkItem.status} />
                                    </div>

                                    {/* Big Amount */}
                                    <div className="text-center py-8 bg-gray-50 rounded-xl mb-8 border border-gray-100 dashed">
                                        <p className="text-sm text-gray-500 mb-1">Total Donation Amount</p>
                                        <h1 className="text-5xl font-agency font-bold text-brand-brown-dark">₦{Number(selectedWorkItem.amount).toLocaleString()}</h1>
                                        <p className="text-xs text-gray-400 mt-2">To Fund: <span className="text-gray-600 font-bold">{selectedWorkItem.fundTitle}</span></p>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Donor Details</p>
                                            <p className="font-bold text-gray-800">{selectedWorkItem.donorName || "Anonymous"}</p>
                                            <p className="text-sm text-gray-600">{selectedWorkItem.donorEmail}</p>
                                            <p className="text-sm text-gray-600">{selectedWorkItem.donorPhone || "No Phone"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Payment Method</p>
                                            <div className="flex items-center gap-2">
                                                {selectedWorkItem.method === 'paystack' ? <CreditCard className="w-5 h-5 text-blue-500" /> : <Landmark className="w-5 h-5 text-green-500" />}
                                                <span className="capitalize font-bold text-gray-700">{selectedWorkItem.method}</span>
                                            </div>
                                            {selectedWorkItem.bankProofUrl && (
                                                <a href={selectedWorkItem.bankProofUrl} target="_blank" className="text-xs text-blue-600 underline mt-2 block hover:text-blue-800">View Uploaded Receipt</a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-gray-100 pt-6 flex flex-col gap-3">
                                        {selectedWorkItem.method === 'bank' && (
                                            <button 
                                                onClick={() => handleVerifyBank(selectedWorkItem)}
                                                disabled={processingAction}
                                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2"
                                            >
                                                {processingAction ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                                Confirm Payment Received
                                            </button>
                                        )}

                                        {selectedWorkItem.method === 'paystack' && (
                                            <button 
                                                onClick={() => handleReverifyPaystack(selectedWorkItem)}
                                                disabled={processingAction}
                                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2"
                                            >
                                                {processingAction ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                                Re-Verify Status with Paystack
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => handleFlagDonation(selectedWorkItem)}
                                            className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 flex justify-center items-center gap-2"
                                        >
                                            <Flag className="w-4 h-4" /> Flag for Review
                                        </button>
                                    </div>

                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-500">
                                        <ArrowUpRight className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold">Select a transaction from the queue</p>
                                    <p className="text-sm">View details and perform actions</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: TRANSACTIONS (TABLE) --- */}
                {activeTab === 'transactions' && (
                    <div className="p-6">
                        {/* Filters Bar */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name, reference, or email..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20" 
                                />
                            </div>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 focus:outline-none"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Success">Success</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Flagged">Flagged</option>
                            </select>
                            <select 
                                value={methodFilter} 
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 focus:outline-none"
                            >
                                <option value="All">All Methods</option>
                                <option value="paystack">Paystack</option>
                                <option value="bank">Bank Transfer</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Reference</th>
                                        <th className="px-6 py-4">Donor</th>
                                        <th className="px-6 py-4">Fund</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredDonations.map(d => (
                                        <tr key={d.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                                <span className="block text-[10px] text-gray-400">
                                                    {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500 select-all">{d.reference}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{d.donorName || "Anonymous"}</div>
                                                <div className="text-xs text-gray-500">{d.donorEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-[150px] truncate">{d.fundTitle}</td>
                                            <td className="px-6 py-4 font-bold text-brand-brown-dark">₦{Number(d.amount).toLocaleString()}</td>
                                            <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => { setActiveTab('reconciliation'); setSelectedWorkItem(d); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-brand-brown-dark">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredDonations.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-gray-400">
                                                No transactions match your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB: FUNDS --- */}
                {activeTab === 'funds' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {funds.map(fund => (
                                <div key={fund.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-32 bg-gray-100 relative">
                                        {fund.coverImage ? (
                                            <Image src={fund.coverImage} alt={fund.title} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300"><Landmark className="w-8 h-8" /></div>
                                        )}
                                        <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${fund.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                            {fund.status || 'Active'}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{fund.title}</h3>
                                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{fund.tagline || fund.description}</p>
                                        
                                        <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-4">
                                            <Link href={`/admin/donations/funds/edit/${fund.id}`} className="text-gray-500 hover:text-brand-gold font-bold flex items-center gap-1">
                                                <Edit className="w-3 h-3" /> Edit
                                            </Link>
                                            <span className="text-brand-brown-dark font-bold">
                                                {/* Calculate total raised for this fund specifically */}
                                                ₦{donations.filter(d => d.fundId === fund.id && d.status === 'Success').reduce((a,b) => a + Number(b.amount), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Add New Card */}
                            <Link href="/admin/donations/funds/new" className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-brand-gold hover:text-brand-gold hover:bg-brand-sand/5 transition-all">
                                <Plus className="w-8 h-8 mb-2" />
                                <span className="font-bold">Create New Fund</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
