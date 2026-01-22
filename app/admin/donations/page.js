"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { 
    collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where 
} from 'firebase/firestore';
import { 
    Search, Plus, Filter, Download, 
    TrendingUp, Users, Wallet, CreditCard, Landmark, 
    CheckCircle, XCircle, Clock, MoreVertical, Eye, Trash2, Edit
} from 'lucide-react';

export default function AdminDonationsPage() {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'funds'
    const [donations, setDonations] = useState([]);
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // --- FETCH DATA ---
    useEffect(() => {
        setLoading(true);
        
        // 1. Listen to Donations
        const qDonations = query(collection(db, "donations"), orderBy("createdAt", "desc"));
        const unsubDonations = onSnapshot(qDonations, (snapshot) => {
            setDonations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 2. Listen to Funds
        const qFunds = query(collection(db, "donation_funds"), orderBy("createdAt", "desc"));
        const unsubFunds = onSnapshot(qFunds, (snapshot) => {
            setFunds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => {
            unsubDonations();
            unsubFunds();
        };
    }, []);

    // --- ACTIONS ---
    const verifyDonation = async (id) => {
        if(confirm("Confirm that you have received this payment?")) {
            await updateDoc(doc(db, "donations", id), { status: 'Success' });
        }
    };

    const deleteFund = async (id) => {
        if(confirm("Delete this fund? This will not delete historical donations associated with it.")) {
            await deleteDoc(doc(db, "donation_funds", id));
        }
    };

    const toggleFundStatus = async (fund) => {
        const newStatus = fund.status === 'Active' ? 'Paused' : 'Active';
        await updateDoc(doc(db, "donation_funds", fund.id), { status: newStatus });
    };

    // --- FILTERING ---
    const filteredDonations = donations.filter(d => {
        const matchesSearch = d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              d.donorEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // --- STATS CALCULATION ---
    const totalRaised = donations.filter(d => d.status === 'Success').reduce((acc, curr) => acc + curr.amount, 0);
    const totalDonors = new Set(donations.map(d => d.donorEmail)).size;
    const pendingCount = donations.filter(d => d.status === 'Pending').length;

    // --- HELPERS ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };
    return (
        <div className="max-w-7xl mx-auto pb-20">
            
            {/* HEADER & STATS */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Donations Manager</h1>
                        <p className="font-lato text-sm text-gray-500">Track inflows, verify transfers, and manage funds.</p>
                    </div>
                    {activeTab === 'funds' && (
                        <Link href="/admin/donations/funds/new">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl font-bold hover:bg-brand-brown-dark transition-colors shadow-md text-sm">
                                <Plus className="w-4 h-4" /> Create Fund
                            </button>
                        </Link>
                    )}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600"><TrendingUp className="w-6 h-6" /></div>
                        <div><p className="text-xs text-gray-400 font-bold uppercase">Total Raised</p><h3 className="text-2xl font-agency text-brand-brown-dark">{formatCurrency(totalRaised)}</h3></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Users className="w-6 h-6" /></div>
                        <div><p className="text-xs text-gray-400 font-bold uppercase">Unique Donors</p><h3 className="text-2xl font-agency text-brand-brown-dark">{totalDonors}</h3></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600"><Clock className="w-6 h-6" /></div>
                        <div><p className="text-xs text-gray-400 font-bold uppercase">Pending Verification</p><h3 className="text-2xl font-agency text-brand-brown-dark">{pendingCount}</h3></div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 border-b border-gray-200">
                    <button onClick={() => setActiveTab('transactions')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'transactions' ? 'border-brand-gold text-brand-brown-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Transactions</button>
                    <button onClick={() => setActiveTab('funds')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'funds' ? 'border-brand-gold text-brand-brown-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Manage Funds</button>
                </div>
            </div>

            {/* --- TAB 1: TRANSACTIONS --- */}
            {activeTab === 'transactions' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search donor, email, or reference..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-gold/20" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                            {['All', 'Success', 'Pending', 'Failed'].map(status => (
                                <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${statusFilter === status ? 'bg-brand-brown-dark text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{status}</button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Donor</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Fund / Method</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredDonations.length > 0 ? (
                                        filteredDonations.map((d) => (
                                            <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-gray-800">{d.donorName}</div>
                                                    <div className="text-xs text-gray-400">{d.donorEmail}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-brand-brown-dark">{formatCurrency(d.amount)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-gray-600 mb-1">{d.fundTitle || 'General Fund'}</div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase">
                                                        {d.method === 'paystack' ? <CreditCard className="w-3 h-3" /> : <Landmark className="w-3 h-3" />}
                                                        {d.method}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${d.status === 'Success' ? 'bg-green-50 text-green-700' : d.status === 'Pending' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${d.status === 'Success' ? 'bg-green-500' : d.status === 'Pending' ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">{formatDate(d.createdAt)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {d.status === 'Pending' && (
                                                        <button onClick={() => verifyDonation(d.id)} className="text-xs font-bold text-brand-gold hover:text-brand-brown-dark underline">Verify</button>
                                                    )}
                                                    {d.status === 'Success' && <CheckCircle className="w-4 h-4 text-green-300 ml-auto" />}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">No transactions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 2: FUNDS --- */}
            {activeTab === 'funds' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {funds.map((fund) => (
                        <div key={fund.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                            <div className="relative h-32 bg-gray-200">
                                <Image src={fund.coverImage || "/fallback.webp"} alt={fund.title} fill className="object-cover" />
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button onClick={() => toggleFundStatus(fund)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-sm ${fund.status === 'Active' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                                        {fund.status}
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-1">{fund.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{fund.description}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-xs font-bold text-gray-400">{fund.bankDetails?.bankName || "No Bank"}</span>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/donations/funds/edit/${fund.id}`}>
                                            <button className="p-1.5 text-gray-400 hover:text-brand-brown-dark hover:bg-gray-100 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                                        </Link>
                                        <button onClick={() => deleteFund(fund.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Add Fund Card */}
                    <Link href="/admin/donations/funds/new" className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-brand-gold hover:text-brand-gold transition-colors bg-gray-50/50 hover:bg-white min-h-[250px]">
                        <Plus className="w-10 h-10 mb-2 opacity-50" />
                        <span className="font-bold text-sm">Create New Fund</span>
                    </Link>
                </div>
            )}

        </div>
    );
}
