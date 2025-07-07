'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FiLogOut } from 'react-icons/fi';

type AdminNavbarProps = {
  userName: string;
};

export default function AdminNavbar({ userName }: AdminNavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between 
  bg-white bg-opacity-90 backdrop-blur-md shadow-sm z-30">

      {/* Logo & Brand */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => router.push('/admin')}
      >
        {/* <Image
          src="/assets/gbi-logo.png"
          alt="GBI Pasar Kemis"
          width={40}
          height={40}
          className="rounded"
        /> */}
        <span className="text-gray-900 font-semibold text-base tracking-wide">
          Dashboard Admin
        </span>
      </div>

      {/* User & Logout */}
      <div className="flex items-center gap-4">
        <span className="text-gray-700 text-sm font-medium">
          Selamat datang, {userName}
        </span>
        <button
        onClick={handleLogout}
        className="p-2 rounded hover:bg-gray-100 text-gray-500 transition"
        aria-label="Logout"
        >
        <FiLogOut size={18} />
        </button>
      </div>
    </div>
  );
}
