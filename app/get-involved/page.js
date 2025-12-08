import Link from 'next/link';

const involvementPaths = [
  {
    title: "Make a Donation",
    desc: "Your financial support powers our scholarships and rural community projects.",
    path: "/get-involved/donate",
    icon: "💰",
    cta: "Donate Now"
  },
  {
    title: "Become a Volunteer",
    desc: "Lend your professional skills or time to assist our students and outreach teams.",
    path: "/get-involved/volunteer",
    icon: "✋",
    cta: "Join the Team"
  },
  {
    title: "Partner With Us",
    desc: "Collaborate with us as an institution, NGO, or technical partner for greater impact.",
    path: "/get-involved/partner-with-us",
    icon: "🤝",
    cta: "Start Partnership"
  }
];

export default function GetInvolvedPage() {
  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-brand-brown-dark text-white text-center">
        <div className="container mx-auto">
          <h1 className="font-agency text-5xl md:text-7xl uppercase tracking-widest mb-6 text-brand-gold">
            Join the Mission
          </h1>
          <p className="font-lato text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
            There are many ways to support the Al-Asad Foundation. Whether you give 
            resources, expertise, or time, you are helping build a brighter future.
          </p>
        </div>
      </section>

      {/* Involvement Grid */}
      <section className="container mx-auto px-6 -mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {involvementPaths.map((path, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-10 card-shadow flex flex-col items-center text-center transition-transform hover:-translate-y-2">
            <div className="text-5xl mb-6">{path.icon}</div>
            <h2 className="font-agency text-3xl text-brand-brown-dark uppercase mb-4">{path.title}</h2>
            <p className="font-lato text-brand-brown mb-8 flex-grow leading-relaxed">
              {path.desc}
            </p>
            <Link 
              href={path.path}
              className="bg-brand-gold text-white font-bold font-lato px-8 py-3 rounded-full hover:brightness-110 shadow-lg transition-all"
            >
              {path.cta}
            </Link>
          </div>
        ))}
      </section>

      {/* Impact Statement */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto border-t-2 border-brand-gold pt-12">
           <blockquote className="font-agency text-3xl md:text-4xl text-brand-brown-dark uppercase italic leading-tight mb-8">
             "The best of people are those that bring most benefit to the rest of mankind."
           </blockquote>
           <p className="font-lato text-brand-brown tracking-widest text-sm uppercase">Foundational Principle</p>
        </div>
      </section>

      {/* Featured Transparency Highlight */}
      <section className="container mx-auto px-6 mb-20">
        <div className="bg-brand-brown-dark text-white p-10 md:p-16 rounded-[3rem] flex flex-col md:flex-row items-center gap-12 featured-background border-none overflow-hidden relative">
          <div className="md:w-1/2">
            <h3 className="font-agency text-4xl mb-6 uppercase">Total Transparency</h3>
            <p className="font-lato text-gray-300 leading-relaxed">
              We provide monthly financial reports to our partners and donors. 
              100% of your community-designated donations go directly to 
              field projects and scholarship payouts.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
             <div className="w-32 h-32 border-4 border-brand-gold rounded-full flex items-center justify-center text-brand-gold font-agency text-3xl">
                100%
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}
