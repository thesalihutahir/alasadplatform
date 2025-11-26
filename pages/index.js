import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import Card from '../components/Card'

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="hero card p-6 mb-8" style={{ backgroundImage: `url('/hero.jpg')`, backgroundSize:'cover' }}>
          <div className="bg-white/70 p-6 rounded-lg max-w-xl">
            <h1 className="text-3xl font-heading">Al-Asad Education Foundation</h1>
            <p className="mt-2 text-lg">Knowledge, courage, and legacy. Qur'an-centered programs, community empowerment.</p>
            <div className="mt-4">
              <Link href="/donate"><a className="btn-primary">Donate Now</a></Link>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-heading">Programs</h3>
            <p className="mt-2">Qur'an, Tafsir, Hifz, Skills.</p>
            <Link href="/programs"><a className="text-asad-gold mt-3 inline-block">Explore Programs</a></Link>
          </Card>

          <Card>
            <h3 className="font-heading">Multimedia</h3>
            <p className="mt-2">Tafsir videos, audio reminders, galleries.</p>
            <Link href="/multimedia"><a className="text-asad-gold mt-3 inline-block">Open Library</a></Link>
          </Card>

          <Card>
            <h3 className="font-heading">News & Events</h3>
            <p className="mt-2">Latest announcements and upcoming events.</p>
            <Link href="/news"><a className="text-asad-gold mt-3 inline-block">Read Updates</a></Link>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  )
    }
