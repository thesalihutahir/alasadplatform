"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ScrollText, Shield, CreditCard, Copyright, Mail, ChevronRight } from 'lucide-react';

export default function LegalPage() {

    const [activeSection, setActiveSection] = useState('introduction');

    // Smooth scroll handler
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    const sections = [
        { id: 'introduction', title: 'Introduction', icon: ScrollText },
        { id: 'privacy', title: 'Privacy Policy', icon: Shield },
        { id: 'donations', title: 'Donations & Refunds', icon: CreditCard },
        { id: 'intellectual-property', title: 'Intellectual Property', icon: Copyright },
        { id: 'contact', title: 'Contact Us', icon: Mail },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown">
            <Header />

            <main className="flex-grow pt-16 md:pt-24 pb-20 px-6">

                {/* Page Title */}
                <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
                    <div className="inline-flex items-center justify-center p-3 bg-brand-sand/50 rounded-full mb-4 text-brand-brown-dark">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h1 className="font-agency text-4xl md:text-6xl text-brand-brown-dark mb-4">Terms & Policies</h1>
                    <p className="font-lato text-gray-500 text-sm md:text-base bg-gray-50 inline-block px-4 py-1 rounded-full border border-gray-100">
                        Last Updated: December 2024
                    </p>
                </div>

                {/* Main Content Layout */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12 relative">

                    {/* LEFT: Sticky Sidebar Navigation (Desktop Only) */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-32 space-y-1 border-l-2 border-gray-100 pl-4">
                            <h3 className="font-agency text-xl text-gray-400 mb-6 uppercase tracking-widest pl-2">Contents</h3>
                            {sections.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`group flex items-center justify-between w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-bold ${
                                        activeSection === item.id 
                                        ? 'bg-brand-sand/50 text-brand-brown-dark translate-x-1' 
                                        : 'text-gray-500 hover:text-brand-brown-dark hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{item.title}</span>
                                    {activeSection === item.id && <ChevronRight className="w-4 h-4 text-brand-gold" />}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* RIGHT: Content Area */}
                    <div className="lg:col-span-3 space-y-16 max-w-3xl">

                        {/* Section 1 */}
                        <section id="introduction" className="scroll-mt-32">
                            <div className="flex items-center gap-3 mb-4">
                                <ScrollText className="w-6 h-6 text-brand-gold" />
                                <h2 className="font-agency text-3xl text-brand-brown-dark">
                                    1. Introduction
                                </h2>
                            </div>
                            <div className="prose prose-brown max-w-none text-sm md:text-base leading-relaxed text-justify md:text-left text-gray-600">
                                <p>
                                    Welcome to the Al-Asad Education Foundation platform. By accessing our website, you agree to comply with these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                                </p>
                                <p className="mt-4">
                                    These terms apply to all visitors, users, and others who access or use the Service. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Section 2 */}
                        <section id="privacy" className="scroll-mt-32">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-6 h-6 text-brand-gold" />
                                <h2 className="font-agency text-3xl text-brand-brown-dark">
                                    2. Privacy Policy
                                </h2>
                            </div>
                            <div className="prose prose-brown max-w-none text-sm md:text-base leading-relaxed text-justify md:text-left text-gray-600">
                                <p className="mb-4">
                                    Your privacy is critically important to us. It is Al-Asad Education Foundation's policy to respect your privacy regarding any information we may collect while operating our website.
                                </p>
                                <ul className="list-none space-y-3 pl-0">
                                    <li className="flex items-start gap-3 bg-brand-sand/10 p-3 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0"></div>
                                        <span>We only ask for personal information when we truly need it to provide a service (e.g., donation processing, volunteer registration, newsletter subscription).</span>
                                    </li>
                                    <li className="flex items-start gap-3 bg-brand-sand/10 p-3 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0"></div>
                                        <span>We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</span>
                                    </li>
                                    <li className="flex items-start gap-3 bg-brand-sand/10 p-3 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0"></div>
                                        <span>We do not share any personally identifying information publicly or with third-parties, except when required to by law.</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Section 3 */}
                        <section id="donations" className="scroll-mt-32">
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard className="w-6 h-6 text-brand-gold" />
                                <h2 className="font-agency text-3xl text-brand-brown-dark">
                                    3. Donation & Refund Policy
                                </h2>
                            </div>
                            <div className="prose prose-brown max-w-none text-sm md:text-base leading-relaxed text-justify md:text-left text-gray-600">
                                <p>
                                    All donations made to Al-Asad Education Foundation are utilized for the specific programs mentioned or for the general welfare of the community. We practice strict financial transparency and accountability in line with Islamic principles of Amanah (Trust).
                                </p>
                                <p className="mt-4">
                                    <strong className="text-brand-brown-dark">Refunds:</strong> Since donations are charitable contributions (Sadaqah/Zakat), they are generally non-refundable. However, if you have made an error in the amount or duplicate transaction, please contact us within 7 days. Refunds are processed at the discretion of the management after verification.
                                </p>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Section 4 */}
                        <section id="intellectual-property" className="scroll-mt-32">
                            <div className="flex items-center gap-3 mb-4">
                                <Copyright className="w-6 h-6 text-brand-gold" />
                                <h2 className="font-agency text-3xl text-brand-brown-dark">
                                    4. Intellectual Property
                                </h2>
                            </div>
                            <div className="prose prose-brown max-w-none text-sm md:text-base leading-relaxed text-justify md:text-left text-gray-600">
                                <p>
                                    The materials on Al-Asad Education Foundation's website (including lectures, articles, audio, video, and imagery) are protected by copyright.
                                </p>
                                <div className="mt-4 bg-gray-50 p-4 rounded-xl border-l-4 border-brand-brown-dark">
                                    <p className="font-bold text-brand-brown-dark mb-2">Usage Rights:</p>
                                    <p className="text-sm">
                                        Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Section 5 */}
                        <section id="contact" className="scroll-mt-32">
                            <div className="flex items-center gap-3 mb-4">
                                <Mail className="w-6 h-6 text-brand-gold" />
                                <h2 className="font-agency text-3xl text-brand-brown-dark">
                                    5. Contact Us
                                </h2>
                            </div>
                            <div className="bg-brand-brown-dark text-white p-6 md:p-8 rounded-2xl shadow-lg">
                                <p className="text-sm md:text-base mb-4 leading-relaxed">
                                    If you have any questions about our Terms and Policies, please do not hesitate to contact our legal and administrative team.
                                </p>
                                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                                    <a href="mailto:info@alasadfoundation.org" className="inline-flex items-center gap-2 font-bold text-brand-gold hover:text-white transition-colors">
                                        <Mail className="w-4 h-4" /> info@alasadfoundation.org
                                    </a>
                                    <span className="hidden md:inline text-white/30">|</span>
                                    <span className="text-white/80 text-sm">
                                        Mani Road, Katsina State, Nigeria.
                                    </span>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
