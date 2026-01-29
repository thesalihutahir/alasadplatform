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
                    collection(db, "leadership_team"), // Corrected collection name based on Master Map
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
        { title: "Iman (Faith)", text: "Grounding every action in sincerity and God-consciousness.", icon: Heart },
        { title: "Ilm (Knowledge)", text: "Pursuing beneficial knowledge as a lifelong sacred duty.", icon: Book },
        { title: "Ihsan (Excellence)", text: "Striving for perfection and beauty in service and conduct.", icon: Star },
        { title: "Khidmah (Service)", text: "Dedicating resources to the upliftment of the Ummah.", icon: Users },
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
                            Bridging the gap between sacred tradition and modern excellence to empower the next generation.
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
                                    Al-Asad Education Foundation is a movement. Born from the belief that education should nurture the soul as much as it informs the mind, we are a Qur’an-centered initiative committed to redefining what it means to be learned.
                                </p>
                                <p>
                                    In a world of shifting values, we stand firm on the principles of our Deen while embracing the tools of the modern age. We support students, empower educators, and uplift underserved communities—not just to help them survive, but to help them lead with character and competence.
                                </p>
                            </div>
                            <div className="mt-10 pl-6 border-l-4 border-brand-gold">
                                <p className="font-agency text-2xl text-brand-brown-dark italic">
                                    "Knowledge without character is a tree without fruit. We are here to nurture both."
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
                                    To expand access to quality education that harmonizes Islamic values with academic excellence, fostering a generation of morally grounded leaders.
                                </p>
                            </div>
                            <div className="bg-brand-sand/30 text-brand-brown-dark p-8 md:p-10 rounded-3xl border border-brand-gold/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                                <Eye className="w-10 h-10 text-brand-brown-dark mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-agency text-3xl mb-2">Our Vision</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    To be the beacon of holistic education in Africa, where spiritual growth and intellectual advancement walk hand in hand.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. FOUNDER'S MESSAGE */}
                <section className="bg-gray-50 py-20 md:py-32 px-6">
                    <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                        <div className="lg:w-2/5 relative h-80 lg:h-auto bg-brand-brown-dark">
                            <Image 
                                src="/images/chairman/sheikh1.webp" 
                                alt="Founder" 
                                fill 
                                className="object-cover opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:bg-gradient-to-r"></div>
                            <div className="absolute bottom-8 left-8 text-white z-10">
                                <p className="font-agency text-3xl leading-none mb-1">Sheikh Goni Dr. Muneer</p>
                                <p className="font-lato text-xs uppercase tracking-widest text-brand-gold">Founder & Chairman</p>
                            </div>
                        </div>
                        <div className="lg:w-3/5 p-10 md:p-16 flex flex-col justify-center relative">
                            <Quote className="text-brand-sand/40 w-24 h-24 absolute top-8 left-8 -z-0 transform rotate-180" />
                            <h3 className="font-agency text-4xl text-brand-brown-dark mb-6 relative z-10">From the Chairman's Desk</h3>
                            <div className="space-y-6 text-gray-600 text-lg leading-relaxed italic relative z-10">
                                <p>
                                    "We established this foundation not merely to build schools, but to build souls. In a world rapidly changing, our anchor remains the Qur'an."
                                </p>
                                <p>
                                    "Our goal is to raise a generation that is as competent in the sciences of the world as they are grounded in the sciences of the Deen. This is our trust, and this is our legacy."
                                </p>
                            </div>
                            <div className="mt-8">
                                {/* Use a styled text signature if image not available, or keep image if you have it */}
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

                {/* 5. DYNAMIC LEADERSHIP TEAM (Fixed Hover Logic) */}
                <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-agency text-4xl md:text-6xl text-brand-brown-dark mb-4">
                            Our Leadership
                        </h2>
                        <p className="font-lato text-gray-500 text-lg max-w-2xl mx-auto">
                            Guided by scholarship, wisdom, and professional excellence.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
                        </div>
                    ) : leaders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {leaders.map((leader) => (
                                <div key={leader.id} className="group relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 h-[450px]">
                                    
                                    {/* Image (Fills Card) */}
                                    <Image 
                                        src={leader.image || "/fallback.webp"} 
                                        alt={leader.name} 
                                        fill 
                                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                                    {/* Info Content (Absolute Positioning for smooth slide) */}
                                    <div className="absolute bottom-0 left-0 w-full p-8 text-white transform translate-y-24 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                        <div className="mb-6">
                                            <h3 className="font-agency text-3xl leading-none mb-2 text-shadow-sm">{leader.name}</h3>
                                            <p className="text-xs font-bold text-brand-gold uppercase tracking-widest">{leader.position}</p>
                                        </div>
                                        
                                        {/* Bio - Visible on Hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 border-t border-white/20 pt-4">
                                            <p className="text-sm text-white/90 leading-relaxed line-clamp-4">
                                                {leader.bio || "A dedicated leader serving the foundation with excellence and vision."}
                                            </p>
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

            </main>

            <Footer />
        </div>
    );
}
