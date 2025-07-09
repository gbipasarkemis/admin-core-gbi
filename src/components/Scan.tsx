'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Pelayan = {
  nama_pelayan: string
  nama_department: string
}

export default function ScanPage() {
  const [pelayan, setPelayan] = useState<Pelayan | null>(null)
  const [message, setMessage] = useState('')
  const [scanCooldown, setScanCooldown] = useState(false)
  const [inputKode, setInputKode] = useState('')
  const [showManual, setShowManual] = useState(false)

  const qrEngineRef = useRef<Html5Qrcode | null>(null)

  const playSuccessSound = () => {
    const audio = new Audio('/assets/success.mp3')
    audio.load()
    audio.play().catch((e) => console.warn('Sound error:', e))
  }

  const playErrorSound = () => {
    const audio = new Audio('/assets/error.mp3')
    audio.load()
    audio.play().catch((e) => console.warn('Sound error:', e))
  }

  const resumeCamera = async () => {
    try {
      if (qrEngineRef.current) {
        await qrEngineRef.current.resume()
      }
    } catch (err) {
      console.warn('Resume camera error:', err)
    }
  }

  const handleScan = async (kode: string) => {
    if (scanCooldown) return
    setScanCooldown(true)

    // Pause kamera agar QR tidak langsung di-scan ulang
    try {
      await qrEngineRef.current?.pause()
    } catch (err) {
      console.warn('Pause camera error:', err)
    }

    const { data: found } = await supabase
      .from('pelayan')
      .select(`
        id,
        nama_pelayan,
        departemen:departments (
          nama_department
        )
      `)
      .eq('kode_pelayan', kode)
      .single()

    const departemenObj =
      Array.isArray(found?.departemen)
        ? found?.departemen?.[0]
        : typeof found?.departemen === 'object'
          ? found.departemen
          : null

    if (!found || !departemenObj) {
      setMessage('❌ QR tidak dikenali')
      setPelayan(null)
    } else {
      const { error } = await supabase
        .from('absensi')
        .insert({ pelayan_id: found.id })

      if (error) {
        setPelayan(null)
        if (error.message.includes('duplicate key')) {
          setMessage(`❌ ${found.nama_pelayan} sudah absen hari ini`)
          playErrorSound()
        } else {
          setMessage(`⚠️ Error: ${error.message}`)
          playErrorSound()
        }
      } else {
        setMessage(`✅ Absensi ${found.nama_pelayan} berhasil`)
        setPelayan({
          nama_pelayan: found.nama_pelayan,
          nama_department: departemenObj?.nama_department ?? 'Tidak ditemukan'
        })
        playSuccessSound()
      }
    }

    // Cooldown 5 detik sebelum bisa scan lagi
    setTimeout(() => {
      setScanCooldown(false)
      resumeCamera()
    }, 1000)
  }

  const submitManual = () => {
    if (!inputKode.trim()) {
      setMessage('❌ Masukkan kode QR terlebih dahulu')
      return
    }
    handleScan(inputKode.trim().toUpperCase())
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const html5Qr = new Html5Qrcode('qr-reader')
    qrEngineRef.current = html5Qr

    html5Qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => handleScan(decodedText),
      (errorMessage) => console.warn('Scan error:', errorMessage)
    ).catch((err) => console.error('Camera start error:', err))

    return () => {
      html5Qr.stop().then(() => html5Qr.clear()).catch(console.error)
    }
  }, [])

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-10 p-6 min-h-screen bg-gray-50 max-w-5xl mx-auto">
      {/* Kamera & Input Manual */}
      <div className="w-full md:max-w-md flex flex-col items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Scan QR Pelayan</h2>

        <div id="qr-reader" className="w-full max-w-md rounded-lg shadow-md bg-white overflow-hidden" />

        {message && (
          <p className="mt-4 text-sm font-medium text-orange-600 text-center">{message}</p>
        )}

        <div className="mt-6 w-full max-w-md text-center">
          {!showManual && (
            <button
              onClick={() => setShowManual(true)}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Input manual kode QR
            </button>
          )}
        </div>

        {showManual && (
          <div className="mt-4 w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Masukkan Kode QR:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKode}
                onChange={(e) => setInputKode(e.target.value.toUpperCase())}
                placeholder="Contoh: W9NRXBA2"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={submitManual}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Pelayan */}
      <div className="w-full md:max-w-md bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">📋 Informasi Pelayan</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nama Pelayan</label>
            <input
              type="text"
              value={pelayan?.nama_pelayan ?? ''}
              readOnly
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Departemen</label>
            <input
              type="text"
              value={pelayan?.nama_department ?? ''}
              readOnly
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-800 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
