"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase Imports
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { BookOpen, Users, Award, CheckCircle, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function EducationalSupportPage() {

    // --- STATE ---
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                // Fetch only 'Educational Support' programs
                const q = query(
                    collection(db, "programs"),
                    where("category", "==", "Educational Support"),
                    orderBy("createdAt", "desc")
                );
                
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPrograms(data);
            } catch (error) {
                console.error("Error fetching educational programs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
    }, []);

    // Filter Active vs Others
    const activePrograms = programs.filter(p => p.status === 'Active');
    const otherPrograms = programs.filter(p => p.status !== 'Active');

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-12 md:mb-20">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/programs-educational-support-hero.webp" 
                            alt="Educational Support Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            Educational Support
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Building a generation grounded in faith, pursuing academic excellence, and equipped for the modern world.
                        </p>
                    </div>
                </section>

                {/* 2. AIMS & OBJECTIVES */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-sand/50 rounded-full text-brand-brown-dark text-xs font-bold uppercase tracking-wider">
                                <BookOpen className="w-4 h-4" /> Core Pillar
                            </div>
                            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark leading-tight">
                                Cultivating Minds,<br />
                                <span className="text-brand-gold">Nurturing Souls.</span>
                            </h2>
                            <p className="font-lato text-gray-600 text-lg leading-relaxed">
                                At Al-Asad Foundation, we view education not just as a means to a career, but as a divine trust. Our primary objective is to bridge the gap between traditional Islamic scholarship and modern academic requirements.
                            </p>
                            <p className="font-lato text-gray-600 text-lg leading-relaxed">
                                We aim to produce <strong>Huffaz (Quran Memorizers)</strong> who are also doctors, engineers, and social leaders—individuals who carry the light of the Quran in their hearts while excelling in professional fields to serve humanity with competence and compassion.
                            </p>
                            
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {['Integrated Curriculum', 'Tahfeez Excellence', 'Character Building', 'Digital Literacy'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-brand-brown-dark font-bold text-sm">
                                        <CheckCircle className="w-5 h-5 text-green-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                            <Image 
                                src="/fallback.webp" 
                                alt="Classroom Session" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. DYNAMIC PROGRAMS LIST */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-20">
                    <div className="text-center md:text-left border-b border-gray-100 pb-4 mb-12 flex flex-col md:flex-row justify-between items-end gap-4">
                        <div>
                            <h3 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">
                                Active Initiatives
                            </h3>
                            <p className="text-gray-500 text-sm mt-2">Current projects making an impact today.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><Loader size="md" /></div>
                    ) : (
                        <div className="space-y-20">
                            {/* ACTIVE PROGRAMS (Detailed) */}
                            {activePrograms.length > 0 ? (
                                activePrograms.map((program, index) => (
                                    <div key={program.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center`}>
                                        
                                        {/* Image Side */}
                                        <div className="w-full md:w-1/2 relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-xl group cursor-pointer border border-gray-100">
                                            <Image 
                                                src={program.coverImage || "/fallback.webp"} 
                                                alt={program.title} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-brown-dark uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Active
                                            </div>
                                        </div>

                                        {/* Content Side */}
                                        <div className={`w-full md:w-1/2 ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                                            <h4 className="font-agency text-3xl md:text-4xl text-brand-brown-dark mb-4 leading-tight">
                                                {program.title}
                                            </h4>
                                            
                                            <div className={`flex flex-wrap gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 ${index % 2 === 1 ? 'md:justify-end' : ''}`}>
                                                {program.location && (
                                                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                                        <MapPin className="w-3 h-3 text-brand-gold" /> {program.location}
                                                    </span>
                                                )}
                                                {program.beneficiaries && (
                                                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                                        <Users className="w-3 h-3 text-brand-gold" /> {program.beneficiaries}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="font-lato text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                                                {program.excerpt}
                                            </p>

                                            <Link 
                                                href={`/programs/${program.id}`} // We will create this detail page later
                                                className="inline-flex items-center gap-2 text-brand-gold font-bold hover:text-brand-brown-dark transition-colors uppercase tracking-widest text-sm"
                                            >
                                                Learn More <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400">No active educational programs at the moment.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* 4. UPCOMING / COMPLETED (Grid) */}
                {!loading && otherPrograms.length > 0 && (
                    <section className="px-6 md:px-12 lg:px-24 mb-20 max-w-7xl mx-auto">
                        <h3 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-8 border-b border-gray-100 pb-2">
                            Upcoming & Past Projects
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherPrograms.map((prog) => (
                                <div key={prog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                    <div className="relative h-48 w-full bg-gray-200">
                                        <Image src={prog.coverImage || "/fallback.webp"} alt={prog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            prog.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {prog.status}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-agency text-xl text-brand-brown-dark mb-2 line-clamp-1">{prog.title}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{prog.excerpt}</p>
                                        <Link href={`/programs/${prog.id}`} className="text-xs font-bold text-brand-brown underline decoration-brand-gold/50 hover:decoration-brand-gold hover:text-brand-gold transition-all">
                                            Read Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. IMPACT STATS */}
                <section className="mt-20 md:mt-32 px-6 py-16 bg-brand-sand">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-brand-brown-dark/10">
                        <div className="pb-8 md:pb-0">
                            <h3 className="font-agency text-5xl md:text-6xl text-brand-gold mb-2">500+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-base uppercase tracking-widest font-bold">
                                Students Enrolled
                            </p>
                        </div>
                        <div className="py-8 md:py-0">
                            <h3 className="font-agency text-5xl md:text-6xl text-brand-gold mb-2">30+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-base uppercase tracking-widest font-bold">
                                Huffaz Graduated
                            </p>
                        </div>
                        <div className="pt-8 md:pt-0">
                            <h3 className="font-agency text-5xl md:text-6xl text-brand-gold mb-2">100%</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-base uppercase tracking-widest font-bold">
                                Commitment to Excellence
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. CTA */}
                <section className="px-6 mt-16 md:mt-24 mb-4">
                    <div className="max-w-4xl mx-auto bg-brand-brown-dark rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl -ml-10 -mt-10"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mb-10"></div>

                        <Award className="w-12 h-12 text-brand-gold mx-auto mb-6" />
                        
                        <h3 className="font-agency text-3xl md:text-5xl mb-4 relative z-10">Sponsor Knowledge</h3>
                        <p className="font-lato text-base md:text-xl text-white/80 mb-8 relative z-10 italic">
                            "He who follows a path in pursuit of knowledge, Allah will make the path to Paradise easy for him."
                        </p>
                        <Link
                            href="/get-involved/donate"
                            className="inline-block py-4 px-10 font-agency text-xl text-brand-brown-dark bg-white rounded-full shadow-lg hover:bg-brand-gold hover:text-white transition-all transform hover:scale-105 relative z-10"
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