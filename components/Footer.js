"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
    Lock, 
    Facebook, 
    Youtube, 
    Instagram, 
    Twitter, 
    Send, 
    MessageCircle 
} from "lucide-react";

export default function Footer() {

    // --- Dynamic Social Links Fetching ---
    const [socialUrls, setSocialUrls] = useState({
        facebook: "",
        youtube: "",
        instagram: "",
        telegram: "",
        twitter: "",
        whatsapp: ""
    });

    useEffect(() => {
        const fetchSocials = async () => {
            try {
                const docRef = doc(db, "general_settings", "contact_info");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSocialUrls(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching footer socials:", error);
            }
        };
        fetchSocials();
    }, []);

    // Map data to icons and filter out empty links
    const socialLinks = [
        { name: "Facebook", icon: Facebook, href: socialUrls.facebook },
        { name: "YouTube", icon: Youtube, href: socialUrls.youtube },
        { name: "Instagram", icon: Instagram, href: socialUrls.instagram },
        { name: "Telegram", icon: Send, href: socialUrls.telegram },
        { name: "X", icon: Twitter, href: socialUrls.twitter },
        { name: "WhatsApp", icon: MessageCircle, href: socialUrls.whatsapp },
    ].filter(link => link.href && link.href.length > 5);

    // Navigation Links (Static)
    const quickLinks = [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "Programs", href: "/programs" },
        { name: "Media Library", href: "/media" },
        { name: "Blogs & News", href: "/blogs" },
    ];

    const actionLinks = [
        { name: "Donate", href: "/get-involved/donate" },
        { name: "Volunteer", href: "/get-involved/volunteer" },
        { name: "Partner With Us", href: "/get-involved/partner-with-us" },
        { name: "Contact & Team", href: "/contact" },
        { name: "FAQ", href: "/faq" },
    ];

    return (
        <footer className="w-full bg-brand-brown-dark text-white font-lato pt-12 md:pt-16 pb-8 border-t-4 border-brand-gold">
            <div className="max-w-7xl mx-auto px-6"> 

                {/* --- 1. MAIN CONTENT --- */}
                {/* Mobile: 2 Columns (Links side-by-side). Desktop: 12 Columns. */}
                <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-12">

                    {/* COLUMN 1: BRAND LOGO & MISSION (DESKTOP ONLY) */}
                    <div className="hidden md:block md:col-span-5 space-y-6">
                        {/* Larger Grey Logo for Desktop */}
                        <div className="relative w-60 h-24">
                            <Image 
                                src="/headerlogo.svg" 
                                alt="Al-Asad Logo" 
                                fill 
                                className="object-contain brightness-0 invert-[0.6]" 
                            />
                        </div>

                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                            Empowering communities through Qur'an-centered education, sustainable development, and social innovation. Bridging the gap between traditional values and modern excellence.
                        </p>
                    </div>

                    {/* SPACER COLUMN (Desktop Only) */}
                    <div className="hidden md:block md:col-span-1"></div>

                    {/* COLUMN 2: QUICK LINKS */}
                    <div className="col-span-1 md:col-span-3">
                        <h3 className="font-agency text-lg font-bold mb-4 md:mb-6 text-brand-gold uppercase tracking-wider flex items-center gap-2">
                            Quick Menu
                            {/* Line decoration only on Desktop */}
                            <span className="hidden md:block h-px flex-grow bg-white/10 ml-2"></span>
                        </h3>
                        <ul className="space-y-3 text-sm"> 
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-brand-gold md:hover:pl-2 transition-all duration-300 text-gray-300 block w-fit">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* COLUMN 3: GET INVOLVED */}
                    <div className="col-span-1 md:col-span-3">
                        <h3 className="font-agency text-lg font-bold mb-4 md:mb-6 text-brand-gold uppercase tracking-wider flex items-center gap-2">
                            Get Involved
                            {/* Line decoration only on Desktop */}
                            <span className="hidden md:block h-px flex-grow bg-white/10 ml-2"></span>
                        </h3>
                        <ul className="space-y-3 text-sm"> 
                            {actionLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-brand-gold md:hover:pl-2 transition-all duration-300 text-gray-300 block w-fit">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* --- 2. DIVIDER LINE --- */}
                <hr className="border-t border-white/10 my-8" />

                {/* --- 3. BOTTOM BAR --- */}
                <div className="flex flex-col md:flex-row-reverse md:justify-between md:items-center w-full gap-6">

                    {/* Social Icons (Dynamic) */}
                    <div className="flex justify-center md:justify-end flex-wrap items-center gap-2"> 
                        {socialLinks.map((social) => {
                            const Icon = social.icon;
                            return (
                                <Link 
                                    key={social.name} 
                                    href={social.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="group p-2.5 bg-white/5 rounded-full hover:bg-brand-gold transition-all duration-300 flex items-center justify-center border border-white/5 hover:border-brand-gold"
                                    title={social.name}
                                >
                                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Copyright & Legal (Centered on Mobile, Left on Desktop) */}
                    <div className="text-center md:text-left">

                        {/* Mobile Company Name (Since Logo is hidden) */}
                        <p className="md:hidden text-white/90 text-sm font-agency mb-2">
                            Al-Asad Education Foundation
                        </p>

                        <p className="text-gray-500 text-xs">
                            © {new Date().getFullYear()} All rights reserved <span className="hidden md:inline">| Al-Asad Education Foundation</span> | CAC/IT/8168079
                        </p>

                        <div className="mt-3 text-xs text-gray-600 flex flex-wrap gap-4 justify-center md:justify-start items-center">
                             <Link href="/terms-and-policies" className="hover:text-gray-300 transition-colors">Terms & Policies</Link>
                             <span></span>

                             {/* --- HIDDEN ADMIN LINK (Desktop Only) --- */}
                             <div className="hidden md:flex items-center gap-4">
                                <span>•</span>
                                <Link 
                                    href="/admin/login" 
                                    className="flex items-center gap-1 opacity-20 hover:opacity-100 hover:text-brand-gold transition-all duration-500"
                                    title="Admin Access"
                                >
                                    <Lock className="w-3 h-3" />
                                    <span>Admin</span>
                                </Link>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
}
