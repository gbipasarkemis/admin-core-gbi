'use client'

export default function LandingGBI() {
  return (
    <main className="bg-gray-50 font-sans text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white h-[85vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg tracking-wide">
          GBI Pasar Kemis
        </h1>
        <p className="mt-4 text-lg md:text-xl text-blue-100 italic font-light">
          Rumah Ibadah • Rumah Pemulihan • Rumah Pelayanan
        </p>
        <div className="mt-6">
          <a
            href="#jadwal"
            className="inline-block px-8 py-3 bg-white text-blue-800 font-semibold rounded-full shadow-lg hover:bg-blue-50 transition duration-300"
          >
            Lihat Jadwal Ibadah
          </a>
        </div>
      </section>

      {/* Jadwal Ibadah */}
      <section id="jadwal" className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">📅 Jadwal Ibadah</h2>
        <div className="grid md:grid-cols-2 gap-8 text-center text-lg">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-xl font-semibold text-blue-700">Minggu Pagi</h3>
            <p className="mt-2">07.00 WIB – Ibadah Raya</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-xl font-semibold text-blue-700">Minggu Sore</h3>
            <p className="mt-2">17.00 WIB – Ibadah Pemuda</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-xl font-semibold text-blue-700">Rabu</h3>
            <p className="mt-2">19.00 WIB – Doa & Pengajaran</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-xl font-semibold text-blue-700">Komsel</h3>
            <p className="mt-2">Sesuai Departemen masing-masing</p>
          </div>
        </div>
      </section>

      {/* Sistem Digital */}
      <section className="bg-gradient-to-t from-white to-blue-50 py-20 px-6">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">📲 Sistem Pelayanan Digital</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <a
            href="https://gbipasarkemis.vercel.app/register-pelayan"
            className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl border border-blue-100 transition duration-300"
          >
            <h3 className="text-blue-700 font-bold text-lg">Registrasi Pelayan</h3>
            <p className="mt-2 text-sm text-gray-600">Daftar sebagai pelayan untuk ibadah mendatang</p>
          </a>
          <a
            href="https://gbipasarkemis.vercel.app/absensi"
            className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl border border-green-100 transition duration-300"
          >
            <h3 className="text-green-700 font-bold text-lg">Absensi QR Code</h3>
            <p className="mt-2 text-sm text-gray-600">Scan QR saat ibadah dimulai</p>
          </a>
        </div>
      </section>

      {/* Lokasi Gereja */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">📍 Lokasi Gereja</h2>
        <p className="mb-6 text-gray-700">Ruko Bumi Indah Blok RB No. 16, Gelam Jaya, Pasar Kemis, Tangerang</p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2119490736474!2d106.58385077402617!3d-6.237183493767616"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          className="rounded-xl shadow-md"
        />
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 text-center">
        <p className="text-sm">© {new Date().getFullYear()} GBI Pasar Kemis — “Karunia untuk Melayani”</p>
        <p className="text-xs mt-2 text-blue-200">Website oleh Ezra untuk pelayanan digital gereja</p>
      </footer>
    </main>
  )
}
