"use client";

import { useState } from 'react';

export default function DonatePage() {
  const [amount, setAmount] = useState('50');
  const [frequency, setFrequency] = useState('once');

  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Header */}
      <section className="pt-32 pb-16 px-6 bg-brand-brown-dark text-white text-center">
        <div className="container mx-auto">
          <h1 className="font-agency text-5xl md:text-7xl uppercase tracking-widest mb-4">Support the <span className="text-brand-gold">Impact</span></h1>
          <p className="font-lato text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Your contributions provide education, clean water, and community growth. 
            Choose how you want to make a difference today.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 -mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: Donation Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 card-shadow">
          <h2 className="font-agency text-3xl text-brand-brown-dark uppercase mb-8">Choose Amount</h2>
          
          {/* Frequency Toggle */}
          <div className="flex bg-brand-sand p-1 rounded-full w-fit mb-8">
            <button 
              onClick={() => setFrequency('once')}
              className={`px-8 py-2 rounded-full font-lato text-sm font-bold transition-all ${frequency === 'once' ? 'bg-brand-gold text-white shadow-md' : 'text-brand-brown'}`}
            >
              Give Once
            </button>
            <button 
              onClick={() => setFrequency('monthly')}
              className={`px-8 py-2 rounded-full font-lato text-sm font-bold transition-all ${frequency === 'monthly' ? 'bg-brand-gold text-white shadow-md' : 'text-brand-brown'}`}
            >
              Monthly
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['25', '50', '100', '250'].map((val) => (
              <button 
                key={val}
                onClick={() => setAmount(val)}
                className={`p-4 rounded-2xl font-agency text-2xl border-2 transition-all ${amount === val ? 'bg-brand-brown-dark text-white border-brand-brown-dark' : 'bg-white text-brand-brown-dark border-gray-100 hover:border-brand-gold'}`}
              >
                ${val}
              </button>
            ))}
            <input 
              type="text" 
              placeholder="Custom" 
              className="p-4 rounded-2xl bg-brand-sand font-lato text-center outline-none focus:ring-2 focus:ring-brand-gold" 
            />
          </div>

          {/* Allocation Selection */}
          <h2 className="font-agency text-2xl text-brand-brown-dark uppercase mb-4">Direct Your Gift</h2>
          <div className="space-y-4 font-lato mb-8">
            {['General Fund', 'Scholarship Fund', 'Water & Health Projects'].map((fund) => (
              <label key={fund} className="flex items-center gap-4 p-4 bg-brand-sand rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input type="radio" name="allocation" defaultChecked={fund === 'General Fund'} className="accent-brand-gold w-5 h-5" />
                <span className="font-bold text-brand-brown-dark">{fund}</span>
              </label>
            ))}
          </div>

          <button className="w-full bg-brand-gold text-white font-bold font-lato text-lg py-5 rounded-full hover:brightness-110 transition-all shadow-xl uppercase tracking-widest">
            Proceed to Payment
          </button>
        </div>

        {/* Right: Side Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 card-shadow border-b-4 border-brand-gold">
            <h3 className="font-agency text-2xl text-brand-brown-dark uppercase mb-4">Bank Transfer</h3>
            <p className="font-lato text-xs text-brand-brown mb-6 leading-relaxed">
              Prefer to donate via direct bank transfer? Use our official local account details:
            </p>
            <div className="font-lato bg-brand-sand p-4 rounded-xl space-y-2 text-sm">
              <p><span className="font-bold">Bank:</span> Al-Hikmah Islamic Bank</p>
              <p><span className="font-bold">Acc:</span> 100767676</p>
              <p><span className="font-bold">Name:</span> Al-Asad Foundation</p>
            </div>
          </div>

          <div className="bg-brand-brown-dark text-white rounded-3xl p-8 card-shadow">
            <h3 className="font-agency text-2xl text-brand-gold uppercase mb-4">Trust Guarantee</h3>
            <ul className="space-y-4 font-lato text-sm text-gray-300">
              <li className="flex gap-3"><span>✅</span> SSL Secured Payment</li>
              <li className="flex gap-3"><span>✅</span> No Admin Deductions</li>
              <li className="flex gap-3"><span>✅</span> Tax Receipt Provided</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
