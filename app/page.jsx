"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
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
                        className="py-3 px-8 text-center font-agency text-xl text-white bg-brand-gold rounded-full shadow-xl transition-transform hover:scale-110"
                    >
                        Make a Donation
                    </Link>
                </section>

                {/* 4. LATEST UPDATES */}
                <section className="py-8 px-6">
                    <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 text-left">Latest Updates</h2>

                    {/* SAMPLE UPDATE 1 */}
                    <div className="bg-[#F0E4D4] rounded-xl overflow-hidden card-shadow mb-4">
                        <Link href="/news" className="flex flex-col items-center group">
                            <div className="relative w-full h-48 transition-transform group-hover:scale-110">
                                <Image
                                    src="/hero.jpg"
                                    alt="Latest Update"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-5 relative">
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

                    {/* SAMPLE UPDATE 2 */}
                    <div className="bg-[#F0E4D4] rounded-xl overflow-hidden card-shadow mb-4">
                        <Link href="/news" className="flex flex-col items-center group">
                            <div className="relative w-full h-48 transition-transform group-hover:scale-110">
                                <Image
                                    src="/hero.jpg"
                                    alt="Latest Update"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-5 relative">
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

                    {/* SAMPLE UPDATE 3 */}
                    <div className="bg-[#F0E4D4] rounded-xl overflow-hidden card-shadow mb-4">
                        <Link href="/news" className="flex flex-col items-center group">
                            <div className="relative w-full h-48 transition-transform group-hover:scale-110">
                                <Image
                                    src="/hero.jpg"
                                    alt="Latest Update"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-5 relative">
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

                {/* FEATURED SECTIONS */}
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

                        <div
                            className="p-5 rounded-2xl bg-[#f8f5f0] border-l-4 flex flex-row items-center gap-4 shadow-sm"
                            style={{ borderColor: '#C8A34F' }}
                        >
                            <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-white shadow-sm">
                                <svg className="w-6 h-6" style={{ color: '#C8A34F' }} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>

                            <div className="flex-grow">
                                <h3 className="font-agency text-lg font-bold text-gray-800">Islamic Jurisprudence Intro</h3>

                                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3" style={{ backgroundColor: '#C8A34F' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* UPCOMING EVENTS - CLEANED */}
                    <div className="mb-8">
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-6 text-left">Upcoming Events</h2>

                        <div className="flex overflow-x-auto pb-4 gap-4">
                            <div className="min-w-[250px] bg-[#F0E4D4] rounded-xl p-4 shadow">
                                <h3 className="font-agency text-lg text-brand-brown-dark mb-2">Event Title</h3>
                                <p className="font-lato text-sm text-brand-brown">
                                    Add events dynamically later.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}