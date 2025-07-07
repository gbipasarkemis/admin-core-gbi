'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { FiGrid, FiUsers, FiHome, FiMenu, FiX } from 'react-icons/fi'
import Image from 'next/image'

type Props = {
  onToggle: (state: boolean) => void
}

export default function AdminSidebar({ onToggle }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FiHome size={16} /> },
    { path: '/admin/departments', label: 'Master Department', icon: <FiGrid size={16} /> },
    { path: '/admin/pelayan', label: 'Master Pelayan', icon: <FiUsers size={16} /> },
  ]

  const [isOpen, setIsOpen] = useState(() => {
    // Default: hide sidebar on mobile
    if (typeof window !== 'undefined') return window.innerWidth >= 768
    return true
  })

  useEffect(() => {
    // Call onToggle only once on mount to sync state
    onToggle(isOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSidebar = () => {
    const next = !isOpen
    setIsOpen(next)
    onToggle(next)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    if (window.innerWidth < 768) {
      setIsOpen(false)
      onToggle(false)
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white rounded-md p-2 shadow"
        onClick={toggleSidebar}
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 w-64 bg-white shadow-lg backdrop-blur-sm
        transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block`}
      >
        <div className="flex justify-center items-center py-6">
        <Image
          src="/assets/gbi-logo2.png"
          alt="GBI Pasar Kemis"
          width={80}
          height={50}
          className="rounded"
        />
      </div>
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
          {navItems.map(({ path, label, icon }) => (
            <button
              key={path}
              onClick={() => handleNavigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded transition ${
                isActive(path)
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              {icon}
              <span >{label}</span>
            </button>
          ))}
        </nav>

        <div className="px-6 py-4 text-xs text-gray-400 border-t border-gray-100 hidden md:block">
          © 2025 GBI Pasar Kemis
        </div>
      </aside>
    </>
  )
}
