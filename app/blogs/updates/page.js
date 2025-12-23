"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calendar, ArrowRight, Bell, Clock, Filter } from 'lucide-react';

export default function UpdatesPage() {

    // Mock "Featured" Update (The big news)
    const featured = {
        id: 'grad-2024',
        title: "5th Annual Ma'ahad Graduation Ceremony Announced",
        excerpt: "We are pleased to announce the official date for this year's graduation. Over 30 Huffaz will be celebrating their completion of the Holy Qur'an.",
        date: "20",
        month: "DEC",
        image: "/hero.jpg",
        category: "Event"
    };

    // Mock Data for News Feed
    const updates = [
        {
            id: 1,
            title: "Foundation launches new scholarship scheme for orphans",
            excerpt: "Applications are now open for the 2025 academic session. Eligible families are encouraged to apply at the secretariat.",
            day: "15",
            month: "DEC",
            category: "Announcement"
        },
        {
            id: 2,
            title: "Community Water Project Phase 2 Completed",
            excerpt: "Alhamdulillah, the borehole project in Kabala Doki has been commissioned and is now serving over 200 households.",
            day: "10",
            month: "NOV",
            category: "Project Update"
        },
        {
            id: 3,
            title: "Ramadan Food Bank: Call for Volunteers",
            excerpt: "We are recruiting 50 volunteers to help package and distribute food items for the upcoming Ramadan welfare program.",
            day: "05",
            month: "NOV",
            category: "Volunteer"
        },
        {
            id: 4,
            title: "Visit from the State Ministry of Education",
            excerpt: "Officials visited our Ma'ahad to inspect facilities and discuss partnership opportunities for integrating western curriculum.",
            day: "28",
            month: "OCT",
            category: "Official Visit"
        },
        {
            id: 5,
            title: "Weekly Fiqh Classes Resuming",
            excerpt: "Sheikh Muneer's weekly class on 'Bulugh Al-Maram' will resume this Saturday after the semester break.",
            day: "15",
            month: "OCT",
            category: "Education"
        },
        {
            id: 6,
            title: "Q3 Financial Report Published",
            excerpt: "In the spirit of transparency, we have released our quarterly report detailing donations received and projects executed.",
            day: "01",
            month: "OCT",
            category: "Report"
        }
    ];

    const years = ["2024", "2023", "Archive"];

    return (
        <div className="min-h-screen flex flex-col bg-white font-lato">
            <Header />
            <main className="flex-grow pb-16">

                {/* 1. HERO SECTION */}
                <section className="w-full relative bg-white mb-8 md:mb-16">
                    <div className="relative w-full aspect-[2.5/1] md:aspect-[3.5/1] lg:aspect-[4/1]">
                        <Image 
                            src="/hero.jpg" 
                            alt="News Hero" 
                            fill 
                            className="object-cover object-center" 
                            priority 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
                    </div>
                    <div className="relative -mt-16 md:-mt-32 text-center px-6 z-10 max-w-4xl mx-auto">
                        <h1 className="font-agency text-4xl md:text-6xl lg:text-7xl text-brand-brown-dark mb-4 drop-shadow-md">
                            News & Updates
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-brand-gold mx-auto rounded-full mb-6"></div>
                        <p className="font-lato text-brand-brown text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                            Stay informed about the foundation's activities, upcoming events, and project milestones.
                        </p>
                    </div>
                </section>

                {/* 2. FEATURED UPDATE (Banner) */}
                <section className="px-6 md:px-12 lg:px-24 mb-16 md:mb-20 max-w-7xl mx-auto">
                    <div className="bg-brand-brown-dark rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                        {/* Image Side */}
                        <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto">
                            <Image 
                                src={featured.image} 
                                alt={featured.title} 
                                fill 
                                className="object-cover" 
                            />
                            <div className="absolute top-4 left-4 bg-brand-gold text-white text-xs font-bold px-3 py-1 rounded shadow-sm uppercase tracking-widest flex items-center gap-2">
                                <Bell className="w-3 h-3 fill-current" /> Breaking News
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="p-8 md:p-12 text-white flex flex-col justify-center md:w-1/2">
                            <div className="flex items-center gap-2 mb-4 opacity-80">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-bold">{featured.date} {featured.month}, 2024</span>
                            </div>
                            <h2 className="font-agency text-3xl md:text-5xl leading-tight mb-4">
                                {featured.title}
                            </h2>
                            <p className="font-lato text-white/80 text-sm md:text-lg mb-8 leading-relaxed">
                                {featured.excerpt}
                            </p>
                            <Link href="#" className="inline-flex items-center gap-2 text-brand-gold font-bold uppercase tracking-widest hover:text-white transition-colors group">
                                Read Full Story <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 3. FILTER / TIMELINE BAR */}
                <section className="px-6 md:px-12 lg:px-24 mb-8 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-brand-brown-dark" />
                            <h3 className="font-agency text-2xl text-brand-brown-dark">Recent Activity</h3>
                        </div>
                        
                        {/* Desktop Year Filter */}
                        <div className="hidden md:flex gap-2">
                            {years.map((year, idx) => (
                                <button key={idx} className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${idx === 0 ? 'bg-brand-sand text-brand-brown-dark' : 'text-gray-400 hover:text-brand-brown-dark'}`}>
                                    {year}
                                </button>
                            ))}
                        </div>
                        
                        {/* Mobile Filter Icon */}
                        <button className="md:hidden text-gray-400">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* 4. NEWS GRID (Mobile: List / Desktop: Grid) */}
                <section className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {updates.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl p-6 flex flex-row md:flex-col gap-5 items-start shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all group h-full">
                                
                                {/* Date Box (Left on Mobile, Top on Desktop) */}
                                <div className="flex-shrink-0 w-16 md:w-full md:flex md:items-center md:justify-between md:border-b md:border-gray-100 md:pb-4 md:mb-2">
                                    <div className="bg-brand-sand/50 rounded-xl flex flex-col items-center justify-center py-2 px-1 md:px-4 md:py-3 text-brand-brown-dark md:flex-row md:gap-2">
                                        <span className="font-agency text-2xl md:text-3xl leading-none font-bold">{item.day}</span>
                                        <span className="font-lato text-[10px] md:text-xs uppercase font-bold text-brand-gold">{item.month}</span>
                                    </div>
                                    <span className="hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                                        {item.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-grow">
                                    <span className="md:hidden text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        {item.category}
                                    </span>
                                    <h3 className="font-agency text-xl md:text-2xl text-brand-brown-dark leading-tight mb-3 group-hover:text-brand-gold transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="font-lato text-xs md:text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3 flex-grow">
                                        {item.excerpt}
                                    </p>
                                    <span className="text-[10px] md:text-xs font-bold text-brand-brown-dark flex items-center gap-1 group-hover:underline decoration-brand-gold underline-offset-4 mt-auto">
                                        See Details <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. CTA / SUBSCRIBE */}
                <section className="px-6 md:px-12 lg:px-24 mb-8 max-w-4xl mx-auto text-center">
                    <p className="text-sm text-gray-400 mb-4">Don't miss out on important announcements.</p>
                    <button className="px-8 py-3 border border-brand-brown-dark/20 rounded-full text-brand-brown-dark font-agency hover:bg-brand-brown-dark hover:text-white transition-colors">
                        View Archive
                    </button>
                </section>

            </main>
            <Footer />
        </div>
    );
}
