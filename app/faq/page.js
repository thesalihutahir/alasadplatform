"use client";

import { useState } from 'react';
import Link from 'next/link';

const faqData = [
  {
    category: "Scholarships",
    questions: [
      { q: "Who is eligible to apply for a scholarship?", a: "Eligibility is open to students currently enrolled in an affiliated Quranic center who show exceptional progress and financial need." },
      { q: "What documents are required for application?", a: "You will need a letter of recommendation, student ID, and academic records from your local center." },
    ]
  },
  {
    category: "Donations",
    questions: [
      { q: "Is my donation tax-deductible?", a: "Yes, the Al-Asad Foundation is a registered non-profit, and we provide tax receipts upon request." },
      { q: "Can I donate to a specific project?", a: "Absolutely. During the donation process, you can choose between our General Fund, Scholarship Fund, or Rural Outreach." },
    ]
  },
  {
    category: "Media & Press",
    questions: [
      { q: "Can I use foundation photos for my research?", a: "All gallery photos are available for educational use. For commercial use, please contact our Media Team." },
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* FAQ Hero */}
      <section className="pt-32 pb-16 px-6 bg-brand-brown-dark text-white text-center">
        <div className="container mx-auto">
          <h1 className="font-agency text-5xl md:text-7xl uppercase tracking-widest mb-4">Support <span className="text-brand-gold">Center</span></h1>
          <p className="font-lato text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Quick answers to our most common questions. If you can't find what you're 
            looking for, feel free to reach out to our team.
          </p>
        </div>
      </section>

      {/* Accordion List */}
      <section className="container mx-auto px-6 -mt-10 max-w-4xl relative z-10">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 card-shadow">
          {faqData.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-10 last:mb-0">
              <h2 className="font-agency text-2xl text-brand-gold uppercase tracking-widest border-b border-gray-100 pb-2 mb-6">
                {group.category}
              </h2>
              
              <div className="space-y-4">
                {group.questions.map((faq, faqIdx) => {
                  const itemIndex = `${groupIdx}-${faqIdx}`;
                  const isOpen = openIndex === itemIndex;
                  
                  return (
                    <div key={faqIdx} className="border-b border-gray-50 last:border-none">
                      <button 
                        onClick={() => toggleAccordion(itemIndex)}
                        className="w-full py-5 flex justify-between items-center text-left group"
                      >
                        <span className="font-lato font-bold text-brand-brown-dark group-hover:text-brand-gold transition-colors pr-4">
                          {faq.q}
                        </span>
                        <span className={`text-brand-gold text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                          +
                        </span>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-5' : 'max-h-0'}`}>
                        <p className="font-lato text-brand-brown leading-relaxed text-sm">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Contact CTA */}
      <section className="container mx-auto px-6 mt-16 text-center">
        <div className="bg-brand-brown-dark rounded-3xl p-10 md:p-16 text-white featured-background border-none relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-agency text-3xl mb-4 uppercase tracking-widest">Still have questions?</h3>
            <p className="font-lato text-gray-300 mb-8 max-w-md mx-auto">
              Our support team usually responds within 24 hours during business days.
            </p>
            <Link 
              href="/contact" 
              className="bg-brand-gold text-white font-bold font-lato px-10 py-3 rounded-full hover:scale-105 transition-all inline-block shadow-lg"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
