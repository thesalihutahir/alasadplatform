"use client";

import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setStatus("Submitting...");
    setTimeout(() => setStatus("Success! We'll be in touch soon."), 1500);
  };

  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Hero Header */}
      <section className="pt-32 pb-16 px-6 bg-brand-brown-dark text-white text-center">
        <div className="container mx-auto">
          <h1 className="font-agency text-5xl md:text-7xl uppercase tracking-widest mb-4">Get in <span className="text-brand-gold">Touch</span></h1>
          <p className="font-lato text-gray-300 max-w-2xl mx-auto text-lg">
            Have a question about our programs or wish to visit our center? 
            Our team is ready to assist you.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 -mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 card-shadow">
          <h2 className="font-agency text-3xl text-brand-brown-dark uppercase mb-8">Send a Message</h2>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-lato">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-brand-brown">Full Name</label>
                <input type="text" required placeholder="John Doe" className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-brand-brown">Email Address</label>
                <input type="email" required placeholder="john@example.com" className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
            </div>
            <div className="flex flex-col gap-2 font-lato">
              <label className="text-sm font-bold text-brand-brown">Subject</label>
              <select className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold">
                <option>General Inquiry</option>
                <option>Scholarship Question</option>
                <option>Partnership Proposal</option>
                <option>Media Team</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 font-lato">
              <label className="text-sm font-bold text-brand-brown">Message</label>
              <textarea rows="5" required placeholder="How can we help you?" className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold resize-none"></textarea>
            </div>
            <button className="bg-brand-gold text-white font-bold font-lato px-12 py-4 rounded-full hover:brightness-110 transition-all shadow-lg">
              {status || "Send Message"}
            </button>
          </form>
        </div>

        {/* Right: Info Cards */}
        <div className="space-y-6">
          {/* Official Contact */}
          <div className="bg-white rounded-3xl p-8 card-shadow border-t-4 border-brand-brown-dark">
            <h3 className="font-agency text-2xl text-brand-brown-dark uppercase mb-4">Official Channels</h3>
            <div className="space-y-4 font-lato text-brand-brown text-sm">
              <p className="flex items-start gap-3">
                <span className="text-brand-gold">📍</span> 12 Al-Asad Way, Academic District, Katsina, Nigeria.
              </p>
              <p className="flex items-center gap-3">
                <span className="text-brand-gold">📞</span> +234 (0) 800-AL-ASAD
              </p>
              <p className="flex items-center gap-3">
                <span className="text-brand-gold">✉️</span> info@al-asad.org
              </p>
            </div>
          </div>

          {/* Media Team specific */}
          <div className="bg-brand-brown-dark rounded-3xl p-8 card-shadow text-white">
            <h3 className="font-agency text-2xl text-brand-gold uppercase mb-4">Media Team</h3>
            <p className="font-lato text-xs text-gray-300 leading-relaxed mb-6">
              For press inquiries, high-res assets, or interview requests with our leadership team.
            </p>
            <a href="mailto:media@al-asad.org" className="font-bold font-lato text-sm text-brand-gold underline underline-offset-4 decoration-white/20 hover:decoration-brand-gold transition-all">
              media@al-asad.org
            </a>
          </div>

          {/* Office Hours */}
          <div className="bg-white rounded-3xl p-8 card-shadow">
            <h3 className="font-agency text-xl text-brand-brown-dark uppercase mb-4">Visiting Hours</h3>
            <ul className="font-lato text-xs text-brand-brown space-y-2">
              <li className="flex justify-between"><span>Mon - Thu</span> <span className="font-bold">9am - 4pm</span></li>
              <li className="flex justify-between"><span>Friday</span> <span className="font-bold">9am - 12pm</span></li>
              <li className="flex justify-between"><span>Sat - Sun</span> <span className="font-bold">Closed</span></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
