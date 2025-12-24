"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

export default function Footer() {

    // Updated Navigation Links
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

    // Social Media Data
    const socialLinks = [
        { name: "Facebook", icon: "/fbicon.svg", href: "https://www.facebook.com/share/1D438MVXpQ/" },
        { name: "YouTube", icon: "/yticon.svg", href: "https://youtube.com/@alasadeducation" },
        { name: "Instagram", icon: "/igicon.svg", href: "https://www.instagram.com/alasad_education_foundation" },
        { name: "TikTok", icon: "/tticon.svg", href: "https://www.tiktok.com/@alasad_tv" },
        { name: "Telegram", icon: "/tgicon.svg", href: "https://t.me/alasadeducation" },
        { name: "X", icon: "/xicon.svg", href: "https://x.com/AsadEducation" },
        { name: "WhatsApp", icon: "/waicon.svg", href: "https://whatsapp.com/channel/0029VawdL4n6xCSHyUsMzc2V" },
    ];

    return (
        <footer className="w-full bg-brand-brown-dark text-white font-lato pt-16 pb-8 border-t-4 border-brand-gold">
            <div className="max-w-7xl mx-auto px-6"> 

                {/* --- 1. MAIN CONTENT (Grid Layout) --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">

                    {/* COLUMN 1: BRAND INFO (Spans 5 cols on Desktop) */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12">
                                <Image src="/headerlogo.svg" alt="Logo" fill className="object-contain brightness-0 invert" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-agency text-3xl font-bold tracking-wide text-brand-gold leading-none">
                                    AL-ASAD
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                                    Education Foundation
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                            Empowering communities through Qur'an-centered education, sustainable development, and social innovation. Bridging the gap between traditional values and modern excellence.
                        </p>
                    </div>

                    {/* SPACER COLUMN (Desktop Only) */}
                    <div className="hidden md:block md:col-span-1"></div>

                    {/* COLUMN 2: QUICK LINKS (Spans 3 cols) */}
                    <div className="md:col-span-3">
                        <h3 className="font-agency text-lg font-bold mb-6 text-brand-gold uppercase tracking-wider flex items-center gap-2">
                            Quick Menu
                            <span className="h-px flex-grow bg-white/10 ml-2"></span>
                        </h3>
                        <ul className="space-y-3 text-sm"> 
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-brand-gold hover:pl-2 transition-all duration-300 text-gray-300 block w-fit">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* COLUMN 3: GET INVOLVED (Spans 3 cols) */}
                    <div className="md:col-span-3">
                        <h3 className="font-agency text-lg font-bold mb-6 text-brand-gold uppercase tracking-wider flex items-center gap-2">
                            Get Involved
                            <span className="h-px flex-grow bg-white/10 ml-2"></span>
                        </h3>
                        <ul className="space-y-3 text-sm"> 
                            {actionLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-brand-gold hover:pl-2 transition-all duration-300 text-gray-300 block w-fit">
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
                    
                    {/* Social Icons (Right) */}
                    <div className="flex flex-wrap items-center gap-4"> 
                        {socialLinks.map((social) => (
                            <Link key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="group p-2 bg-white/5 rounded-full hover:bg-brand-gold transition-all duration-300">
                                <Image 
                                    src={social.icon} 
                                    alt={social.name} 
                                    width={20} 
                                    height={20} 
                                    className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert transition-all"
                                />
                            </Link>
                        ))}
                    </div>

                    {/* Copyright & Legal (Left) */}
                    <div className="text-center md:text-left">
                        <p className="text-gray-500 text-xs mt-1">
                            © {new Date().getFullYear()} Al-Asad Education Foundation | CAC/IT/8168079
                        </p>
                        
                        <div className="mt-3 text-xs text-gray-600 flex flex-wrap gap-4 justify-center md:justify-start items-center">
                             <Link href="/terms-and-policies" className="hover:text-gray-300 transition-colors">Terms & Policies</Link>
                             <span>•</span>
                             <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact Support</Link>
                             
                             {/* --- HIDDEN ADMIN LINK --- */}
                             <span className="hidden md:inline">•</span>
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
        </footer>
    );
}
