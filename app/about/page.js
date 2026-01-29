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

    // Core Values Data (Updated Content)
    const values = [
        { title: "Iman (Faith)", text: "Our work is grounded in sincere belief in Allah and adherence to the Qur’an and Sunnah.", icon: Heart },
        { title: "‘Ilm (Knowledge)", text: "We uphold authentic learning, scholarly discipline, and intellectual honesty.", icon: Book },
        { title: "Ihsan (Excellence)", text: "We strive for excellence in teaching, organisation, and service, doing our work as an act of worship.", icon: Star },
        { title: "Khidmah (Service)", text: "We exist to serve, supporting individuals and communities with compassion and responsibility.", icon: Users },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato overflow-x-hidden">
            <Header />

            <main className="flex-grow pb-0">

                {/* 1. HERO SECTION */}
                <section className="relative h-[60vh] md:h-[70vh] w-full flex items-center justify-center overflow-hidden">
                    <Image
                        src="/images/heroes/about-hero.webp" 
                        alt="About Al-Asad Foundation"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto text-white">
                        <span className="block font-lato text-brand-gold text-sm md:text-base tracking-[0.2em] uppercase mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            Our Essence
                        </span>
                        <h1 className="font-agency text-5xl md:text-7xl lg:text-8xl leading-none mb-6 drop-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            Faith. Knowledge. Service.
                        </h1>
                        <p className="font-lato text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            Building minds, nurturing character, and serving communities through Islamic education and purposeful action.
                        </p>
                    </div>
                </section>

                {/* 2. NARRATIVE SECTION */}
                <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl"></div>
                            <h2 className="font-agency text-4xl md:text-6xl text-brand-brown-dark mb-8 leading-[0.9]">
                                We Are More Than <br/> Just A Foundation.
                            </h2>
                            <div className="space-y-6 text-gray-600 text-lg leading-relaxed text-justify lg:text-left">
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
                            <div className="mt-10 pl-6 border-l-4 border-brand-gold">
                                <p className="font-agency text-2xl text-brand-brown-dark italic">
                                    “Knowledge without character is a burden. Character without knowledge is blind.”
                                </p>
                            </div>
                        </div>

                        {/* Interactive Grid of Mission/Vision */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-brand-brown-dark text-white p-8 md:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <Target className="w-10 h-10 text-brand-gold mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-agency text-3xl mb-2">Our Mission</h3>
                                <p className="text-white/80 leading-relaxed">
                                    To provide accessible, authentic Islamic education; to nurture moral excellence and intellectual discipline; and to serve communities through programmes that reflect the values of Islam with clarity, balance, and compassion.
                                </p>
                            </div>
                            <div className="bg-brand-sand/30 text-brand-brown-dark p-8 md:p-10 rounded-3xl border border-brand-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                                <Eye className="w-10 h-10 text-brand-brown-dark mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-agency text-3xl mb-2">Our Vision</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    To raise generations grounded in faith, guided by knowledge, and committed to service, individuals who embody Islamic values and contribute meaningfully to society locally and beyond.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. FOUNDER'S MESSAGE (Updated Content & Image) */}
                <section className="bg-gray-50 py-20 md:py-32 px-6">
                    <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                        <div className="lg:w-2/5 relative h-96 lg:h-auto bg-brand-brown-dark">
                            <Image 
                                src="/images/chairman/sheikh2.webp" 
                                alt="Sheikh Goni Dr. Muneer Ja‘afar Katsina" 
                                fill 
                                className="object-cover object-top opacity-95"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent lg:bg-gradient-to-r"></div>
                            <div className="absolute bottom-8 left-8 text-white z-10">
                                <p className="font-agency text-3xl leading-none mb-1">Sheikh Goni Dr. Muneer</p>
                                <p className="font-lato text-xs uppercase tracking-widest text-brand-gold">Chairman, Al-Asad Education Foundation</p>
                            </div>
                        </div>
                        <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center relative">
                            <Quote className="text-brand-sand/40 w-24 h-24 absolute top-8 left-8 -z-0 transform rotate-180" />
                            <h3 className="font-agency text-4xl text-brand-brown-dark mb-6 relative z-10">From the Chairman's Desk</h3>
                            <div className="space-y-6 text-gray-600 text-lg leading-relaxed italic relative z-10">
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
                            <div className="mt-8">
                                <p className="font-arabic text-3xl text-brand-brown-dark opacity-70 transform -rotate-2">الشيخ منير جعفر</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. CORE VALUES */}
                <section className="py-20 md:py-32 bg-brand-brown-dark text-white px-6 md:px-12 lg:px-24">
                    <div className="max-w-7xl mx-auto text-center">
                        <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">Our DNA</span>
                        <h2 className="font-agency text-4xl md:text-6xl mb-16">The Values We Live By</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((val, idx) => {
                                const Icon = val.icon;
                                return (
                                    <div key={idx} className="group relative bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-brand-gold hover:border-brand-gold transition-all duration-500">
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-brand-gold group-hover:text-brand-brown-dark group-hover:bg-white transition-colors">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-agency text-2xl text-white group-hover:text-brand-brown-dark mb-3 transition-colors">{val.title}</h3>
                                        <p className="font-lato text-sm text-white/70 group-hover:text-brand-brown-dark/80 leading-relaxed transition-colors">{val.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 5. DYNAMIC LEADERSHIP TEAM (Futuristic Card Design) */}
                <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-agency text-4xl md:text-6xl text-brand-brown-dark mb-4">
                            Our Leadership
                        </h2>
                        <p className="font-lato text-gray-500 text-lg max-w-3xl mx-auto">
                            Al-Asad Education Foundation is guided by scholars, educators, and professionals committed to Islamic ethics, transparency, and long-term impact. Leadership is exercised as responsibility, not privilege, with accountability to Allah and to the communities we serve.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
                        </div>
                    ) : leaders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {leaders.map((leader) => (
                                <div key={leader.id} className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 flex flex-col">
                                    
                                    {/* Image Section */}
                                    <div className="relative h-[380px] w-full overflow-hidden bg-gray-100">
                                        <Image 
                                            src={leader.image || "/fallback.webp"} 
                                            alt={leader.name} 
                                            fill 
                                            className="object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                                        />
                                        {/* Futuristic Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/90 via-brand-brown-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                                        
                                        {/* Accent Line */}
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="relative -mt-16 p-6 flex-grow flex flex-col">
                                        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 relative z-10 flex-grow flex flex-col justify-between transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
                                            <div>
                                                <h3 className="font-agency text-2xl text-brand-brown-dark leading-tight mb-1">{leader.name}</h3>
                                                <p className="font-lato text-xs font-bold text-brand-gold uppercase tracking-wider mb-4">{leader.position}</p>
                                                <div className="w-10 h-0.5 bg-gray-100 mb-4"></div>
                                                <p className="font-lato text-sm text-gray-600 leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-300">
                                                    {leader.bio || "A dedicated leader serving the foundation with excellence."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400">Leadership profiles are currently being updated.</p>
                        </div>
                    )}
                </section>

                {/* 6. CLOSING STATEMENT */}
                <section className="py-16 px-6 bg-brand-sand/30 border-t border-brand-gold/10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="w-16 h-1 bg-brand-gold mx-auto mb-6 rounded-full"></div>
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
