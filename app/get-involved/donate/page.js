"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { 
    Heart, ArrowRight, ShieldCheck, Globe, 
    PieChart, MessageCircle, ChevronRight, Gift 
} from 'lucide-react';

export default function DonateOverviewPage() {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH FUNDS ---
    useEffect(() => {
        const fetchFunds = async () => {
            try {
                // Fetch only ACTIVE and PUBLIC funds
                const q = query(
                    collection(db, "donation_funds"),
                    where("status", "==", "Active"), 
                    where("visibility", "==", "Public"),
                    orderBy("createdAt", "desc")
                );
                
                const snapshot = await getDocs(q);
                const fetchedFunds = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setFunds(fetchedFunds);
            } catch (error) {
                console.error("Error fetching funds:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFunds();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow">
                
                {/* 1. HERO SECTION */}
                <section className="relative w-full bg-brand-brown-dark overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32 px-6">
                    {/* Abstract Background */}
                    <div className="absolute inset-0 opacity-10">
                        <Image 
                            src="/pattern.png" 
                            alt="Background Pattern" 
                            fill 
                            className="object-cover"
                        />
                    </div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-brand-gold text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
                            <Heart className="w-3 h-3 fill-current" /> Save a Life Today
                        </div>
                        <h1 className="font-agency text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Invest in <span className="text-brand-gold">Humanity.</span><br />
                            Empower the <span className="text-white/80">Future.</span>
                        </h1>
                        <p className="font-lato text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Your generosity fuels education, provides essential resources, and builds resilience in our communities. 100% of your donation goes directly to the cause.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="#funds" className="px-8 py-4 bg-brand-gold text-white font-bold rounded-xl shadow-lg hover:bg-white hover:text-brand-brown-dark transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
                                Donate Now <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/about" className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                                How We Use Funds
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 2. TRUST INDICATORS */}
                <section className="py-12 bg-gray-50 border-b border-gray-100">
                    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Secure & Transparent</h3>
                                <p className="text-sm text-gray-500 mt-1">We use encrypted payment gateways and provide clear reporting on all fund usage.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Direct Impact</h3>
                                <p className="text-sm text-gray-500 mt-1">Our administrative costs are covered separately, maximizing the value of your gift.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-brand-sand/50 rounded-full flex items-center justify-center text-brand-brown-dark flex-shrink-0">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Community Focused</h3>
                                <p className="text-sm text-gray-500 mt-1">Rooted in local values, we solve real problems for real people in our community.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. FUNDS GRID */}
                <section id="funds" className="py-20 md:py-28 max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-agency text-4xl text-brand-brown-dark mb-4">Choose a Cause</h2>
                        <div className="w-20 h-1 bg-brand-gold mx-auto rounded-full"></div>
                        <p className="mt-4 text-gray-500 max-w-lg mx-auto">Select a specific fund to support, or contribute to our general mission.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader size="lg" />
                        </div>
                    ) : funds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* DYNAMIC FUNDS */}
                            {funds.map(fund => (
                                <FundCard key={fund.id} fund={fund} />
                            ))}
                        </div>
                    ) : (
                        // --- NO FUNDS AVAILABLE STATE ---
                        <div className="flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-3xl border border-gray-100 max-w-2xl mx-auto">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                                <Heart className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="font-agency text-2xl text-gray-600 mb-2">No Active Online Campaigns</h3>
                            <p className="text-gray-500 max-w-md mb-8 px-4">
                                We currently do not have specific funds listed for online payment. However, your support is vital to our mission. Please reach out to us directly to make a contribution.
                            </p>
                            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-brown-dark text-white font-bold rounded-xl hover:bg-brand-gold transition-colors shadow-md">
                                <MessageCircle className="w-4 h-4" /> Contact Team to Donate
                            </Link>
                        </div>
                    )}
                </section>

                {/* 4. OFFLINE DONATION CTA */}
                <section className="bg-brand-brown-dark text-white py-16">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="font-agency text-3xl mb-4">Prefer Bank Transfer or In-Kind Donations?</h2>
                        <p className="text-white/70 mb-8 font-lato">
                            We gratefully accept direct bank transfers, equipment, books, and other resources. 
                            Contact our support team for arrangement.
                        </p>
                        <Link href="/contact" className="inline-flex items-center gap-2 text-brand-gold font-bold hover:text-white transition-colors border-b-2 border-brand-gold pb-1 hover:border-white">
                            Contact Support Team <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}

// --- SUB-COMPONENT: FUND CARD ---
function FundCard({ fund }) {
    return (
        <div className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            
            {/* Image Header */}
            <div className="relative w-full h-56 bg-gray-200 overflow-hidden">
                <Image 
                    src={fund.coverImage || "/fallback.webp"} 
                    alt={fund.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Badge */}
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur text-brand-brown-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Active Fund
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-agency text-2xl text-brand-brown-dark mb-2 group-hover:text-brand-gold transition-colors">
                    {fund.title}
                </h3>
                {fund.tagline && (
                    <p className="text-xs font-bold text-brand-gold uppercase tracking-wide mb-4">
                        {fund.tagline}
                    </p>
                )}
                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {fund.description}
                </p>

                {/* Action */}
                <Link 
                    href={`/get-involved/donate/${fund.id}`} 
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-gray-50 text-gray-700 hover:bg-brand-brown-dark hover:text-white"
                >
                    <Heart className="w-4 h-4" />
                    Donate Now
                </Link>
            </div>
        </div>
    );
}