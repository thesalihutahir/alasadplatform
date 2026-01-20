"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect'; 
import { useModal } from '@/context/ModalContext';
// Firebase
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { MapPin, Phone, Mail, Globe, Facebook, Youtube, Instagram, Twitter, MessageCircle, Loader2, Send, Clock, ArrowRight } from 'lucide-react';

export default function ContactPage() {
    const { showSuccess } = useModal();
    
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    
    // Dynamic Data
    const [teamLead, setTeamLead] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [contactInfo, setContactInfo] = useState({
        address: 'Loading address...',
        email: 'Loading email...',
        phone: 'Loading phone...',
        facebook: '', twitter: '', instagram: '', youtube: '', whatsapp: ''
    });

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        subject: '',
        message: ''
    });

    const subjects = ["General Inquiry", "Media & Press", "Volunteering", "Donation Support", "Other"];

    // --- 1. FETCH DATA (Team & Contact Info) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // A. Fetch Contact Settings
                const infoSnap = await getDoc(doc(db, "general_settings", "contact_info"));
                if (infoSnap.exists()) {
                    setContactInfo(infoSnap.data());
                }

                // B. Fetch Team Members
                const teamQ = query(collection(db, "team_members"), orderBy("createdAt", "desc"));
                const teamSnap = await getDocs(teamQ);
                const allMembers = teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Separate Lead from others
                const lead = allMembers.find(m => m.isLead);
                const rest = allMembers.filter(m => m.id !== lead?.id);

                setTeamLead(lead || null);
                setTeamMembers(rest);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- 2. HANDLE FORM SUBMISSION ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullName || !formData.email || !formData.message || !formData.subject) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, "contact_messages"), {
                ...formData,
                status: "New",
                createdAt: serverTimestamp()
            });

            // Reset & Show Success
            setFormData({ fullName: '', email: '', subject: '', message: '' });
            showSuccess({
                title: "Message Sent!",
                message: "Thank you for reaching out. Our team will get back to you shortly.",
                confirmText: "Close"
            });

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to map dynamic links to icons
    const socialLinks = [
        { icon: Facebook, href: contactInfo.facebook },
        { icon: Twitter, href: contactInfo.twitter },
        { icon: Instagram, href: contactInfo.instagram },
        { icon: Youtube, href: contactInfo.youtube },
        { icon: MessageCircle, href: contactInfo.whatsapp },
    ].filter(link => link.href && link.href.length > 5); 

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-16 md:mb-24">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/contact-hero.webp"
                            alt="Contact Us"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Contact Us
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Have questions, want to get involved, or need media resources? We are here to listen and assist you.
                        </p>
                    </div>
                </section>

                {/* 2. CONTACT INFO & FORM GRID */}
                <section className="px-6 md:px-12 lg:px-24 mb-20 max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">

                        {/* LEFT: Contact Information (Dynamic) */}
                        <div className="flex-1 space-y-8 w-full">

                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-brand-sand/20 relative overflow-hidden group hover:border-brand-gold/30 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-sand/30 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-brand-gold/20"></div>
                                
                                <h2 className="font-agency text-3xl text-brand-brown-dark mb-8 relative z-10">
                                    Get in Touch
                                </h2>
                                <div className="space-y-8 relative z-10">
                                    
                                    {/* Address */}
                                    <div className="flex items-start gap-5 group/item">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-sand/30 text-brand-brown-dark flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand-brown-dark group-hover/item:text-brand-gold transition-all duration-300">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-agency text-xl text-brand-brown-dark leading-none mb-2">Head Office</p>
                                            <p className="font-lato text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {contactInfo.address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone/Email */}
                                    <div className="flex items-start gap-5 group/item">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-sand/30 text-brand-brown-dark flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand-brown-dark group-hover/item:text-brand-gold transition-all duration-300">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-agency text-xl text-brand-brown-dark leading-none mb-2">Direct Contacts</p>
                                            <a href={`mailto:${contactInfo.email}`} className="block font-lato text-base text-gray-600 hover:text-brand-gold transition-colors break-all mb-1">
                                                {contactInfo.email}
                                            </a>
                                            <a href={`tel:${contactInfo.phone}`} className="block font-lato text-base text-gray-600 hover:text-brand-gold transition-colors">
                                                {contactInfo.phone}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Socials */}
                                    {socialLinks.length > 0 && (
                                        <div className="flex items-start gap-5 group/item pt-2">
                                            <div className="w-12 h-12 rounded-2xl bg-brand-sand/30 text-brand-brown-dark flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand-brown-dark group-hover/item:text-brand-gold transition-all duration-300">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-agency text-xl text-brand-brown-dark leading-none mb-4">Connect Online</p>
                                                <div className="flex gap-3 flex-wrap">
                                                    {socialLinks.map((social, idx) => {
                                                        const Icon = social.icon;
                                                        return (
                                                            <Link 
                                                                key={idx} 
                                                                href={social.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold hover:text-white transition-all transform hover:-translate-y-1 shadow-sm"
                                                            >
                                                                <Icon className="w-5 h-5" />
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Visit Note (Replaced Press & Media) */}
                            <div className="p-8 rounded-3xl bg-brand-brown-dark text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <div className="relative z-10 flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-brand-gold" />
                                    </div>
                                    <div>
                                        <h2 className="font-agency text-2xl text-white mb-2">
                                            Visit Us
                                        </h2>
                                        <p className="font-lato text-sm text-white/80 leading-relaxed mb-4">
                                            Our doors are open for inquiries and support during working hours.
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
                                            <span>Mon - Fri: 9AM - 5PM</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Contact Form (Functional) */}
                        <div className="flex-1 w-full bg-white rounded-3xl shadow-2xl shadow-brand-brown-dark/10 p-8 md:p-12 border border-gray-100 relative h-fit">
                            <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-2">
                                Send us a Message
                            </h2>
                            <p className="text-gray-500 text-sm mb-8">We usually reply within 24 hours.</p>

                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:bg-white" 
                                            placeholder="Enter your name" 
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:bg-white" 
                                            placeholder="Enter your email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                {/* Custom Select for Subject */}
                                <CustomSelect 
                                    label="Subject"
                                    options={subjects}
                                    value={formData.subject}
                                    onChange={(val) => setFormData({...formData, subject: val})}
                                    placeholder="Select Topic"
                                />

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                                    <textarea 
                                        rows="5" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:bg-white resize-none" 
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        required
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Send Message <Send className="w-5 h-5" /></>}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* 3. DYNAMIC MEDIA TEAM */}
                <section className="px-6 md:px-12 lg:px-24 mb-20 max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark mb-3">
                            Meet Our Media Team
                        </h2>
                        <div className="w-20 h-1.5 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-base md:text-xl max-w-2xl mx-auto">
                            The dedicated faces behind our digital presence, ensuring the message of Al-Asad Foundation reaches the world.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-brand-gold" /></div>
                    ) : (
                        <>
                            {/* 3a. TEAM LEAD */}
                            {teamLead && (
                                <div className="flex justify-center mb-12 md:mb-16">
                                    <div className="group flex flex-col items-center w-full max-w-[280px]">
                                        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-6 shadow-2xl border-4 border-brand-gold bg-brand-sand transform group-hover:scale-105 transition-transform duration-500">
                                            <Image 
                                                src={teamLead.image || "/images/placeholders/user-placeholder.webp"} 
                                                alt={teamLead.name} 
                                                fill 
                                                className="object-cover" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                        </div>
                                        <h3 className="font-agency text-3xl text-brand-brown-dark leading-none mb-2">
                                            {teamLead.name}
                                        </h3>
                                        <p className="font-lato text-sm text-brand-gold font-bold uppercase tracking-widest bg-brand-gold/10 px-4 py-1.5 rounded-full">
                                            {teamLead.role}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 3b. REST OF THE TEAM */}
                            {teamMembers.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="group flex flex-col items-center">
                                            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-md bg-brand-sand transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 border border-transparent group-hover:border-brand-gold/50">
                                                <Image 
                                                    src={member.image || "/images/placeholders/user-placeholder.webp"} 
                                                    alt={member.name} 
                                                    fill 
                                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                                />
                                            </div>
                                            <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-none text-center mb-1 group-hover:text-brand-gold transition-colors">
                                                {member.name}
                                            </h3>
                                            <p className="font-lato text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider text-center">
                                                {member.role}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !teamLead && <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 italic">Team members will be listed here soon.</div>
                            )}
                        </>
                    )}
                </section>

                {/* 4. LIVE MAP */}
                <section className="w-full h-[400px] md:h-[500px] bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700 border-t border-gray-200">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.6724623347986!2d7.5960!3d12.9886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x11b03b6d2737604d%3A0x863336795779366!2sGidan%20Dawa%20Primary%20School!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                    ></iframe>
                    
                    {/* Overlay Label */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-200">
                        <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center animate-pulse">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-agency text-brand-brown-dark text-xl">We are here</span>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
