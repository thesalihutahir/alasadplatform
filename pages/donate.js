import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Donate(){
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-heading mb-4">Donate</h2>
        <div className="bg-white p-4 rounded-md">
          <p>Select donation amount</p>
          <div className="mt-3 flex gap-3">
            <button className="btn-primary">₦1,000</button>
            <button className="btn-primary">₦5,000</button>
            <button className="btn-primary">₦10,000</button>
          </div>
          <p className="mt-4 text-sm">This is a placeholder. Integrate Paystack/Flutterwave later.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
