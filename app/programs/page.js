"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProgramsPage() {

    // Program Data configuration for easy management
    const programs = [
        {
            id: 'education',
            title: 'Educational Support',
            description: 'Nurturing minds through Qur’anic values, scholarships, and academic excellence initiatives.',
            link: '/programs/educational-support',
            image: '/hero.jpg', // Placeholder for a real classroom/teaching image
            icon: '/educationalsupporticon_brown.svg'
        },
        {
            id: 'community',
            title: 'Community Development',
            description: 'Empowering society through welfare, hunger relief, and sustainable aid projects.',
            link: '/programs/community-development',
            image: '/hero.jpg', // Placeholder for community gathering/aid image
            icon: '/communitydevelopmenticon_brown.svg'
        },
        {
            id: 'training',
            title: 'Training & Innovation',
            description: 'Equipping the future generation with digital skills, workshops, and modern vocational training.',
            link: '/programs/training-and-innovation',
            image: '/hero.jpg', // Placeholder for computer/workshop image
            icon: '/trainingandinnovationicon_brown.svg'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    {/* Hero Image with Gradient Fade */}
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/programs-overview-hero.webp" 
                            alt="Programs Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        {/* Gradient Overlay - FIXED NESTING */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-black/30 to-transparent "></div>
                    </div>

                    {/* Text Content - Pulled up into the fade area */}
                    <div className="relative -mt-12 md:-mt-24 lg:-mt-32 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-3 md:mb-6 drop-shadow-sm">
                            Our Programs
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-4 md:mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-md md:max-w-2xl mx-auto leading-relaxed">
                            A holistic approach to serving humanity—building minds, supporting lives, and innovating for the future.
                        </p>
                    </div>
                </section>

                {/* 2. PROGRAM CARDS LIST (Mobile: Stack / Desktop: Grid) */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {programs.map((program) => (
                            <Link 
                                key={program.id} 
                                href={program.link}
                                className="block group relative bg-brand-sand rounded-3xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full"
                            >
                                {/* Card Image Area */}
                                <div className="relative w-full h-48 md:h-56">
                                    <Image
                                        src={program.image}
                                        alt={program.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                    {/* Floating Icon Badge */}
                                    <div className="absolute -bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-white rounded-full p-3 md:p-4 shadow-md border-2 border-brand-brown-dark z-10 group-hover:scale-110 transition-transform duration-300">
                                        <div className="relative w-full h-full">
                                            <Image 
                                                src={program.icon} 
                                                alt="Icon" 
                                                fill 
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Content Area */}
                                <div className="pt-10 pb-6 px-6 md:pt-12 md:px-8 flex-grow flex flex-col">
                                    <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-3 group-hover:text-brand-gold transition-colors">
                                        {program.title}
                                    </h2>
                                    <p className="font-lato text-sm md:text-base text-brand-brown leading-relaxed mb-6 line-clamp-3 md:line-clamp-4 flex-grow">
                                        {program.description}
                                    </p>

                                    <div className="flex items-center text-brand-gold font-bold text-xs md:text-sm uppercase tracking-widest mt-auto">
                                        <span>Explore Program</span>
                                        <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 3. CTA SECTION */}
                <section className="mt-16 md:mt-24 px-6 md:px-0">
                    <div className="mx-auto max-w-4xl bg-brand-brown-dark rounded-2xl md:rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                        {/* Background Pattern Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-white opacity-5 rounded-full blur-3xl -ml-10 -mb-10"></div>

                        <h3 className="font-agency text-2xl md:text-4xl mb-4 relative z-10">Support Our Mission</h3>
                        <p className="font-lato text-sm md:text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed relative z-10">
                            Your contribution fuels these initiatives and brings hope to communities. Join us in building a legacy of knowledge and care.
                        </p>
                        <Link
                            href="/get-involved/donate"
                            className="inline-block py-3 px-8 md:px-12 md:py-4 font-agency text-lg md:text-xl text-brand-brown-dark bg-white rounded-full shadow-lg hover:bg-brand-gold hover:text-white transition-colors relative z-10 transform hover:scale-105 duration-200"
                        >
                            Donate Now
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
