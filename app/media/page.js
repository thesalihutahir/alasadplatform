import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import Link from 'next/link';

const mediaCategories = [
  {
    title: 'Videos',
    desc: 'Watch lectures, event highlights, and educational series.',
    path: '/media/videos',
    icon: '🎬',
    count: '120+ Videos'
  },
  {
    title: 'Audios',
    desc: 'Listen to Quranic recitations, podcasts, and audiobooks.',
    path: '/media/audios',
    icon: '🎙️',
    count: '50+ Tracks'
  },
  {
    title: 'Gallery',
    desc: 'Browse photos from our centers and community projects.',
    path: '/media/gallery',
    icon: '📸',
    count: '500+ Photos'
  },
  {
    title: 'eBooks',
    desc: 'Download research papers, guides, and religious texts.',
    path: '/media/ebooks',
    icon: '📚',
    count: '15+ Titles'
  }
];

export default function MediaLandingPage() {
  return (
    <>
      <Header />

      <main className="bg-brand-sand min-h-screen pb-20">
        
        {/* Media Hero */}
        <section className="pt-32 pb-16 px-6 bg-brand-brown-dark text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold rounded-full blur-3xl opacity-10 -mr-32 -mt-32"></div>

          <div className="container mx-auto text-center">
            <h1 className="font-agency text-5xl md:text-7xl uppercase tracking-widest mb-4">
              Digital <span className="text-brand-gold">Media</span>
            </h1>
            <p className="font-lato text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
              Access our comprehensive collection of resources. From visual learning 
              to downloadable research, our library is built for your growth.
            </p>
          </div>
        </section>

        {/* Media Categories Grid */}
        <section className="container mx-auto px-6 -mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {mediaCategories.map((item) => (
            <Link 
              key={item.title} 
              href={item.path}
              className="group bg-white rounded-2xl p-8 card-shadow hover:bg-brand-brown-dark transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h2 className="font-agency text-3xl text-brand-brown-dark group-hover:text-brand-gold mb-2 uppercase">
                {item.title}
              </h2>
              <p className="font-lato text-brand-brown group-hover:text-gray-300 text-sm mb-6 leading-relaxed">
                {item.desc}
              </p>
              <div className="font-lato text-xs font-bold uppercase tracking-widest text-brand-gold group-hover:text-white">
                {item.count}
              </div>
            </Link>
          ))}
        </section>

        {/* Featured Media Spotlight */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row gap-12 items-center featured-background overflow-hidden border-none">
            <div className="lg:w-1/2">
              <div className="relative aspect-video bg-brand-brown-dark rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button className="absolute inset-0 m-auto w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center text-white text-3xl hover:scale-110 transition-transform shadow-xl">
                  ▶
                </button>
              </div>
            </div>

            <div className="lg:w-1/2">
              <span className="bg-brand-gold/10 text-brand-gold px-4 py-1 rounded-full text-xs font-bold font-lato uppercase">
                Latest Video
              </span>

              <h3 className="font-agency text-4xl text-brand-brown-dark mt-4 mb-6 leading-tight uppercase">
                A Journey through the Quran: <br/>Community Stories
              </h3>

              <p className="font-lato text-brand-brown text-lg leading-relaxed mb-8">
                Discover how the Al-Asad Foundation is impacting lives in local 
                communities. This documentary explores the growth of our first 50 scholars.
              </p>

              <Link 
                href="/media/videos"
                className="inline-block bg-brand-brown-dark text-white font-bold font-lato px-8 py-3 rounded-full hover:bg-brand-gold transition-colors"
              >
                Watch Video
              </Link>
            </div>
          </div>
        </section>

        {/* Recent eBooks */}
        <section className="container mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-agency text-3xl text-brand-brown-dark uppercase">New Publications</h3>
            <Link href="/media/ebooks" className="text-brand-gold font-bold font-lato hover:underline uppercase text-sm">View All</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-white rounded-lg card-shadow p-4 flex flex-col justify-end group cursor-pointer border-b-4 border-transparent hover:border-brand-gold transition-all">
                <div className="h-full bg-brand-sand mb-4 rounded opacity-50"></div>
                <h4 className="font-lato font-bold text-sm text-brand-brown-dark uppercase">Research Paper {i}</h4>
                <p className="text-xs text-brand-gold font-bold mt-1">PDF Download</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}