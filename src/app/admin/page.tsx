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

const namaBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function StatistikAbsensiRange() {
  const bulanSekarang = new Date().getMonth() + 1
  const tahunSekarang = new Date().getFullYear()

  const [rangeStart, setRangeStart] = useState(7)
  const [rangeEnd, setRangeEnd] = useState(8)
  const [tahun, setTahun] = useState(tahunSekarang)

  const [isLoading, setIsLoading] = useState(true)
  const [kehadiranRaw, setKehadiranRaw] = useState<KehadiranRow[]>([])
  const [formatted, setFormatted] = useState<any[]>([])
  const [dataChart, setDataChart] = useState<{ nama_department: string, total_hadir: number }[]>([])


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

  useEffect(() => {
    const fetchChartData = async () => {
      const { data, error } = await supabase.rpc('get_kehadiran_summary_departemen', {
        start_bulan: rangeStart,
        end_bulan: rangeEnd,
        tahun
      })
      if (error) console.error('Gagal ambil chart:', error.message)
      else setDataChart(data || [])
    }
  
    fetchChartData()
  }, [rangeStart, rangeEnd, tahun])
  

  useEffect(() => {
    // Jagaan filter tidak boleh lebih dari bulan sekarang di tahun ini
    if (tahun === tahunSekarang) {
      if (rangeEnd > bulanSekarang) setRangeEnd(bulanSekarang)
      if (rangeStart > bulanSekarang) setRangeStart(1)
    }

    fetchKehadiran()
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

  if (isLoading)
  return (
    <LoadingOverlay />
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
       Absensi Doa Pengerja
      </h2>

      {/* Filter Range & Tahun */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Bulan:</label>
          <select
            value={rangeStart}
            onChange={(e) => setRangeStart(+e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {namaBulan.map((b, i) => (
              <option key={i + 1} value={i + 1}>{b}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">hingga</span>
          <select
            value={rangeEnd}
            onChange={(e) => setRangeEnd(+e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {namaBulan.map((b, i) => (
              <option
                key={i + 1}
                value={i + 1}
                disabled={tahun === tahunSekarang && i + 1 > bulanSekarang}
              >
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Tahun:</label>
          <select
            value={tahun}
            onChange={(e) => setTahun(+e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {[...Array(5)].map((_, i) => {
              const y = tahunSekarang - i
              return <option key={y} value={y}>{y}</option>
            })}
          </select>
        </div>

        <div className="ml-auto">
          <button
            onClick={exportXLS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium shadow-sm"
          >
            Download XLS
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">No</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Nama Pelayan</th>
              {namaBulan.slice(rangeStart - 1, rangeEnd).map((b, i) => (
                <th key={i} className="px-3 py-2 text-center font-medium text-gray-700">{b}</th>
              ))}
              <th className="px-3 py-2 text-center font-medium text-gray-700">Total Kehadiran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {formatted.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800 text-center">{i + 1}</td>
                <td className="px-3 py-2 text-gray-800 font-medium">{d.nama}</td>
                {namaBulan.slice(rangeStart - 1, rangeEnd).map((b, j) => (
                  <td key={j} className="px-3 py-2 text-center text-gray-800">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      d[b] === 'Hadir' ? 'bg-green-100 text-green-700' :
                      d[b] === 'Tidak' ? 'bg-red-100 text-red-700' :
                      'text-gray-500'
                    }`}>
                      {d[b] ?? '-'}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-bold text-gray-800">{d['Total Kehadiran']}</td>
                              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 text-sm text-gray-600">
          Menampilkan {formatted.length} pelayan dari bulan {namaBulan[rangeStart - 1]} hingga {namaBulan[rangeEnd - 1]} tahun {tahun}.
        </p>
        <br/>
        {dataChart.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Statistik Kehadiran Per Departemen
          </h3>
          <div className="max-w-md mx-auto">
            <Pie
              data={{
                labels: dataChart.map((d) => d.nama_department),
                datasets: [{
                  label: 'Jumlah Hadir',
                  data: dataChart.map((d) => d.total_hadir),
                  backgroundColor: [
                    '#A3BFFA', '#B2DFDB', '#FFCCBC', '#C5E1A5', '#F8BBD0',
                    '#D1C4E9', '#FFE082', '#BCAAA4', '#90CAF9'
                  ],
                  borderWidth: 1,
                }],
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      font: { size: 12 }
                    }
                  }
                }
              }}
            />
            <p className="text-sm text-gray-600 mt-3 text-center">
              Menampilkan jumlah pelayan hadir berdasarkan departemen untuk rentang yang dipilih.
            </p>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
