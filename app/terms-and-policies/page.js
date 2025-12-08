import Link from 'next/link';

export default function LegalPage() {
  const lastUpdated = "December 2024";

  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Legal Hero */}
      <section className="pt-32 pb-12 px-6 bg-white border-b border-gray-100">
        <div className="container mx-auto">
          <h1 className="font-agency text-5xl md:text-6xl text-brand-brown-dark uppercase tracking-tight">
            Legal & <span className="text-brand-gold">Compliance</span>
          </h1>
          <p className="font-lato text-brand-brown mt-4 text-sm uppercase font-bold tracking-widest">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-1 hidden lg:block">
          <nav className="sticky top-24 space-y-4 font-lato">
            <h3 className="text-brand-gold font-bold uppercase text-xs tracking-widest mb-6">Directory</h3>
            <Link href="#privacy" className="block text-brand-brown-dark font-bold hover:text-brand-gold transition-colors">Privacy Policy</Link>
            <Link href="#donors" className="block text-brand-brown hover:text-brand-gold transition-colors">Donor Terms</Link>
            <Link href="#scholarships" className="block text-brand-brown hover:text-brand-gold transition-colors">Scholarship Terms</Link>
            <Link href="#code-of-conduct" className="block text-brand-brown hover:text-brand-gold transition-colors">Volunteer Code</Link>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-16 max-w-3xl">
          {/* Section: Privacy */}
          <section id="privacy" className="font-lato">
            <h2 className="font-agency text-4xl text-brand-brown-dark uppercase mb-6">1. Privacy Policy</h2>
            <div className="text-brand-brown leading-relaxed space-y-4">
              <p>
                Al-Asad Education Foundation respects your privacy. We collect data solely to 
                process donations, scholarship applications, and provide foundation updates.
              </p>
              <h4 className="font-bold text-brand-brown-dark">Data Usage</h4>
              <p>
                We do not sell, rent, or trade your personal information. All financial data is 
                processed via SSL-secured third-party partners.
              </p>
            </div>
          </section>

          {/* Section: Donor Terms */}
          <section id="donors" className="font-lato">
            <h2 className="font-agency text-4xl text-brand-brown-dark uppercase mb-6">2. Donor Terms & Conditions</h2>
            <div className="text-brand-brown leading-relaxed space-y-4">
              <p>
                Donations made to designated projects are utilized 100% for that cause. 
                The foundation covers administrative costs through separate endowments.
              </p>
              <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-gold card-shadow">
                <h4 className="font-bold text-brand-brown-dark mb-2 uppercase">Refund Policy</h4>
                <p className="text-sm italic">
                  Since donations are applied immediately to outreach projects, they are 
                  non-refundable unless a transaction error occurs.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Scholarship Compliance */}
          <section id="scholarships" className="font-lato">
            <h2 className="font-agency text-4xl text-brand-brown-dark uppercase mb-6">3. Scholarship Terms</h2>
            <div className="text-brand-brown leading-relaxed space-y-4">
              <p>
                Recipients of Al-Asad Scholarships are expected to maintain academic 
                excellence and ethical standards. Misrepresentation of identity leads to 
                immediate revocation of aid.
              </p>
            </div>
          </section>

          {/* Compliance Contact */}
          <div className="bg-brand-brown-dark text-white p-10 rounded-3xl text-center">
            <h3 className="font-agency text-2xl uppercase mb-4">Questions about compliance?</h3>
            <p className="font-lato text-gray-300 text-sm mb-6">Contact our governance board for detailed legal inquiries.</p>
            <Link 
              href="/contact" 
              className="inline-block border border-brand-gold text-brand-gold font-bold px-8 py-2 rounded-full hover:bg-brand-gold hover:text-white transition-all"
            >
              Contact Board
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
