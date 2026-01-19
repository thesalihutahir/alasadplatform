"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

import { 
    GraduationCap, 
    HandHeart, 
    Lightbulb,
    ArrowRight,
    Calendar,
    MapPin
} from 'lucide-react';

export default function ProgramsPage() {

    // --- STATE ---
    const [recentPrograms, setRecentPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH RECENT PROGRAMS ---
    useEffect(() => {
        const fetchRecent = async () => {
            try {
                // Fetch 3 latest 'Active' programs from ANY category
                const q = query(
                    collection(db, "programs"),
                    where("status", "==", "Active"),
                    orderBy("createdAt", "desc"),
                    limit(3)
                );
                
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRecentPrograms(data);
            } catch (error) {
                console.error("Error fetching recent programs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();
    }, []);

    // Static Category Configuration
    const categories = [
        {
            id: 'education',
            title: 'Educational Support',
            description: 'Nurturing minds through Qur’anic values, scholarships, and academic excellence initiatives.',
            link: '/programs/educational-support',
            image: '/images/heroes/programs-educational-support-hero.webp', 
            icon: GraduationCap 
        },
        {
            id: 'community',
            title: 'Community Development',
            description: 'Empowering society through welfare, hunger relief, and sustainable aid projects.',
            link: '/programs/community-development',
            image: '/images/heroes/programs-community-development-hero.webp', 
            icon: HandHeart
        },
        {
            id: 'training',
            title: 'Training & Innovation',
            description: 'Equipping the future generation with digital skills, workshops, and modern vocational training.',
            link: '/programs/training-and-innovation',
            image: '/images/heroes/programs-training-innovation-hero.webp', 
            icon: Lightbulb
        }
    ];

    // Helper: Format Date
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[4/1]">
                        <Image
                            src="/images/heroes/programs-overview-hero.webp" 
                            alt="Programs Hero"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-gold/40 to-transparent "></div>
                    </div>

                    <div className="relative -mt-12 md:-mt-24 lg:-mt-32 text-center px-6 z-10">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-3 md:mb-6 drop-shadow-sm">
                            Our Programs
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-4 md:mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-md md:max-w-2xl mx-auto leading-relaxed">
                            A holistic approach to serving humanity—building minds, supporting lives, and innovating for the future.
                        </p>
                    </div>
                </section>

                {/* 2. PROGRAM CATEGORIES (Core Pillars) */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {categories.map((cat) => {
                            const IconComponent = cat.icon;
                            return (
                                <Link 
                                    key={cat.id} 
                                    href={cat.link}
                                    className="block group relative bg-brand-sand rounded-3xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full border border-transparent hover:border-brand-gold/30"
                                >
                                    {/* Card Image Area */}
                                    <div className="relative w-full h-48 md:h-56">
                                        <Image
                                            src={cat.image}
                                            alt={cat.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                        {/* Floating Icon Badge */}
                                        <div className="absolute -bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-brand-brown-dark z-10 group-hover:scale-110 transition-transform duration-300">
                                            <IconComponent 
                                                className="w-7 h-7 md:w-8 md:h-8 text-brand-brown-dark" 
                                                strokeWidth={1.5} 
                                            />
                                        </div>
                                    </div>

                                    {/* Card Content Area */}
                                    <div className="pt-10 pb-6 px-6 md:pt-12 md:px-8 flex-grow flex flex-col">
                                        <h2 className="font-agency text-2xl md:text-3xl text-brand-brown-dark mb-3 group-hover:text-brand-gold transition-colors">
                                            {cat.title}
                                        </h2>
                                        <p className="font-lato text-sm md:text-base text-brand-brown leading-relaxed mb-6 line-clamp-3 md:line-clamp-4 flex-grow">
                                            {cat.description}
                                        </p>

                                        <div className="flex items-center text-brand-gold font-bold text-xs md:text-sm uppercase tracking-widest mt-auto group/link">
                                            <span>Explore Program</span>
                                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/link:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* 3. RECENT HIGHLIGHTS (Dynamic) */}
                {!loading && recentPrograms.length > 0 && (
                    <section className="px-6 md:px-12 lg:px-24 mb-20 max-w-7xl mx-auto border-t border-gray-100 pt-16">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                            <div>
                                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-2 block">What's Happening Now</span>
                                <h3 className="font-agency text-3xl md:text-5xl text-brand-brown-dark">
                                    Latest Initiatives
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {recentPrograms.map((program) => (
                                <Link 
                                    key={program.id} 
                                    href={`/programs/${program.id}`}
                                    className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                                >
                                    <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                                        <Image 
                                            src={program.coverImage || "/fallback.webp"} 
                                            alt={program.title} 
                                            fill 
                                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-brand-brown-dark uppercase tracking-wider">
                                            {program.category}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h4 className="font-agency text-xl text-brand-brown-dark mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                                            {program.title}
                                        </h4>
                                        
                                        <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-4 font-bold uppercase tracking-wider">
                                            {program.createdAt && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {formatDate(program.createdAt)}
                                                </span>
                                            )}
                                            {program.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {program.location}
                                                </span>
                                            )}
                                        </div>

                                        <p className="font-lato text-xs text-gray-500 line-clamp-3 mb-4 flex-grow">
                                            {program.excerpt}
                                        </p>

                                        <span className="text-xs font-bold text-brand-brown underline decoration-brand-gold/30 hover:decoration-brand-gold hover:text-brand-gold transition-all w-fit">
                                            Read Full Details
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. CTA SECTION */}
                <section className="mt-16 md:mt-24 px-6 md:px-0">
                    <div className="mx-auto max-w-4xl bg-brand-brown-dark rounded-2xl md:rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-brand-gold opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-white opacity-5 rounded-full blur-3xl -ml-10 -mb-10"></div>

                        <h3 className="font-agency text-2xl md:text-4xl mb-4 relative z-10">Support Our Mission</h3>
                        <p className="font-lato text-sm md:text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed relative z-10">
                            Your contribution fuels these initiatives and brings hope to communities. Join us in building a legacy of knowledge and care.
                        </p>
                        <Link
                            href="/get-involved/donate"
                            className="inline-block py-3 px-8 md:px-12 md:py-4 font-agency text-lg md:text-xl text-brand-brown-dark bg-white rounded-full shadow-lg hover:bg-brand-gold hover:text-white transition-colors relative z-10 transform hover:scale-105 duration-200"
                        >
                            Donate Now
                        </Link>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}