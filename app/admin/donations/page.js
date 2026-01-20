"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Loader2, 
    Pencil, 
    Wallet, 
    Target, 
    CheckCircle, 
    XCircle,
    X
} from 'lucide-react';

export default function DonationsManagerPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null); // If null, we are adding. If set, we are editing.

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        bankName: '',
        accountNumber: '',
        status: 'Active' // Active or Inactive
    });

    // 1. Fetch Projects
    useEffect(() => {
        const q = query(collection(db, "donation_projects"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Form Handlers
    const resetForm = () => {
        setFormData({ title: '', description: '', bankName: '', accountNumber: '', status: 'Active' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (project) => {
        setFormData({
            title: project.title,
            description: project.description,
            bankName: project.bankName || '',
            accountNumber: project.accountNumber || '',
            status: project.status
        });
        setEditingId(project.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            alert("Title and Description are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                // Update
                const docRef = doc(db, "donation_projects", editingId);
                await updateDoc(docRef, {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
                alert("Project updated successfully!");
            } else {
                // Create
                await addDoc(collection(db, "donation_projects"), {
                    ...formData,
                    createdAt: serverTimestamp()
                });
                alert("New cause added successfully!");
            }
            resetForm();
        } catch (error) {
            console.error("Error saving project:", error);
            alert("Failed to save project.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure? This will remove the cause from the donation page.")) {
            await deleteDoc(doc(db, "donation_projects", id));
        }
    };

    // Toggle Status directly from card
    const toggleStatus = async (project) => {
        const newStatus = project.status === "Active" ? "Inactive" : "Active";
        const docRef = doc(db, "donation_projects", project.id);
        await updateDoc(docRef, { status: newStatus });
    };

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-gold" /></div>;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Donation Causes</h1>
                    <p className="text-gray-500 text-sm">Manage the active campaigns shown on the Donate page.</p>
                </div>
                <button 
                    onClick={() => {
                        if(showForm && editingId) resetForm(); // Cancel edit mode
                        setShowForm(!showForm);
                    }} 
                    className="flex items-center gap-2 px-5 py-2 bg-brand-gold text-white rounded-xl font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Add Cause"}
                </button>
            </div>

            {/* FORM (Collapsible) */}
            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-brand-gold/20 mb-10 animate-in slide-in-from-top-4">
                    <h2 className="font-bold text-lg text-brand-brown-dark mb-6 border-b pb-2">
                        {editingId ? "Edit Cause" : "Create New Cause"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project Title *</label>
                                <input 
                                    type="text" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="e.g. Ramadan Feeding Program" 
                                    required
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description *</label>
                                <textarea 
                                    rows="3"
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 resize-none" 
                                    placeholder="Short description of the cause..." 
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bank Name (Optional)</label>
                                <input 
                                    type="text" 
                                    value={formData.bankName} 
                                    onChange={(e) => setFormData({...formData, bankName: e.target.value})} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="e.g. Jaiz Bank" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Account Number (Optional)</label>
                                <input 
                                    type="text" 
                                    value={formData.accountNumber} 
                                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                    placeholder="e.g. 00345..." 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                                <select 
                                    value={formData.status} 
                                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                                >
                                    <option value="Active">Active (Visible)</option>
                                    <option value="Inactive">Inactive (Hidden)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-brand-brown-dark text-white font-bold rounded-xl hover:bg-brand-gold transition-colors shadow-lg flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? "Update Cause" : "Create Cause")}
                            </button>
                            <button 
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* PROJECTS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className={`bg-white p-6 rounded-2xl border transition-all hover:shadow-md group relative ${project.status === 'Active' ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-75'}`}>
                        
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {project.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {project.status}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(project)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-sand/30 flex items-center justify-center text-brand-brown-dark flex-shrink-0">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-agency text-xl text-brand-brown-dark leading-tight mb-1">{project.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
                                
                                {project.bankName && (
                                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md w-fit">
                                        <Wallet className="w-3 h-3" /> 
                                        {project.bankName}: {project.accountNumber}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Toggle Button */}
                        <button 
                            onClick={() => toggleStatus(project)}
                            className="w-full mt-4 py-2 text-xs font-bold text-gray-400 border border-gray-100 rounded-lg hover:bg-gray-50 hover:text-brand-brown-dark transition-colors"
                        >
                            {project.status === 'Active' ? "Deactivate Cause" : "Activate Cause"}
                        </button>
                    </div>
                ))}

                {projects.length === 0 && !showForm && (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-500">No active causes</h3>
                        <p className="text-sm text-gray-400 mb-4">Create a new donation campaign to get started.</p>
                        <button onClick={() => setShowForm(true)} className="text-brand-gold font-bold hover:underline">Create Now</button>
                    </div>
                )}
            </div>
        </div>
    );
}