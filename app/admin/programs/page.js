"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    PlusCircle, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Users,
    Target
} from 'lucide-react';

export default function ManageProgramsPage() {

    // Mock Data
    const [programs, setPrograms] = useState([
        { 
            id: 1, 
            title: "Ramadan Iftar Distribution 2025", 
            category: "Welfare", 
            beneficiaries: "5,000 Families",
            location: "Katsina State",
            status: "Upcoming",
            image: "/hero.jpg"
        },
        { 
            id: 2, 
            title: "Annual Scholarship Scheme", 
            category: "Education", 
            beneficiaries: "150 Students",
            location: "Ma'ahad Sheikh Shareef",
            status: "Active",
            image: "/hero.jpg"
        },
        { 
            id: 3, 
            title: "Borehole Construction Project", 
            category: "Infrastructure", 
            beneficiaries: "3 Communities",
            location: "Rural Areas",
            status: "Completed",
            image: "/hero.jpg"
        },
    ]);

    // Handle Delete
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this program?")) {
            setPrograms(programs.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            
            {/* 1. HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Manage Programs</h1>
                    <p className="font-lato text-sm text-gray-500">Oversee foundation initiatives, campaigns, and projects.</p>
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
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                        <option>All Statuses</option>
                        <option>Active</option>
                        <option>Upcoming</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>

            {/* 3. PROGRAMS TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Program Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Target / Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {programs.map((program) => (
                                <tr key={program.id} className="hover:bg-gray-50 transition-colors group">
                                    
                                    {/* Program Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                <Image src={program.image} alt={program.title} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-brand-brown-dark text-sm line-clamp-1 max-w-[200px]">{program.title}</h3>
                                                <p className="text-xs text-gray-400">ID: #{program.id}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                            program.category === 'Education' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            program.category === 'Welfare' ? 'bg-green-50 text-green-600 border-green-100' :
                                            'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {program.category}
                                        </span>
                                    </td>

                                    {/* Target / Location */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Users className="w-3 h-3 text-brand-gold" />
                                                {program.beneficiaries}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                <Target className="w-3 h-3" />
                                                {program.location}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            program.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                            program.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                program.status === 'Active' ? 'bg-green-500' : 
                                                program.status === 'Upcoming' ? 'bg-yellow-500' :
                                                'bg-gray-400'
                                            }`}></span>
                                            {program.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
