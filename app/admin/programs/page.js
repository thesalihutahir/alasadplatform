"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
// Context
import { useModal } from '@/context/ModalContext';
import LogoReveal from '@/components/logo-reveal'; 

import { 
    PlusCircle, 
    Search, 
    Edit, 
    Trash2, 
    Users, 
    Target, 
    Loader2, 
    Filter,
    AlertTriangle,
    X
} from 'lucide-react';

export default function ManageProgramsPage() {
    const { showSuccess } = useModal();

    // --- STATE ---
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [pillarFilter, setPillarFilter] = useState('All'); 
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State for Delete
    const [deleteConfig, setDeleteConfig] = useState(null); // { id: string }
    const [isDeleting, setIsDeleting] = useState(false);

    // 1. Fetch Programs
    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, "programs"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPrograms(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Handle Delete
    const confirmDelete = (id) => {
        setDeleteConfig({ id });
    };

    const executeDelete = async () => {
        if (!deleteConfig) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, "programs", deleteConfig.id));
            showSuccess({ title: "Deleted", message: "Program has been removed successfully." });
            setDeleteConfig(null);
        } catch (error) {
            console.error("Error deleting program:", error);
            alert("Failed to delete program.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter Logic
    const filteredPrograms = programs.filter(p => {
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesPillar = pillarFilter === 'All' || p.category === pillarFilter;
        const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesPillar && matchesSearch;
    });
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Manage Programs</h1>
                    <p className="font-lato text-sm text-gray-500">Oversee Educational, Community, and Innovation initiatives.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-center shadow-sm min-w-[80px]">
                        <span className="block text-lg font-bold text-brand-gold">{programs.length}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
                    </div>
                    <Link 
                        href="/admin/programs/create" 
                        className="flex items-center gap-2 px-5 py-2 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Create New Program
                    </Link>
                </div>
            </div>

            {/* 2. FILTERS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto gap-2">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-transparent text-sm font-bold text-gray-600 focus:outline-none cursor-pointer border-r border-gray-200 pr-8"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Paused">Paused</option>
                    </select>

                    <select 
                        value={pillarFilter}
                        onChange={(e) => setPillarFilter(e.target.value)}
                        className="px-4 py-2 bg-transparent text-sm font-bold text-gray-600 focus:outline-none cursor-pointer"
                    >
                        <option value="All">All Pillars</option>
                        <option value="Educational Support">Education</option>
                        <option value="Community Development">Community</option>
                        <option value="Training & Innovation">Innovation</option>
                    </select>
                </div>

                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search programs..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
            </div>

            {/* 3. PROGRAMS TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 scale-75"><LogoReveal /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Program Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pillar (Type)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPrograms.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400">No programs found.</td></tr>
                                ) : (
                                    filteredPrograms.map((program) => (
                                        <tr key={program.id} className="hover:bg-gray-50 transition-colors group">

                                            {/* Program Info */}
                                            <td className="px-6 py-4 max-w-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                                                        <Image src={program.coverImage || "/fallback.webp"} alt={program.title} fill className="object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1">{program.title}</h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                                <Target className="w-3 h-3" /> {program.location || "No Loc"}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                                <Users className="w-3 h-3" /> {program.beneficiaries || "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category (Pillar) */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                                    program.category === 'Educational Support' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    program.category === 'Community Development' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    'bg-purple-50 text-purple-600 border-purple-100'
                                                }`}>
                                                    {program.category}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    program.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                                    program.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-700' :
                                                    program.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        program.status === 'Active' ? 'bg-green-500' : 
                                                        program.status === 'Upcoming' ? 'bg-yellow-500' :
                                                        program.status === 'Completed' ? 'bg-gray-400' :
                                                        'bg-red-500'
                                                    }`}></span>
                                                    {program.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/programs/${program.id}`}>
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <button 
                                                        onClick={() => confirmDelete(program.id)}
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

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {deleteConfig && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-gray-100 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-2">Delete Program?</h3>
                            <p className="text-gray-500 font-lato text-sm mb-6">
                                This action cannot be undone. It will be removed from the public website immediately.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeleteConfig(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors flex justify-center items-center gap-2">
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
