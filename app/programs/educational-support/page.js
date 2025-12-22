import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const eligibilityCriteria = [
  "Must be a registered student of an affiliated Quranic center.",
  "Demonstrated excellence in Quranic memorization or studies.",
  "Financial need based on family income assessment.",
  "Recommendation from a recognized community lead or scholar.",
];

export default function ScholarshipsPage() {
  return (
    <>
      <Header />

      <main className="bg-brand-sand min-h-screen">
        {/* Hero */}
        <section className="pt-24 pb-16 px-6 bg-brand-brown-dark text-white text-center">
          <div className="container mx-auto">
            <h1 className="font-agency text-5xl md:text-7xl uppercase tracking-wider mb-4">
              Scholarship Portal
            </h1>
            <p className="font-lato text-lg md:text-xl max-w-2xl mx-auto opacity-90">
              Investing in the future of our youth through Quranic excellence and access to education.
            </p>

            <div className="mt-8">
              <Link
                href="/programs/scholarships/apply"
                className="bg-brand-gold text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:brightness-110 transition-all inline-block"
              >
                Start Application
              </Link>
            </div>
          </div>
        </section>

        {/* Main Section */}
        <section className="container mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* About */}
          <div className="space-y-6">
            <h2 className="font-agency text-4xl text-brand-brown-dark uppercase">
              About the Scholarship
            </h2>
            <p className="font-lato text-brand-brown leading-relaxed">
              The Al Asad Education Foundation Scholarship Program exists to remove financial barriers for hardworking students. We support Quranic learners and students in need with tuition coverage, study materials, and mentorship throughout the academic year.
            </p>

            {/* Eligibility */}
            <div className="bg-white p-8 rounded-2xl card-shadow">
              <h3 className="font-agency text-2xl text-brand-gold mb-4">
                Eligibility Requirements
              </h3>
              <ul className="space-y-3">
                {eligibilityCriteria.map((item, index) => (
                  <li key={index} className="flex items-start font-lato text-brand-brown">
                    <span className="text-brand-gold mr-3">✔</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-brand-brown-dark text-white p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-gold rounded-full opacity-10"></div>

            <h2 className="font-agency text-4xl mb-8 uppercase text-brand-gold">
              How to Apply
            </h2>

            <div className="space-y-8 relative z-10">
              {[
                {
                  step: "01",
                  title: "Create an Account",
                  desc: "Register on the portal with your basic information.",
                },
                {
                  step: "02",
                  title: "Upload Documents",
                  desc: "Submit your academic records and proof of financial need.",
                },
                {
                  step: "03",
                  title: "Interview Stage",
                  desc: "Shortlisted applicants will attend an oral evaluation.",
                },
                {
                  step: "04",
                  title: "Award Decision",
                  desc: "Successful students receive scholarship packages.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="font-agency text-4xl text-brand-gold opacity-50">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-xl mb-1">{item.title}</h4>
                    <p className="text-gray-300 font-lato text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/10">
              <p className="text-sm italic opacity-70">
                Deadline for this semester: December 31st, 2024
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-agency text-5xl text-brand-gold">500+</div>
              <div className="font-lato text-brand-brown uppercase tracking-widest mt-2">
                Scholars Supported
              </div>
            </div>

            <div>
              <div className="font-agency text-5xl text-brand-gold">20+</div>
              <div className="font-lato text-brand-brown uppercase tracking-widest mt-2">
                Partner Centers
              </div>
            </div>

            <div>
              <div className="font-agency text-5xl text-brand-gold">100%</div>
              <div className="font-lato text-brand-brown uppercase tracking-widest mt-2">
                Transparency
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
    }
