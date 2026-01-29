"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Firebase
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// Context & Components
import { useModal } from '@/context/ModalContext';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';

import { 
    ArrowLeft, Save, Loader2, Calendar, MapPin, 
    Clock, AlignLeft, Type, AlertTriangle
} from 'lucide-react';

export default function CreateEventPage() {
    const router = useRouter();
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Community',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        location: '',
        description: '',
        status: 'Upcoming'
    });

    const categoryOptions = [
        { value: "Islamic", label: "Islamic / Religious" },
        { value: "Community", label: "Community Gathering" },
        { value: "Educational", label: "Educational / Workshop" },
        { value: "Fundraiser", label: "Fundraiser" }
    ];

    const statusOptions = [
        { value: "Upcoming", label: "Upcoming" },
        { value: "Concluded", label: "Concluded" },
        { value: "Postponed", label: "Postponed" }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.date) return;

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "events"), {
                ...formData,
                createdAt: serverTimestamp()
            });

            showSuccess({
                title: "Event Created",
                message: "The event has been added to the calendar.",
                onConfirm: () => router.push('/admin/dashboard') // Redirects to dashboard for now
            });

        } catch (error) {
            console.error("Error creating event:", error);
            alert("Failed to create event.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 font-lato">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">New Event</h1>
                        <p className="font-lato text-sm text-gray-500">Schedule an upcoming program or gathering.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || !formData.title} 
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-white font-bold rounded-xl shadow-md hover:bg-brand-brown-dark transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publish Event
                    </button>
                </div>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                
                {/* Left: Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Event Title <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Type className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Annual Ramadan Tafsir" 
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    rows="4" 
                                    placeholder="Brief details about the event..." 
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                ></textarea>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location / Venue</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Main Auditorium or Zoom Link" 
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                        <CustomSelect 
                            label="Category" 
                            options={categoryOptions} 
                            value={formData.category} 
                            onChange={(val) => handleSelectChange('category', val)} 
                        />

                        <CustomSelect 
                            label="Status" 
                            options={statusOptions} 
                            value={formData.status} 
                            onChange={(val) => handleSelectChange('status', val)} 
                        />

                        <CustomDatePicker 
                            label="Event Date" 
                            value={formData.date} 
                            onChange={(val) => handleSelectChange('date', val)} 
                            icon={Calendar}
                        />

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="time" 
                                    name="time" 
                                    value={formData.time} 
                                    onChange={handleChange} 
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
