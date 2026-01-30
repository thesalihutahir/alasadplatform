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
        <div className="min-h-screen flex flex-col bg-white font-lato overflow-x-hidden text-brand-brown-dark">
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
                    {/* Gradient Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
                    
                    <div className="relative z-10 text-center px-6 max-w-5xl mx-auto text-white">
                        <div className="inline-block mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                                Our Essence
                            </span>
                        </div>
                        <h1 className="font-agency text-5xl md:text-7xl lg:text-8xl leading-none mb-6 drop-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            Faith. Knowledge. Service.
                        </h1>
                        <p className="font-lato text-lg md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            Building minds, nurturing character, and serving communities through Islamic education and purposeful action.
                        </p>
                    </div>
                </section>

                {/* 2. NARRATIVE SECTION */}
                <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                        
                        {/* Left: Text Content */}
                        <div className="relative">
                            <h2 className="font-agency text-4xl md:text-6xl text-brand-brown-dark mb-8 leading-[0.9]">
                                We Are More Than <br/> Just A Foundation.
                            </h2>
                            {/* FIXED: Changed alignment to text-left to remove awkward spacing rivers */}
                            <div className="space-y-6 text-gray-600 text-lg leading-relaxed text-left font-lato">
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
                            <div className="mt-12 pl-6 border-l-4 border-brand-gold">
                                <p className="font-agency text-2xl md:text-3xl text-brand-brown-dark italic leading-tight">
                                    “Knowledge without character is a burden. Character without knowledge is blind.”
                                </p>
                            </div>
                        </div>

                        {/* Right: Mission & Vision Cards (Clean & Modern) */}
                        <div className="flex flex-col gap-8">
                            {/* Mission */}
                            <div className="bg-brand-sand/30 p-8 md:p-10 rounded-3xl border border-brand-gold/10 hover:border-brand-gold/30 transition-all duration-300">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-gold shadow-sm">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-agency text-3xl text-brand-brown-dark">Our Mission</h3>
                                </div>
                                <p className="text-brand-brown leading-relaxed text-lg">
                                    To provide accessible, authentic Islamic education; to nurture moral excellence and intellectual discipline; and to serve communities through programmes that reflect the values of Islam with clarity, balance, and compassion.
                                </p>
                            </div>

                            {/* Vision */}
                            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-brand-brown-dark rounded-full flex items-center justify-center text-white shadow-sm">
                                        <Eye className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-agency text-3xl text-brand-brown-dark">Our Vision</h3>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    To raise generations grounded in faith, guided by knowledge, and committed to service, individuals who embody Islamic values and contribute meaningfully to society locally and beyond.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 3. FOUNDER'S MESSAGE */}
                <section className="bg-brand-sand/20 py-20 md:py-32 px-6">
                    <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
                        {/* Image Side */}
                        <div className="lg:w-5/12 relative h-[500px] lg:h-auto bg-brand-brown-dark">
                            <Image 
                                src="/images/chairman/sheikh2.webp" 
                                alt="Sheikh Goni Dr. Muneer Ja‘afar Katsina" 
                                fill 
                                className="object-cover object-top opacity-95"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent lg:bg-gradient-to-r"></div>
                            <div className="absolute bottom-8 left-8 text-white z-10 pr-8">
                                <p className="font-agency text-3xl md:text-4xl leading-none mb-2">Sheikh Goni Dr. Muneer</p>
                                <p className="font-lato text-xs uppercase tracking-widest text-brand-gold font-bold">Chairman, Al-Asad Foundation</p>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="lg:w-7/12 p-10 md:p-16 flex flex-col justify-center relative">
                            <Quote className="text-brand-sand w-32 h-32 absolute top-4 right-4 md:top-8 md:right-8 -z-0 opacity-50 transform rotate-180" />
                            
                            <h3 className="font-agency text-3xl md:text-5xl text-brand-brown-dark mb-8 relative z-10">From the Chairman's Desk</h3>
                            
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
                            
                            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="font-arabic text-3xl text-brand-brown-dark opacity-80">الشيخ منير جعفر</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. CORE VALUES */}
                <section className="py-20 md:py-32 bg-brand-brown-dark text-white px-6 md:px-12 lg:px-24">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Our DNA</span>
                            <h2 className="font-agency text-4xl md:text-6xl">The Values We Live By</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((val, idx) => {
                                const Icon = val.icon;
                                return (
                                    <div key={idx} className="group relative bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white hover:border-white transition-all duration-500 hover:-translate-y-2">
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-brand-gold group-hover:text-white group-hover:bg-brand-brown-dark transition-colors duration-500">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-agency text-2xl text-white group-hover:text-brand-brown-dark mb-3 transition-colors duration-500">{val.title}</h3>
                                        <p className="font-lato text-sm text-white/60 group-hover:text-gray-600 leading-relaxed transition-colors duration-500">{val.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* 5. DYNAMIC LEADERSHIP TEAM */}
                <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-agency text-4xl md:text-6xl text-brand-brown-dark mb-6">
                            Our Leadership
                        </h2>
                        <p className="font-lato text-gray-500 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
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
                                <div key={leader.id} className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 h-[480px]">
                                    
                                    {/* Image Section */}
                                    <div className="relative h-full w-full bg-gray-200">
                                        <Image 
                                            src={leader.image || "/fallback.webp"} 
                                            alt={leader.name} 
                                            fill 
                                            className="object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                                        />
                                        {/* Gradient Overlay - Always visible but darker on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark via-brand-brown-dark/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                                        
                                        {/* Content Positioned at Bottom */}
                                        <div className="absolute bottom-0 left-0 w-full p-8 text-white z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="border-l-2 border-brand-gold pl-4 mb-2">
                                                <h3 className="font-agency text-3xl leading-none mb-1 text-shadow-sm">{leader.name}</h3>
                                                <p className="font-lato text-xs font-bold text-brand-gold uppercase tracking-widest">{leader.position}</p>
                                            </div>
                                            
                                            {/* Expandable Bio */}
                                            <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100">
                                                <p className="font-lato text-sm text-white/80 mt-4 leading-relaxed line-clamp-4">
                                                    {leader.bio || "Dedicated to serving the community through excellence and integrity."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-agency text-xl">Leadership profiles are currently being updated.</p>
                        </div>
                    )}
                </section>

                {/* 6. CLOSING STATEMENT */}
                <section className="py-20 px-6 bg-brand-sand/30 border-t border-brand-gold/10">
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
