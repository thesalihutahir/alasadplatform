"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

import { 
    PlusCircle, 
    Search, 
    Edit, 
    Trash2, 
    Users,
    Target,
    Loader2,
    Filter
} from 'lucide-react';

export default function ManageProgramsPage() {

    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [pillarFilter, setPillarFilter] = useState('All'); // Added Pillar Filter

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
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this program?")) return;
        try {
            await deleteDoc(doc(db, "programs", id));
        } catch (error) {
            console.error("Error deleting program:", error);
            alert("Failed to delete program.");
        }
    };

    // Filter Logic
    const filteredPrograms = programs.filter(p => {
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesPillar = pillarFilter === 'All' || p.category === pillarFilter;
        return matchesStatus && matchesPillar;
    });
return (
        <div className="space-y-6">

            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Manage Programs</h1>
                    <p className="font-lato text-sm text-gray-500">Oversee Educational, Community, and Innovation initiatives.</p>
                </div>
                <Link 
                    href="/admin/programs/new" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-white rounded-xl text-sm font-bold hover:bg-brand-brown-dark transition-colors shadow-md"
                >
                    <PlusCircle className="w-4 h-4" />
                    Create New Program
                </Link>
            </div>

            {/* 2. FILTERS */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search programs..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Paused">Paused</option>
                    </select>

                    {/* Pillar Filter */}
                    <select 
                        value={pillarFilter}
                        onChange={(e) => setPillarFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                    >
                        <option value="All">All Pillars</option>
                        <option value="Educational Support">Education</option>
                        <option value="Community Development">Community</option>
                        <option value="Training & Innovation">Innovation</option>
                    </select>
                </div>
            </div>

            {/* 3. PROGRAMS TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
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
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">No programs found.</td></tr>
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
                                                    <Link href={`/admin/programs/edit/${program.id}`}>
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(program.id)}
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

        </div>
    );
}