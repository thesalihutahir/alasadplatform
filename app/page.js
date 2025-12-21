"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
    // Temporary data to simulate dynamic content sources
    const updates = [1, 2, 3]; // Simulating 3 latest updates

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark">
            <Header />

            <main className="flex-grow">

                {/* 1. HERO SECTION */}
                <section className="w-full relative">
                    <div className="relative w-full aspect-[720/400]">
                        <Image
                            src="/sheikhhero.jpg"
                            alt="Al-Asad Foundation Hero"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Gradient overlay for text readability if image is busy */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent"></div>
                    </div>

                    <div className="relative -mt-12 text-left px-6 pb-4 z-10">
                        <h1 className="font-agency text-3xl text-brand-brown-dark leading-none drop-shadow-sm">
                            Welcome to Al-Asad Education Foundation Official Platform
                        </h1>
                    </div>
                </section>

                {/* 2. ICON NAVIGATION MENU */}
                <section className="py-6 px-6">
                    <div className="grid grid-cols-4 gap-4 justify-items-center">
                        <Link href="/programs" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/programsicon.svg" alt="Programs" fill className="object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark tracking-wide">Programs</span>
                        </Link>

                        <Link href="/media" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/mediaicon.svg" alt="Media" fill className="object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark tracking-wide">Media</span>
                        </Link>

                        <Link href="/blogs" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/blogsicon.svg" alt="Blogs" fill className="object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark tracking-wide">Blogs</span>
                        </Link>

                        <Link href="/about" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/abouticon.svg" alt="About" fill className="object-contain drop-shadow-sm" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark tracking-wide">About</span>
                        </Link>
                    </div>
                </section>

                {/* 3. ACTION BUTTONS */}
                <section className="py-2 px-8 flex justify-center pb-8">
                    <Link
                        href="/donate"
                        className="w-full max-w-xs py-3 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        Make a Donation
                    </Link>
                </section>

                {/* 4. LATEST UPDATES (Dynamic Source: likely 'Blogs' or 'News' collection) */}
                <section className="py-8 px-6 bg-brand-sand/30">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="font-agency text-2xl text-brand-brown-dark">Latest Updates</h2>
                        <Link href="/blogs" className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">View All</Link>
                    </div>

                    <div className="space-y-6">
                        {updates.map((item, index) => (
                            <div key={index} className="bg-[#F0E4D4] rounded-xl overflow-hidden card-shadow group">
                                <Link href="/news" className="block">
                                    <div className="relative w-full h-48 overflow-hidden">
                                        <Image
                                            src="/hero.jpg" // Placeholder
                                            alt="Latest Update"
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-0 left-0 bg-brand-gold text-white py-1 px-3 rounded-br-lg font-agency text-sm z-10">
                                            20 DEC
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-lato text-[10px] font-bold text-brand-gold uppercase tracking-wider">Education</span>
                                        </div>

                                        <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-tight">
                                            Students of Ma'ahad celebrate Qur'an memorization
                                        </h3>

                                        <p className="font-lato text-sm text-left text-brand-brown line-clamp-3 leading-relaxed">
                                            Ma'ahad Sheikh Shareef Ibrahim Saleh Al-Hussaini celebrated over 30 students who memorized the Holy Qur'an this year.
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. MEDIA PREVIEWS */}
                <section className="py-10 px-6 bg-white">

                    {/* VIDEO SECTION (Source: 'Videos' collection) */}
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="font-agency text-2xl text-brand-brown-dark">Latest Videos</h2>
                            <Link href="/media/videos" className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">See More</Link>
                        </div>

                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
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

                    {/* AUDIO SECTION (Source: 'Audios' collection) */}
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="font-agency text-2xl text-brand-brown-dark">Latest Audios</h2>
                            <Link href="/media/audios" className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline">Listen All</Link>
                        </div>

                        <div
                            className="p-5 rounded-2xl bg-[#f8f5f0] border-l-4 border-brand-gold flex flex-row items-center gap-4 shadow-sm"
                        >
                            <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-white shadow-sm text-brand-gold">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>

                            <div className="flex-grow">
                                <h3 className="font-agency text-lg font-bold text-brand-brown-dark">Islamic Jurisprudence Intro</h3>
                                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-brand-gold"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EVENTS SECTION */}
                    <div className="mb-8">
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-6">Upcoming Events</h2>

                        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                            {/* Placeholder Event Card */}
                            <div className="min-w-[260px] bg-[#F0E4D4] rounded-xl p-5 shadow-md border border-brand-gold/10">
                                <span className="text-xs font-bold text-brand-gold uppercase">Coming Soon</span>
                                <h3 className="font-agency text-xl text-brand-brown-dark mt-2 mb-1">Annual Conference</h3>
                                <p className="font-lato text-sm text-brand-brown">
                                    Details to be announced shortly.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* 6. VISION AND MISSION STATEMENTS */}
                <section className="relative py-16 px-6 bg-brand-gold overflow-hidden">
                    {/* Background Overlay Pattern */}
                    <div className="absolute inset-0 mix-blend-overlay">
                        <Image 
                            src="/overlay.jpg" 
                            alt="Background pattern overlay" 
                            fill 
                            className="object-cover opacity-20" 
                        />
                    </div>

                    <div className="relative z-10 text-center text-white">
                        {/* Vision */}
                        <div className="mb-8">
                            <h2 className="font-agency text-xl uppercase tracking-widest text-white/80 mb-3">
                                Vision Statement
                            </h2>
                            <p className="font-lato text-lg leading-relaxed max-w-md mx-auto">
                                To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
                            </p>
                        </div>

                        {/* Separator & Icons */}
                        <div className="mb-10 max-w-lg mx-auto">
                            <div className="flex justify-center items-center my-6 opacity-50">
                                <div className="w-24 h-0.5 bg-white"></div>
                                <div className="mx-4 text-2xl">✦</div>
                                <div className="w-24 h-0.5 bg-white"></div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 relative mb-2">
                                        <Image src="/educationalsupporticon.svg" alt="Educational Support" fill className="object-contain" />
                                    </div>
                                    <span className="font-agency text-xs tracking-wide">Education</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 relative mb-2">
                                        <Image src="/communitydevelopmenticon.svg" alt="Community Development" fill className="object-contain" />
                                    </div>
                                    <span className="font-agency text-xs tracking-wide">Community</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 relative mb-2">
                                        <Image src="/trainingandinnovationicon.svg" alt="Training & Innovation" fill className="object-contain" />
                                    </div>
                                    <span className="font-agency text-xs tracking-wide">Innovation</span>
                                </div>
                            </div>
                        </div>

<div className="flex justify-center items-center my-6 opacity-50">
                                <div className="w-24 h-0.5 bg-white"></div>
                                <div className="mx-4 text-2xl">✦</div>
                                <div className="w-24 h-0.5 bg-white"></div>
                            </div>

                        {/* Mission */}
                        <div>
                            <h2 className="font-agency text-xl uppercase tracking-widest text-white/80 mb-3">
                                Mission Statement
                            </h2>
                            <p className="font-lato text-lg leading-relaxed max-w-md mx-auto">
                                Expanding access to knowledge through Qur'an-centered and community driven education.
                            </p>
                        </div>
                    </div>
                </section>


                {/* 7. ARABIC QUOTE & FINAL CTA */}
                <section className="py-16 px-6 text-center bg-white">
                    <div className="relative w-full max-w-xs mx-auto h-24 mb-6">
                        <Image
                            src="/ilmquote.svg"
                            alt="Arabic Quote about Knowledge"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="font-agency text-xl text-brand-gold leading-tight max-w-xs mx-auto">
                        Join us in building a future shaped by knowledge and faith.
                    </h2>
                </section>

            </main>

            <Footer />
        </div>
    );
}