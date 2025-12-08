"use client";

import { useState } from 'react';

const partnershipTypes = [
  { title: "Institutional", desc: "For Quranic centers looking to adopt our innovation curriculum.", icon: "🏛️" },
  { title: "Technical", desc: "For tech firms providing infrastructure, software, or lab equipment.", icon: "⚙️" },
  { title: "Corporate Social", desc: "For businesses looking to fund rural outreach or scholarships.", icon: "🏢" }
];

export default function PartnerPage() {
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Initiating Partnership Request...");
    setTimeout(() => setStatus("Proposal Received. We will contact your office."), 2000);
  };

  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Hero Header */}
      <section className="pt-32 pb-16 px-6 bg-brand-brown-dark text-white">
        <div className="container mx-auto text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-2/3">
            <h1 className="font-agency text-5xl md:text-7xl uppercase tracking-widest mb-6">Strategic <br/><span className="text-brand-gold">Partnership</span></h1>
            <p className="font-lato text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl">
              Collaborate with Al-Asad Foundation to scale impact. We combine 
              traditional wisdom with institutional standards for sustainable results.
            </p>
          </div>
          <div className="md:w-1/3">
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-brand-gold flex items-center justify-center font-agency text-brand-gold text-2xl animate-pulse">
                Scale Together
             </div>
          </div>
        </div>
      </section>

      {/* Partnership Model Tiers */}
      <section className="container mx-auto px-6 -mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {partnershipTypes.map((type, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl card-shadow flex flex-col items-center text-center">
            <div className="text-4xl mb-4">{type.icon}</div>
            <h3 className="font-agency text-2xl text-brand-brown-dark uppercase mb-2">{type.title}</h3>
            <p className="font-lato text-brand-brown text-sm leading-relaxed">{type.desc}</p>
          </div>
        ))}
      </section>

      {/* Form Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-white rounded-[3rem] p-8 md:p-16 card-shadow border border-gray-100">
          <header className="mb-12 text-center">
            <h2 className="font-agency text-4xl text-brand-brown-dark uppercase">Partnership Proposal</h2>
            <p className="font-lato text-brand-brown mt-2">Formal request for institutional collaboration</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-lato">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-brand-brown-dark text-sm">Organization Name</label>
                <input type="text" required className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-brand-brown-dark text-sm">Website (URL)</label>
                <input type="url" placeholder="https://" className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-brand-brown-dark text-sm">Contact Person</label>
                <input type="text" required className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-brand-brown-dark text-sm">Email Address</label>
                <input type="email" required className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
            </div>

            <div className="flex flex-col gap-2 font-lato">
              <label className="font-bold text-brand-brown-dark text-sm">Scope of Collaboration</label>
              <textarea rows="6" required className="p-4 bg-brand-sand rounded-xl outline-none focus:ring-2 focus:ring-brand-gold resize-none" placeholder="Describe the proposed synergy..."></textarea>
            </div>

            <div className="text-center">
              <button className="bg-brand-brown-dark text-white font-bold font-lato px-12 py-4 rounded-full hover:bg-brand-gold shadow-lg transition-all tracking-widest">
                {status || "Submit Proposal"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
