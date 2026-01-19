"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Firebase
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Truck, Laptop, HeartHandshake, Calendar, User, Phone, Mail, MapPin, Loader2, CheckCircle } from 'lucide-react';

export default function VolunteerPage() {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        department: 'Teaching & Education',
        availability: 'Weekends Only',
        experience: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple Validation
        if (!formData.fullName || !formData.phone || !formData.location) {
            alert("Please fill in all required fields (Name, Phone, Location).");
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "volunteers"), {
                ...formData,
                status: "Pending", // Default status
                submittedAt: serverTimestamp()
            });

            // Here you would trigger your API for Email/SMS (e.g., fetch('/api/notify', ...))

            setSubmitted(true);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                location: '',
                department: 'Teaching & Education',
                availability: 'Weekends Only',
                experience: ''
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

                {/* 2. MAIN CONTENT SPLIT */}
                <div className="px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row gap-12 lg:gap-20 max-w-7xl mx-auto">

                    {/* LEFT: INFO */}
                    <div className="flex-1 lg:sticky lg:top-32 lg:self-start space-y-8">
                        <div>
                            <h2 className="font-agency text-3xl text-brand-brown-dark mb-4 relative inline-block">
                                Why Volunteer?
                                <span className="absolute -bottom-1 left-0 w-1/3 h-1 bg-brand-gold rounded-full"></span>
                            </h2>
                            <p className="font-lato text-base text-gray-600 leading-relaxed mb-4 text-justify md:text-left">
                                Volunteering at Al-Asad Foundation is more than just a task; it is an act of worship (Ibadah) and service (Khidmah). By dedicating your time, you become part of a legacy that uplifts the ignorant through knowledge and feeds the hungry through charity.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-brand-sand/30 p-6 rounded-2xl border-l-4 border-brand-gold flex gap-4 hover:shadow-md transition-shadow">
                                <div className="bg-white p-2 rounded-full h-fit text-brand-brown-dark"><BookOpen className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Education Unit</h3>
                                    <p className="font-lato text-sm text-gray-600">Tutoring, mentoring students, or organizing Islamic classes.</p>
                                </div>
                            </div>
                            <div className="bg-brand-sand/30 p-6 rounded-2xl border-l-4 border-brand-brown-dark flex gap-4 hover:shadow-md transition-shadow">
                                <div className="bg-white p-2 rounded-full h-fit text-brand-brown-dark"><Truck className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Welfare & Aid</h3>
                                    <p className="font-lato text-sm text-gray-600">Food distribution, logistics for events, and community support.</p>
                                </div>
                            </div>
                            <div className="bg-brand-sand/30 p-6 rounded-2xl border-l-4 border-brand-gold flex gap-4 hover:shadow-md transition-shadow">
                                <div className="bg-white p-2 rounded-full h-fit text-brand-brown-dark"><Laptop className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Professional Skills</h3>
                                    <p className="font-lato text-sm text-gray-600">Medical, Tech/IT, Legal, or Media support.</p>
                                </div>
                            </div>
                        </div>
                    </div>
{/* RIGHT: APPLICATION FORM */}
                    <div className="flex-[1.5]">
                        <div className="bg-white rounded-3xl shadow-2xl border-t-8 border-brand-brown-dark p-6 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sand opacity-20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <HeartHandshake className="w-8 h-8 text-brand-gold" />
                                    <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark">
                                        Volunteer Application
                                    </h2>
                                </div>
                                <p className="font-lato text-sm md:text-base text-gray-500 mb-10 pl-1">
                                    Please fill out this form to register your interest. Our team will review your profile and contact you soon.
                                </p>

                                {submitted ? (
                                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-agency text-2xl text-green-800 mb-2">Jazakumullahu Khairan!</h3>
                                        <p className="text-green-700 font-lato">
                                            Your application has been submitted successfully. We will review your details and contact you shortly via email or phone.
                                        </p>
                                        <button 
                                            onClick={() => setSubmitted(false)}
                                            className="mt-6 px-6 py-2 bg-white border border-green-200 text-green-700 font-bold rounded-full hover:bg-green-50 transition-colors"
                                        >
                                            Submit Another
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">

                                        {/* Personal Details */}
                                        <div className="space-y-6">
                                            <h3 className="font-agency text-xl text-brand-brown-dark uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                                                <User className="w-4 h-4 text-brand-gold" /> Personal Details
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Full Name *</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-colors"
                                                            placeholder="Enter your name"
                                                        />
                                                        <User className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Phone Number *</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="tel" 
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-colors"
                                                            placeholder="080..."
                                                        />
                                                        <Phone className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Email Address</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="email" 
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-colors"
                                                            placeholder="you@example.com"
                                                        />
                                                        <Mail className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">City/Location *</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            name="location"
                                                            value={formData.location}
                                                            onChange={handleChange}
                                                            required
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-colors"
                                                            placeholder="e.g. Katsina GRA"
                                                        />
                                                        <MapPin className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service Interest */}
                                        <div className="space-y-6 pt-2">
                                            <h3 className="font-agency text-xl text-brand-brown-dark uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-brand-gold" /> Availability & Skills
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Department of Interest</label>
                                                    <select 
                                                        name="department"
                                                        value={formData.department}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-colors cursor-pointer appearance-none"
                                                    >
                                                        <option>Teaching & Education</option>
                                                        <option>Welfare & Distribution</option>
                                                        <option>Media & Content</option>
                                                        <option>Medical Team</option>
                                                        <option>Event Logistics</option>
                                                        <option>Tech & IT Support</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Availability</label>
                                                    <select 
                                                        name="availability"
                                                        value={formData.availability}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-colors cursor-pointer appearance-none"
                                                    >
                                                        <option>Weekends Only</option>
                                                        <option>Weekdays (Part-time)</option>
                                                        <option>Remote / Online</option>
                                                        <option>Flexible / Event based</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Skills / Experience</label>
                                                <textarea 
                                                    name="experience"
                                                    value={formData.experience}
                                                    onChange={handleChange}
                                                    rows="4"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white transition-colors resize-none"
                                                    placeholder="Briefly describe your skills, profession, or any previous volunteer experience that might be relevant..."
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button 
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Application'}
                                            </button>
                                            <p className="text-center text-xs text-gray-400 mt-4">
                                                By submitting, you agree to be contacted by our team.
                                            </p>
                                        </div>

                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}