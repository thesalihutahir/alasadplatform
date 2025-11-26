import { useState } from 'react'
import { auth } from '../../lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/router'
import Header from '../../components/Header'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function doLogin(e) {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/admin')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto px-4 py-12">
        <h2 className="text-xl font-heading mb-4">Admin login</h2>
        <form onSubmit={doLogin} className="bg-white p-4 rounded-md shadow">
          <label>Email<input className="border p-2 w-full mt-1" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label className="mt-2">Password<input type="password" className="border p-2 w-full mt-1" value={password} onChange={e => setPassword(e.target.value)} /></label>
          <div className="mt-3"><button className="btn-primary">Login</button></div>
        </form>
      </div>
    </>
  )
    }
