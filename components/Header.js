"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Menu, X } from 'lucide-react';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const navItems = [
        { name: 'Programs', href: '/programs' },
        { name: 'Multimedia', href: '/multimedia' },
        { name: 'News & Events', href: '/news' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo/Brand */}
                    <Link href="/" className="flex items-center gap-2">
                         {/* https://github.com/thesalihutahir/al-asad-platform/blob/main/public/headerlogo.png */}
                        <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-white font-bold text-xl">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold text-brand-brown-dark leading-none">Al Asad</span>
                            <span className="text-xs text-brand-brown tracking-widest uppercase">Foundation</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        {navItems.map((item) => (
                            <Link key={item.name} href={item.href} className="text-gray-600 hover:text-brand-gold font-medium transition-colors duration-200">
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex items-center gap-4 ml-4">
                             <Link href="/admin" className="text-sm font-medium text-gray-400 hover:text-brand-brown transition">
                                Staff Login
                            </Link>
                            <Link href="/donate" className="flex items-center px-6 py-2.5 text-sm font-bold rounded-full text-white bg-green-600 hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                <Heart className="w-4 h-4 mr-2 fill-white" /> Donate Now
                            </Link>
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 text-brand-brown-dark rounded-lg hover:bg-gray-100 transition" 
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation"
                    >
                        {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="md:hidden absolute w-full bg-white shadow-xl border-t border-gray-100 animate-in slide-in-from-top-5 duration-200">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-brand-gold/10 hover:text-brand-gold">
                                {item.name}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-100 my-2"></div>
                        <Link href="/donate" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-lg text-base font-bold text-white bg-green-600 hover:bg-green-700">
                             Donate Now
                        </Link>
                         <Link href="/admin" onClick={() => setIsOpen(false)} className="block text-center px-4 py-3 text-sm text-gray-500 hover:text-brand-brown">
                            Staff Login
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};