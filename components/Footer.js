"use client";

import Link from "next/link";
import Image from "next/image";

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
        <footer className="w-full bg-brand-brown-dark text-white font-lato pt-12 pb-6">
            <div className="max-w-7xl mx-auto flex flex-col px-6"> 

                {/* --- 1. MAIN CONTENT (Desktop: Row / Mobile: Stack) --- */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start md:gap-12 mb-8">

                    {/* LEFT COLUMN: BRAND INFO (Hidden on Mobile, Visible on Tablet/Desktop) */}
                    <div className="hidden md:flex flex-col space-y-4 max-w-xs">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 opacity-90">
                                <Image src="/headerlogo.svg" alt="Logo" fill className="object-contain brightness-0 invert" />
                            </div>
                            <span className="font-agency text-2xl font-bold tracking-wide text-brand-gold">
                                AL-ASAD FOUNDATION
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Empowering communities through education, development, and innovation. Join us in making a lasting impact.
                        </p>
                    </div>

                    {/* RIGHT SIDE: NAVIGATION LINKS */}
                    {/* Mobile: Centered Grid. Desktop: Aligned Right */}
                    <div className="w-full md:w-auto grid grid-cols-2 gap-8 mx-auto md:mx-0 max-w-md md:max-w-none md:gap-20 text-left">
                        
                        {/* Quick Links Column */}
                        <div> 
                            <h3 className="font-agency text-lg font-bold mb-4 text-brand-gold uppercase tracking-wider">Quick Menu</h3>
                            <ul className="space-y-2 text-sm"> 
                                {quickLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="hover:text-brand-gold transition-colors opacity-80 hover:opacity-100 block py-1">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Get Involved Column */}
                        <div> 
                            <h3 className="font-agency text-lg font-bold mb-4 text-brand-gold uppercase tracking-wider">Get Involved</h3>
                            <ul className="space-y-2 text-sm"> 
                                {actionLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="hover:text-brand-gold transition-colors opacity-80 hover:opacity-100 block py-1">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* --- 2. DIVIDER LINE --- */}
                <hr className="border-t border-white/10 my-6" />

                {/* --- 3. BOTTOM BAR (Desktop: Row / Mobile: Column) --- */}
                <div className="flex flex-col md:flex-row-reverse md:justify-between md:items-center w-full gap-6">
                    
                    {/* Social Icons (Desktop: Right Side) */}
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-4"> 
                        {socialLinks.map((social) => (
                            <Link key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform p-1">
                                <Image 
                                    src={social.icon} 
                                    alt={social.name} 
                                    width={24} 
                                    height={24} 
                                    className="w-5 h-5 md:w-6 md:h-6 object-contain opacity-80 hover:opacity-100"
                                />
                            </Link>
                        ))}
                    </div>

                    {/* Copyright & Legal (Desktop: Left Side) */}
                    <div className="text-center md:text-left">
                        <p className="text-[#9a9a9a] text-sm md:hidden">
                            Al-Asad Education Foundation
                        </p>
                        <p className="text-[#9a9a9a] text-xs mt-1">
                            © {new Date().getFullYear()} All rights reserved <span className="hidden md:inline">| Al-Asad Education Foundation</span> | CAC/IT/NO 8168079
                        </p>
                        
                        <div className="mt-2 text-sm text-[#9a9a9a]/60 space-x-2">
                             <Link href="/terms-and-policies" className="hover:text-brand-gold">Terms</Link>
                             <span>|</span>
                             <Link href="/faq" className="hover:text-brand-gold">FAQ</Link>
                             <span>|</span>
                             <Link href="/contact" className="hover:text-brand-gold">Contact</Link>
                        </div>
                    </div>
                </div>
                
            </div>
        </footer>
    );
}
