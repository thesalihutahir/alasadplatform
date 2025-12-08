import Link from 'next/link';

const updates = [
  {
    title: "Phase 1 of Water Project Completed in Katsina",
    desc: "Over 200 families now have access to clean, solar-powered water systems.",
    date: "Dec 05, 2024",
    location: "Katsina, Nigeria",
    type: "Project Success"
  },
  {
    title: "New Intake: 50 Students Awarded Scholarships",
    desc: "Our selection committee has finalized the list for the upcoming academic year.",
    date: "Nov 28, 2024",
    location: "Lagos Hub",
    type: "Academic"
  },
  {
    title: "Al-Asad Foundation Partners with Global Tech NGO",
    desc: "A new collaboration to bring digital literacy workshops to rural Quranic students.",
    date: "Nov 15, 2024",
    location: "Headquarters",
    type: "Partnership"
  }
];

export default function UpdatesPage() {
  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto">
          <Link href="/blogs" className="text-brand-gold font-bold font-lato hover:underline mb-4 inline-block">
            ← Back to Blog Hub
          </Link>
          <h1 className="font-agency text-5xl md:text-6xl text-brand-brown-dark uppercase tracking-tight">
            Latest <span className="text-brand-gold">Updates</span>
          </h1>
          <p className="font-lato text-brand-brown mt-2 text-lg">
            Real-time news and progress reports from our centers across the globe.
          </p>
        </div>
      </section>

      {/* Timeline Feed */}
      <section className="container mx-auto px-6 relative">
        {/* Vertical Line for Timeline */}
        <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -z-10"></div>

        <div className="space-y-12">
          {updates.map((update, index) => (
            <div 
              key={index} 
              className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline Marker */}
              <div className="absolute left-10 md:left-1/2 -ml-3 w-6 h-6 rounded-full bg-brand-gold border-4 border-white shadow-md"></div>

              {/* Content Card */}
              <div className="w-full md:w-[45%] bg-white p-6 md:p-8 rounded-3xl card-shadow group hover:border-brand-gold border-2 border-transparent transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-brand-gold font-bold font-lato text-xs uppercase tracking-widest">{update.type}</span>
                  <span className="text-brand-brown/60 text-xs font-lato">{update.date}</span>
                </div>
                <h3 className="font-agency text-2xl text-brand-brown-dark uppercase leading-tight mb-4">
                  {update.title}
                </h3>
                <p className="font-lato text-brand-brown text-sm leading-relaxed mb-6">
                  {update.desc}
                </p>
                <div className="flex items-center text-xs font-lato text-brand-gold font-bold uppercase tracking-tighter">
                  📍 {update.location}
                </div>
              </div>

              {/* Spacer for symmetrical layout on desktop */}
              <div className="hidden md:block w-[45%]"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Load More Button */}
      <div className="text-center mt-20">
        <button className="bg-brand-brown-dark text-white font-bold font-lato px-12 py-4 rounded-full hover:bg-brand-gold transition-all shadow-lg">
          Explore Older News
        </button>
      </div>
    </main>
  );
}
