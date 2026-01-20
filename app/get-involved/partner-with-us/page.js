"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect'; 
import { useModal } from '@/context/ModalContext'; 
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
    ShieldCheck, Users, TrendingUp, Briefcase, Building2, Lightbulb, Handshake, 
    Mail, User, Building, Loader2, Target, Phone, Globe, Warehouse, MessageCircle 
} from 'lucide-react';

// --- DATA: Countries List (Truncated for performance, includes major global + African nations) ---
const COUNTRIES = [
    { name: "Nigeria", code: "NG", dial: "+234", flag: "🇳🇬" },
    { name: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧" },
    { name: "United States", code: "US", dial: "+1", flag: "🇺🇸" },
    { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦" },
    { name: "United Arab Emirates", code: "AE", dial: "+971", flag: "🇦🇪" },
    { name: "Ghana", code: "GH", dial: "+233", flag: "🇬🇭" },
    { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦" },
    { name: "Egypt", code: "EG", dial: "+20", flag: "🇪🇬" },
    { name: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦" },
    { name: "Qatar", code: "QA", dial: "+974", flag: "🇶🇦" },
    { name: "India", code: "IN", dial: "+91", flag: "🇮🇳" },
    { name: "China", code: "CN", dial: "+86", flag: "🇨🇳" },
    { name: "Germany", code: "DE", dial: "+49", flag: "🇩🇪" },
    { name: "France", code: "FR", dial: "+33", flag: "🇫🇷" },
    { name: "Turkey", code: "TR", dial: "+90", flag: "🇹🇷" },
    { name: "Malaysia", code: "MY", dial: "+60", flag: "🇲🇾" },
    { name: "Kenya", code: "KE", dial: "+254", flag: "🇰🇪" },
    { name: "Niger", code: "NE", dial: "+227", flag: "🇳🇪" },
    { name: "Benin", code: "BJ", dial: "+229", flag: "🇧🇯" },
    { name: "Cameroon", code: "CM", dial: "+237", flag: "🇨🇲" },
    // Add more as needed...
].sort((a, b) => a.name.localeCompare(b.name));

export default function PartnerPage() {
    const { showSuccess } = useModal();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [phoneCode, setPhoneCode] = useState("+234");
    const [phoneNumber, setPhoneNumber] = useState("");
    
    const [formData, setFormData] = useState({
        organization: '',
        orgType: '', 
        contactPerson: '',
        email: '',
        country: '', 
        type: 'Sponsorship',
        message: ''
    });

    const partnershipTypes = [
        "Sponsorship", "CSR Project Implementation", "Academic Collaboration", 
        "Technical Partnership", "Event Sponsorship", "Other"
    ];

    const organizationTypes = [
        "Corporate Company", "NGO / Non-Profit", "Government Agency", 
        "Academic Institution", "Start-up / SME", "Community Group", "Other"
    ];

    // Helper for Country Dropdown
    const countryNames = useMemo(() => COUNTRIES.map(c => c.name), []);

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
        if (!formData.organization || !formData.email || !formData.message || !phoneNumber || !formData.country || !formData.orgType) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "partners"), {
                ...formData,
                phone: `${phoneCode} ${phoneNumber}`, // Combine Code + Number
                status: "New",
                submittedAt: serverTimestamp()
            });

            // Reset Form
            setFormData({
                organization: '', orgType: '', contactPerson: '',
                email: '', country: '', type: 'Sponsorship', message: ''
            });
            setPhoneNumber("");
            setPhoneCode("+234");

            showSuccess({
                title: "Partnership Inquiry Sent!",
                message: "Thank you for your interest. Our team will review your proposal and contact you shortly.",
                confirmText: "Close"
            });

        } catch (error) {
            console.error("Error submitting:", error);
            alert("Failed to submit inquiry.");
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
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">Collaborate with Al-Asad Foundation to amplify reach, empower communities, and build a lasting legacy.</p>
                    </div>
                </section>

                {/* 2. VALUE PROPOSITION */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-4">Why Partner With Us?</h2>
                        <p className="font-lato text-sm md:text-lg text-brand-brown max-w-3xl mx-auto leading-relaxed">We offer a trusted platform for organizations to fulfill their Corporate Social Responsibility (CSR) and community engagement goals.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors"><ShieldCheck className="w-7 h-7" /></div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Structure & Credibility</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">Leveraging our established community trust ensures your resources are deployed effectively.</p>
                        </div>
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors"><Users className="w-7 h-7" /></div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Deep Community Reach</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">Gain access to grassroots networks where help is needed most directly without middlemen.</p>
                        </div>
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors"><TrendingUp className="w-7 h-7" /></div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Measurable Impact</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">We provide clear reporting and media documentation on how every partnership milestone is achieved.</p>
                        </div>
                    </div>
                </section>

                {/* 3. INQUIRY FORM */}
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

                            {/* Row 3: Country & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                
                                {/* Country Dropdown */}
                                <div>
                                    <CustomSelect label="Country *" options={countryNames} value={formData.country} onChange={(val) => handleSelectChange('country', val)} icon={Globe} placeholder="Select Country" />
                                </div>

                                {/* Phone with Code */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Phone Number *</label>
                                    <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-gold/20 focus-within:border-brand-gold transition-all">
                                        <select 
                                            value={phoneCode} 
                                            onChange={(e) => setPhoneCode(e.target.value)} 
                                            className="bg-gray-50 text-gray-700 text-sm px-2 py-3 border-r border-gray-200 focus:outline-none cursor-pointer w-[90px]"
                                        >
                                            {COUNTRIES.map((c) => (
                                                <option key={c.code} value={c.dial}>{c.flag} {c.dial}</option>
                                            ))}
                                        </select>
                                        <div className="relative flex-grow">
                                            <input 
                                                type="tel" 
                                                value={phoneNumber} 
                                                onChange={(e) => setPhoneNumber(e.target.value)} 
                                                required 
                                                className="w-full h-full pl-3 pr-4 text-sm focus:outline-none" 
                                                placeholder="806 716 8669" 
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3 text-green-500" /> 
                                        Please use a number available on WhatsApp.
                                    </p>
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
