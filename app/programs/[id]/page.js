"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
// Firebase
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

import { 
    Calendar, 
    MapPin, 
    Users, 
    ArrowLeft, 
    CheckCircle, 
    Share2, 
    Target,
    Layers
} from 'lucide-react';

export default function ProgramDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [program, setProgram] = useState(null);
    const [relatedPrograms, setRelatedPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper: Format Date
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // 1. Fetch Program Data
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // A. Main Program
                const docRef = doc(db, "programs", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setProgram(data);

                    // B. Fetch Related (Same Category, Active, Not current)
                    const q = query(
                        collection(db, "programs"),
                        where("category", "==", data.category),
                        where("status", "==", "Active"),
                        limit(3)
                    );
                    const relatedSnap = await getDocs(q);
                    const related = relatedSnap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(p => p.id !== id); // Exclude current
                    
                    setRelatedPrograms(related);
                } else {
                    // Not Found
                    router.push('/programs'); 
                }
            } catch (error) {
                console.error("Error details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader size="lg" /></div>;
    if (!program) return null; // Handled by redirect

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />

            <main className="flex-grow pb-20">

                {/* 1. HERO HEADER */}
                <div className="relative w-full h-[60vh] md:h-[70vh] bg-brand-brown-dark">
                    <Image 
                        src={program.coverImage || "/fallback.webp"} 
                        alt={program.title} 
                        fill 
                        className="object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 lg:px-24 pb-12 md:pb-16 max-w-7xl mx-auto">
                        {/* Breadcrumb / Back */}
                        <Link href="/programs" className="inline-flex items-center text-white/70 hover:text-brand-gold mb-6 transition-colors text-sm font-bold uppercase tracking-wider">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Programs
                        </Link>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="bg-brand-gold text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {program.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                program.status === 'Active' ? 'bg-green-500 text-white' : 
                                program.status === 'Upcoming' ? 'bg-yellow-500 text-white' : 
                                'bg-gray-500 text-white'
                            }`}>
                                {program.status}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight drop-shadow-lg">
                            {program.title}
                        </h1>

                        {/* Metadata Bar */}
                        <div className="flex flex-wrap items-center gap-6 md:gap-10 text-white/90 text-sm md:text-base font-medium">
                            {program.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-brand-gold" /> {program.location}
                                </div>
                            )}
                            {program.beneficiaries && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-brand-gold" /> {program.beneficiaries}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-brand-gold" /> Published: {formatDate(program.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CONTENT LAYOUT */}
                <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16">

                    {/* LEFT: MAIN ARTICLE */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-t-3xl p-6 md:p-0">
                            
                            {/* Summary Box */}
                            <div className="bg-brand-sand/20 border-l-4 border-brand-gold p-6 md:p-8 rounded-r-xl mb-10">
                                <h3 className="font-agency text-2xl text-brand-brown-dark mb-2">Program Summary</h3>
                                <p className="text-lg text-brand-brown font-medium italic leading-relaxed">
                                    "{program.excerpt}"
                                </p>
                            </div>

                            {/* Full Content (Rich Text Simulation) */}
                            <div className="prose prose-lg text-gray-600 max-w-none font-lato leading-loose whitespace-pre-wrap">
                                {program.content}
                            </div>

                            {/* Share / Action Bar */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex gap-4">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Share:</span>
                                    {/* Social Share Placeholders (Functionality to be added later if needed) */}
                                    <button className="p-2 bg-gray-50 rounded-full hover:bg-brand-gold hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
                                </div>
                                
                                {program.status === 'Active' && (
                                    <Link 
                                        href="/get-involved/donate"
                                        className="px-8 py-3 bg-brand-brown-dark text-white font-agency text-xl rounded-xl hover:bg-brand-gold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        Support This Cause
                                    </Link>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* RIGHT: SIDEBAR */}
                    <div className="lg:col-span-1 space-y-8 pt-8 lg:pt-0">
                        
                        {/* Key Pillars Widget */}
                        <div className="bg-brand-sand/30 p-8 rounded-3xl border border-brand-gold/10">
                            <h3 className="font-agency text-2xl text-brand-brown-dark mb-4 border-b border-brand-brown-dark/10 pb-2">Impact Areas</h3>
                            <ul className="space-y-3">
                                {['Education', 'Welfare', 'Sustainability', 'Faith'].map((tag, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-brand-brown">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> {tag}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Related Programs Widget */}
                        {relatedPrograms.length > 0 && (
                            <div>
                                <h3 className="font-agency text-2xl text-brand-brown-dark mb-6 pl-2 border-l-4 border-brand-gold">
                                    See Also
                                </h3>
                                <div className="space-y-6">
                                    {relatedPrograms.map((related) => (
                                        <Link href={`/programs/${related.id}`} key={related.id} className="group flex gap-4 items-start">
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                                                <Image src={related.coverImage || "/fallback.webp"} alt={related.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-brand-brown-dark text-sm leading-tight mb-1 group-hover:text-brand-gold transition-colors line-clamp-2">
                                                    {related.title}
                                                </h4>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                                    {related.status}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Volunteer Call */}
                        <div className="bg-brand-brown-dark p-8 rounded-3xl text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold opacity-10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                            <h3 className="font-agency text-2xl mb-3 relative z-10">Join the Team</h3>
                            <p className="text-sm text-white/70 mb-6 relative z-10">
                                Be a part of this initiative. Your time and skills can make a difference.
                            </p>
                            <Link href="/get-involved/volunteer" className="inline-block w-full py-3 bg-white text-brand-brown-dark font-bold rounded-xl hover:bg-brand-gold hover:text-white transition-colors relative z-10">
                                Volunteer Now
                            </Link>
                        </div>

                    </div>

                </div>

            </main>
            <Footer />
        </div>
    );
}
