import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const modules = [
  {
    title: "Digital Literacy",
    desc: "Equipping students with essential computing skills, from productivity software to internet safety.",
    icon: "💻"
  },
  {
    title: "Arabic Type-setting",
    desc: "Specialized training in modern digital calligraphic software and publishing tools.",
    icon: "🖋️"
  },
  {
    title: "Creative Media",
    desc: "Content creation and photography workshops to help students document their Quranic journey.",
    icon: "📷"
  }
];

export default function TrainingInnovationPage() {
  return (
    <main className="bg-brand-sand min-h-screen">

      <Header />

      {/* Header Section */}
      <section className="pt-32 pb-20 px-6 bg-white border-b border-gray-100">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">

          <div className="md:w-1/2">
            <span className="text-brand-gold font-bold font-lato uppercase tracking-widest text-sm">
              Empowering the Future
            </span>

            <h1 className="font-agency text-5xl md:text-7xl text-brand-brown-dark uppercase mt-4 mb-6 leading-tight">
              Training and <br />
              <span className="text-brand-gold">Innovation</span>
            </h1>

            <p className="font-lato text-brand-brown text-lg leading-relaxed">
              We equip our students with the tools and technical training they need to thrive in a
              digital world while staying firmly rooted in their spiritual foundation. It is a bridge 
              between timeless knowledge and modern capability.
            </p>
          </div>

          <div className="md:w-1/2 w-full">
            <div className="aspect-video bg-brand-brown-dark rounded-3xl featured-background flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-gold opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <span className="text-6xl group-hover:scale-110 transition-transform cursor-default">🚀</span>
            </div>
          </div>

        </div>
      </section>

      {/* Modules Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-agency text-4xl text-brand-brown-dark uppercase mb-4">
            Core Training Modules
          </h2>
          <div className="h-1 bg-brand-gold w-20 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <div
              key={index}
              className="bg-white p-10 rounded-3xl card-shadow border-t-4 border-brand-gold transition-all hover:-translate-y-2"
            >
              <div className="text-4xl mb-6">{module.icon}</div>

              <h3 className="font-agency text-2xl text-brand-brown-dark mb-4">
                {module.title}
              </h3>

              <p className="font-lato text-brand-brown leading-relaxed">
                {module.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Innovation Lab Highlight */}
      <section className="container mx-auto px-6 mb-24">
        <div className="bg-brand-sand border-2 border-brand-brown-dark/10 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">

          <div className="md:w-1/3">
            <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center text-white text-3xl font-bold font-agency">
              NEW
            </div>
          </div>

          <div className="md:w-2/3">
            <h3 className="font-agency text-4xl text-brand-brown-dark uppercase mb-4">
              The Al Asad Digital Lab
            </h3>

            <p className="font-lato text-brand-brown mb-8 leading-relaxed">
              Launching in 2025: A modern facility featuring high speed internet, dedicated workstations,
              and professional recording equipment for students to produce educational content in a
              structured environment.
            </p>

            <Link
              href="/contact"
              className="text-brand-brown-dark font-bold font-lato underline decoration-brand-gold decoration-2 underline-offset-8 hover:text-brand-gold transition-colors"
            >
              Interested in sponsoring equipment? Contact us
            </Link>
          </div>

        </div>
      </section>

      <Footer />

    </main>
  );
}