"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Laptop, Briefcase, Cpu, Code } from 'lucide-react';

export default function TrainingInnovationPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/programs-training-innovation-hero.webp" // Placeholder
                            alt="Training & Innovation Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Training & Innovation
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Bridging the gap between traditional knowledge and modern skills to create self-reliant, future-ready leaders.
                        </p>
                    </div>
                </section>

                {/* 2. INTRODUCTION */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24">
                    <div className="max-w-5xl mx-auto bg-brand-sand/30 rounded-3xl p-8 md:p-12 border-l-8 border-brand-gold flex flex-col md:flex-row gap-8 items-center">
                        <div className="md:w-1/3">
                            <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-2">
                                Empowering the Future
                            </h2>
                            <div className="h-1 w-12 bg-brand-brown-dark rounded-full"></div>
                        </div>
                        <div className="md:w-2/3">
                            <p className="font-lato text-base md:text-lg text-brand-brown leading-relaxed text-justify md:text-left">
                                In a rapidly changing world, religious education must be paired with practical capability. Our training programs are designed to equip students and community members with the digital, vocational, and entrepreneurial skills needed to thrive in the modern economy.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. KEY INITIATIVES (Horizontal Grid on Desktop) */}
                <section className="px-6 md:px-12 lg:px-24 space-y-12 max-w-7xl mx-auto">
                    <div className="text-center md:text-left border-b border-gray-100 pb-4 mb-8">
                        <h3 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">
                            Skill Development
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* Initiative 1: Digital Literacy */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col group h-full hover:shadow-2xl transition-all hover:-translate-y-2">
                            <div className="relative w-full h-56">
                                <Image 
                                    src="/hero.jpg" 
                                    alt="Digital Literacy" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full p-2 text-brand-brown-dark">
                                    <Laptop className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <h4 className="font-agency text-2xl text-brand-brown-dark mb-3">
                                    Digital Literacy Bootcamp
                                </h4>
                                <p className="font-lato text-sm text-gray-600 leading-relaxed mb-6 flex-grow">
                                    Fundamental computer training, internet safety, and introduction to modern productivity tools for students. We ensure every student is computer literate.
                                </p>
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-md w-fit">
                                    Active Program
                                </span>
                            </div>
                        </div>

                        {/* Initiative 2: Vocational Workshops */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col group h-full hover:shadow-2xl transition-all hover:-translate-y-2">
                            <div className="relative w-full h-56">
                                <Image 
                                    src="/hero.jpg" 
                                    alt="Vocational Skills" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full p-2 text-brand-brown-dark">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <h4 className="font-agency text-2xl text-brand-brown-dark mb-3">
                                    Entrepreneurship Workshops
                                </h4>
                                <p className="font-lato text-sm text-gray-600 leading-relaxed mb-6 flex-grow">
                                    Seminars on small business management, trade skills, and financial independence for youth and women. Building the next generation of business owners.
                                </p>
                                <span className="inline-block px-3 py-1 bg-brand-sand text-brand-brown-dark text-xs font-bold uppercase rounded-md w-fit">
                                    Periodic Events
                                </span>
                            </div>
                        </div>

                        {/* Initiative 3: Innovation Hub (Future) */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col group h-full opacity-90 hover:opacity-100 transition-all hover:-translate-y-2">
                            <div className="relative w-full h-56 grayscale-[50%] group-hover:grayscale-0 transition-all duration-500">
                                <Image 
                                    src="/hero.jpg" 
                                    alt="Tech Innovation Hub" 
                                    fill 
                                    className="object-cover"
                                />
                                 <div className="absolute inset-0 bg-brand-brown-dark/60 flex items-center justify-center backdrop-blur-[1px]">
                                    <span className="text-white font-agency text-xl tracking-widest border border-white px-4 py-2 rounded group-hover:bg-white group-hover:text-brand-brown-dark transition-colors">
                                        FUTURE GOAL
                                    </span>
                                </div>
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full p-2 text-brand-brown-dark">
                                    <Cpu className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow bg-gray-50">
                                <h4 className="font-agency text-2xl text-brand-brown-dark mb-3">
                                    Al-Asad Tech Hub
                                </h4>
                                <p className="font-lato text-sm text-gray-600 leading-relaxed mb-6 flex-grow">
                                    A planned dedicated space for advanced coding, robotics, and design thinking to nurture the next generation of Muslim innovators and problem solvers.
                                </p>
                                <div className="flex items-center gap-2 text-brand-gold">
                                    <Code className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">In Development</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 4. IMPACT / STATS */}
                <section className="mt-20 md:mt-32 px-6 py-16 bg-brand-sand">
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-2 gap-8 md:gap-16 text-center">
                        <div className="p-6">
                            <h3 className="font-agency text-5xl md:text-7xl text-brand-gold mb-2">150+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-lg uppercase tracking-widest font-bold">
                                Youths Trained
                            </p>
                        </div>
                        <div className="p-6 border-l border-brand-brown-dark/10">
                            <h3 className="font-agency text-5xl md:text-7xl text-brand-gold mb-2">10+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-lg uppercase tracking-widest font-bold">
                                Workshops Held
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. CTA */}
                <section className="px-6 mt-16 md:mt-24 mb-4">
                    <div className="max-w-4xl mx-auto bg-brand-brown-dark rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        
                        <Laptop className="w-12 h-12 text-brand-gold mx-auto mb-6" />

                        <h3 className="font-agency text-3xl md:text-5xl mb-4 relative z-10">Partner for Impact</h3>
                        <p className="font-lato text-base md:text-xl text-white/80 mb-8 relative z-10 italic max-w-2xl mx-auto">
                            Do you have skills to share or resources to support our vocational training programs?
                        </p>
                        <Link
                            href="/get-involved/partner-with-us"
                            className="inline-block py-4 px-10 font-agency text-xl text-brand-brown-dark bg-white rounded-full shadow-lg hover:bg-brand-gold hover:text-white transition-all transform hover:scale-105 relative z-10"
                        >
                            Become a Partner
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
