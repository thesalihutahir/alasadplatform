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
import { Laptop, Briefcase, Cpu, Code, ArrowRight, CheckCircle, Target } from 'lucide-react';

export default function TrainingInnovationPage() {

    // --- STATE ---
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                // Fetch only 'Training & Innovation' programs
                const q = query(
                    collection(db, "programs"),
                    where("category", "==", "Training & Innovation"),
                    orderBy("createdAt", "desc")
                );
                
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPrograms(data);
            } catch (error) {
                console.error("Error fetching training programs:", error);
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
                            src="/images/heroes/programs-training-innovation-hero.webp" 
                            alt="Training & Innovation Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
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

                {/* 2. AIMS & OBJECTIVES */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-24">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-sand/50 rounded-full text-brand-brown-dark text-xs font-bold uppercase tracking-wider">
                                <Laptop className="w-4 h-4" /> Core Pillar
                            </div>
                            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark leading-tight">
                                Empowering Minds,<br />
                                <span className="text-brand-gold">Building Futures.</span>
                            </h2>
                            <p className="font-lato text-gray-600 text-lg leading-relaxed">
                                In a rapidly evolving world, religious education must be paired with practical capability. Our Training & Innovation programs are designed to equip students and community members with the digital, vocational, and entrepreneurial skills needed to thrive in the modern economy.
                            </p>
                            <p className="font-lato text-gray-600 text-lg leading-relaxed">
                                We aim to foster a culture of self-reliance and innovation, ensuring that our graduates are not only spiritually grounded but also economically empowered contributors to society.
                            </p>
                            
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {['Digital Literacy', 'Vocational Skills', 'Entrepreneurship', 'Tech Innovation'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-brand-brown-dark font-bold text-sm">
                                        <CheckCircle className="w-5 h-5 text-green-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                            <Image 
                                src="/fallback.webp" 
                                alt="Vocational Training" 
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
                                Skill Development
                            </h3>
                            <p className="text-gray-500 text-sm mt-2">Active training and empowerment initiatives.</p>
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
                                                        <Briefcase className="w-3 h-3 text-brand-gold" /> {program.location}
                                                    </span>
                                                )}
                                                {program.beneficiaries && (
                                                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                                        <Target className="w-3 h-3 text-brand-gold" /> {program.beneficiaries}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="font-lato text-base md:text-lg text-gray-600 leading-relaxed mb-6">
                                                {program.excerpt}
                                            </p>

                                            <Link 
                                                href={`/programs/${program.id}`} 
                                                className="inline-flex items-center gap-2 text-brand-gold font-bold hover:text-brand-brown-dark transition-colors uppercase tracking-widest text-sm"
                                            >
                                                Details & Registration <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400">No active training programs at the moment.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* 4. UPCOMING / COMPLETED (Grid) */}
                {!loading && otherPrograms.length > 0 && (
                    <section className="px-6 md:px-12 lg:px-24 mb-20 max-w-7xl mx-auto">
                        <h3 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-8 border-b border-gray-100 pb-2">
                            Workshops & Seminars
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
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. IMPACT STATS */}
                <section className="mt-20 md:mt-32 px-6 py-16 bg-brand-sand">
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-2 gap-8 md:gap-16 text-center divide-x divide-brand-brown-dark/10">
                        <div className="p-4">
                            <h3 className="font-agency text-5xl md:text-7xl text-brand-gold mb-2">150+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-lg uppercase tracking-widest font-bold">
                                Youths Trained
                            </p>
                        </div>
                        <div className="p-4">
                            <h3 className="font-agency text-5xl md:text-7xl text-brand-gold mb-2">10+</h3>
                            <p className="font-lato text-brand-brown-dark text-sm md:text-lg uppercase tracking-widest font-bold">
                                Workshops Held
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. CTA */}
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