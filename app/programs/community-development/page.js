"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, Users, Droplets, Gift } from 'lucide-react';

export default function CommunityDevelopmentPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/programs-community-development-hero.webp" // Placeholder
                            alt="Community Development Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Community Development
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Extending the mercy of Islam through tangible support, welfare, and humanitarian services to uplift the most vulnerable.
                        </p>
                    </div>
                </section>

                {/* 2. INTRODUCTION */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24">
                    <div className="max-w-5xl mx-auto bg-brand-sand/30 rounded-3xl p-8 md:p-12 border-l-8 border-brand-gold flex flex-col md:flex-row gap-8 items-center">
                        <div className="md:w-1/3">
                            <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-2">
                                Our Approach
                            </h2>
                            <div className="h-1 w-12 bg-brand-brown-dark rounded-full"></div>
                        </div>
                        <div className="md:w-2/3">
                            <p className="font-lato text-base md:text-lg text-brand-brown leading-relaxed text-justify md:text-left">
                                We believe that spiritual growth and physical well-being go hand in hand. Our community development programs aim to alleviate hunger, support the vulnerable, and strengthen the social fabric of our society through consistent acts of <em>Sadaqah</em> (Charity) and service.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. KEY INITIATIVES (Grid Layout on Desktop) */}
                <section className="px-6 md:px-12 lg:px-24 space-y-12 max-w-7xl mx-auto">
                    <div className="text-center md:text-left border-b border-gray-100 pb-4 mb-8">
                        <h3 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">
                            Active Projects
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* Initiative 1: Food Bank (Featured - Spans 2 cols on Large screens) */}
                        <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col md:flex-row group h-full">
                            <div className="relative w-full md:w-1/2 h-64 md:h-auto">
                                <Image 
                                    src="/hero.jpg" 
                                    alt="Ramadan Iftar & Food Bank" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full p-2 text-brand-brown-dark">
                                    <Gift className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="p-8 md:p-10 flex flex-col justify-center w-full md:w-1/2">
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full w-fit mb-4">
                                    Seasonal & Ongoing
                                </span>
                                <h4 className="font-agency text-3xl text-brand-brown-dark mb-4">
                                    Food Relief & Ramadan Iftar
                                </h4>
                                <p className="font-lato text-sm md:text-base text-gray-600 leading-relaxed mb-6">
                                    Our flagship program providing annual Ramadan feeding packages (Iftar/Sahur) and emergency food distribution for families facing critical food insecurity within our locality.
                                </p>
                                <div className="mt-auto">
                                    <Link href="/get-involved/donate" className="text-sm font-bold text-brand-gold uppercase tracking-widest hover:underline">
                                        Support a Family →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Initiative 2: Orphan Support */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group h-full">
                            <div className="relative w-full h-56">
                                <Image 
                                    src="/hero.jpg" 
                                    alt="Orphan Support" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full p-2 text-brand-brown-dark">
                                    <Heart className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="p-8 flex-col flex flex-grow">
                                <h4 className="font-agency text-2xl text-brand-brown-dark mb-3">
                                    Orphan & Widow Support
                                </h4>
                                <p className="font-lato text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                                    Providing financial aid, clothing, and emotional support to widows and orphans to ensure they live with dignity and care.
                                </p>
                                <span className="inline-block px-3 py-1 bg-brand-brown-dark/5 text-brand-brown-dark text-xs font-bold uppercase rounded-md w-fit">
                                    Active Program
                                </span>
                            </div>
                        </div>

                        {/* Initiative 3: Water Projects (Planned) */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group h-full opacity-90">
                            <div className="relative w-full h-56 grayscale-[30%]">
                                <Image 
                                    src="/hero.jpg" 
                                    alt="Clean Water Project" 
                                    fill 
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-brand-brown-dark/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="text-white font-agency text-xl tracking-widest border border-white px-6 py-2 rounded-full">
                                        PLANNED
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex-col flex flex-grow bg-gray-50">
                                <h4 className="font-agency text-2xl text-brand-brown-dark mb-3">
                                    Clean Water Initiatives
                                </h4>
                                <p className="font-lato text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                                    Future plans to construct boreholes and water stations in remote areas lacking access to clean drinking water.
                                </p>
                                <div className="flex items-center gap-2 text-brand-gold">
                                    <Droplets className="w-4 h-4" />
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
                            <h3 className="font-agency text-5xl md:text-7xl text-brand-gold mb-2">1000+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-lg uppercase tracking-widest font-bold">
                                Meals Served
                            </p>
                        </div>
                        <div className="p-6 border-l border-brand-brown-dark/10">
                            <h3 className="font-agency text-5xl md:text-7xl text-brand-gold mb-2">50+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-lg uppercase tracking-widest font-bold">
                                Families Supported
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. CTA */}
                <section className="px-6 mt-16 md:mt-24 mb-4">
                    <div className="max-w-4xl mx-auto bg-brand-brown-dark rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                         {/* Decorative Background */}
                         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        
                        <Users className="w-12 h-12 text-brand-gold mx-auto mb-6" />

                        <h3 className="font-agency text-3xl md:text-5xl mb-4 relative z-10">Be the Helping Hand</h3>
                        <p className="font-lato text-base md:text-xl text-white/80 mb-8 relative z-10 italic max-w-2xl mx-auto">
                            "The best of people are those that bring most benefit to the rest of mankind."
                        </p>
                        <Link
                            href="/get-involved/donate"
                            className="inline-block py-4 px-10 font-agency text-xl text-brand-brown-dark bg-white rounded-full shadow-lg hover:bg-brand-gold hover:text-white transition-all transform hover:scale-105 relative z-10"
                        >
                            Donate to Welfare
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
