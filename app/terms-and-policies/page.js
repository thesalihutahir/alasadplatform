"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LegalPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />

            <main className="flex-grow pt-10 pb-16 px-6">
                
                {/* Page Title */}
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="font-agency text-4xl text-brand-brown-dark mb-2">Terms & Policies</h1>
                    <p className="font-lato text-brand-brown text-sm">Last Updated: December 2024</p>
                </div>

                {/* Content Container */}
                <div className="max-w-3xl mx-auto space-y-10">
                    
                    {/* Section 1 */}
                    <section>
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-3 border-b border-gray-100 pb-2">
                            1. Introduction
                        </h2>
                        <p className="font-lato text-sm text-brand-brown leading-relaxed text-justify">
                            Welcome to the Al-Asad Education Foundation platform. By accessing our website, you agree to comply with these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-3 border-b border-gray-100 pb-2">
                            2. Privacy Policy
                        </h2>
                        <p className="font-lato text-sm text-brand-brown leading-relaxed text-justify mb-3">
                            Your privacy is important to us. It is Al-Asad Education Foundation's policy to respect your privacy regarding any information we may collect from you across our website.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 font-lato text-sm text-brand-brown">
                            <li>We only ask for personal information when we truly need it to provide a service (e.g., donation processing, volunteer registration).</li>
                            <li>We collect it by fair and lawful means, with your knowledge and consent.</li>
                            <li>We do not share any personally identifying information publicly or with third-parties, except when required to by law.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-3 border-b border-gray-100 pb-2">
                            3. Donation & Refund Policy
                        </h2>
                        <p className="font-lato text-sm text-brand-brown leading-relaxed text-justify">
                            All donations made to Al-Asad Education Foundation are utilized for the specific programs mentioned or for the general welfare of the community. We practice strict financial transparency. Refunds for donations are generally not provided, except in cases of technical error or duplicate transactions, which must be reported within 7 days.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-3 border-b border-gray-100 pb-2">
                            4. Intellectual Property
                        </h2>
                        <p className="font-lato text-sm text-brand-brown leading-relaxed text-justify">
                            The materials on Al-Asad Education Foundation's website (including lectures, articles, and media) are protected by copyright. Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-3 border-b border-gray-100 pb-2">
                            5. Contact Us
                        </h2>
                        <p className="font-lato text-sm text-brand-brown leading-relaxed">
                            If you have any questions about our Terms and Policies, please contact us at <span className="font-bold text-brand-gold">info@alasadfoundation.org</span>.
                        </p>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}
