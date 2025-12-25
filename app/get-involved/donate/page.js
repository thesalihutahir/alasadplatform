"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Copy, Check, CreditCard, GraduationCap, Utensils, Mic, Lock } from 'lucide-react';

export default function DonatePage() {
    
    // State to handle "Copy to Clipboard" feedback
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    };

    const accounts = [
        {
            id: 1,
            type: "General Donation & Sadaqah",
            bank: "Jaiz Bank",
            number: "0000 000 000",
            name: "Al-Asad Education Foundation",
            color: "bg-brand-brown-dark",
            textColor: "text-white",
            iconColor: "text-brand-gold"
        },
        {
            id: 2,
            type: "Zakat Fund",
            bank: "Jaiz Bank",
            number: "1111 111 111",
            name: "Al-Asad Zakat",
            color: "bg-brand-gold",
            textColor: "text-white",
            iconColor: "text-white"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/get-involved-donate-hero.webp" 
                            alt="Donate Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Invest in an Eternal Legacy
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            "When a person dies, his deeds come to an end except for three: Sadaqah Jariyah, knowledge from which benefit is gained, or a righteous child who prays for him."
                        </p>
                    </div>
                </section>

                {/* 2. DIRECT BANK TRANSFER (Primary Method) */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-6xl mx-auto">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-3">
                            Direct Bank Transfer
                        </h2>
                        <p className="font-lato text-base md:text-lg text-brand-brown max-w-xl mx-auto">
                            Please use the account details below for secure transfers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {accounts.map((acc) => (
                            <div key={acc.id} className={`${acc.color} ${acc.textColor} p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden group transform transition-transform hover:-translate-y-1`}>
                                {/* Decorative Pattern */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-5 rounded-full blur-2xl -ml-10 -mb-10"></div>

                                <div className="relative z-10">
                                    <h3 className="font-agency text-xl md:text-2xl opacity-90 mb-8 border-b border-white/20 pb-4 inline-block">
                                        {acc.type}
                                    </h3>

                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <p className="font-lato text-xs opacity-70 uppercase tracking-widest mb-1">Bank Name</p>
                                            <p className="font-agency text-2xl md:text-3xl tracking-wide">{acc.bank}</p>
                                        </div>

                                        <div>
                                            <p className="font-lato text-xs opacity-70 uppercase tracking-widest mb-1">Account Number</p>
                                            <div className="flex items-center gap-4">
                                                <p className="font-mono text-3xl md:text-4xl font-bold tracking-widest">{acc.number}</p>
                                                
                                                {/* Copy Button */}
                                                <button 
                                                    onClick={() => handleCopy(acc.number, acc.id)}
                                                    className="opacity-70 hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 p-2 rounded-lg"
                                                    title="Copy Account Number"
                                                >
                                                    {copiedId === acc.id ? (
                                                        <Check className="w-6 h-6 text-green-300" />
                                                    ) : (
                                                        <Copy className="w-6 h-6" />
                                                    )}
                                                </button>
                                            </div>
                                            {copiedId === acc.id && (
                                                <span className="text-xs text-green-300 font-bold mt-1 block animate-pulse">Copied to clipboard!</span>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-lato text-xs opacity-70 uppercase tracking-widest mb-1">Account Name</p>
                                            <p className="font-lato text-sm md:text-lg font-bold">{acc.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. ONLINE PAYMENT (Placeholder) */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-2xl mx-auto">
                    <div className="bg-brand-sand/30 border-2 border-dashed border-brand-brown/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold shadow-sm">
                            <CreditCard className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <h3 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-3">
                            Pay with Card
                        </h3>
                        <p className="font-lato text-sm md:text-lg text-brand-brown mb-6 max-w-md mx-auto">
                            Secure online donation integration via Paystack/Flutterwave is currently in development.
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-500 font-bold text-xs rounded-full uppercase tracking-wider cursor-not-allowed">
                            <Lock className="w-3 h-3" /> Coming Soon
                        </div>
                    </div>
                </section>

                {/* 4. IMPACT BREAKDOWN */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <div className="bg-brand-brown-dark text-white rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <h2 className="font-agency text-3xl md:text-5xl mb-12 relative z-10">Where does your donation go?</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 relative z-10">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-brand-gold">
                                    <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <h3 className="font-agency text-xl md:text-2xl text-brand-gold mb-2">Scholarships</h3>
                                <p className="font-lato text-sm md:text-base text-white/70 max-w-xs mx-auto">Supporting indigent students with tuition, books, and necessary learning materials.</p>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-brand-gold">
                                    <Utensils className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <h3 className="font-agency text-xl md:text-2xl text-brand-gold mb-2">Welfare</h3>
                                <p className="font-lato text-sm md:text-base text-white/70 max-w-xs mx-auto">Feeding programs, Ramadan packages, and emergency relief for vulnerable families.</p>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 md:mb-6 text-brand-gold">
                                    <Mic className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                                <h3 className="font-agency text-xl md:text-2xl text-brand-gold mb-2">Dawah</h3>
                                <p className="font-lato text-sm md:text-base text-white/70 max-w-xs mx-auto">Producing educational content, organizing lectures, and community outreach.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
