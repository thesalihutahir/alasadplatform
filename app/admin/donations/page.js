"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Plus, Trash2, Loader2, Pencil, Target, CheckCircle, XCircle, X } from 'lucide-react';

export default function DonationsManagerPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({ title: '', description: '', status: 'Active' });

    useEffect(() => {
        const q = query(collection(db, "donation_projects"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateDoc(doc(db, "donation_projects", editingId), { ...formData, updatedAt: serverTimestamp() });
            } else {
                await addDoc(collection(db, "donation_projects"), { ...formData, createdAt: serverTimestamp() });
            }
            setShowForm(false); setEditingId(null); setFormData({ title: '', description: '', status: 'Active' });
        } catch (error) { alert("Failed to save."); } 
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if(confirm("Delete this cause?")) await deleteDoc(doc(db, "donation_projects", id));
    };

    const handleEdit = (p) => {
        setFormData({ title: p.title, description: p.description, status: p.status });
        setEditingId(p.id);
        setShowForm(true);
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Donation Causes</h1>
                    <p className="text-gray-500 text-sm">Manage active campaigns.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/donations/transactions" className="px-5 py-2 bg-white border border-gray-200 text-brand-brown-dark rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        View Transactions
                    </Link>
                    <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2 bg-brand-gold text-white rounded-xl font-bold hover:bg-brand-brown-dark transition-colors">
                        {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showForm ? "Cancel" : "Add Cause"}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-brand-gold/20 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <input type="text" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} placeholder="Project Title" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" required />
                            <select value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl"><option>Active</option><option>Inactive</option></select>
                        </div>
                        <textarea value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} placeholder="Description" rows="3" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" required></textarea>
                        <button disabled={isSubmitting} className="px-8 py-3 bg-brand-brown-dark text-white font-bold rounded-xl hover:bg-brand-gold transition-colors">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? "Update" : "Create")}</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((p) => (
                    <div key={p.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.status}</div>
                            <div className="flex gap-2">
                                <button onClick={()=>handleEdit(p)} className="text-gray-400 hover:text-brand-gold"><Pencil className="w-4 h-4"/></button>
                                <button onClick={()=>handleDelete(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <h3 className="font-bold text-brand-brown-dark text-lg">{p.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}