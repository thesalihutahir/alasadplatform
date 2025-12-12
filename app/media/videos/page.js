import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const videoCategories = ["All", "Lectures", "Events", "Series", "Documentaries"];

const videos = [
  {
    title: "The Path of Excellence: Quranic Memorization",
    category: "Lectures",
    duration: "45:20",
    thumbnail: "bg-brand-brown",
    date: "Oct 12, 2024"
  },
  {
    title: "Al-Asad Annual Graduation Ceremony 2024",
    category: "Events",
    duration: "1:15:00",
    thumbnail: "bg-brand-gold",
    date: "Sep 28, 2024"
  },
  {
    title: "Understanding Tafsir: Episode 1",
    category: "Series",
    duration: "22:15",
    thumbnail: "bg-brand-brown-dark",
    date: "Sep 15, 2024"
  },
  {
    title: "Community Impact: The Clean Water Project",
    category: "Documentaries",
    duration: "12:05",
    thumbnail: "bg-brand-sand",
    date: "Aug 30, 2024"
  }
];

export default function VideosPage() {
  return (
    <>
      <Header />

      <main className="bg-brand-sand min-h-screen pb-20">
        {/* Header Section */}
        <section className="pt-32 pb-12 px-6">
          <div className="container mx-auto">
            <Link 
              href="/media" 
              className="text-brand-gold font-bold font-lato hover:underline mb-4 inline-block"
            >
              ← Back to Media Hub
            </Link>

            <h1 className="font-agency text-5xl md:text-6xl text-brand-brown-dark uppercase tracking-wide">
              Video Library
            </h1>

            <p className="font-lato text-brand-brown mt-4 text-lg max-w-2xl">
              Watch our latest lectures, special event highlights, and educational documentaries.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="container mx-auto px-6 mb-12">
          <div className="flex flex-wrap gap-4 border-b border-gray-200 pb-6">
            {videoCategories.map((cat) => (
              <button 
                key={cat} 
                className={`font-lato px-6 py-2 rounded-full border-2 transition-all ${
                  cat === "All" 
                  ? "bg-brand-brown-dark text-white border-brand-brown-dark" 
                  : "border-gray-300 text-brand-brown hover:border-brand-gold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Video Grid */}
        <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {videos.map((video, index) => (
            <div key={index} className="group cursor-pointer">
              
              {/* Thumbnail */}
              <div className={`aspect-video rounded-2xl relative overflow-hidden card-shadow ${video.thumbnail}`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-2xl">▶</span>
                  </div>
                </div>

                {/* Duration */}
                <span className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded font-lato">
                  {video.duration}
                </span>
              </div>

              {/* Content */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-brand-gold font-bold text-xs uppercase tracking-widest">{video.category}</span>
                  <span className="text-brand-brown/60 text-xs font-lato">{video.date}</span>
                </div>

                <h2 className="font-agency text-2xl text-brand-brown-dark group-hover:text-brand-gold transition-colors leading-tight uppercase">
                  {video.title}
                </h2>
              </div>
            </div>
          ))}
        </section>

        {/* Load More */}
        <div className="container mx-auto px-6 mt-16 text-center">
          <button className="bg-white border-2 border-brand-brown-dark text-brand-brown-dark font-bold font-lato px-10 py-3 rounded-full hover:bg-brand-brown-dark hover:text-white transition-all">
            Load More Videos
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}