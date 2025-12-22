"use client";

import React, { useState } from 'react';
import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    CheckCircle, 
    XCircle, 
    Clock,
    User,
    Mail,
    Phone
} from 'lucide-react';

export default function ManageVolunteersPage() {

    // Mock Data (Simulating submissions from the public form)
    const [volunteers, setVolunteers] = useState([
        { 
            id: 1, 
            name: "Ahmed Musa", 
            email: "ahmed@email.com",
            phone: "08012345678",
            interest: "Teaching & Education", 
            availability: "Weekends Only",
            date: "22 Dec 2024", 
            status: "Pending"
        },
        { 
            id: 2, 
            name: "Fatima Sani", 
            email: "fatima@email.com",
            phone: "08098765432",
            interest: "Medical Team", 
            availability: "Flexible",
            date: "20 Dec 2024", 
            status: "Approved"
        },
        { 
            id: 3, 
            name: "Umar Farouq", 
            email: "umar@email.com",
            phone: "07011223344",
            interest: "Tech & IT Support", 
            availability: "Remote / Online",
            date: "18 Dec 2024", 
            status: "Declined"
        },
    ]);

    // Handle Status Change
    const handleStatusChange = (id, newStatus) => {
        setVolunteers(volunteers.map(vol => 
            vol.id === id ? { ...vol, status: newStatus } : vol
        ));
    };

    return (
        <div className="space-y-6">
            
            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-agency text-3xl text-brand-brown-dark">Volunteer Applications</h1>
                    <p className="font-lato text-sm text-gray-500">Review and manage community service requests.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* 2. FILTERS */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or phone..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                        <option>All Departments</option>
                        <option>Teaching</option>
                        <option>Medical</option>
                        <option>Welfare</option>
                        <option>Tech</option>
                    </select>
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Approved</option>
                    </select>
                </div>
            </div>

            {/* 3. APPLICATIONS TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Applicant</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Interest & Availability</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {volunteers.map((vol) => (
                                <tr key={vol.id} className="hover:bg-gray-50 transition-colors group">
                                    
                                    {/* Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-brand-brown-dark text-sm">{vol.name}</span>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Mail className="w-3 h-3 text-gray-400" />
                                                {vol.email}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Phone className="w-3 h-3 text-gray-400" />
                                                {vol.phone}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Interest */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className="block text-xs font-bold text-brand-brown-dark">{vol.interest}</span>
                                            <span className="block text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                                                {vol.availability}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {vol.date}
                                    </td>

                                    {/* Status Badge */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            vol.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                            vol.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {vol.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                                            {vol.status === 'Pending' && <Clock className="w-3 h-3" />}
                                            {vol.status === 'Declined' && <XCircle className="w-3 h-3" />}
                                            {vol.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleStatusChange(vol.id, 'Approved')}
                                                className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" 
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(vol.id, 'Declined')}
                                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                                                title="Decline"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
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
