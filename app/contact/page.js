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
import { MapPin, Phone, Mail, Globe, Facebook, Youtube, Instagram, Twitter, MessageCircle, Loader2, Send, Info } from 'lucide-react';

export default function ContactPage() {
    const { showSuccess } = useModal();
    
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    
    // Dynamic Data
    const [teamLead, setTeamLead] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    
    // Contact Info State
    const [contactInfo, setContactInfo] = useState({
        address: 'Loading address...',
        email: 'Loading email...',
        phone: 'Loading phone...',
        facebook: '', twitter: '', instagram: '', youtube: '', whatsapp: '', telegram: '',
        mapLatitude: '12.970758', // Default: Katsina
        mapLongitude: '7.636398'  // Default: Katsina
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

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // A. Fetch Contact Settings
                const infoSnap = await getDoc(doc(db, "general_settings", "contact_info"));
                if (infoSnap.exists()) {
                    const data = infoSnap.data();
                    setContactInfo(prev => ({
                        ...prev,
                        ...data,
                        mapLatitude: data.mapLatitude || '12.970758',
                        mapLongitude: data.mapLongitude || '7.636398'
                    }));
                }

                // B. Fetch Team Members
                const teamQ = query(collection(db, "team_members"), orderBy("createdAt", "desc"));
                const teamSnap = await getDocs(teamQ);
                const allMembers = teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

    // Helper for Socials
    const socialLinks = [
        { icon: Facebook, href: contactInfo.facebook },
        { icon: Twitter, href: contactInfo.twitter },
        { icon: Instagram, href: contactInfo.instagram },
        { icon: Youtube, href: contactInfo.youtube },
        { icon: MessageCircle, href: contactInfo.whatsapp },
        { icon: Send, href: contactInfo.telegram },
    ].filter(link => link.href && link.href.length > 2); 

    // Dynamic Map URL
    const mapEmbedUrl = `https://maps.google.com/maps?q=${contactInfo.mapLatitude},${contactInfo.mapLongitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
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
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                        {/* LEFT: Contact Information & Map */}
                        <div className="flex-1 space-y-8">

                            {/* Contact Details Card */}
                            <div className="bg-brand-sand/30 p-8 md:p-10 rounded-3xl border border-brand-gold/10 relative overflow-hidden shadow-sm">
                                <h2 className="font-agency text-3xl text-brand-brown-dark mb-8">Get in Touch</h2>
                                <div className="space-y-8">
                                    {/* Address */}
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-gold shadow-sm mt-1 flex-shrink-0"><MapPin className="w-6 h-6" /></div>
                                        <div>
                                            <p className="font-agency text-xl text-brand-brown-dark leading-none mb-2">Office Address</p>
                                            <p className="font-lato text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{contactInfo.address}</p>
                                        </div>
                                    </div>
                                    {/* Phone/Email */}
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-gold shadow-sm mt-1 flex-shrink-0"><Phone className="w-6 h-6" /></div>
                                        <div>
                                            <p className="font-agency text-xl text-brand-brown-dark leading-none mb-2">Direct Contacts</p>
                                            <a href={`mailto:${contactInfo.email}`} className="block font-lato text-base text-gray-600 hover:text-brand-gold transition-colors break-all mb-1">{contactInfo.email}</a>
                                            <a href={`tel:${contactInfo.phone}`} className="block font-lato text-base text-gray-600 hover:text-brand-gold transition-colors">{contactInfo.phone}</a>
                                        </div>
                                    </div>
                                    {/* Socials */}
                                    {socialLinks.length > 0 && (
                                        <div className="flex items-start gap-5 pt-2">
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-gold shadow-sm mt-1 flex-shrink-0"><Globe className="w-6 h-6" /></div>
                                            <div>
                                                <p className="font-agency text-xl text-brand-brown-dark leading-none mb-4">Connect Online</p>
                                                <div className="flex gap-3 flex-wrap">
                                                    {socialLinks.map((social, idx) => {
                                                        const Icon = social.icon;
                                                        return (
                                                            <Link key={idx} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-gold text-white flex items-center justify-center hover:bg-brand-brown-dark transition-all transform hover:scale-110 shadow-sm">
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

                            {/* 16:9 Map (Moved Here) */}
                            <div className="bg-white p-2 rounded-3xl shadow-lg border border-gray-100">
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
                                    <iframe 
                                        src={mapEmbedUrl} 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }} 
                                        allowFullScreen="" 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="absolute inset-0"
                                    ></iframe>
                                    
                                    <div className="absolute top-4 left-4 pointer-events-none">
                                        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-gray-100">
                                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="font-agency text-brand-brown-dark text-base whitespace-nowrap">Locate us on Map</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT: Contact Form */}
                        <div className="flex-1 bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-t-8 border-brand-gold h-fit relative">
                            <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-6">Send us a Message</h2>
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label><input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:border-brand-gold" placeholder="Enter your name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label><input type="email" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:border-brand-gold" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                                <CustomSelect label="Subject" options={subjects} value={formData.subject} onChange={(val) => setFormData({...formData, subject: val})} placeholder="Select Subject" />
                                <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label><textarea rows="5" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:border-brand-gold resize-none" placeholder="How can we help you?" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required></textarea></div>
                                
                                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <Send className="w-4 h-4" /></>}
                                </button>

                                {/* Important Notice (Integrated Here) */}
                                <div className="bg-brand-sand/10 border border-brand-gold/20 rounded-xl p-4 mt-6 flex gap-3 items-start">
                                    <Info className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                                    <div className="space-y-2">
                                        <p className="text-xs text-brand-brown leading-relaxed">
                                            This contact form is intended for general inquiries, feedback, and non-urgent communication.
                                        </p>
                                        <p className="text-xs text-brand-brown font-bold leading-relaxed">
                                            For time-sensitive matters, we recommend visiting our administrative office or contacting us directly by phone to ensure faster resolution.
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide pt-1">
                                            Thank you for your understanding.
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                {/* 3. MEDIA TEAM */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark mb-3">Meet Our Media Team</h2>
                        <div className="w-20 h-1.5 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-base md:text-xl max-w-2xl mx-auto">The dedicated faces behind our digital presence.</p>
                    </div>
                    {loading ? <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-brand-gold" /></div> : (
                        <>
                            {teamLead && (
                                <div className="flex justify-center mb-12 md:mb-16">
                                    <div className="group flex flex-col items-center w-full max-w-[280px]">
                                        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-6 shadow-2xl border-4 border-brand-gold bg-brand-sand transform group-hover:scale-105 transition-transform duration-500">
                                            <Image src={teamLead.image || "/fallback.webp"} alt={teamLead.name} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                        </div>
                                        <h3 className="font-agency text-3xl text-brand-brown-dark leading-none mb-2">{teamLead.name}</h3>
                                        <p className="font-lato text-sm text-brand-gold font-bold uppercase tracking-widest bg-brand-gold/10 px-4 py-1.5 rounded-full">{teamLead.role}</p>
                                    </div>
                                </div>
                            )}
                            {teamMembers.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="group flex flex-col items-center">
                                            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-md bg-brand-sand transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                                                <Image src={member.image || "/fallback.webp"} alt={member.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            </div>
                                            <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-none text-center mb-1">{member.name}</h3>
                                            <p className="font-lato text-[10px] md:text-xs text-brand-brown font-bold uppercase tracking-wider text-center opacity-70">{member.role}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (!teamLead && <p className="text-center text-gray-400 italic">Team members will be listed here.</p>)}
                        </>
                    )}
                </section>

            </main>
            <Footer />
        </div>
    );
}