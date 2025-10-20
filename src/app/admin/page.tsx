'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import { utils, writeFile } from 'xlsx'
import LoadingOverlay from '@/components/LoadingOverlay'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

dayjs.locale('id')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type KehadiranRow = {
  nama: string
  bulan: number
  status: string
}

type DepartemenStat = {
  nama_department: string
  total_hadir: number
  total_pelayan: number
}

const namaBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function StatistikAbsensiRange() {
  const bulanSekarang = new Date().getMonth() + 1
  const tahunSekarang = new Date().getFullYear()

  // Default diatur ke bulan dan tahun sekarang
  const [rangeStart, setRangeStart] = useState(bulanSekarang)
  const [rangeEnd, setRangeEnd] = useState(bulanSekarang)
  const [tahun, setTahun] = useState(tahunSekarang)

  const [isLoading, setIsLoading] = useState(true)
  const [kehadiranRaw, setKehadiranRaw] = useState<KehadiranRow[]>([])
  const [formatted, setFormatted] = useState<any[]>([])
  const [dataChart, setDataChart] = useState<DepartemenStat[]>([])
  const [statistikDepartemen, setStatistikDepartemen] = useState<DepartemenStat[]>([])

  const fetchStatistikDepartemen = async () => {
    const { data, error } = await supabase.rpc('get_kehadiran_departemen_dengan_total', {
      start_bulan: rangeStart,
      end_bulan: rangeEnd,
      tahun
    })
    if (error) {
      console.error('Gagal ambil data departemen:', error.message)
      setStatistikDepartemen([])
    } else {
      setStatistikDepartemen(data || [])
    }
  }

  const fetchKehadiran = async () => {
    setIsLoading(true)

    const validRangeEnd = tahun === tahunSekarang
      ? Math.min(rangeEnd, bulanSekarang)
      : rangeEnd

    const { data, error } = await supabase.rpc('get_kehadiran_range_bulan', {
      start_bulan: rangeStart,
      end_bulan: validRangeEnd,
      tahun
    })

    if (error) {
      console.error('Gagal ambil data:', error.message)
      setKehadiranRaw([])
    } else {
      setKehadiranRaw(data || [])
    }

    setIsLoading(false)
  }

  const fetchChartData = async () => {
    const { data, error } = await supabase.rpc('get_kehadiran_summary_departemen', {
      start_bulan: rangeStart,
      end_bulan: rangeEnd,
      tahun
    })
    if (error) console.error('Gagal ambil chart:', error.message)
    else setDataChart(data || [])
  }

  useEffect(() => {
    if (tahun === tahunSekarang) {
      if (rangeEnd > bulanSekarang) setRangeEnd(bulanSekarang)
      if (rangeStart > bulanSekarang) setRangeStart(1)
    }

    fetchKehadiran()
    fetchChartData()
    fetchStatistikDepartemen()
  }, [rangeStart, rangeEnd, tahun])

  useEffect(() => {
    const grouped: Record<string, Record<string, string>> = {}

    kehadiranRaw.forEach(({ nama, bulan, status }) => {
      const namaBulanStr = namaBulan[bulan - 1]
      if (!grouped[nama]) grouped[nama] = {}
      grouped[nama][namaBulanStr] = status
    })

    const hasil = Object.entries(grouped).map(([nama, bulanStatus]) => {
      const row: Record<string, string | number> = { nama }
      let total = 0
      for (let i = rangeStart - 1; i < rangeEnd; i++) {
        const labelBulan = namaBulan[i]
        const status = bulanStatus[labelBulan] || '-'
        row[labelBulan] = status
        if (status === 'Hadir') total += 1
      }
      row['Total Kehadiran'] = total
      return row
    })

    setFormatted(hasil)
  }, [kehadiranRaw, rangeStart, rangeEnd])

  const exportXLS = () => {
    const worksheet = utils.json_to_sheet(formatted.map((d, i) => ({
      No: i + 1,
      ...d
    })))
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Absensi')

    const namaFile = `absensi-${namaBulan[rangeStart - 1]}-sd-${namaBulan[rangeEnd - 1]}-${tahun}.xlsx`
    writeFile(workbook, namaFile)
  }

  // Fungsi untuk menentukan warna progress bar berdasarkan persentase
  const getProgressBarColor = (persentase: number) => {
    if (persentase >= 80) return 'bg-green-500'
    if (persentase >= 60) return 'bg-yellow-500'
    if (persentase >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Fungsi untuk menentukan warna teks persentase
  const getTextColor = (persentase: number) => {
    if (persentase >= 80) return 'text-green-700'
    if (persentase >= 60) return 'text-yellow-700'
    if (persentase >= 40) return 'text-orange-700'
    return 'text-red-700'
  }

  if (isLoading) return <LoadingOverlay />

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Absensi Doa Pengerja
      </h2>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Bulan:</label>
          <select value={rangeStart} onChange={(e) => setRangeStart(+e.target.value)} className="px-3 py-2 border rounded-md text-sm">
            {namaBulan.map((b, i) => <option key={i + 1} value={i + 1}>{b}</option>)}
          </select>
          <span className="text-sm text-gray-600">hingga</span>
          <select value={rangeEnd} onChange={(e) => setRangeEnd(+e.target.value)} className="px-3 py-2 border rounded-md text-sm">
            {namaBulan.map((b, i) => (
              <option key={i + 1} value={i + 1} disabled={tahun === tahunSekarang && i + 1 > bulanSekarang}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Tahun:</label>
          <select value={tahun} onChange={(e) => setTahun(+e.target.value)} className="px-3 py-2 border rounded-md text-sm">
            {[...Array(5)].map((_, i) => {
              const y = tahunSekarang - i
              return <option key={y} value={y}>{y}</option>
            })}
          </select>
        </div>

        <div className="ml-auto">
          <button onClick={exportXLS} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
            Download XLS
          </button>
        </div>
      </div>

      {/* Tabel Kehadiran */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">No</th>
              <th className="px-3 py-2 text-left">Nama Pelayan</th>
              {namaBulan.slice(rangeStart - 1, rangeEnd).map((b, i) => (
                <th key={i} className="px-3 py-2 text-center">{b}</th>
              ))}
              <th className="px-3 py-2 text-center">Total Kehadiran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {formatted.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-center">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{d.nama}</td>
                {namaBulan.slice(rangeStart - 1, rangeEnd).map((b, j) => (
                  <td key={j} className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      d[b] === 'Hadir' ? 'bg-green-100 text-green-700' :
                      d[b] === 'Tidak' ? 'bg-red-100 text-red-700' :
                      'text-gray-500'
                    }`}>
                      {d[b] ?? '-'}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-bold">{d['Total Kehadiran']}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 text-sm text-gray-600">
          Menampilkan {formatted.length} pelayan dari bulan {namaBulan[rangeStart - 1]} hingga {namaBulan[rangeEnd - 1]} tahun {tahun}.
        </p>


        {/* Statistik Kehadiran Per Departemen (Container Format) */}
        <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Rekap Kehadiran Per Departemen ({namaBulan[rangeStart - 1]} - {namaBulan[rangeEnd - 1]} {tahun})
        </h3>
          
          {statistikDepartemen.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada data kehadiran departemen untuk rentang ini.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistikDepartemen.map((dept, index) => {
                const persentase = dept.total_pelayan > 0
                  ? Math.round((dept.total_hadir / dept.total_pelayan) * 100)
                  : 0
                const tidakHadir = dept.total_pelayan - dept.total_hadir

                return (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                    {/* Header Departemen */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800 text-lg">{dept.nama_department}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {dept.total_pelayan} total anggota
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">Kehadiran</span>
                        <span className={`font-bold ${getTextColor(persentase)}`}>
                          {persentase}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${getProgressBarColor(persentase)}`}
                          style={{ width: `${persentase}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Statistik Detail */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-green-50 p-2 rounded-md">
                        <div className="text-green-700 font-semibold">{dept.total_hadir}</div>
                        <div className="text-green-600 text-xs">Hadir</div>
                      </div>
                      <div className="bg-red-50 p-2 rounded-md">
                        <div className="text-red-700 font-semibold">{tidakHadir}</div>
                        <div className="text-red-600 text-xs">Tidak Hadir</div>
                      </div>
                    </div>

                    {/* Ringkasan */}
                    {/* <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Rasio kehadiran: {dept.total_hadir}:{dept.total_pelayan}
                      </p>
                    </div> */}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}