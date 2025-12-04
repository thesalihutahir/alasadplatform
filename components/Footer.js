"use client";

import Link from "next/link";
import Image from "next/image";

// Define brand colors for reuse
const BRAND_DARK = '#432e16'; // Footer background
const BRAND_GOLD = '#d17600'; // Brand gold

export default function Footer() {

    // Define the updated navigation links
    const quickLinks = [
        { name: "Home", href: "/" },
        { name: "Media", href: "/media" },
        { name: "About Us", href: "/about" },
    ];

    const getInvolved = [
        { name: "Donate", href: "/donate" },
        { name: "Volunteer", href: "/volunteer" },
        { name: "Meet our team", href: "/team" }, 
    ];

    return (
        <footer className={`w-full bg-[${BRAND_DARK}] text-white font-lato pt-12 pb-6`}>
            <div className="max-w-7xl mx-auto flex flex-col px-4">

                {/* --- 1. MINI-NAVIGATION HORIZONTAL GRID (Quick Links & Get Involved) --- */}
                {/* Changes: Added centering (mx-auto), set max-width for margin control, reduced gap */}
                <div className="w-full grid grid-cols-2 gap-4 mb-10 mx-auto max-w-xs sm:max-w-md">
                    
                    {/* Quick Links Column */}
                    <div className="text-left"> 
                        {/* Heading uses the Agency font */}
                        <h3 className="font-agency text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm"> {/* Changed space-y and text size */}
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-amber-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Get Involved Column */}
                    <div className="text-left"> 
                        {/* Heading uses the Agency font */}
                        <h3 className="font-agency text-xl font-bold mb-4">Get Involved</h3>
                        <ul className="space-y-2 text-sm"> {/* Changed space-y and text size */}
                            {getInvolved.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-amber-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                {/* --- 2. DIVIDER LINE --- */}
                <hr className="border-t border-white/20 my-6" />


                {/* --- 3. SOCIAL ICONS AND COPYRIGHT --- */}
                <div className="flex flex-col items-center justify-center w-full">
                    
                    {/* Social Icons */}
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full my-4"> 
                        <Link href="https://www.facebook.com/share/1D438MVXpQ/">
                            <Image src="/fbicon.svg" alt="Facebook" width={32} height={32} className="w-6 h-6"/>
                        </Link>
                        <Link href="https://youtube.com/@alasadeducation">
                            <Image src="/yticon.svg" alt="YouTube" width={32} height={32} className="w-6 h-6"/>
                        </Link>
                        <Link href="https://www.instagram.com/alasad_education_foundation">
                            <Image src="/igicon.svg" alt="Instagram" width={32} height={32} className="w-6 h-6"/>
                        </Link>
                        <Link href="https://www.tiktok.com/@alasad_tv">
                            <Image src="/tticon.svg" alt="TikTok" width={32} height={32} className="w-6 h-6"/>
                        </Link>
                        <Link href="https://t.me/alasadeducation">
                            <Image src="/tgicon.svg" alt="Telegram" width={32} height={32} className="w-6 h-6"/>
                        </Link>
                        <Link href="https://x.com/AsadEducation">
                            <Image src="/xicon.svg" alt="X" width={32} height={32} className="w-6 h-6"/>
                        </Link>
                        <Link href="https://whatsapp.com/channel/0029VawdL4n6xCSHyUsMzc2V">
                            <Image src="/waicon.svg" alt="WhatsApp" width={32} height={32} className="w-6 h-6"/>
                        </Link>
                    </div>

                    {/* Copyright */}
                    <p className="mt-2 text-[#9a9a9a] text-sm text-center">
                        Al-Asad Education Foundation
<br />
© All rights reserved | CAC-IT-973975
                    </p>
                </div>
                
            </div>
        </footer>
    );
}
