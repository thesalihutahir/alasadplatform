import Link from 'next/link';

const featuredPost = {
  title: "The Future of Quranic Education in the Digital Age",
  excerpt: "Exploring how modern technology can preserve ancient wisdom while making it more accessible to the youth...",
  category: "Research",
  date: "Oct 15, 2024",
  author: "Dr. Sulaiman Tahir",
  image: "bg-brand-brown-dark"
};

const recentPosts = [
  {
    title: "Community Outreach: Water Well Completed",
    category: "Updates",
    date: "Oct 12, 2024",
    path: "/blogs/updates"
  },
  {
    title: "Understanding the Ethics of Charity",
    category: "Articles",
    date: "Oct 10, 2024",
    path: "/blogs/articles"
  },
  {
    title: "New Student Enrollment for Spring Semester",
    category: "Updates",
    date: "Oct 05, 2024",
    path: "/blogs/updates"
  }
];

export default function BlogsPage() {
  return (
    <main className="bg-brand-sand min-h-screen pb-20">
      {/* Blog Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto">
          <h1 className="font-agency text-5xl md:text-7xl text-brand-brown-dark uppercase tracking-tighter">
            Perspectives & <span className="text-brand-gold">News</span>
          </h1>
          <div className="flex flex-wrap gap-4 mt-8 font-lato text-sm uppercase font-bold tracking-widest">
             <Link href="/blogs/articles" className="text-brand-brown border-b-2 border-transparent hover:border-brand-gold py-1">Articles</Link>
             <Link href="/blogs/updates" className="text-brand-brown border-b-2 border-transparent hover:border-brand-gold py-1">Updates</Link>
             <Link href="/blogs/research-and-publications" className="text-brand-brown border-b-2 border-transparent hover:border-brand-gold py-1">Research</Link>
          </div>
        </div>
      </section>

      {/* Featured Post (Full Width) */}
      <section className="container mx-auto px-6 mb-16">
        <div className="bg-white rounded-[2.5rem] overflow-hidden card-shadow flex flex-col lg:flex-row border border-gray-100 group">
          <div className={`lg:w-1/2 min-h-[300px] ${featuredPost.image} group-hover:opacity-90 transition-opacity`}></div>
          <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <span className="text-brand-gold font-bold font-lato text-xs uppercase tracking-[0.2em] mb-4">Featured {featuredPost.category}</span>
            <h2 className="font-agency text-4xl md:text-5xl text-brand-brown-dark uppercase leading-tight group-hover:text-brand-gold transition-colors">
              {featuredPost.title}
            </h2>
            <p className="font-lato text-brand-brown mt-6 text-lg leading-relaxed">
              {featuredPost.excerpt}
            </p>
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm font-lato text-brand-brown">
                <span className="font-bold">{featuredPost.author}</span> • {featuredPost.date}
              </div>
              <Link href="/blogs/research-and-publications" className="bg-brand-brown-dark text-white px-8 py-3 rounded-full font-bold hover:bg-brand-gold transition-all uppercase text-xs">
                Read Post
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Recent Posts */}
      <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {recentPosts.map((post, index) => (
          <div key={index} className="bg-white p-8 rounded-3xl card-shadow flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div>
              <span className="text-brand-gold font-bold font-lato text-xs uppercase tracking-widest">{post.category}</span>
              <h3 className="font-agency text-2xl text-brand-brown-dark mt-4 leading-tight uppercase">
                {post.title}
              </h3>
            </div>
            <div className="mt-8 flex justify-between items-center text-xs font-lato text-brand-brown">
              <span>{post.date}</span>
              <Link href={post.path} className="font-bold text-brand-gold uppercase tracking-tighter hover:underline">
                View →
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
