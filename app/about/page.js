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
        <div className="min-h-screen flex flex-col bg-white font-lato text-brand-brown-dark overflow-x-hidden">
            <Header />

            <main className="flex-grow pb-0">

                {/* 1. HERO SECTION (Calm Authority) */}
                <section className="relative h-[50vh] w-full flex items-center justify-center overflow-hidden bg-brand-brown-dark">
                    <Image
                        src="/images/heroes/about-hero.webp" 
                        alt="About Al-Asad Foundation"
                        fill
                        className="object-cover object-center opacity-40 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto text-white">
                        <span className="inline-block py-1 px-3 border border-white/20 rounded-full font-lato text-xs md:text-sm tracking-[0.2em] uppercase mb-6 bg-white/5 backdrop-blur-sm">
                            Our Essence
                        </span>
                        <h1 className="font-agency text-5xl md:text-7xl leading-tight mb-6 drop-shadow-md">
                            Faith. Knowledge. Service.
                        </h1>
                        <p className="font-lato text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                            Building minds, nurturing character, and serving communities through Islamic education and purposeful action.
                        </p>
                    </div>
                </section>
                {/* 2. NARRATIVE SECTION (The Intellectual Core) */}
                <section className="py-20 md:py-28 px-6 bg-white">
                    <div className="max-w-3xl mx-auto space-y-10 text-center md:text-left">
                        
                        {/* Intro Block */}
                        <div className="space-y-6">
                            <h2 className="font-agency text-4xl md:text-5xl text-brand-brown-dark leading-none text-center">
                                We Are More Than <br/> Just A Foundation.
                            </h2>
                            <div className="w-16 h-1 bg-brand-gold mx-auto rounded-full"></div>
                            
                            <div className="font-lato text-lg md:text-xl text-gray-700 leading-relaxed space-y-6 text-justify md:text-center">
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
                        </div>

                        {/* Quote Block */}
                        <div className="pt-8 pb-8">
                            <blockquote className="relative p-8 border-l-4 border-brand-gold bg-brand-sand/20 rounded-r-xl">
                                <Quote className="absolute top-4 left-4 w-8 h-8 text-brand-gold/20 transform -scale-x-100" />
                                <p className="font-agency text-2xl md:text-3xl text-brand-brown-dark italic text-center relative z-10 leading-relaxed">
                                    “Knowledge without character is a burden. <br className="hidden md:block"/>
                                    Character without knowledge is blind.”
                                </p>
                            </blockquote>
                        </div>
                    </div>
                </section>

                {/* 3. MISSION & VISION (Balanced & Grounded) */}
                <section className="py-20 px-6 bg-brand-sand/10 border-y border-brand-brown/5">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        
                        {/* Mission */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm border-t-4 border-brand-brown-dark flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-brand-sand/50 rounded-full flex items-center justify-center mb-6 text-brand-brown-dark">
                                <Target className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-agency text-3xl text-brand-brown-dark mb-4">Our Mission</h3>
                            <p className="font-lato text-gray-600 leading-relaxed text-lg">
                                To provide accessible, authentic Islamic education; to nurture moral excellence and intellectual discipline; and to serve communities through programmes that reflect the values of Islam with clarity, balance, and compassion.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="bg-white p-10 rounded-2xl shadow-sm border-t-4 border-brand-gold flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-brand-sand/50 rounded-full flex items-center justify-center mb-6 text-brand-gold">
                                <Eye className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-agency text-3xl text-brand-brown-dark mb-4">Our Vision</h3>
                            <p className="font-lato text-gray-600 leading-relaxed text-lg">
                                To raise generations grounded in faith, guided by knowledge, and committed to service, individuals who embody Islamic values and contribute meaningfully to society locally and beyond.
                            </p>
                        </div>

                    </div>
                </section>
                {/* 4. FROM THE CHAIRMAN'S DESK (Dignified Letter Style) */}
                <section className="py-24 px-6 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                            
                            {/* Image Column */}
                            <div className="md:w-5/12 relative h-96 md:h-auto bg-gray-100">
                                <Image 
                                    src="/images/chairman/sheikh2.webp" 
                                    alt="Sheikh Goni Dr. Muneer Ja‘afar Katsina" 
                                    fill 
                                    className="object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/90 via-transparent to-transparent md:bg-gradient-to-r"></div>
                                <div className="absolute bottom-0 left-0 p-8 text-white">
                                    <p className="font-agency text-3xl leading-none mb-2">Sheikh Goni Dr. Muneer</p>
                                    <div className="h-0.5 w-12 bg-brand-gold mb-2"></div>
                                    <p className="font-lato text-xs uppercase tracking-widest text-white/80">Chairman</p>
                                </div>
                            </div>

                            {/* Text Column */}
                            <div className="md:w-7/12 p-10 md:p-14 lg:p-16 flex flex-col justify-center">
                                <div className="mb-8">
                                    <span className="font-lato text-brand-gold text-xs font-bold uppercase tracking-widest">From the Chairman's Desk</span>
                                    <h3 className="font-agency text-4xl text-brand-brown-dark mt-2">A Message of Purpose</h3>
                                </div>
                                
                                <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-lato">
                                    <p>
                                        "Islamic education is not merely the transfer of information, it is the cultivation of hearts, minds, and conduct."
                                    </p>
                                    <p>
                                        "Al-Asad Education Foundation was established with the conviction that true reform begins with sound knowledge, sincere intention, and consistent action. Over the years, our efforts have remained focused on teaching Islam with depth, balance, and relevance."
                                    </p>
                                    <p>
                                        "We believe that education should inspire responsibility, humility, and service. Our work is a trust, and we remain committed to fulfilling it with integrity and excellence."
                                    </p>
                                </div>

                                <div className="mt-10 pt-6 border-t border-gray-100">
                                    <p className="font-arabic text-3xl text-brand-brown-dark opacity-80">الشيخ منير جعفر</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. CORE VALUES (Clean & Principled) */}
                <section className="py-24 px-6 bg-brand-brown-dark text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Our DNA</span>
                            <h2 className="font-agency text-4xl md:text-6xl mt-3">The Values We Live By</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((val, idx) => {
                                const Icon = val.icon;
                                return (
                                    <div key={idx} className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-brand-gold/50 transition-colors duration-300">
                                        <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center mb-6 text-brand-gold">
                                            <Icon className="w-6 h-6" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="font-agency text-2xl text-white mb-3 tracking-wide">{val.title}</h3>
                                        <p className="font-lato text-sm text-white/70 leading-relaxed">
                                            {val.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
                {/* 6. LEADERSHIP (Dignified & Official) */}
                <section className="py-24 px-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <h2 className="font-agency text-4xl md:text-6xl text-brand-brown-dark mb-6">
                                Our Leadership
                            </h2>
                            <p className="font-lato text-gray-600 text-lg leading-relaxed">
                                Al-Asad Education Foundation is guided by scholars, educators, and professionals committed to Islamic ethics, transparency, and long-term impact. Leadership is exercised as responsibility, not privilege.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
                            </div>
                        ) : leaders.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {leaders.map((leader) => (
                                    <div key={leader.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
                                        {/* Image Area */}
                                        <div className="relative h-80 w-full bg-gray-200">
                                            <Image 
                                                src={leader.image || "/fallback.webp"} 
                                                alt={leader.name} 
                                                fill 
                                                className="object-cover object-top" 
                                            />
                                            {/* Subtle gradient at bottom for text readability if needed, but we use a card body below */}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="mb-4">
                                                <h3 className="font-agency text-2xl text-brand-brown-dark leading-tight mb-1">{leader.name}</h3>
                                                <p className="font-lato text-xs font-bold text-brand-gold uppercase tracking-widest">{leader.position}</p>
                                            </div>
                                            
                                            <div className="w-full h-px bg-gray-100 mb-4"></div>
                                            
                                            <p className="font-lato text-sm text-gray-600 leading-relaxed line-clamp-4 flex-grow">
                                                {leader.bio || "A dedicated leader serving the foundation with excellence."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-400 font-lato">Leadership profiles are currently being updated.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 7. CLOSING STATEMENT */}
                <section className="py-20 px-6 bg-white border-t border-brand-brown/5">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="w-16 h-1 bg-brand-gold mx-auto mb-8 rounded-full"></div>
                        <h2 className="font-agency text-3xl md:text-5xl text-brand-brown-dark leading-snug">
                            "Al-Asad Education Foundation continues its journey with humility, purpose, and trust in Allah, seeking to educate, uplift, and serve, today and for generations to come."
                        </h2>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
