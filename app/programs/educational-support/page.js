"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BookOpen, Users, Award, CheckCircle } from 'lucide-react';

export default function EducationalSupportPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" // Placeholder
                            alt="Educational Support Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-white"></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Educational Support
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Building a generation grounded in faith, pursuing academic excellence, and equipped for the modern world.
                        </p>
                    </div>
                </section>

                {/* 2. PHILOSOPHY SECTION */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24">
                    <div className="max-w-5xl mx-auto bg-brand-sand/30 rounded-3xl p-8 md:p-12 border-l-8 border-brand-gold flex flex-col md:flex-row gap-8 items-center">
                        <div className="md:w-1/3">
                            <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-2">
                                Our Philosophy
                            </h2>
                            <div className="h-1 w-12 bg-brand-brown-dark rounded-full"></div>
                        </div>
                        <div className="md:w-2/3">
                            <p className="font-lato text-base md:text-lg text-brand-brown leading-relaxed text-justify md:text-left">
                                At Al-Asad Education Foundation, we believe that education is the foundation of dignity. Our approach integrates <strong>Tahfeez (Qur'an Memorization)</strong> with rigorous western education, ensuring our students become Hafiz doctors, engineers, and leaders who serve humanity with <em>Ihsan</em> (Excellence).
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. KEY INITIATIVES (Zig-Zag Layout on Desktop) */}
                <section className="px-6 md:px-12 lg:px-24 space-y-16 md:space-y-24 max-w-7xl mx-auto">
                    
                    <div className="text-center md:text-left border-b border-gray-100 pb-4 mb-8">
                        <h3 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">
                            Core Initiatives
                        </h3>
                    </div>

                    {/* Initiative 1: The Ma'ahad (Image Left, Text Right) */}
                    <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
                        <div className="w-full md:w-1/2 relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-xl group">
                            <Image 
                                src="/hero.jpg" 
                                alt="Ma'ahad Classes" 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="p-2 bg-brand-sand rounded-lg text-brand-brown-dark">
                                    <BookOpen className="w-5 h-5" />
                                </span>
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full">
                                    Active Program
                                </span>
                            </div>
                            <h4 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-4">
                                Ma'ahad (Integrated Institute)
                            </h4>
                            <p className="font-lato text-sm md:text-lg text-gray-600 leading-relaxed mb-6">
                                A structured learning environment providing full-time Tahfeez classes alongside English, Mathematics, and Science curriculum. We focus on character building alongside academic success.
                            </p>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-brand-gold" /> Full Qur'an Memorization
                                </li>
                                <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-brand-gold" /> Govt Approved Curriculum
                                </li>
                                <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-brand-gold" /> Digital Literacy
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Initiative 2: Adult Literacy (Image Right, Text Left) */}
                    <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-center">
                        <div className="w-full md:w-1/2 relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-xl group">
                            <Image 
                                src="/hero.jpg" 
                                alt="Adult Literacy" 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        <div className="w-full md:w-1/2 md:text-right">
                             <div className="flex items-center gap-3 mb-2 md:justify-end">
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full">
                                    Active Program
                                </span>
                                <span className="p-2 bg-brand-sand rounded-lg text-brand-brown-dark">
                                    <Users className="w-5 h-5" />
                                </span>
                            </div>
                            <h4 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-4">
                                Adult Literacy & Islamic Studies
                            </h4>
                            <p className="font-lato text-sm md:text-lg text-gray-600 leading-relaxed mb-6">
                                Education has no age limit. We offer evening and weekend classes designed for community members to improve their reading, writing, and understanding of Fiqh (Jurisprudence).
                            </p>
                             <ul className="space-y-2 mb-6 inline-block text-left">
                                <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-brand-gold" /> Basic Literacy
                                </li>
                                <li className="flex items-center gap-2 text-sm md:text-base text-gray-700">
                                    <CheckCircle className="w-4 h-4 text-brand-gold" /> Tajweed Classes
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Initiative 3: Scholarships (Full Width Card) */}
                    <div className="relative rounded-3xl overflow-hidden bg-brand-brown-dark text-white p-8 md:p-12 shadow-2xl">
                        <div className="absolute inset-0 opacity-20">
                             <Image src="/hero.jpg" alt="Background" fill className="object-cover grayscale" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                             <div className="flex-grow text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/50 px-4 py-1 rounded-full mb-4">
                                    <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                                    <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">In Development</span>
                                </div>
                                <h4 className="font-agency text-3xl md:text-5xl mb-4">
                                    Student Scholarship Fund
                                </h4>
                                <p className="font-lato text-sm md:text-lg text-white/80 max-w-2xl">
                                    A dedicated fund to support indigent students with tuition, books, and welfare to ensure no child is left behind due to poverty.
                                </p>
                             </div>
                             <div className="flex-shrink-0">
                                <Link 
                                    href="/contact" 
                                    className="px-8 py-3 bg-white text-brand-brown-dark font-agency text-lg rounded-full hover:bg-brand-gold hover:text-white transition-colors"
                                >
                                    Become a Partner
                                </Link>
                             </div>
                        </div>
                    </div>

                </section>

                {/* 4. IMPACT / STATS */}
                <section className="mt-20 md:mt-32 px-6 py-16 bg-brand-sand">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-brand-brown-dark/10">
                        <div className="pb-8 md:pb-0">
                            <h3 className="font-agency text-5xl md:text-6xl text-brand-gold mb-2">500+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-base uppercase tracking-widest font-bold">
                                Students Enrolled
                            </p>
                        </div>
                        <div className="py-8 md:py-0">
                            <h3 className="font-agency text-5xl md:text-6xl text-brand-gold mb-2">30+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-base uppercase tracking-widest font-bold">
                                Huffaz Graduated
                            </p>
                        </div>
                        <div className="pt-8 md:pt-0">
                            <h3 className="font-agency text-5xl md:text-6xl text-brand-gold mb-2">100%</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-base uppercase tracking-widest font-bold">
                                Commitment to Excellence
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. CTA */}
                <section className="px-6 mt-16 md:mt-24 mb-4">
                    <div className="max-w-4xl mx-auto bg-brand-brown-dark rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl -ml-10 -mt-10"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mb-10"></div>

                        <Award className="w-12 h-12 text-brand-gold mx-auto mb-6" />
                        
                        <h3 className="font-agency text-3xl md:text-5xl mb-4 relative z-10">Sponsor Knowledge</h3>
                        <p className="font-lato text-base md:text-xl text-white/80 mb-8 relative z-10 italic">
                            "He who follows a path in pursuit of knowledge, Allah will make the path to Paradise easy for him."
                        </p>
                        <Link
                            href="/get-involved/donate"
                            className="inline-block py-4 px-10 font-agency text-xl text-brand-brown-dark bg-white rounded-full shadow-lg hover:bg-brand-gold hover:text-white transition-all transform hover:scale-105 relative z-10"
                        >
                            Support Education
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
