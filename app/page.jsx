"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
    // Define missing constants for branding
    const BRAND_GOLD = '#d17600';
    const BRAND_DARK = '#432e16';

    // Define missing data array for events
    const upcomingEvents = [
        { day: 'Sat', date: '27', month: 'DEC', title: 'Weekly Tafsir by Shaykh Foundurn' },
        { day: 'Sun', date: '28', month: 'DEC', title: 'Community Outreach Soqurahns' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow">
                {/* 1. HERO SECTION */}
                <section className="w-full">
                    <div className="relative w-full aspect-[720/317]">
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
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/programsicon.svg" alt="Programs" fill className="object-contain" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Programs</span>
                        </Link>
                        <Link href="/multimedia" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/mediaicon.svg" alt="Media" fill className="object-contain" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Media</span>
                        </Link>
                        <Link href="/blogs" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/blogsicon.svg" alt="Blogs" fill className="object-contain" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Blogs</span>
                        </Link>
                        <Link href="/about" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/abouticon.svg" alt="About" fill className="object-contain" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">About</span>
                        </Link>
                    </div>
                </section>

                {/* 3. ACTION BUTTONS */}
                <section className="py-6 px-8 flex justify-center gap-4">
                    <Link
                        href="/donate"
                        className="py-3 px-8 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-xl transition-transform hover:scale-110"
                    >
                        Make a Donation
                    </Link>
                </section>

                {/* 4. LATEST UPDATES (Section Omitted for Brevity - Keep yours as is) */}

                {/* --- INTEGRATED FEATURED SECTIONS --- */}
                <section className="py-8 px-6 bg-white">
                    <div className="mb-12">
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 text-left">Featured Lecture</h2>
                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-black">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src="https://www.youtube.com/embed/BYdCnmAgvhs?rel=0&modestbranding=1"
                                title="Featured Lecture"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 text-left">Featured Audio</h2>
                        <div className="p-5 rounded-2xl bg-[#f8f5f0] border-l-4 flex flex-row items-center gap-4 shadow-sm" style={{ borderColor: BRAND_GOLD }}>
                            <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-white shadow-sm">
                                <svg className="w-6 h-6" style={{ color: BRAND_GOLD }} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-agency text-lg font-bold text-gray-800">Islamic Jurisprudence Intro</h3>
                                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3" style={{ backgroundColor: BRAND_GOLD }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 text-left">Upcoming Events</h2>
                        <div className="flex overflow-x-auto pb-4 gap-4">
                            {upcomingEvents.map((event, index) => (
                                <div key={index} className="flex-shrink-0 w-[260px] p-3 bg-[#fdfaf6] rounded-2xl border border-gray-100 flex items-center gap-3">
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl bg-[#ece1d4]">
                                        <span className="font-lato text-[9px] uppercase font-bold text-gray-500">{event.day}</span>
                                        <span className="font-agency text-2xl font-bold" style={{ color: BRAND_DARK }}>{event.date}</span>
                                        <span className="font-lato text-[9px] uppercase font-bold text-gray-500">{event.month}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="font-lato text-xs font-bold leading-tight mb-1" style={{ color: BRAND_DARK }}>{event.title}</h4>
                                        <button className="font-lato text-[10px] font-semibold tracking-wider text-left" style={{ color: BRAND_GOLD }}>REGISTER NOW</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. VISION AND MISSION STATEMENTS */}
                <section className="relative py-20 px-4 bg-brand-gold overflow-hidden">
                    <div className="absolute inset-0">
                        <Image 
                            src="/overlay.jpg" 
                            alt="Background" 
                            fill 
                            className="object-cover opacity-20 md:opacity-30" 
                        />
                    </div>
                    <div className="relative z-10 text-center text-white">
                        <div className="mb-5">
                            <h2 className="font-agency text-md mb-2">Vision Statement</h2>
                            <p className="font-lato">To be a leading force in transforming education...</p>
                        </div>
                        {/* Corrected Icons grid */}
                        <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
                             <div className="w-20 h-20 relative mx-auto"><Image src="/educationalsupporticon.svg" fill alt="Icon" /></div>
                             <div className="w-20 h-20 relative mx-auto"><Image src="/communitydevelopmenticon.svg" fill alt="Icon" /></div>
                             <div className="w-20 h-20 relative mx-auto"><Image src="/trainingandinnovationicon.svg" fill alt="Icon" /></div>
                        </div>
                        <div className="mt-5">
                            <h2 className="font-agency text-md mb-2">Mission Statement</h2>
                            <p className="font-lato">Expanding access to knowledge...</p>
                        </div>
                    </div>
                </section>

                {/* 6. QUOTE SECTION */}
                <section className="py-12 px-4 text-center">
                    <div className="relative w-4/5 mx-auto h-24 mb-8">
                        <Image src="/ilmquote.svg" alt="Quote" fill className="object-contain" />
                    </div>
                    <h2 className="font-agency text-md text-brand-gold max-w-xs mx-auto">
                        Join us in building a future shaped by knowledge and faith.
                    </h2>
                </section>
            </main>

            <Footer />
        </div>
    );
}
