"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { Quote, Target, Eye, Heart, Book, Star, Users, Loader2 } from 'lucide-react';

export default function AboutPage() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH LEADERSHIP DATA ---
    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const q = query(
                    collection(db, "leadership_team"),
                    where("visibility", "==", "Visible"),
                    orderBy("order", "asc")
                );
                const snapshot = await getDocs(q);
                setLeaders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching leadership:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    // Core Values Data
    const values = [
        { title: "Iman (Faith)", text: "Our work is grounded in sincere belief in Allah and adherence to the Qur’an and Sunnah.", icon: Heart },
        { title: "‘Ilm (Knowledge)", text: "We uphold authentic learning, scholarly discipline, and intellectual honesty.", icon: Book },
        { title: "Ihsan (Excellence)", text: "We strive for excellence in teaching, organisation, and service, doing our work as an act of worship.", icon: Star },
        { title: "Khidmah (Service)", text: "We exist to serve, supporting individuals and communities with compassion and responsibility.", icon: Users },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark selection:bg-brand-gold/20">
            <Header />

            <main className="flex-grow">

                {/* 1. HERO SECTION (Calm Authority) */}
                <section className="relative h-[50vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden bg-brand-brown-dark">
                    <Image
                        src="/images/heroes/about-hero.webp" 
                        alt="About Al-Asad Foundation"
                        fill
                        className="object-cover object-center opacity-40" // Reduced opacity for text clarity
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-transparent to-black/30"></div>
                    
                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto text-white">
                        <span className="inline-block border-b border-brand-gold pb-2 font-agency text-brand-gold tracking-[0.2em] uppercase mb-6 text-sm md:text-base">
                            Our Essence
                        </span>
                        <h1 className="font-agency text-5xl md:text-7xl leading-tight mb-6 drop-shadow-sm">
                            Faith. Knowledge. Service.
                        </h1>
                        <p className="font-lato text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light">
                            Building minds, nurturing character, and serving communities through Islamic education and purposeful action.
                        </p>
                    </div>
                </section>
                {/* 2. INTRO NARRATIVE (Reading Focused) */}
                <section className="py-20 md:py-24 px-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark mb-6">
                                We Are More Than Just a Foundation
                            </h2>
                            <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full"></div>
                        </div>

                        <div className="space-y-6 text-lg text-brand-brown leading-relaxed text-justify md:text-left font-light">
                            <p>
                                Al-Asad Education Foundation is an Islamic educational and community-focused organisation established in the early 2000s, dedicated to the preservation, transmission, and practical application of authentic Islamic knowledge.
                            </p>
                            <p>
                                From its beginnings as a modest learning circle, the foundation has grown into a structured platform for education, da‘wah, mentorship, and community development. Its work is rooted in the Qur’an and Sunnah, guided by scholarship, and driven by sincere service to society.
                            </p>
                            <p>
                                Al-Asad exists to nurture individuals who combine sound knowledge with upright character, and who contribute positively to their communities with wisdom, humility, and responsibility.
                            </p>
                        </div>

                        <div className="mt-12 p-8 bg-brand-sand/30 border-l-4 border-brand-gold rounded-r-xl">
                            <p className="font-agency text-2xl md:text-3xl text-brand-brown-dark italic leading-snug">
                                “Knowledge without character is a burden. <br className="hidden md:block"/>
                                Character without knowledge is blind.”
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. MISSION & VISION (Principles, not Features) */}
                <section className="py-16 bg-brand-sand/20 border-y border-brand-brown-dark/5 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                            
                            {/* Mission Block */}
                            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-brand-gold/30 transition-colors duration-500">
                                <div className="w-16 h-16 bg-brand-sand rounded-full flex items-center justify-center mb-6 text-brand-gold">
                                    <Target className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-agency text-3xl text-brand-brown-dark mb-4">Our Mission</h3>
                                <p className="font-lato text-brand-brown leading-relaxed">
                                    To provide accessible, authentic Islamic education; to nurture moral excellence and intellectual discipline; and to serve communities through programmes that reflect the values of Islam with clarity, balance, and compassion.
                                </p>
                            </div>

                            {/* Vision Block */}
                            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:border-brand-gold/30 transition-colors duration-500">
                                <div className="w-16 h-16 bg-brand-sand rounded-full flex items-center justify-center mb-6 text-brand-gold">
                                    <Eye className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-agency text-3xl text-brand-brown-dark mb-4">Our Vision</h3>
                                <p className="font-lato text-brand-brown leading-relaxed">
                                    To raise generations grounded in faith, guided by knowledge, and committed to service, individuals who embody Islamic values and contribute meaningfully to society locally and beyond.
                                </p>
                            </div>

                        </div>
                    </div>
                </section>
                {/* 4. CHAIRMAN'S DESK (Letter Style) */}
                <section className="py-20 md:py-28 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            
                            {/* Image Portrait */}
                            <div className="lg:w-1/3 relative group">
                                <div className="absolute inset-0 bg-brand-gold/10 transform translate-x-3 translate-y-3 rounded-2xl transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-lg">
                                    <Image 
                                        src="/images/chairman/sheikh2.webp" 
                                        alt="Sheikh Goni Dr. Muneer Ja‘afar Katsina" 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                                <div className="mt-6 text-center lg:text-left">
                                    <h3 className="font-agency text-2xl text-brand-brown-dark">Sheikh Goni Dr. Muneer Ja‘afar</h3>
                                    <p className="font-lato text-xs text-brand-gold uppercase tracking-widest font-bold">Chairman</p>
                                </div>
                            </div>

                            {/* Letter Content */}
                            <div className="lg:w-2/3">
                                <Quote className="w-12 h-12 text-brand-gold/20 mb-6" />
                                <h2 className="font-agency text-4xl text-brand-brown-dark mb-8 border-b border-gray-100 pb-4">
                                    From the Chairman’s Desk
                                </h2>
                                <div className="space-y-6 text-lg text-gray-600 font-lato leading-relaxed">
                                    <p>
                                        "Islamic education is not merely the transfer of information, it is the cultivation of hearts, minds, and conduct."
                                    </p>
                                    <p>
                                        "Al-Asad Education Foundation was established with the conviction that true reform begins with sound knowledge, sincere intention, and consistent action. Over the years, our efforts have remained focused on teaching Islam with depth, balance, and relevance, while addressing the real needs of people and communities."
                                    </p>
                                    <p>
                                        "We believe that education should inspire responsibility, humility, and service, not arrogance or division. Our work is a trust, and we remain committed to fulfilling it with integrity and excellence, seeking the pleasure of Allah above all."
                                    </p>
                                </div>
                                <div className="mt-10 pt-6 border-t border-dashed border-gray-200">
                                    <p className="font-arabic text-4xl text-brand-brown-dark opacity-80" dir="rtl">الشيخ منير جعفر</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. CORE VALUES (Clean Grid) */}
                <section className="py-20 bg-brand-brown-dark text-white px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Our DNA</span>
                            <h2 className="font-agency text-4xl md:text-5xl">The Values We Live By</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((val, idx) => {
                                const Icon = val.icon;
                                return (
                                    <div key={idx} className="bg-white/5 p-8 rounded-xl border border-white/5 hover:bg-white/10 transition-colors duration-300">
                                        <div className="text-brand-gold mb-6">
                                            <Icon className="w-8 h-8" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="font-agency text-2xl text-white mb-3">{val.title}</h3>
                                        <p className="font-lato text-sm text-white/70 leading-relaxed">
                                            {val.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 6. LEADERSHIP (Official Cards) */}
                <section className="py-20 md:py-32 px-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="font-agency text-4xl md:text-5xl text-brand-brown-dark mb-6">
                                Our Leadership
                            </h2>
                            <p className="font-lato text-gray-600 text-lg leading-relaxed">
                                Al-Asad Education Foundation is guided by scholars, educators, and professionals committed to Islamic ethics, transparency, and long-term impact. Leadership is exercised as responsibility, not privilege, with accountability to Allah and to the communities we serve.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
                            </div>
                        ) : leaders.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {leaders.map((leader) => (
                                    <div key={leader.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                        {/* Image Area */}
                                        <div className="relative h-80 w-full bg-gray-200 overflow-hidden">
                                            <Image 
                                                src={leader.image || "/fallback.webp"} 
                                                alt={leader.name} 
                                                fill 
                                                className="object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                                            />
                                            {/* Gold Accent Line */}
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                        </div>
                                        
                                        {/* Info Area */}
                                        <div className="p-6">
                                            <h3 className="font-agency text-2xl text-brand-brown-dark leading-tight mb-1">{leader.name}</h3>
                                            <p className="font-lato text-xs font-bold text-brand-gold uppercase tracking-widest mb-4">{leader.position}</p>
                                            
                                            {/* Expandable Bio */}
                                            <div className="text-sm text-gray-600 leading-relaxed">
                                                <p className="line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                                    {leader.bio}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 font-agency text-lg">Leadership profiles are being updated.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 7. CLOSING STATEMENT */}
                <section className="py-20 px-6 bg-white border-t border-brand-brown-dark/5">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="w-12 h-1 bg-brand-gold mx-auto mb-8 rounded-full"></div>
                        <h2 className="font-agency text-3xl md:text-4xl text-brand-brown-dark leading-snug">
                            "Al-Asad Education Foundation continues its journey with humility, purpose, and trust in Allah, seeking to educate, uplift, and serve, today and for generations to come."
                        </h2>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
