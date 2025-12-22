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
            icon: '/educationalsupporticon.svg'
        },
        {
            id: 'community',
            title: 'Community Development',
            description: 'Empowering society through welfare, hunger relief, and sustainable aid projects.',
            link: '/programs/community-development',
            image: '/hero.jpg', // Placeholder for community gathering/aid image
            icon: '/communitydevelopmenticon.svg'
        },
        {
            id: 'training',
            title: 'Training & Innovation',
            description: 'Equipping the future generation with digital skills, workshops, and modern vocational training.',
            link: '/programs/training-and-innovation',
            image: '/hero.jpg', // Placeholder for computer/workshop image
            icon: '/trainingandinnovationicon.svg'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pt-8 pb-16 px-6">
                
                {/* 1. PAGE HEADER */}
                <section className="mb-10 text-center">
                    <h1 className="font-agency text-4xl text-brand-brown-dark mb-3">
                        Our Programs
                    </h1>
                    <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full mb-4"></div>
                    <p className="font-lato text-brand-brown text-sm max-w-md mx-auto leading-relaxed">
                        A holistic approach to serving humanity—building minds, supporting lives, and innovating for the future.
                    </p>
                </section>

                {/* 2. PROGRAM CARDS LIST */}
                <section className="space-y-8">
                    {programs.map((program) => (
                        <Link 
                            key={program.id} 
                            href={program.link}
                            className="block group relative bg-brand-sand rounded-3xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1"
                        >
                            {/* Card Image Area */}
                            <div className="relative w-full h-48">
                                <Image
                                    src={program.image}
                                    alt={program.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                {/* Floating Icon Badge */}
                                <div className="absolute -bottom-6 right-6 w-14 h-14 bg-white rounded-full p-3 shadow-md border-2 border-brand-gold z-10">
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
                            <div className="pt-8 pb-6 px-6">
                                <h2 className="font-agency text-2xl text-brand-brown-dark mb-2 group-hover:text-brand-gold transition-colors">
                                    {program.title}
                                </h2>
                                <p className="font-lato text-sm text-brand-brown leading-relaxed mb-4 line-clamp-3">
                                    {program.description}
                                </p>
                                
                                <div className="flex items-center text-brand-gold font-bold text-xs uppercase tracking-widest">
                                    <span>Explore Program</span>
                                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </section>

                {/* 3. CTA SECTION */}
                <section className="mt-16 text-center bg-brand-brown-dark rounded-2xl p-8 text-white relative overflow-hidden">
                     {/* Background Pattern Element (Optional) */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <h3 className="font-agency text-2xl mb-3 relative z-10">Support Our Mission</h3>
                    <p className="font-lato text-sm text-white/80 mb-6 relative z-10">
                        Your contribution fuels these initiatives and brings hope to communities.
                    </p>
                    <Link
                        href="/get-involved/donate"
                        className="inline-block py-3 px-8 font-agency text-lg text-brand-brown-dark bg-brand-gold rounded-full shadow-lg hover:bg-white transition-colors relative z-10"
                    >
                        Donate Now
                    </Link>
                </section>

            </main>

            <Footer />
        </div>
    );
}
