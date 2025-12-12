import Link from 'next/link';
// CORRECTED: Removed the unnecessary .js extension from the layout components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const galleryCategories = ["All", "Campus", "Events", "Students", "Outreach"];

const photos = [
  { id: 1, title: "Morning Recitation", category: "Students", size: "md" },
  { id: 2, title: "New Center Opening", category: "Campus", size: "lg" },
  { id: 3, title: "Water Well Commissioning", category: "Outreach", size: "sm" },
  { id: 4, title: "Annual Graduation 2024", category: "Events", size: "md" },
  { id: 5, title: "Library Archives", category: "Campus", size: "sm" },
  { id: 6, title: "Skill Workshop", category: "Students", size: "lg" },
];

export default function GalleryPage() {
  return (
    <main className="bg-brand-sand min-h-screen">
      <Header />

      {/* Header Section */}
      <section className="pt-28 pb-12 px-6">
        <div className="container mx-auto text-center">
          <Link 
            href="/media" 
            className="text-brand-gold font-bold font-lato hover:underline mb-4 inline-block"
          >
            ← Back to Media Hub
          </Link>

          <h1 className="font-agency text-5xl md:text-6xl text-brand-brown-dark uppercase tracking-wide">
            Photo Gallery
          </h1>

          <p className="font-lato text-brand-brown mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
            A visual journey through our centers, our milestones, and the faces 
            of the community we serve.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="container mx-auto px-6 mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          {galleryCategories.map((cat) => (
            <button 
              key={cat} 
              className={`font-lato px-8 py-2 rounded-full border-2 transition-all text-sm uppercase font-bold tracking-widest ${
                cat === "All"
                  ? "bg-brand-gold text-white border-brand-gold shadow-lg"
                  : "bg-white border-gray-200 text-brand-brown-dark hover:border-brand-gold hover:text-brand-gold"
              }`}
              aria-label={`Filter by ${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Photo Grid */}
      <section className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="group relative aspect-square bg-white rounded-2xl overflow-hidden card-shadow cursor-pointer"
          >
            {/* Image Placeholder */}
            <div className="absolute inset-0 bg-brand-brown-dark opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="h-full w-full bg-gray-200"></div> 
            {/* Replace with: <Image src={`/gallery/${photo.id}.jpg`} alt={photo.title} fill /> */}

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
              <span className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-1">
                {photo.category}
              </span>
              <h3 className="text-white font-agency text-xl uppercase leading-tight">
                {photo.title}
              </h3>
            </div>
          </div>
        ))}
      </section>

      {/* Social CTA */}
      <section className="container mx-auto px-6 mt-20 mb-20">
        <div className="bg-white p-10 rounded-[3rem] text-center border-2 border-brand-sand shadow-sm featured-background">
          <h2 className="font-agency text-3xl text-brand-brown-dark uppercase mb-4">
            Follow our journey on Instagram
          </h2>
          <p className="font-lato text-brand-brown mb-8">
            Get daily updates and behind-the-scenes glimpses into our programs.
          </p>

          <a 
            href="#" 
            className="inline-block bg-brand-brown-dark text-white font-bold font-lato px-10 py-3 rounded-full hover:bg-brand-gold transition-all shadow-md"
          >
            @AlAsadFoundation
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
