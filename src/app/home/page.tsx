'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 text-gray-800">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <Image
          src="/assets/gbi-logo.png"
          alt="GBI Pasar Kemis"
          width={80}
          height={80}
          className="mb-4 rounded"
        />
        <h1 className="text-3xl font-bold mb-2">GBI Pasar Kemis</h1>
        <p className="text-lg text-gray-600 mb-6 max-w-md">
          Platform pelayanan yang dirancang untuk mendukung koordinasi, absensi, dan semangat pelayanan bersama.
        </p>
        {/* <div className="flex gap-4">
          <Link
            href="/admin"
            className="px-5 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition text-sm"
          >
            Masuk Dashboard
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
          >
            Daftar Pelayan Baru
          </Link>
        </div> */}
      </header>

      {/* Value Section */}
      <section className="px-6 py-10 bg-white text-center">
        <h2 className="text-xl font-semibold mb-4">Nilai Pelayanan Kami</h2>
        <ul className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
          <li className="bg-gray-50 rounded-md p-4 shadow">
            ⛪ Komitmen dalam membangun tubuh Kristus melalui pelayanan.
          </li>
          <li className="bg-gray-50 rounded-md p-4 shadow">
            🤝 Kolaborasi antar departemen demi efisiensi dan dampak maksimal.
          </li>
          <li className="bg-gray-50 rounded-md p-4 shadow">
            📊 Transparansi data kehadiran dan koordinasi antar pelayan.
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 px-6 bg-gray-100 text-sm text-center text-gray-500">
        © {new Date().getFullYear()} GBI Pasar Kemis. Dibuat dengan kasih 💙
      </footer>
    </div>
  )
}
