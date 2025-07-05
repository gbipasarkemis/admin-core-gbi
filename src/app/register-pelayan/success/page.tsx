export default function RegisterSuccessPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
          <svg
            className="mx-auto mb-4 text-green-500 w-16 h-16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h1>
          <p className="text-gray-600 mb-6">
            Terima kasih telah mendaftar sebagai pelayan. Silakan cek email kamu
            untuk melihat <strong>kode pelayan</strong> atau <strong>QR Code</strong>.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    )
  }
  