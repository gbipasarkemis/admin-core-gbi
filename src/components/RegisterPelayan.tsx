'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { generateQRWithTextBlob } from '@/lib/qr/generateQRCodeBlob';
import { readQRCodeFromFile } from '@/lib/qr/readQRCodeFromFile';
import { sendConfirmationEmail } from '@/lib/email/sendConfirmationEmail';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/LoadingOverlay';

type Pelayan = {
  nama_pelayan: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  department: string;
  email: string;
};

type Department = {
  id_department: string;
  nama_department: string;
};

export default function RegisterPelayanPublic() {
  const [pelayan, setPelayan] = useState<Pelayan>({
    nama_pelayan: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    department: '',
    email: '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const generateKodePelayan = () => uuidv4().slice(0, 7).toUpperCase();

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('id_department, nama_department');
    if (data) setDepartments(data);
  };

  useEffect(() => {
    fetchDepartments().finally(() => setIsLoading(false));
  }, []);

  const isFormValid = (): boolean => {
    const requiredFields = Object.values(pelayan);
    return requiredFields.every((field) => field.trim() !== '') && !isEmailTaken;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPelayan((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      const { data: existing } = await supabase
        .from('pelayan')
        .select('email')
        .eq('email', value)
        .maybeSingle();
      setIsEmailTaken(!!existing);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: existing } = await supabase
        .from('pelayan')
        .select('email')
        .eq('email', pelayan.email)
        .maybeSingle();

      if (existing) {
        toast.error('Email sudah digunakan oleh pelayan lain.');
        return;
      }

      let kode_pelayan = '';
      let qrCodeUrlForDB: string | null = null;

      if (file) {
        const result = await readQRCodeFromFile(file);
        if (!result) {
          toast.error('QR Code tidak valid.');
          return;
        }
        kode_pelayan = result;
      } else {
        kode_pelayan = generateKodePelayan();
        const qrBlob = await generateQRWithTextBlob(kode_pelayan, pelayan.nama_pelayan.toUpperCase(), {
          darkColor: '#ffffff',
            lightColor: '#075aad',
          fontSize: 12,
        });

        const formData = new FormData();
        formData.append('kode', kode_pelayan);
        formData.append('file', qrBlob);

        const res = await fetch('/api/uploadQR', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          toast.error('Gagal upload QR code.');
          return;
        }

        const { url } = await res.json();
        qrCodeUrlForDB = url;
      }

      await supabase.from('pelayan').insert([
        {
          ...pelayan,
          kode_pelayan,
          qrcode_url: qrCodeUrlForDB,
        },
      ]);

      await sendConfirmationEmail({
        to_email: pelayan.email,
        to_name: pelayan.nama_pelayan,
        qrcode_url: qrCodeUrlForDB ?? '',
      });

      toast.success('Registrasi berhasil!');
      setPelayan({
        nama_pelayan: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        alamat: '',
        department: '',
        email: '',
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {

      console.error('Emm error:', error);

      const message =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.statusText ||
        'Terjadi kesalahan saat proses registrasi.';
    
      toast.error(`Registrasi gagal: ${message}`);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Registrasi Pelayan</h1>
      <p className="text-sm text-center text-gray-500 mb-6">
        Halaman ini terbuka untuk pelayan GBI Pasar Kemis. Silakan isi data dengan lengkap.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Lengkap</label>
            <input
              name="nama_pelayan"
              value={pelayan.nama_pelayan}
              onChange={handleChange}
              placeholder="Masukkan nama pelayan"
              className="w-full px-3 py-2 border rounded-md text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal Lahir</label>
            <input
              type="date"
              name="tanggal_lahir"
              value={pelayan.tanggal_lahir}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Jenis Kelamin</label>
            <select
              name="jenis_kelamin"
              value={pelayan.jenis_kelamin}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Alamat</label>
            <input
              name="alamat"
              value={pelayan.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat"
              className="w-full px-3 py-2 border rounded-md text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
            <select
              name="department"
              value={pelayan.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih department</option>
              {departments.map((d) => (
                <option key={d.id_department} value={d.id_department}>
                  {d.nama_department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={pelayan.email}
              onChange={handleChange}
              placeholder="contoh@domain.com"
              className={`w-full px-3 py-2 border rounded-md text-sm text-gray-800 placeholder-gray-400 focus:ring-2 transition ${
                isEmailTaken ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {isEmailTaken && (
              <p className="text-red-600 text-sm mt-1">
                Email telah terdaftar. Silakan gunakan email lain.
              </p>
            )}
          </div>
        </div>

        {/* Upload QR Code (Opsional) */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Upload QR Code Rayon 3 Anda (jika punya)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="w-full px-3 py-2 border rounded-md text-sm text-gray-800 bg-white file:bg-blue-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md hover:file:bg-blue-700 transition"
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className={`w-full py-2 rounded-md text-white text-sm font-semibold transition ${
            isFormValid() && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </button>
      </form>
    </div>
  );
}
