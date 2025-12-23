"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Globe, Facebook, Youtube, Instagram, Twitter, MessageCircle } from 'lucide-react';

export default function ContactPage() {

    // Mock Data for Media Team (11 Members)
    const teamMembers = [
        { id: 1, name: "Lead Name", role: "Head of Media", image: "/hero.jpg" },
        { id: 2, name: "Member Name", role: "Content Strategist", image: "/hero.jpg" },
        { id: 3, name: "Member Name", role: "Videographer", image: "/hero.jpg" },
        { id: 4, name: "Member Name", role: "Editor", image: "/hero.jpg" },
        { id: 5, name: "Member Name", role: "Social Media Manager", image: "/hero.jpg" },
        { id: 6, name: "Member Name", role: "Graphic Designer", image: "/hero.jpg" },
        { id: 7, name: "Member Name", role: "Photographer", image: "/hero.jpg" },
        { id: 8, name: "Member Name", role: "IT Support", image: "/hero.jpg" },
        { id: 9, name: "Member Name", role: "Audio Engineer", image: "/hero.jpg" },
        { id: 10, name: "Member Name", role: "Writer", image: "/hero.jpg" },
        { id: 11, name: "Member Name", role: "Community Manager", image: "/hero.jpg" },
    ];

    // Split the team: Lead (first person) vs. The Rest
    const teamLead = teamMembers[0];
    const teamRest = teamMembers.slice(1);

    // Official Social Links
    const socialLinks = [
        { icon: Facebook, href: "https://www.facebook.com/share/1D438MVXpQ/" },
        { icon: Youtube, href: "https://youtube.com/@alasadeducation" },
        { icon: Instagram, href: "https://www.instagram.com/alasad_education_foundation" },
        { icon: Twitter, href: "https://x.com/AsadEducation" }, // Lucide doesn't have X icon, Twitter is fine or custom SVG
        { icon: MessageCircle, href: "https://whatsapp.com/channel/0029VawdL4n6xCSHyUsMzc2V" }, // WhatsApp
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/hero.jpg"
                            alt="Contact Us"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-white"></div>
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

                        {/* LEFT: Contact Information */}
                        <div className="flex-1 space-y-8 md:space-y-10">

                            {/* General Inquiries Card */}
                            <div className="bg-brand-sand/30 p-8 rounded-3xl border border-brand-gold/10 relative overflow-hidden">
                                <h2 className="font-agency text-3xl text-brand-brown-dark mb-6">
                                    Get in Touch
                                </h2>
                                <div className="space-y-6">
                                    {/* Address */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-gold shadow-sm mt-1 flex-shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-agency text-xl text-brand-brown-dark leading-none mb-1">Office Address</p>
                                            <p className="font-lato text-base text-brand-brown leading-relaxed">
                                                Mani Road, Opposite Gidan Dawa<br />Primary School, Katsina, Katsina State.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone/Email */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-gold shadow-sm mt-1 flex-shrink-0">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-agency text-xl text-brand-brown-dark leading-none mb-1">Direct Contacts</p>
                                            <a href="mailto:alasadeducationfoundation@gmail.com" className="block font-lato text-base text-brand-brown hover:text-brand-gold transition-colors break-all">
                                                alasadeducationfoundation@gmail.com
                                            </a>
                                            <a href="tel:+2348067168669" className="block font-lato text-base text-brand-brown mt-1 hover:text-brand-gold transition-colors">
                                                +234 806 716 8669
                                            </a>
                                        </div>
                                    </div>

                                    {/* Socials */}
                                    <div className="flex items-start gap-4 pt-2">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-gold shadow-sm mt-1 flex-shrink-0">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-agency text-xl text-brand-brown-dark leading-none mb-3">Connect Online</p>
                                            <div className="flex gap-3 flex-wrap">
                                                {socialLinks.map((social, idx) => {
                                                    const Icon = social.icon;
                                                    return (
                                                        <Link 
                                                            key={idx} 
                                                            href={social.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-10 h-10 rounded-full bg-brand-gold text-white flex items-center justify-center hover:bg-brand-brown-dark transition-all transform hover:scale-110 shadow-sm"
                                                        >
                                                            <Icon className="w-5 h-5" />
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Direct Media Contact */}
                            <div className="p-8 rounded-3xl border-l-4 border-brand-brown-dark bg-white shadow-lg">
                                <h2 className="font-agency text-2xl text-brand-brown-dark mb-2">
                                    For Press & Media
                                </h2>
                                <p className="font-lato text-base text-brand-brown mb-2">
                                    Need logos, brand assets, or interviews? Reach out directly:
                                </p>
                                <p className="font-lato text-base font-bold text-brand-gold flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> alasadeducationfoundation@gmail.com
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: Contact Form */}
                        <div className="flex-1 bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-t-8 border-brand-gold h-fit relative">
                            <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-6">
                                Send us a Message
                            </h2>
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:bg-white" placeholder="Enter your name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:bg-white" placeholder="Enter your email" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:bg-white cursor-pointer">
                                        <option>General Inquiry</option>
                                        <option>Media & Press</option>
                                        <option>Volunteering</option>
                                        <option>Donation Support</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                                    <textarea rows="5" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all focus:bg-white resize-none" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="button" className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* 3. MEET THE MEDIA TEAM SECTION */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark mb-3">
                            Meet Our Media Team
                        </h2>
                        <div className="w-20 h-1.5 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-base md:text-xl max-w-2xl mx-auto">
                            The dedicated faces behind our digital presence, ensuring the message of Al-Asad Foundation reaches the world with excellence.
                        </p>
                    </div>

                    {/* 3a. TEAM LEAD (Centered & Highlighted) */}
                    <div className="flex justify-center mb-12 md:mb-16">
                        <div className="group flex flex-col items-center w-full max-w-[280px]">
                            {/* Image Card */}
                            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-6 shadow-2xl border-4 border-brand-gold bg-brand-sand transform group-hover:scale-105 transition-transform duration-500">
                                <Image 
                                    src={teamLead.image} 
                                    alt={teamLead.name} 
                                    fill 
                                    className="object-cover" 
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                            </div>

                            {/* Info */}
                            <h3 className="font-agency text-3xl text-brand-brown-dark leading-none mb-2">
                                {teamLead.name}
                            </h3>
                            <p className="font-lato text-sm text-brand-gold font-bold uppercase tracking-widest bg-brand-gold/10 px-4 py-1.5 rounded-full">
                                {teamLead.role}
                            </p>
                        </div>
                    </div>

                    {/* 3b. THE REST OF THE TEAM (Grid) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                        {teamRest.map((member) => (
                            <div key={member.id} className="group flex flex-col items-center">
                                {/* Image Card */}
                                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4 shadow-md bg-brand-sand transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                                    <Image 
                                        src={member.image} 
                                        alt={member.name} 
                                        fill 
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                                    />
                                </div>

                                {/* Info */}
                                <h3 className="font-agency text-lg md:text-xl text-brand-brown-dark leading-none text-center mb-1">
                                    {member.name}
                                </h3>
                                <p className="font-lato text-[10px] md:text-xs text-brand-brown font-bold uppercase tracking-wider text-center opacity-70">
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. MAP PLACEHOLDER */}
                <section className="w-full h-80 md:h-96 bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700">
                    <Image
                        src="/hero.jpg" // Placeholder for map image
                        alt="Map Location"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-full shadow-2xl flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-brand-gold" />
                            <span className="font-agency text-brand-brown-dark text-xl">Locate us on Map</span>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
