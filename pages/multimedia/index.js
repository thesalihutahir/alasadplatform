import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Card from '../../components/Card'
import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function Multimedia() {
  const [items, setItems] = useState([])
  useEffect(() => {
    async function load(){
      const snap = await getDocs(collection(db, 'multimedia'))
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  },[])
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-heading mb-4">Multimedia</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(i => (
            <Card key={i.id}>
              <img src={i.thumbnailUrl || '/placeholder.jpg'} className="w-full h-44 object-cover rounded-md" />
              <h3 className="mt-3 font-heading">{i.title}</h3>
              <p className="text-sm mt-1">{i.description}</p>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
