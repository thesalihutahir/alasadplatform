"use client"; // Required because we will handle form states

import { useState } from 'react';
import Link from 'next/link';

export default function ScholarshipApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Logic for form submission would go here
    setTimeout(() => {
      alert("Application submitted successfully!");
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Top Navigation / Breadcrumbs */}
      <nav className="pt-24 pb-8 px-6 container mx-auto">
        <div className="flex items-center gap-2 text-sm font-lato text-brand-brown">
          <Link href="/" className="hover:text-brand-gold">Home</Link>
          <span>/</span>
          <Link href="/programs/scholarships" className="hover:text-brand-gold">Scholarships</Link>
          <span>/</span>
          <span className="text-brand-brown-dark font-bold">Apply</span>
        </div>
      </nav>

      <section className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 card-shadow">
          <header className="mb-10 border-b border-gray-100 pb-6">
            <h1 className="font-agency text-4xl text-brand-brown-dark uppercase tracking-tight">
              Scholarship Application Form
            </h1>
            <p className="font-lato text-brand-brown mt-2">
              Please ensure all information provided is accurate and verifiable.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Info */}
            <div>
              <h2 className="font-agency text-2xl text-brand-gold mb-4 uppercase">1. Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-lato">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-brand-brown-dark">Full Name</label>
                  <input type="text" required placeholder="John Doe" className="p-3 bg-brand-sand rounded-xl border-none focus:ring-2 focus:ring-brand-gold transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-brand-brown-dark">Email Address</label>
                  <input type="email" required placeholder="example@mail.com" className="p-3 bg-brand-sand rounded-xl border-none focus:ring-2 focus:ring-brand-gold transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-brand-brown-dark">Date of Birth</label>
                  <input type="date" required className="p-3 bg-brand-sand rounded-xl border-none focus:ring-2 focus:ring-brand-gold transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-brand-brown-dark">Gender</label>
                  <select required className="p-3 bg-brand-sand rounded-xl border-none focus:ring-2 focus:ring-brand-gold transition-all">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Academic Details */}
            <div>
              <h2 className="font-agency text-2xl text-brand-gold mb-4 uppercase">2. Quranic Study Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-lato">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-brand-brown-dark">Affiliated Quranic Center</label>
                  <input type="text" required placeholder="e.g. Al-Hikmah Center" className="p-3 bg-brand-sand rounded-xl border-none focus:ring-2 focus:ring-brand-gold transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-brand-brown-dark">Current Student ID</label>
                  <input type="text" placeholder="AL-12345" className="p-3 bg-brand-sand rounded-xl border-none focus:ring-2 focus:ring-brand-gold transition-all" />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-sm font-bold text-brand-brown-dark">Memorization Progress (Juz)</label>
                  <input type="number" min="0" max="30" placeholder="Number of Juz memorized" className="p-3 bg-brand-sand rounded-xl border-none focus:ring-2 focus:ring-brand-gold transition-all" />
                </div>
              </div>
            </div>

            {/* Section 3: Document Uploads */}
            <div>
              <h2 className="font-agency text-2xl text-brand-gold mb-4 uppercase">3. Supporting Documents</h2>
              <div className="bg-brand-sand p-6 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="flex flex-col gap-4 font-lato">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-brand-brown-dark">Academic Record / Recommendation Letter</label>
                    <input type="file" required className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-brand-brown-dark file:text-white hover:file:bg-brand-gold cursor-pointer" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-brand-brown-dark">Identity Proof (ID Card/Birth Cert)</label>
                    <input type="file" required className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-brand-brown-dark file:text-white hover:file:bg-brand-gold cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submission */}
            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
              <p className="text-xs font-lato text-brand-brown italic max-w-sm">
                By submitting this form, you certify that all inputs are true. Discovery of false documents leads to immediate disqualification.
              </p>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-brand-brown-dark text-white font-bold font-lato px-12 py-4 rounded-full hover:bg-brand-gold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Processing Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
