"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { 
    collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // To stamp who verified
import { 
    Search, Plus, TrendingUp, Users, Clock, 
    CreditCard, Landmark, CheckCircle, X, 
    Trash2, Edit, Eye, FileText, 
    Mail, Phone, Copy, FileCheck
} from 'lucide-react';

export default function AdminDonationsPage() {
    const [activeTab, setActiveTab] = useState('transactions'); 
    const [donations, setDonations] = useState([]);
    const [funds, setFunds] = useState([]);
    const [viewDonation, setViewDonation] = useState(null);
    const auth = getAuth();

    // --- FETCH DATA ---
    useEffect(() => {
        const unsubDonations = onSnapshot(query(collection(db, "donations"), orderBy("createdAt", "desc")), (snap) => {
            setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        const unsubFunds = onSnapshot(query(collection(db, "donation_funds"), orderBy("createdAt", "desc")), (snap) => {
            setFunds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => { unsubDonations(); unsubFunds(); };
    }, []);

    // --- VERIFY ACTION (WITH AUDIT) ---
    const verifyDonation = async (donation) => {
        if(!confirm(`Confirm receipt of ₦${donation.amount.toLocaleString()}?`)) return;
        
        const user = auth.currentUser;
        await updateDoc(doc(db, "donations", donation.id), { 
            status: 'Success',
            verifiedAt: serverTimestamp(),
            verifiedByEmail: user ? user.email : 'Admin',
            updatedAt: serverTimestamp()
        });
        setViewDonation(null); 
    };

    const deleteDonation = async (id) => {
        if(confirm("Permanently delete this record?")) {
            await deleteDoc(doc(db, "donations", id));
            setViewDonation(null);
        }
    };

    // Calculate Stats
    const totalRaised = donations.filter(d => d.status === 'Success').reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* HEAD */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Donations Manager</h1>
                    <p className="text-sm text-gray-500">Total Raised: <span className="font-bold text-green-600">₦{totalRaised.toLocaleString()}</span></p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 rounded-lg font-bold text-xs ${activeTab === 'transactions' ? 'bg-brand-brown-dark text-white' : 'bg-gray-100'}`}>Transactions</button>
                    <button onClick={() => setActiveTab('funds')} className={`px-4 py-2 rounded-lg font-bold text-xs ${activeTab === 'funds' ? 'bg-brand-brown-dark text-white' : 'bg-gray-100'}`}>Funds</button>
                </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            {activeTab === 'transactions' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Donor</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {donations.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setViewDonation(d)}>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{d.reference}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{d.donorName || "Anonymous"}</div>
                                        <div className="text-xs text-gray-400">{d.method}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-brand-brown-dark">₦{Number(d.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${d.status === 'Success' ? 'bg-green-100 text-green-700' : d.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4"><Eye className="w-4 h-4 text-gray-400"/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* FUNDS GRID */}
            {activeTab === 'funds' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {funds.map(f => (
                        <div key={f.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-brand-brown-dark">{f.title}</h3>
                            <Link href={`/admin/donations/funds/edit/${f.id}`} className="text-xs text-brand-gold font-bold uppercase mt-2 block">Edit Fund</Link>
                        </div>
                    ))}
                    <Link href="/admin/donations/funds/new" className="border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:border-brand-gold hover:text-brand-gold p-8 font-bold text-sm">+ Create Fund</Link>
                </div>
            )}

            {/* MODAL */}
            {viewDonation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="font-agency text-2xl text-brand-brown-dark">Transaction Details</h2>
                            <button onClick={() => setViewDonation(null)}><X className="w-5 h-5 text-gray-400"/></button>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400 font-bold uppercase">Amount</span><span className="font-bold text-xl">₦{viewDonation.amount.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400 font-bold uppercase">Ref</span><span className="font-mono">{viewDonation.reference}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400 font-bold uppercase">Method</span><span className="capitalize">{viewDonation.method}</span></div>
                            
                            {viewDonation.bankProofUrl && (
                                <div className="pt-2 border-t border-gray-200 mt-2">
                                    <span className="text-gray-400 font-bold uppercase text-xs block mb-1">Payment Proof</span>
                                    <a href={viewDonation.bankProofUrl} target="_blank" className="flex items-center gap-2 text-blue-600 font-bold underline text-xs">
                                        <FileCheck className="w-3 h-3"/> View Receipt
                                    </a>
                                </div>
                            )}
                        </div>

                        {viewDonation.status === 'Pending' && (
                            <button onClick={() => verifyDonation(viewDonation)} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700">
                                Verify Payment
                            </button>
                        )}
                        
                        <button onClick={() => deleteDonation(viewDonation.id)} className="w-full py-3 border border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50">
                            Delete Record
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
