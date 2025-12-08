import Link from 'next/link';

const programs = [
  {
    title: 'Scholarships',
    description: 'Providing educational opportunities and financial support for promising students through the Quran.',
    path: '/programs/scholarships',
    icon: '🎓',
  },
  {
    title: 'Community Development',
    description: 'Empowering local communities through sustainable projects and social welfare initiatives.',
    path: '/programs/community-development',
    icon: '🤝',
  },
  {
    title: 'Training & Innovation',
    description: 'Modern skill acquisition and innovative approaches to traditional Islamic learning.',
    path: '/programs/training-and-innovation',
    icon: '💡',
  },
];

export default function ProgramsPage() {
  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Header Space - Adjust padding if your Header is fixed */}
      <div className="pt-24 pb-12 px-6 text-center">
        <h1 className="font-agency text-5xl md:text-6xl text-brand-brown-dark uppercase tracking-wide">
          Our Programs
        </h1>
        <p className="font-lato text-brand-brown max-w-2xl mx-auto mt-4 text-lg">
          Guiding through Quran, empowering communities. Explore our key focus areas.
        </p>
      </div>

      {/* Program Pillars Grid */}
      <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {programs.map((program) => (
          <div 
            key={program.title}
            className="bg-white rounded-2xl p-8 card-shadow flex flex-col items-center text-center transition-transform hover:scale-[1.02]"
          >
            <div className="text-5xl mb-6">{program.icon}</div>
            <h2 className="font-agency text-3xl text-brand-brown-dark mb-4 uppercase">
              {program.title}
            </h2>
            <p className="font-lato text-brand-brown mb-8 flex-grow">
              {program.description}
            </p>
            <Link 
              href={program.path}
              className="bg-brand-gold text-white font-lato px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Learn More
            </Link>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 mt-20 text-center">
        <div className="bg-brand-brown-dark text-white rounded-3xl p-10 featured-background overflow-hidden relative">
           <div className="relative z-10">
            <h3 className="font-agency text-3xl mb-4">WANT TO SUPPORT A PROGRAM?</h3>
            <p className="font-lato text-gray-200 mb-6 max-w-md mx-auto">
              Your donations help us keep these programs alive and impactful for the community.
            </p>
            <Link 
              href="/get-involved/donate"
              className="inline-block border-2 border-brand-gold text-brand-gold font-bold px-8 py-2 rounded-full hover:bg-brand-gold hover:text-white transition-all"
            >
              Support Us
            </Link>
           </div>
        </div>
      </section>
    </main>
  );
}
