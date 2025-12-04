"use client";

import Link from "next/link";
import Image from "next/image";

// Define brand colors for reuse
const BRAND_DARK = '#432e16'; // Footer background
const BRAND_GOLD = '#d17600'; // Brand gold

// NOTE: This code assumes you have defined 'font-lato' and 'font-agency'
// in your tailwind.config.js file to point to your actual fonts.

export default function Footer() {

    // Define navigation links
    const quickLinks = [
        { name: "Home", href: "/" },
        { name: "Programs", href: "/programs" },
        { name: "About Us", href: "/about" },
        { name: "Media", href: "/media" },
    ];

    const getInvolved = [
        { name: "Donate Now", href: "/donate" },
        { name: "Volunteer", href: "/volunteer" },
        { name: "Contact Us", href: "/contact" },
    ];

    return (
        <footer className={`w-full bg-[${BRAND_DARK}] text-white font-lato pt-12 pb-6`}>
            <div className="max-w-7xl mx-auto flex flex-col px-4">

                {/* --- 1. MINI-NAVIGATION GRID --- */}
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-center md:text-left">
                    
                    {/* Quick Links Column */}
                    <div className="col-span-2 md:col-span-1">
                        {/* Heading uses the Agency font */}
                        <h3 className="font-agency text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
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
                    <div className="col-span-2 md:col-span-1">
                        {/* Heading uses the Agency font */}
                        <h3 className="font-agency text-lg font-bold mb-4">Get Involved</h3>
                        <ul className="space-y-2 text-sm">
                            {getInvolved.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="hover:text-amber-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact/Address Column */}
                    <div className="col-span-2 md:col-span-2">
                         {/* Heading uses the Agency font */}
                        <h3 className="font-agency text-lg font-bold mb-4">Contact</h3>
                        {/* Body text uses the default font-lato inherited from the footer */}
                        <p className="text-sm">Email: alasadeducationfoundation@yahoo.com</p>
                        <p className="text-sm mt-1">Phone: +234 803 700 8593</p>
                        <p className="text-sm mt-3">
                            <span className="font-semibold">Head Office:</span> <br/>
                            14, Sultan Abubakar Road, Kaduna, Nigeria.
                        </p>
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
                        © All rights reserved | Al-Asad Education Foundation - CAC-IT-973975
                    </p>
                </div>
                
            </div>
        </footer>
    );
}
