// components/Header.js
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.ico" alt="Al Asad logo" className="h-10 w-10" />
          <div>
            <div className="text-lg font-heading">Al-Asad Education Foundation</div>
            <div className="text-xs text-gray-500">Knowledge, courage, legacy</div>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/programs"><a>Programs</a></Link>
          <Link href="/multimedia"><a>Multimedia</a></Link>
          <Link href="/news"><a>News</a></Link>
          <Link href="/donate"><a className="btn-primary">Donate</a></Link>
          <Link href="/admin"><a className="text-sm">Admin</a></Link>
        </nav>
      </div>
    </header>
  )
    }
