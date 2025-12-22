"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function EducationalSupportPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION (Consistent with Parent Page) */}
                <section className="w-full relative bg-white mb-8">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[4/1]">
                        <Image
                            src="/hero.jpg" // Placeholder: Needs an image of students/classroom
                            alt="Educational Support Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-20 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl text-brand-brown-dark mb-3 drop-shadow-sm">
                            Educational Support
                        </h1>
                        <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                        <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                            Building a generation grounded in faith and equipped for the modern world.
                        </p>
                    </div>
                </section>

                {/* 2. INTRODUCTION & CONTEXT */}
                <section className="px-6 mb-12">
                    <div className="bg-brand-sand/30 rounded-2xl p-6 border-l-4 border-brand-gold">
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-3">
                            Our Philosophy
                        </h2>
                        <p className="font-lato text-sm text-brand-brown leading-relaxed text-justify">
                            At Al-Asad Education Foundation, we believe that education is the foundation of dignity. Our approach integrates <strong>Tahfeez (Qur'an Memorization)</strong> with rigorous western education, ensuring our students become Hafiz doctors, engineers, and leaders who serve humanity with Ihsan.
                        </p>
                    </div>
                </section>

                {/* 3. KEY INITIATIVES (Vertical Cards) */}
                <section className="px-6 space-y-8">
                    <h3 className="font-agency text-2xl text-brand-brown-dark border-b border-gray-100 pb-2 mb-6">
                        Core Initiatives
                    </h3>

                    {/* Initiative 1: The Ma'ahad */}
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-md">
                            <Image 
                                src="/hero.jpg" // Placeholder: Image of Qur'an circles
                                alt="Ma'ahad Classes" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-1">
                                Ma'ahad (Integrated Institute)
                            </h4>
                            <p className="font-lato text-sm text-brand-brown leading-relaxed mb-3">
                                A structured learning environment providing full-time Tahfeez classes alongside English, Mathematics, and Science curriculum.
                            </p>
                            <span className="inline-block px-3 py-1 bg-brand-brown-dark/5 text-brand-brown-dark text-xs font-bold uppercase rounded-md">
                                Active Program
                            </span>
                        </div>
                    </div>

                    {/* Initiative 2: Adult Literacy */}
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-md">
                            <Image 
                                src="/hero.jpg" // Placeholder: Adult education setting
                                alt="Adult Literacy" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-1">
                                Adult Literacy & Islamic Studies
                            </h4>
                            <p className="font-lato text-sm text-brand-brown leading-relaxed mb-3">
                                Evening and weekend classes designed for community members to improve their reading, writing, and understanding of Fiqh.
                            </p>
                            <span className="inline-block px-3 py-1 bg-brand-brown-dark/5 text-brand-brown-dark text-xs font-bold uppercase rounded-md">
                                Active Program
                            </span>
                        </div>
                    </div>

                    {/* Initiative 3: Scholarships (Future) */}
                    <div className="flex flex-col gap-4 opacity-90">
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-md grayscale-[50%]">
                            <Image 
                                src="/hero.jpg" // Placeholder
                                alt="Scholarship Fund" 
                                fill 
                                className="object-cover"
                            />
                            {/* Coming Soon Overlay */}
                            <div className="absolute inset-0 bg-brand-brown-dark/60 flex items-center justify-center">
                                <span className="text-white font-agency text-xl tracking-widest border border-white px-4 py-2 rounded">
                                    COMING SOON
                                </span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-agency text-xl text-brand-brown-dark mb-1">
                                Student Scholarship Fund
                            </h4>
                            <p className="font-lato text-sm text-brand-brown leading-relaxed mb-3">
                                A dedicated fund to support indigent students with tuition, books, and welfare to ensure no child is left behind due to poverty.
                            </p>
                            <span className="inline-block px-3 py-1 bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase rounded-md">
                                In Development
                            </span>
                        </div>
                    </div>
                </section>

                {/* 4. IMPACT / STATS */}
                <section className="mt-12 px-6 py-10 bg-brand-sand">
                    <div className="text-center mb-8">
                        <h3 className="font-agency text-3xl text-brand-gold mb-1">500+</h3>
                        <p className="font-lato text-brand-brown-dark text-sm uppercase tracking-widest font-bold">
                            Students Enrolled
                        </p>
                    </div>
                    <div className="text-center">
                        <h3 className="font-agency text-3xl text-brand-gold mb-1">30+</h3>
                        <p className="font-lato text-brand-brown-dark text-sm uppercase tracking-widest font-bold">
                            Huffaz Graduated
                        </p>
                    </div>
                </section>

                {/* 5. CTA */}
                <section className="px-6 mt-12 mb-4">
                    <div className="bg-brand-brown-dark rounded-2xl p-8 text-center text-white relative overflow-hidden">
                        <h3 className="font-agency text-2xl mb-3 relative z-10">Sponsor Knowledge</h3>
                        <p className="font-lato text-sm text-white/80 mb-6 relative z-10">
                            "He who follows a path in pursuit of knowledge, Allah will make the path to Paradise easy for him."
                        </p>
                        <Link
                            href="/get-involved/donate"
                            className="inline-block py-3 px-8 font-agency text-lg text-brand-brown-dark bg-white rounded-full shadow-lg hover:bg-brand-gold transition-colors relative z-10"
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
