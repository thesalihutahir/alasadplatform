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
                                <Image src="/programsicon.svg" alt="Programs" fill className="object-contain overflow-hidden drop-shadow-md" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Programs</span>
                        </Link>
                        <Link href="/multimedia" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/mediaicon.svg" alt="Media" fill className="object-contain overflow-hidden drop-shadow-md" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Media</span>
                        </Link>
                        <Link href="/blogs" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/blogsicon.svg" alt="Blogs" fill className="object-contain overflow-hidden drop-shadow-md" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">Blogs</span>
                        </Link>
                        <Link href="/about" className="flex flex-col items-center group">
                            <div className="w-14 h-14 relative mb-2 transition-transform group-hover:scale-110">
                                <Image src="/abouticon.svg" alt="About" fill className="object-contain overflow-hidden drop-shadow-md" />
                            </div>
                            <span className="font-agency text-sm text-brand-brown-dark">About</span>
                        </Link>
                    </div>
                </section>

                {/* 3. ACTION BUTTONS */}
                <section className="py-6 px-8 flex justify-center gap-4">
                    <Link
                        href="/donate"
                        // **Adjustments for Padding, Roundness, and Size**
                        className="py-3 px-8 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-xl transition-transform hover:scale-110"
                    >
                        Make a Donation
                    </Link>
                    
                </section>


                {/* 4. LATEST UPDATES */}
                <section className="py-8 px-6">
                    <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 text-left">Latest Updates</h2>

                  {/* Sample Update 1 */}
                    <div className="bg-[#F0E4D4] rounded-xl overflow-hidden card-shadow mb-4">
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
                            <div className="flex items-center gap-2 mb-2 mt-4">
                                <span className="font-lato text-xs text-brand-gold uppercase tracking-wider mt-3">Education</span>
                            </div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-snug">
                                Students of Ma'ahad celebrates Qur'an memorization
                            </h3>
                            <p className="font-lato text-sm text-justify text-brand-brown line-clamp-3">
                                Ma'ahad Sheikh Shareef Ibrahim Saleh Al-Hussaini celebrated over 30 students who memorized the Holy Qur'an this year.
                            </p>
                        </div>
                      </Link>
                    </div>


{/* Sample Update 2 */}
                    <div className="bg-[#F0E4D4] rounded-xl overflow-hidden card-shadow mb-4">
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
                            <div className="flex items-center gap-2 mb-2 mt-4">
                                <span className="font-lato text-xs text-brand-gold uppercase tracking-wider mt-3">Education</span>
                            </div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-snug">
                                Students of Ma'ahad celebrates Qur'an memorization
                            </h3>
                            <p className="font-lato text-sm text-justify text-brand-brown line-clamp-3">
                                Ma'ahad Sheikh Shareef Ibrahim Saleh Al-Hussaini celebrated over 30 students who memorized the Holy Qur'an this year.
                            </p>
                        </div>
                      </Link>
                    </div>


{/* Sample Update 3 */}
                    <div className="bg-[#F0E4D4] rounded-xl overflow-hidden card-shadow mb-4">
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
                            <div className="flex items-center gap-2 mb-2 mt-4">
                                <span className="font-lato text-xs text-brand-gold uppercase tracking-wider mt-3">Education</span>
                            </div>
                            <h3 className="font-agency text-xl text-brand-brown-dark mb-2 leading-snug">
                                Students of Ma'ahad celebrates Qur'an memorization
                            </h3>
                            <p className="font-lato text-sm text-justify text-brand-brown line-clamp-3">
                                Ma'ahad Sheikh Shareef Ibrahim Saleh Al-Hussaini celebrated over 30 students who memorized the Holy Qur'an this year.
                            </p>
                        </div>
                      </Link>
                    </div>


                </section>


                {/* 5. VISION AND MISSION STATEMENTS */}
<section className="relative py-20 px-4 bg-brand-gold overflow-hidden">
    {/* Background Overlay Pattern */}
    <div className="absolute inset-0">
        <Image 
            src="/overlay.jpg" 
            alt="Background pattern overlay" 
            fill 
            className="object-cover opacity-20 md:opacity-30" 
        />
    </div>

    <div className="relative z-10 text-center text-white">
        {/* Vision */}
        <div className="mb-5">
            <h2 className="font-agency text-md text-white mb-2 text-center">
                Vision Statement
            </h2>
            <p className="font-lato leading-snug mx-auto">
                To be a leading force in transforming education through Qur'an values, excellence in learning, and empowerment of communities.
            </p>
        </div>

        {/* Separator & Icons */}
        <div className="mb-10 max-w-xl mx-auto">
            {/* Separator Line */}
            <div className="flex justify-center items-center my-6">
                <hr className="w-3/4 h-0.5 bg-white border-0 ml-4" />
            </div>

            {/* Icons and Labels */}
            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 relative">
                        <Image src="/educationalsupporticon.svg" alt="Educational Support" fill className="object-contain" />
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 relative">2
                        <Image src="/communitydevelopmenticon.svg" alt="Community Development" fill className="object-contain" />
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 relative">
                        <Image src="/trainingandinnovationicon.svg" alt="Training & Innovation" fill className="object-contain" />
                    </div>
                </div>
            </div>
{/* Separator Line */}
            <div className="flex justify-center items-center my-6">
                <hr className="w-3/4 h-0.5 bg-white border-0 ml-4" />
            </div>
        </div>
        

        {/* Mission */}
        <div>
            <h2 className="font-agency text-md text-white mb-2 text-center">
                Mission Statement
            </h2>
            <p className="font-lato leading-snug mx-auto">
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