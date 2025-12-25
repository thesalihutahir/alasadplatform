"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Users, TrendingUp, Briefcase, Building2, Lightbulb, Handshake, Mail, User, Building } from 'lucide-react';

export default function PartnerPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/get-involved-partner-hero.webp" // Placeholder
                            alt="Partner With Us"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Partner For Impact
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Collaborate with Al-Asad Foundation to amplify reach, empower communities, and build a lasting legacy through strategic partnership.
                        </p>
                    </div>
                </section>

                {/* 2. VALUE PROPOSITION */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 max-w-7xl mx-auto">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-4">
                            Why Partner With Us?
                        </h2>
                        <p className="font-lato text-sm md:text-lg text-brand-brown max-w-3xl mx-auto leading-relaxed">
                            We offer a trusted platform for organizations to fulfill their Corporate Social Responsibility (CSR) and community engagement goals through structured, transparent, and high-impact initiatives.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                        {/* Benefit 1 */}
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Structure & Credibility</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">
                                Leveraging our established community trust and administrative structure ensures your resources are deployed effectively, ethically, and transparently.
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Deep Community Reach</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">
                                Gain access to grassroots networks where help is needed most, ensuring your support reaches the intended beneficiaries directly without middlemen.
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-transparent hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-md mb-6 group-hover:bg-brand-brown-dark group-hover:text-white transition-colors">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-3">Measurable Impact</h3>
                            <p className="font-lato text-sm text-gray-600 leading-relaxed">
                                We provide clear reporting and documentation (media & data) on how every partnership milestone is achieved, giving you clear visibility on ROI.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. PARTNERSHIP MODELS */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24 bg-brand-brown-dark py-16 md:py-20 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-12">
                             <h2 className="font-agency text-3xl md:text-5xl mb-4">Ways to Collaborate</h2>
                             <p className="text-white/70 max-w-xl mx-auto font-lato">We offer flexible partnership models tailored to your organization's goals.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {/* Model 1 */}
                            <div className="flex flex-col gap-4 bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="font-agency text-4xl text-brand-gold font-bold opacity-50">01</span>
                                    <Briefcase className="w-8 h-8 text-brand-gold" />
                                </div>
                                <div>
                                    <h3 className="font-agency text-2xl mb-2">Project Sponsorship</h3>
                                    <p className="font-lato text-sm md:text-base text-white/70 leading-relaxed">
                                        Adopt a specific initiative (e.g., "Build a Classroom" or "Ramadan Feeding") and fully brand it as your organization's contribution.
                                    </p>
                                </div>
                            </div>

                             {/* Model 2 */}
                             <div className="flex flex-col gap-4 bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="font-agency text-4xl text-brand-gold font-bold opacity-50">02</span>
                                    <Building2 className="w-8 h-8 text-brand-gold" />
                                </div>
                                <div>
                                    <h3 className="font-agency text-2xl mb-2">CSR Implementation</h3>
                                    <p className="font-lato text-sm md:text-base text-white/70 leading-relaxed">
                                        Let us be the implementation arm for your company's annual Corporate Social Responsibility projects, ensuring compliance and impact.
                                    </p>
                                </div>
                            </div>

                             {/* Model 3 */}
                             <div className="flex flex-col gap-4 bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="font-agency text-4xl text-brand-gold font-bold opacity-50">03</span>
                                    <Lightbulb className="w-8 h-8 text-brand-gold" />
                                </div>
                                <div>
                                    <h3 className="font-agency text-2xl mb-2">Knowledge Exchange</h3>
                                    <p className="font-lato text-sm md:text-base text-white/70 leading-relaxed">
                                        Partner with our schools for curriculum development, teacher training workshops, or establishing tech innovation hubs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. PARTNERSHIP INQUIRY FORM */}
                <section className="px-6 md:px-12 lg:px-24 mb-12 max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-14 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-brand-brown-dark to-brand-gold"></div>

                        <div className="text-center mb-10">
                            <Handshake className="w-12 h-12 text-brand-brown-dark mx-auto mb-4" />
                            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark mb-3">
                                Become a Partner
                            </h2>
                            <p className="font-lato text-sm md:text-lg text-gray-500 max-w-lg mx-auto">
                                Fill out the form below representing your organization. We will get back to you to schedule a meeting.
                            </p>
                        </div>

                        <form className="space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Organization Name</label>
                                    <div className="relative">
                                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all" placeholder="Company / NGO Name" />
                                        <Building className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Contact Person</label>
                                    <div className="relative">
                                        <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all" placeholder="Full Name" />
                                        <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Email Address</label>
                                    <div className="relative">
                                        <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all" placeholder="official@email.com" />
                                        <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Partnership Type</label>
                                    <div className="relative">
                                        <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all appearance-none cursor-pointer">
                                            <option>Sponsorship</option>
                                            <option>CSR Project</option>
                                            <option>Academic Collaboration</option>
                                            <option>Other</option>
                                        </select>
                                        <div className="absolute right-4 top-4 w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 pointer-events-none"></div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Proposal / Message</label>
                                <textarea rows="5" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-brand-brown-dark focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all resize-none" placeholder="Briefly describe how you would like to partner with us..."></textarea>
                            </div>

                            <button type="button" className="w-full py-4 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
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
