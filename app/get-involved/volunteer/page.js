"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect'; // Custom Dropdown
import { useModal } from '@/context/ModalContext'; // Custom Modal
// Firebase
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Truck, Laptop, HeartHandshake, Calendar, User, Phone, Mail, MapPin, Loader2, Globe } from 'lucide-react';

export default function VolunteerPage() {
    const { showSuccess } = useModal(); // Use Custom Modal

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingStates, setIsLoadingStates] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        nationality: '',
        state: '',
        department: 'Teaching & Education',
        availability: 'Weekends Only',
        experience: ''
    });

    // Dynamic Lists
    const [availableStates, setAvailableStates] = useState([]);
    
    const countries = [
        "Nigeria", "Niger", "Ghana", "Cameroon", "Chad", "Benin", "Togo", 
        "United Kingdom", "United States", "Saudi Arabia", "Canada", "Other"
    ];

    const departments = [
        "Teaching & Education", "Welfare & Distribution", "Media & Content",
        "Medical Team", "Event Logistics", "Tech & IT Support"
    ];

    const availabilityOptions = [
        "Weekends Only", "Weekdays (Part-time)", "Remote / Online", "Flexible / Event based"
    ];

    // --- EFFECT: Fetch States when Country Changes ---
    useEffect(() => {
        const fetchStates = async () => {
            if (!formData.nationality || formData.nationality === "Other") {
                setAvailableStates([]); 
                return;
            }

            setIsLoadingStates(true);
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: formData.nationality })
                });
                
                const data = await response.json();
                
                if (!data.error && data.data.states) {
                    // Extract state names from objects {name: "Kano", state_code: "KN"}
                    const stateNames = data.data.states.map(s => s.name);
                    setAvailableStates(stateNames);
                } else {
                    setAvailableStates([]);
                }
            } catch (error) {
                console.error("Failed to fetch states:", error);
                setAvailableStates([]); // Fallback to empty if API fails
            } finally {
                setIsLoadingStates(false);
            }
        };

        fetchStates();
    }, [formData.nationality]);

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Reset state if country changes
        if (name === 'nationality') {
            setFormData(prev => ({ ...prev, state: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.nationality) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "volunteers"), {
                ...formData,
                status: "Pending",
                submittedAt: serverTimestamp()
            });

            // Reset Form
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                nationality: '',
                state: '',
                department: 'Teaching & Education',
                availability: 'Weekends Only',
                experience: ''
            });

            // Trigger Custom Success Modal
            showSuccess({
                title: "Jazakumullahu Khairan!",
                message: "Your volunteer application has been received. Our team will review your profile and contact you soon.",
                confirmText: "Close"
            });

        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-10 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/get-involved-volunteer-hero.webp" 
                            alt="Volunteer with Us"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Join the Khidmah
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            "The most beloved people to Allah are those who are most beneficial to people."
                        </p>
                    </div>
                </section>

                {/* 2. CONTENT */}
                <div className="px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row gap-12 lg:gap-20 max-w-7xl mx-auto">

                    {/* LEFT: INFO */}
                    <div className="flex-1 lg:sticky lg:top-32 lg:self-start space-y-8">
                        <div>
                            <h2 className="font-agency text-3xl text-brand-brown-dark mb-4 relative inline-block">
                                Why Volunteer?
                                <div className="absolute -bottom-1 left-0 w-12 h-1 bg-brand-gold rounded-full"></div>
                            </h2>
                            <p className="font-lato text-base text-gray-600 leading-relaxed mb-4 text-justify md:text-left">
                                Volunteering at Al-Asad Foundation is more than just a task; it is an act of worship (Ibadah) and service (Khidmah). By dedicating your time, you become part of a legacy that uplifts the ignorant through knowledge and feeds the hungry through charity.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:border-brand-gold/50 transition-colors">
                                <div className="w-10 h-10 bg-brand-sand/50 rounded-full flex items-center justify-center text-brand-brown-dark flex-shrink-0">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Education Unit</h3>
                                    <p className="font-lato text-xs text-gray-500">Tutoring, mentoring students, or organizing Islamic classes.</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:border-brand-gold/50 transition-colors">
                                <div className="w-10 h-10 bg-brand-sand/50 rounded-full flex items-center justify-center text-brand-brown-dark flex-shrink-0">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Welfare & Aid</h3>
                                    <p className="font-lato text-xs text-gray-500">Food distribution, logistics for events, and community support.</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:border-brand-gold/50 transition-colors">
                                <div className="w-10 h-10 bg-brand-sand/50 rounded-full flex items-center justify-center text-brand-brown-dark flex-shrink-0">
                                    <Laptop className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Professional Skills</h3>
                                    <p className="font-lato text-xs text-gray-500">Medical, Tech/IT, Legal, or Media support.</p>
                                </div>
                            </div>
                        </div>
                    </div>
{/* RIGHT: FORM */}
                    <div className="flex-[1.5]">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sand/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-brand-gold/10 rounded-lg text-brand-brown-dark">
                                        <HeartHandshake className="w-6 h-6" />
                                    </div>
                                    <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark">
                                        Volunteer Application
                                    </h2>
                                </div>
                                <p className="font-lato text-sm text-gray-500 mb-8 pl-1">
                                    Please fill out this form. Our team will review your profile and contact you soon.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-8">

                                    {/* Section 1: Personal Details */}
                                    <div className="space-y-5">
                                        <h3 className="font-agency text-lg text-brand-brown-dark uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-brand-gold" /> Personal Details
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                                        placeholder="Enter your name"
                                                    />
                                                    <User className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                                                <div className="relative">
                                                    <input 
                                                        type="tel" 
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                                        placeholder="080..."
                                                    />
                                                    <Phone className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                                                <div className="relative">
                                                    <input 
                                                        type="email" 
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                                        placeholder="you@example.com"
                                                    />
                                                    <Mail className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                                                </div>
                                            </div>
                                            
                                            {/* CUSTOM NATIONALITY SELECT */}
                                            <div>
                                                <CustomSelect 
                                                    label="Nationality *"
                                                    icon={Globe}
                                                    options={countries}
                                                    value={formData.nationality}
                                                    onChange={(val) => handleSelectChange('nationality', val)}
                                                    placeholder="Select Country"
                                                />
                                            </div>
                                        </div>

                                        {/* STATE / LOCATION */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* State Select (Dynamic) */}
                                            <div>
                                                {isLoadingStates ? (
                                                    <div className="w-full h-[70px] flex items-center justify-center bg-gray-50 border rounded-xl">
                                                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                                    </div>
                                                ) : availableStates.length > 0 ? (
                                                    <CustomSelect 
                                                        label="State/Province *"
                                                        icon={MapPin}
                                                        options={availableStates}
                                                        value={formData.state}
                                                        onChange={(val) => handleSelectChange('state', val)}
                                                        placeholder="Select State"
                                                    />
                                                ) : (
                                                    // Fallback text input if no states found or "Other" country
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">State / City *</label>
                                                        <div className="relative">
                                                            <input 
                                                                type="text" 
                                                                name="state"
                                                                value={formData.state}
                                                                onChange={handleChange}
                                                                required
                                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                                                placeholder="Enter your location"
                                                            />
                                                            <MapPin className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Skills */}
                                    <div className="space-y-5 pt-2">
                                        <h3 className="font-agency text-lg text-brand-brown-dark uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-brand-gold" /> Availability & Skills
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <CustomSelect 
                                                label="Department"
                                                options={departments}
                                                value={formData.department}
                                                onChange={(val) => handleSelectChange('department', val)}
                                            />
                                            <CustomSelect 
                                                label="Availability"
                                                options={availabilityOptions}
                                                value={formData.availability}
                                                onChange={(val) => handleSelectChange('availability', val)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Skills / Experience</label>
                                            <textarea 
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all resize-none placeholder-gray-400"
                                                placeholder="Briefly describe your skills, profession, or any previous volunteer experience..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Application'}
                                        </button>
                                        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
                                            We respect your privacy.
                                        </p>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}