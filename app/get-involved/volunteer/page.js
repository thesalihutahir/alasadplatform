"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function VolunteerPage() {
    
    // Form State (Ready for Backend Integration later)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        interest: 'Teaching & Education',
        availability: 'Weekends Only',
        experience: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // In the future: This will send data to Firebase
        alert("Thank you! Your application has been received. (Frontend Demo)");
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-10">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" // Placeholder: Volunteers working/smiling
                            alt="Volunteer with Us"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-20 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-3 drop-shadow-sm">
                            Join the Khidmah
                        </h1>
                        <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                        <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                            "The most beloved people to Allah are those who are most beneficial to people."
                        </p>
                    </div>
                </section>

                <div className="px-6 flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                    
                    {/* 2. LEFT: INFORMATIONAL SIDEBAR */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h2 className="font-agency text-2xl text-brand-brown-dark mb-4">
                                Why Volunteer?
                            </h2>
                            <p className="font-lato text-sm text-brand-brown leading-relaxed mb-4 text-justify">
                                Volunteering at Al-Asad Foundation is more than just a task; it is an act of worship (Ibadah) and service (Khidmah). By dedicating your time, you become part of a legacy that uplifts the ignorant through knowledge and feeds the hungry through charity.
                            </p>
                        </div>

                        {/* Areas of Service Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                            <div className="bg-brand-sand/40 p-5 rounded-xl border-l-4 border-brand-gold">
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Education Unit</h3>
                                <p className="font-lato text-xs text-brand-brown">Tutoring, mentoring students, or organizing Islamic classes.</p>
                            </div>
                            <div className="bg-brand-sand/40 p-5 rounded-xl border-l-4 border-brand-brown-dark">
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Welfare & Aid</h3>
                                <p className="font-lato text-xs text-brand-brown">Food distribution, logistics for events, and community support.</p>
                            </div>
                            <div className="bg-brand-sand/40 p-5 rounded-xl border-l-4 border-brand-gold">
                                <h3 className="font-agency text-xl text-brand-brown-dark mb-1">Professional Skills</h3>
                                <p className="font-lato text-xs text-brand-brown">Medical, Tech/IT, Legal, or Media support.</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. RIGHT: THE CUSTOM APPLICATION FORM */}
                    <div className="flex-[1.5]">
                        <div className="bg-white rounded-2xl shadow-xl border-t-8 border-brand-brown-dark p-6 md:p-10">
                            <h2 className="font-agency text-3xl text-brand-brown-dark mb-2">
                                Volunteer Application
                            </h2>
                            <p className="font-lato text-sm text-gray-500 mb-8">
                                Please fill out this form to register your interest. Admins will review and contact you.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                {/* Section A: Personal Details */}
                                <div className="space-y-4">
                                    <h3 className="font-agency text-lg text-brand-gold uppercase tracking-wider border-b border-gray-100 pb-2">
                                        Personal Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-brand-brown mb-1">Full Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-brown mb-1">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                                placeholder="080..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-brand-brown mb-1">Email Address</label>
                                            <input 
                                                type="email" 
                                                className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-brown mb-1">City/Location</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                                placeholder="e.g. Katsina GRA"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section B: Service Interest */}
                                <div className="space-y-4 pt-4">
                                    <h3 className="font-agency text-lg text-brand-gold uppercase tracking-wider border-b border-gray-100 pb-2">
                                        How Can You Help?
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-brand-brown mb-1">Department of Interest</label>
                                            <select className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                                                <option>Teaching & Education</option>
                                                <option>Welfare & Distribution</option>
                                                <option>Media & Content</option>
                                                <option>Medical Team</option>
                                                <option>Event Logistics</option>
                                                <option>Tech & IT Support</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-brown mb-1">Availability</label>
                                            <select className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
                                                <option>Weekends Only</option>
                                                <option>Weekdays (Part-time)</option>
                                                <option>Remote / Online</option>
                                                <option>Flexible / Event based</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-brand-brown mb-1">Skills / Experience</label>
                                        <textarea 
                                            rows="3"
                                            className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                                            placeholder="Tell us briefly about your skills or previous volunteer experience..."
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-colors shadow-lg"
                                    >
                                        Submit Application
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
