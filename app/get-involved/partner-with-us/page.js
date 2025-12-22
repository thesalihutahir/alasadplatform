"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PartnerPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-10">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" // Placeholder: Handshake or Meeting
                            alt="Partner With Us"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-20 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-3 drop-shadow-sm">
                            Partner For Impact
                        </h1>
                        <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                        <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                            Collaborate with Al-Asad Foundation to amplify reach, empower communities, and build a lasting legacy.
                        </p>
                    </div>
                </section>

                {/* 2. VALUE PROPOSITION */}
                <section className="px-6 mb-16 max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-4">
                            Why Partner With Us?
                        </h2>
                        <p className="font-lato text-sm text-brand-brown max-w-2xl mx-auto">
                            We offer a trusted platform for organizations to fulfill their Corporate Social Responsibility (CSR) and community engagement goals through structured, transparent, and high-impact initiatives.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Benefit 1 */}
                        <div className="bg-brand-sand/30 p-6 rounded-xl border border-transparent hover:border-brand-gold/30 transition-colors">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-sm mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-2">Structure & Credibility</h3>
                            <p className="font-lato text-xs text-brand-brown leading-relaxed">
                                Leveraging our established community trust and administrative structure ensures your resources are deployed effectively and ethically.
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-brand-sand/30 p-6 rounded-xl border border-transparent hover:border-brand-gold/30 transition-colors">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-sm mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-2">Deep Community Reach</h3>
                            <p className="font-lato text-xs text-brand-brown leading-relaxed">
                                Gain access to grassroots networks where help is needed most, ensuring your support reaches the intended beneficiaries directly.
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-brand-sand/30 p-6 rounded-xl border border-transparent hover:border-brand-gold/30 transition-colors">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-sm mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-2">Measurable Impact</h3>
                            <p className="font-lato text-xs text-brand-brown leading-relaxed">
                                We provide clear reporting and documentation (media & data) on how every partnership milestone is achieved.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. PARTNERSHIP MODELS */}
                <section className="px-6 mb-16 bg-brand-brown-dark py-12 text-white">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-agency text-2xl mb-8 text-center">Ways to Collaborate</h2>
                        
                        <div className="space-y-4">
                            {/* Model 1 */}
                            <div className="flex gap-4 items-start bg-white/5 p-4 rounded-lg border border-white/10">
                                <span className="font-agency text-3xl text-brand-gold font-bold">01</span>
                                <div>
                                    <h3 className="font-agency text-xl mb-1">Project Sponsorship</h3>
                                    <p className="font-lato text-xs text-white/70">Adopt a specific initiative (e.g., "Build a Classroom" or "Ramadan Feeding") and fully brand it as your organization's contribution.</p>
                                </div>
                            </div>
                             {/* Model 2 */}
                             <div className="flex gap-4 items-start bg-white/5 p-4 rounded-lg border border-white/10">
                                <span className="font-agency text-3xl text-brand-gold font-bold">02</span>
                                <div>
                                    <h3 className="font-agency text-xl mb-1">CSR Implementation</h3>
                                    <p className="font-lato text-xs text-white/70">Let us be the implementation arm for your company's annual Corporate Social Responsibility projects.</p>
                                </div>
                            </div>
                             {/* Model 3 */}
                             <div className="flex gap-4 items-start bg-white/5 p-4 rounded-lg border border-white/10">
                                <span className="font-agency text-3xl text-brand-gold font-bold">03</span>
                                <div>
                                    <h3 className="font-agency text-xl mb-1">Knowledge Exchange</h3>
                                    <p className="font-lato text-xs text-white/70">Partner with our schools for curriculum development, teacher training workshops, or tech innovation hubs.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. PARTNERSHIP INQUIRY FORM */}
                <section className="px-6 max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-gold rounded-t-2xl"></div>
                        
                        <h2 className="font-agency text-3xl text-brand-brown-dark mb-2 text-center">
                            Become a Partner
                        </h2>
                        <p className="font-lato text-sm text-gray-500 mb-8 text-center">
                            Fill out the form below representing your organization.
                        </p>

                        <form className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Organization Name</label>
                                    <input type="text" className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none" placeholder="Company / NGO Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Contact Person</label>
                                    <input type="text" className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none" placeholder="Full Name" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Email Address</label>
                                    <input type="email" className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none" placeholder="official@email.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-brand-brown mb-1">Partnership Type</label>
                                    <select className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none">
                                        <option>Sponsorship</option>
                                        <option>CSR Project</option>
                                        <option>Academic Collaboration</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Proposal / Message</label>
                                <textarea rows="4" className="w-full bg-brand-sand/30 border border-gray-200 rounded-lg px-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none" placeholder="Briefly describe how you would like to partner with us..."></textarea>
                            </div>

                            <button type="button" className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-colors shadow-lg">
                                Submit Inquiry
                            </button>
                        </form>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
