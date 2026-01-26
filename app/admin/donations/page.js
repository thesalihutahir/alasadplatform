"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext'; // Assuming you have this
import { 
    collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
    Search, Plus, TrendingUp, Users, Clock, 
    CreditCard, Landmark, CheckCircle, X, 
    Trash2, Eye, Copy, AlertTriangle
} from 'lucide-react';

export default function AdminDonationsPage() {
    const { user } = useAuth(); // Get current admin user
    const [donations, setDonations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewDonation, setViewDonation] = useState(null);

    // --- FETCH ---
    useEffect(() => {
        const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            setDonations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);

    // --- ACTIONS ---
    const verifyBankTransfer = async (donation) => {
        if (!confirm(`Confirm receipt of ₦${donation.amount} from ${donation.donorName}?`)) return;

        try {
            await updateDoc(doc(db, "donations", donation.id), {
                status: 'Success',
                verifiedAt: serverTimestamp(),
                verifiedByUid: user?.uid || 'admin',
                verifiedByEmail: user?.email || 'admin@alasad.org',
                updatedAt: serverTimestamp()
            });
            setViewDonation(null);
            alert("Donation verified successfully.");
        } catch (error) {
            console.error("Verification failed", error);
            alert("Failed to verify.");
        }
    };

    // --- FILTERS ---
    const filtered = donations.filter(d => 
        (d.donorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.reference || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRaised = donations.filter(d => d.status === 'Success').reduce((acc, curr) => acc + Number(curr.amount), 0);

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* STATS HEADER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600"><TrendingUp /></div>
                    <div><p className="text-xs text-gray-400 font-bold uppercase">Total Raised</p><h3 className="text-2xl font-agency text-brand-brown-dark">₦{totalRaised.toLocaleString()}</h3></div>
                </div>
                {/* Add other stats as needed */}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 py-2 bg-gray-50 rounded-xl text-sm" />
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Donor</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Method</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(d => (
                            <tr key={d.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setViewDonation(d)}>
                                <td className="px-6 py-4 font-mono text-xs">{d.reference}</td>
                                <td className="px-6 py-4 font-bold">{d.donorName || "Anonymous"}</td>
                                <td className="px-6 py-4 font-bold text-brand-brown-dark">₦{Number(d.amount).toLocaleString()}</td>
                                <td className="px-6 py-4 capitalize">{d.method}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${d.status === 'Success' ? 'bg-green-100 text-green-700' : d.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right"><Eye className="w-4 h-4 text-gray-400 inline" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {viewDonation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">
                        <button onClick={() => setViewDonation(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
                        <h3 className="font-agency text-2xl text-brand-brown-dark mb-4">Transaction Details</h3>
                        
                        <div className="space-y-4 text-sm">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-400 uppercase">Amount</p>
                                <p className="text-3xl font-bold text-brand-gold">₦{Number(viewDonation.amount).toLocaleString()}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs text-gray-400 uppercase">Reference</p><p className="font-mono font-bold">{viewDonation.reference}</p></div>
                                <div><p className="text-xs text-gray-400 uppercase">Date</p><p className="font-bold">{viewDonation.createdAt?.toDate ? viewDonation.createdAt.toDate().toLocaleDateString() : 'N/A'}</p></div>
                            </div>
                            
                            {viewDonation.status === 'Pending' && viewDonation.method === 'bank' && (
                                <button onClick={() => verifyBankTransfer(viewDonation)} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl mt-4">
                                    Verify Bank Transfer
                                </button>
                            )}

                             {viewDonation.status === 'Success' && viewDonation.verifiedByEmail && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-800">
                                    Verified by {viewDonation.verifiedByEmail} on {viewDonation.verifiedAt?.toDate().toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
