'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;

      if (user && role === 'admin') {
        setIsAuthorized(true);
        setUserName(user.user_metadata?.name || user.email || 'Admin');
      } else {
        router.push('/not-authorized');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminNavbar userName={userName} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
