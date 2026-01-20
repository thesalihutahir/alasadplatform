"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect'; // Custom Dropdown
import { useModal } from '@/context/ModalContext'; // Custom Modal
// Firebase
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
    ShieldCheck, Users, TrendingUp, Briefcase, Building2, Lightbulb, Handshake, 
    Mail, User, Building, Loader2, Target, Phone, Globe, Warehouse 
} from 'lucide-react';

export default function PartnerPage() {
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        organization: '',
        orgType: '', // New Field
        contactPerson: '',
        email: '',
        phone: '', // New Field
        country: '', // New Field
        type: 'Sponsorship', // Default partnership type
        message: ''
    });

    // Dropdown Options
    const partnershipTypes = [
        "Sponsorship", 
        "CSR Project Implementation", 
        "Academic Collaboration", 
        "Technical Partnership",
        "Event Sponsorship",
        "Other"
    ];

    const organizationTypes = [
        "Corporate Company",
        "NGO / Non-Profit",
        "Government Agency",
        "Academic Institution",
        "Start-up / SME",
        "Community Group",
        "Other"
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

        // Validation
        if (!formData.organization || !formData.email || !formData.message || !formData.phone || !formData.country || !formData.orgType) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "partners"), {
                ...formData,
                status: "New", // New, Contacted, Partnered, Declined
                submittedAt: serverTimestamp()
            });

            // Reset Form
            setFormData({
                organization: '',
                orgType: '',
                contactPerson: '',
                email: '',
                phone: '',
                country: '',
                type: 'Sponsorship',
                message: ''
            });

            // Show Success Modal
            showSuccess({
                title: "Partnership Inquiry Sent!",
                message: "Thank you for your interest in collaborating with Al-Asad Foundation. Our partnerships team will review your proposal and contact you shortly.",
                confirmText: "Close"
            });

        } catch (error) {
            console.error("Error submitting partnership inquiry:", error);
            alert("Failed to submit inquiry. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image src="/images/heroes/get-involved-partner-hero.webp" alt="Partner With Us" fill className="object-cover object-center" priority />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>
                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">Partner For Impact</h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">Collaborate with Al-Asad Foundation to amplify reach, empower communities, and build a lasting legacy through strategic partnership.</p>
                    </div>
                </section>

                {/* 2. VALUE PROPOSITION */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-4">Why Partner With Us?</h2>
                        <p className="font-lato text-sm md:text-lg text-brand-brown max-w-3xl mx-auto leading-relaxed">We offer a trusted platform for organizations to fulfill their Corporate Social Responsibility (CSR) and community engagement goals through structured, transparent, and high-impact initiatives.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors"><ShieldCheck className="w-7 h-7" /></div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Structure & Credibility</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">Leveraging our established community trust and administrative structure ensures your resources are deployed effectively, ethically, and transparently.</p>
                        </div>
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors"><Users className="w-7 h-7" /></div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Deep Community Reach</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">Gain access to grassroots networks where help is needed most, ensuring your support reaches the intended beneficiaries directly without middlemen.</p>
                        </div>
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors"><TrendingUp className="w-7 h-7" /></div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Measurable Impact</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">We provide clear reporting and documentation (media & data) on how every partnership milestone is achieved, giving you clear visibility on ROI.</p>
                        </div>
                    </div>
                </section>

                {/* 3. PARTNERSHIP MODELS */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 bg-brand-brown-dark py-16 md:py-20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -ml-20 -mb-20"></div>
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-12"><h2 className="font-agency text-3xl md:text-5xl mb-4">Ways to Collaborate</h2><p className="text-white/70 max-w-xl mx-auto font-lato">We offer flexible partnership models tailored to your organization's goals.</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <div className="flex flex-col gap-4 bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"><div className="flex justify-between items-start"><span className="font-agency text-4xl text-brand-gold font-bold opacity-50">01</span><Briefcase className="w-8 h-8 text-brand-gold" /></div><div><h3 className="font-agency text-2xl mb-2">Project Sponsorship</h3><p className="font-lato text-sm md:text-base text-white/70 leading-relaxed">Adopt a specific initiative (e.g., "Build a Classroom" or "Ramadan Feeding") and fully brand it as your organization's contribution.</p></div></div>
                            <div className="flex flex-col gap-4 bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"><div className="flex justify-between items-start"><span className="font-agency text-4xl text-brand-gold font-bold opacity-50">02</span><Building2 className="w-8 h-8 text-brand-gold" /></div><div><h3 className="font-agency text-2xl mb-2">CSR Implementation</h3><p className="font-lato text-sm md:text-base text-white/70 leading-relaxed">Let us be the implementation arm for your company's annual Corporate Social Responsibility projects, ensuring compliance and impact.</p></div></div>
                            <div className="flex flex-col gap-4 bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"><div className="flex justify-between items-start"><span className="font-agency text-4xl text-brand-gold font-bold opacity-50">03</span><Lightbulb className="w-8 h-8 text-brand-gold" /></div><div><h3 className="font-agency text-2xl mb-2">Knowledge Exchange</h3><p className="font-lato text-sm md:text-base text-white/70 leading-relaxed">Partner with our schools for curriculum development, teacher training workshops, or establishing tech innovation hubs.</p></div></div>
                        </div>
                    </div>
                </section>

                {/* 4. PARTNERSHIP INQUIRY FORM */}
                <section className="px-6 md:px-12 lg:px-24 mb-12 max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-14 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-brown-dark to-brand-gold"></div>
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4"><Handshake className="w-8 h-8 text-brand-brown-dark" /></div>
                            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark mb-3">Become a Partner</h2>
                            <p className="font-lato text-sm md:text-lg text-gray-500 max-w-lg mx-auto">Fill out the form below representing your organization. We will get back to you to schedule a meeting.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Organization Name *</label>
                                    <div className="relative"><input type="text" name="organization" value={formData.organization} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all" placeholder="Company / NGO Name" /><Building className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" /></div>
                                </div>
                                <div>
                                    <CustomSelect label="Organization Type *" options={organizationTypes} value={formData.orgType} onChange={(val) => handleSelectChange('orgType', val)} icon={Warehouse} placeholder="Select Org Type" />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Contact Person *</label>
                                    <div className="relative"><input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all" placeholder="Full Name" /><User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" /></div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email Address *</label>
                                    <div className="relative"><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all" placeholder="official@email.com" /><Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" /></div>
                                </div>
                            </div>

                            {/* Row 3 (New) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Phone Number *</label>
                                    <div className="relative"><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all" placeholder="+234..." /><Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" /></div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Country *</label>
                                    <div className="relative"><input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all" placeholder="e.g. Nigeria" /><Globe className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" /></div>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div>
                                <CustomSelect label="Partnership Type *" options={partnershipTypes} value={formData.type} onChange={(val) => handleSelectChange('type', val)} icon={Target} placeholder="Select Type" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Proposal / Message *</label>
                                <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all resize-none placeholder-gray-400" placeholder="Briefly describe how you would like to partner with us..."></textarea>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Inquiry'}
                            </button>
                        </form>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
