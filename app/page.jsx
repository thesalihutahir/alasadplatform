"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Header placeholder - waiting for future redesign */}
            <Header />

            <main className="flex-grow">

                {/* 1. HERO SECTION */}
                <section className="w-full">
                    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9]">
                        <Image
                            src="/hero.svg"
                            alt="Al-Asad Foundation Hero"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="text-center py-6 px-4">
                        <h1 className="font-agency text-2xl text-brand-brown-dark leading-tight">
                            Guiding through Qur'an, Empowering Communities.
                        </h1>
                    </div>
                </section>

                {/* 2. ICON NAVIGATION MENU */}
                <section className="py-6 px-8">
                    <div className="grid grid-cols-4 gap-4 justify-items-center">
                        <Link href="/programs" className="flex flex-col items-center group">
                            <div className="w-12 h-12 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/programsicon.svg" alt="Programs" fill className="object-contain shadow-md" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Programs</span>
                        </Link>
                        <Link href="/multimedia" className="flex flex-col items-center group">
                            <div className="w-12 h-12 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/mediaicon.svg" alt="Media" fill className="object-contain shadow-md" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Media</span>
                        </Link>
                        <Link href="/news" className="flex flex-col items-center group">
                            <div className="w-12 h-12 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/blogsicon.svg" alt="Blogs" fill className="object-contain shadow-md" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Blogs</span>
                        </Link>
                        <Link href="/about" className="flex flex-col items-center group">
                            <div className="w-12 h-12 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/abouticon.svg" alt="About" fill className="object-contain shadow-md" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">About</span>
                        </Link>
                    </div>
                </section>

                {/* 3. ACTION BUTTONS */}
                <section className="py-6 px-8 flex justify-center gap-4">
                    <Link
                        href="/donate"
                        className="flex-1 py-1 text-center font-agency text-lg text-white bg-brand-brown-dark rounded-xl shadow-xl transition-transform hover:scale-110"
                    >
                        Donate
                    </Link>
                    <Link
                        href="/volunteer"
                        className="flex-1 py-1 text-center font-agency text-lg text-white bg-brand-gold rounded-xl shadow-xl transition-transform hover:scale-110"
                    >
                        Volunteer
                    </Link>
                </section>

                {/* 4. LATEST UPDATES */}
                <section className="py-8 px-6">
                    <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 text-left">Latest Updates</h2>
                    <div className="bg-white rounded-xl overflow-hidden card-shadow">
<Link href="/news" className="flex flex-col items-center group">
                        <div className="relative w-full h-48 transition-transform hover:scale-110">
                            {/* Placeholder Image - Replace src with dynamic data later */}
                            <Image
                                src="/hero.jpg"
                                alt="Latest Update"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-5 relative">
                            {/* Date Badge */}
                            <div className="absolute top-0 left-0 bg-brand-gold text-white py-1 px-3 rounded-br-lg font-agency text-sm">
                                20 DEC
                            </div>
                            <div className="flex items-center gap-2 mb-2 mt-2">
                                <span className="font-lato text-xs text-brand-gold uppercase tracking-wider">Education</span>
                            </div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-3 leading-snug">
                                Annual Qur'an Competition Winners Announced
                            </h3>
                            <p className="font-lato text-sm text-brand-brown line-clamp-3">
                                The foundation celebrated the achievements of over 100 students who participated in this year's regional memorization and recitation contest.
                            </p>
                        </div>
                      </Link>
                    </div>
                </section>

                {/* 5. VISION AND MISSION STATEMENTS */}
                <section className="relative py-16 px-6 bg-brand-gold overflow-hidden">
                    {/* Background Overlay Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <Image src="/visionandmissionbg.svg" alt="" fill className="object-cover" />
                    </div>

                    <div className="relative z-10 text-center text-white">
                        {/* Vision */}
                        <div className="mb-10">
                            <h2 className="font-agency text-2xl text-white mb-6 text-center">
                                Vision Statement
                            </h2>
                            <p className="font-lato text-lg leading-relaxed max-w-md mx-auto">
                                To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
                            </p>
                        </div>

                        {/* Separator & Icons */}
                            <div className="h-px bg-white flex-grow max-w-[60px]"></div>
                        <div className="flex items-center justify-center gap-4 mb-20 opacity-100">

                            <div className="flex gap-4">
                                <div className="w-10 h-10 relative">
                                    <Image src="/educationalsupporticon.svg" alt="Educational Support" fill className="object-contain" />
                                </div>
                                <div className="w-10 h-10 relative">
                                    <Image src="/communitydevelopmenticon.svg" alt="Community Development" fill className="object-contain" />
                                </div>
                                <div className="w-10 h-10 relative">
                                    <Image src="/trainingandinnovationicon.svg" alt="Training & Innovation" fill className="object-contain" />
                                </div>
                            </div>

                        </div>
                            <div className="h-px bg-white flex-grow max-w-[60px]"></div>

                        {/* Mission */}
                        <div>
                            <h2 className="font-agency text-2xl text-white mb-6 text-center">
                                Mission Statement
                            </h2>
                            <p className="font-lato text-lg leading-relaxed max-w-md mx-auto">
                                Expanding access to knowledge through Qur'an-centered and community driven education.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. ARABIC QUOTE & FINAL CTA */}
                <section className="py-12 px-4 text-center bg-brand-sand">
                    <div className="relative w-4/5 mx-auto h-24 mb-8">
                        <Image
                            src="/ilmquote.svg"
                            alt="Arabic Quote about Knowledge"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="font-agency text-2xl text-brand-brown-dark leading-snug max-w-xs mx-auto">
                        Join us in building a future shaped by knowledge and faith.
                    </h2>
                </section>

            </main>

            {/* Footer placeholder - waiting for future redesign */}
            <Footer />
        </div>
    );
}