"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {

    // Updated Navigation Links to match new Sitemap
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

    // Social Media Data (Centralized for easy updates)
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

                {/* --- 1. NAVIGATION GRID --- */}
                <div className="w-full grid grid-cols-2 gap-8 mb-8 mx-auto max-w-md md:max-w-2xl text-left">
                    
                    {/* Quick Links Column */}
                    <div> 
                        <h3 className="font-agency text-lg font-bold mb-3 text-brand-gold">Quick Menu</h3>
                        <ul className="space-y-2 text-sm"> 
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-brand-gold transition-colors opacity-90 hover:opacity-100">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Get Involved Column */}
                    <div> 
                        <h3 className="font-agency text-lg font-bold mb-3 text-brand-gold">Get Involved</h3>
                        <ul className="space-y-2 text-sm"> 
                            {actionLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-brand-gold transition-colors opacity-90 hover:opacity-100">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                {/* --- 2. DIVIDER LINE --- */}
                <hr className="border-t border-white/10 my-6" />

                {/* --- 3. SOCIAL ICONS AND COPYRIGHT --- */}
                <div className="flex flex-col items-center justify-center w-full">
                    
                    {/* Social Icons Row */}
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full my-4"> 
                        {socialLinks.map((social) => (
                            <Link key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <Image 
                                    src={social.icon} 
                                    alt={social.name} 
                                    width={24} 
                                    height={24} 
                                    className="w-6 h-6 object-contain"
                                />
                            </Link>
                        ))}
                    </div>

                    {/* Copyright & Legal */}
                    <div className="mt-4 text-center">
                        <p className="text-[#9a9a9a] text-sm">
                            Al-Asad Education Foundation
                        </p>
                        <p className="text-[#9a9a9a] text-xs mt-1">
                            © {new Date().getFullYear()} All rights reserved | CAC-IT-973975
                        </p>
                        
                        <div className="mt-2 text-sm text-[#9a9a9a]/60 space-x-2">
                             <Link href="/terms-and-policies" className="hover:text-brand-gold">Terms & Policies</Link>
                             <span>|</span>
                             <Link href="/faq" className="hover:text-brand-gold">FAQ</Link>
                        </div>
                    </div>
                </div>
                
            </div>
        </footer>
    );
}
