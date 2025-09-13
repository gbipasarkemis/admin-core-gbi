'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { utils, writeFile } from 'xlsx'
import LoadingOverlay from '@/components/LoadingOverlay'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Kehadiran = {
  nama: string
  status: string
}

type StatistikDepartemen = {
  nama_departemen: string
  total_hadir: number
  total_pelayan: number
}

export default function StatistikBulananPage() {
  const [kehadiran, setKehadiran] = useState<Kehadiran[]>([])
  const [statistikDepartemen, setStatistikDepartemen] = useState<StatistikDepartemen[]>([])
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const bulanSaatIni = new Date().getMonth() + 1

  const fetchKehadiran = async () => {
    setIsLoadingPage(true)
    const { data, error } = await supabase.rpc('get_kehadiran_bulanan', { bulan })
    if (error) {
      console.error('Gagal ambil data:', error.message)
      setKehadiran([])
    } else {
      setKehadiran(data || [])
    }
    setIsLoadingPage(false)
  }

  const fetchStatistikDepartemen = async () => {
    const { data, error } = await supabase.rpc('get_kehadiran_departemen_bulanan', { bulan })
    if (error) {
      console.error('Gagal ambil statistik departemen:', error.message)
      setStatistikDepartemen([])
    } else {
      setStatistikDepartemen(data || [])
    }
  }

  useEffect(() => {
    fetchKehadiran()
    fetchStatistikDepartemen()
  }, [bulan])

  const exportCSV = () => {
    const worksheet = utils.json_to_sheet(kehadiran)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Kehadiran')
    writeFile(workbook, `statistik-kehadiran-bulan-${bulan}.csv`)
  }

  if (isLoadingPage) return <LoadingOverlay />

  return (
    <div>
      {/* Filter Bulan + Export */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <label htmlFor="bulan" className="text-sm text-gray-700 font-medium">
            Pilih Bulan:
          </label>
          <select
            id="bulan"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={bulan}
            onChange={(e) => setBulan(parseInt(e.target.value))}
          >
            {[...Array(bulanSaatIni)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Bulan {i + 1}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium shadow-sm"
        >
          Export CSV
        </button>
      </div>

      {/* Table Kehadiran */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Statistik Absensi Doa Pengerja Bulan {dayjs().month(bulan - 1).format('MMMM')}
        </h2>

        {kehadiran.length === 0 ? (
          <p className="text-sm text-red-600">Tidak ada data kehadiran bulan ini.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Nama Pelayan</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kehadiran.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{d.nama}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        d.status === 'Hadir'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-4 text-sm text-gray-600">
          Menampilkan {kehadiran.length} pelayan untuk bulan ini.s
        </p>

        {/* Statistik Per Departemen */}
        <div className="mt-8">
          <h3 className="text-md font-semibold text-gray-800 mb-2">
            Statistik Kehadiran Per Departemen
          </h3>
          {statistikDepartemen.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data departemen bulan ini.</p>
          ) : (
            <ul className="space-y-2 text-sm text-gray-700">
              {statistikDepartemen.map((d, i) => {
                const persentase = Math.round((d.total_hadir / d.total_pelayan) * 100)
                return (
                  <li key={i} className="bg-gray-50 px-4 py-2 rounded-md shadow-sm">
                    <strong>{d.nama_departemen}</strong>: {d.total_hadir} orang hadir dari {d.total_pelayan} orang (kehadiran {persentase}%)
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
