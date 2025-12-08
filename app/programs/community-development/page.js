import Link from 'next/link';

const projects = [
  {
    title: "Water & Sanitation",
    status: "Active",
    desc: "Providing clean water access to rural Quranic centers and surrounding villages.",
    image: "/water-project.jpg" // Placeholder path
  },
  {
    title: "Health Outreach",
    status: "Completed",
    desc: "Collaborative medical camps providing basic checkups and medicine to the elderly.",
    image: "/health-project.jpg"
  },
  {
    title: "Food Security",
    status: "Ongoing",
    desc: "Monthly distribution of essential food items to vulnerable families within the community.",
    image: "/food-project.jpg"
  }
];

export default function CommunityDevelopmentPage() {
  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Using your vision-overlay pattern if applicable, or a solid brand color */}
        <div className="absolute inset-0 bg-brand-brown-dark opacity-90 z-0"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="font-agency text-5xl md:text-7xl text-white uppercase tracking-tighter">
            Community Development
          </h1>
          <p className="font-lato text-brand-gold text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            Beyond the classroom: Strengthening the social fabric that supports our community.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="font-agency text-4xl text-brand-brown-dark mb-6">OUR PHILOSOPHY</h2>
        <p className="font-lato text-brand-brown max-w-3xl mx-auto leading-relaxed text-lg">
          We believe that spiritual growth is best nurtured in a stable environment. Our development 
          initiatives focus on the basic needs of life—health, water, and food security—ensuring 
          that students and families can focus on their growth and education without hardship.
        </p>
      </section>

      {/* Projects Grid */}
      <section className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10">
          <h3 className="font-agency text-3xl text-brand-brown-dark uppercase">Current Projects</h3>
          <div className="h-1 bg-brand-gold w-24 mb-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-3xl overflow-hidden card-shadow group">
              {/* Image Placeholder with Brand Color */}
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-brown-dark/20 group-hover:bg-transparent transition-colors duration-300"></div>
                <div className="absolute top-4 left-4 bg-brand-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {project.status}
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-agency text-2xl text-brand-brown-dark mb-2">{project.title}</h4>
                <p className="font-lato text-brand-brown text-sm mb-6 leading-relaxed">
                  {project.desc}
                </p>
                <button className="text-brand-gold font-bold text-sm uppercase tracking-widest hover:translate-x-2 transition-transform inline-flex items-center">
                  View Case Study <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="container mx-auto px-6 mt-12">
        <div className="bg-brand-brown-dark rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-agency text-3xl text-white uppercase mb-2">Partner with us in development</h3>
            <p className="font-lato text-gray-300">We collaborate with NGOs and local leaders for maximum impact.</p>
          </div>
          <Link 
            href="/get-involved/partner-with-us" 
            className="whitespace-nowpx bg-brand-gold text-white font-bold px-8 py-4 rounded-full hover:scale-105 transition-all"
          >
            Become a Partner
          </Link>
        </div>
      </section>
    </main>
  );
}
