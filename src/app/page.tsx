'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.push('/admin/pelayan') // atau halaman utama kamu
  }, [])
  return null
}
