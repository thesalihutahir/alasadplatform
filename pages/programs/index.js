import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Card from '../../components/Card'
import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function Programs() {
  const [programs, setPrograms] = useState([])

  useEffect(() => {
    async function loadPrograms(){
      const snap = await getDocs(collection(db, 'programs'))
      setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    loadPrograms()
  },[])

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-heading mb-4">Programs</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {programs.length === 0 && <p>Loading or no programs yet.</p>}
          {programs.map(p => (
            <Card key={p.id}>
              <img src={p.imageUrl || '/placeholder.jpg'} alt={p.title} className="w-full h-40 object-cover rounded-md" />
              <h3 className="mt-3 font-heading">{p.title}</h3>
              <p className="mt-2 text-sm">{p.description}</p>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
    }
