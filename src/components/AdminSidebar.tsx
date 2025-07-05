'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FiGrid, FiUsers, FiHome } from 'react-icons/fi';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white bg-opacity-[0.97] shadow-lg backdrop-blur-sm">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
        {[
          { path: '/admin', label: 'Dashboard', icon: <FiHome size={16} /> },
          { path: '/admin/departments', label: 'Master Department', icon: <FiGrid size={16} /> },
          { path: '/admin/pelayan', label: 'Master Pelayan', icon: <FiUsers size={16} /> },
        ].map(({ path, label, icon }) => (
          <button
            key={path}
            onClick={() => router.push(path)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition ${
              isActive(path)
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 text-xs text-gray-400 border-t border-gray-100">
        © 2025 GBI Pasar Kemis
      </div>
    </aside>
  );
}
