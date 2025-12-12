import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const audioTracks = [
  {
    title: "Surah Al-Baqarah (Full)",
    reciter: "Sheikh Ahmad Al-Asad",
    duration: "2:15:40",
    category: "Quran",
    size: "45MB"
  },
  {
    title: "The Importance of Community in Islam",
    reciter: "Dr. Sulaiman Tahir",
    duration: "45:12",
    category: "Podcasts",
    size: "18MB"
  },
  {
    title: "Modern Challenges for Quranic Students",
    reciter: "Ustaz Muhammad Sani",
    duration: "32:05",
    category: "Lectures",
    size: "14MB"
  },
  {
    title: "Morning Adhkar (Remembrances)",
    reciter: "Sheikh Ahmad Al-Asad",
    duration: "15:20",
    category: "Dua",
    size: "7MB"
  }
];

export default function AudiosPage() {
  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      <Header />

      {/* Page Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto">
          <Link href="/media" className="text-brand-gold font-bold font-lato hover:underline mb-4 inline-block">
            ← Back to Media Hub
          </Link>
          <h1 className="font-agency text-5xl md:text-6xl text-brand-brown-dark uppercase tracking-wide">
            Audio Library
          </h1>
          <p className="font-lato text-brand-brown mt-4 text-lg max-w-2xl">
            Listen to soulful recitations, scholarly podcasts, and educational lectures anywhere, anytime.
          </p>
        </div>
      </section>

      {/* Tracks Container */}
      <section className="container mx-auto px-6">
        <div className="bg-white rounded-[2rem] card-shadow overflow-hidden border border-gray-100">
          {/* Track Header (Desktop only) */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-brand-brown-dark text-white font-agency uppercase tracking-widest text-sm">
            <div className="col-span-1 text-center">Play</div>
            <div className="col-span-5">Title / Reciter</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2 text-right">Download</div>
          </div>

          {/* Tracks List */}
          <div className="divide-y divide-gray-100">
            {audioTracks.map((track, index) => (
              <div 
                key={index} 
                className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-brand-sand/50 transition-colors group"
              >
                {/* Play Icon */}
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  <button className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                    ▶
                  </button>
                </div>

                {/* Info */}
                <div className="col-span-7 md:col-span-5">
                  <h3 className="font-lato font-bold text-brand-brown-dark text-lg group-hover:text-brand-gold transition-colors">
                    {track.title}
                  </h3>
                  <p className="font-lato text-sm text-brand-brown italic">{track.reciter}</p>
                </div>

                {/* Category (Hidden on mobile) */}
                <div className="hidden md:block col-span-2">
                  <span className="bg-brand-sand text-brand-brown-dark font-lato text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {track.category}
                  </span>
                </div>

                {/* Duration */}
                <div className="col-span-3 md:col-span-2 text-brand-brown font-lato text-sm font-bold">
                  {track.duration}
                </div>

                {/* Download (Hidden on mobile) */}
                <div className="hidden md:block col-span-2 text-right">
                  <button className="text-brand-gold font-bold font-lato text-sm hover:underline">
                    ↓ {track.size}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Podcast */}
      <section className="container mx-auto px-6 mt-16">
        <div className="bg-brand-brown-dark rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 featured-background overflow-hidden relative border-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold opacity-10 rounded-full -mr-16 -mt-16"></div>

          <div className="md:w-1/4">
            <div className="w-full aspect-square bg-brand-gold rounded-2xl flex items-center justify-center text-6xl shadow-2xl">
              🎙️
            </div>
          </div>

          <div className="md:w-3/4">
            <h2 className="font-agency text-4xl text-white mb-4 uppercase">Podcast Series: Al-Asad Insights</h2>
            <p className="font-lato text-gray-300 mb-8 leading-relaxed max-w-2xl">
              Subscribe to our weekly podcast where we discuss the intersection of faith, community, and leadership with global scholars.
            </p>
            <div className="flex gap-4">
              <button className="bg-brand-gold text-white font-bold font-lato px-8 py-3 rounded-full hover:brightness-110 transition-all">
                Subscribe via Spotify
              </button>
              <button className="border border-white/30 text-white font-bold font-lato px-8 py-3 rounded-full hover:bg-white/10 transition-all">
                RSS Feed
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}