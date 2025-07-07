'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { readQRCodeFromFile } from '@/lib/qr/readQRCodeFromFile';
import { generateQRWithTextBlob } from '@/lib/qr/generateQRCodeBlob';
import { sendConfirmationEmail } from '@/lib/email/sendConfirmationEmail';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import LoadingOverlay from '@/components/LoadingOverlay';
// src/components/QRCodeCropper.tsx
import 'cropperjs/dist/cropper.css'



type Pelayan = {
  kode_pelayan: string;
  nama_pelayan: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  department: string;
  email: string;
  qrcode_url: string;
  created_at: string;
};

type Department = {
  id_department: string;
  nama_department: string;
};

export default function RegisterPelayan() {
  const [pelayan, setPelayan] = useState<Omit<Pelayan, 'kode_pelayan' | 'qrcode_url'>>({
    nama_pelayan: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    department: '',
    email: '',
    created_at: '',
  });

  const [editingKode, setEditingKode] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [data, setData] = useState<Pelayan[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);


  const generateKodePelayan = () => uuidv4().slice(0, 7).toUpperCase();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = editingKode !== null;

  const [showForm, setShowForm] = useState(false);

  const [searchNamaPelayan, setSearchNamaPelayan] = useState('');

  const fetchData = async () => {
    const { data: fetched } = await supabase.from('pelayan').select('*');
  
    if (fetched) {
      const sorted = fetched.sort((a, b) =>
        a.nama_pelayan.localeCompare(b.nama_pelayan)
      );
  
      setData(sorted as Pelayan[]);
    }
  };
  

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('id_department, nama_department');
    if (data) setDepartments(data);
  };

  const isFormValid = (): boolean => {
    const requiredFields = [
      pelayan.nama_pelayan,
      pelayan.tanggal_lahir,
      pelayan.jenis_kelamin,
      pelayan.alamat,
      pelayan.department,
      pelayan.email,
    ];
    return requiredFields.every((field) => typeof field === 'string' && field.trim() !== '') && !isEmailTaken;
  };
  
  
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;
  
      if (user && role === 'admin') {
        setIsAuthorized(true);
        await fetchData();
        await fetchDepartments();
      } else {
        router.push('/not-authorized'); // atau '/login'
      }
  
      setIsLoading(false);
    };
  
    checkAuthAndLoad();
  }, [router]);
  

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPelayan({ ...pelayan, [name]: value });

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
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (editingKode) {
        const { error } = await supabase
          .from('pelayan')
          .update(pelayan)
          .eq('kode_pelayan', editingKode);

        if (error) {
          setErrorMessage('Gagal mengupdate data.');
          toast.error('Gagal mengupdate data.'); // ⛔ Toast error muncul
          return;
        }

        setSuccessMessage('Data berhasil diperbarui!');
        toast.success('Data berhasil diperbarui!'); // ⛔ Toast error muncul
        setEditingKode(null);
      } else {
        const { data: existing } = await supabase
          .from('pelayan')
          .select('email')
          .eq('email', pelayan.email)
          .maybeSingle();

        if (existing) {
          setErrorMessage('Email sudah digunakan oleh pelayan lain.');
          toast.error('Email sudah digunakan oleh pelayan lain.'); // ⛔ Toast error muncul
          return;
        }

        let kode_pelayan = '';
        let qrCodeUrlForDB: string | null = null;

        if (file !== null) {
          // ✅ Read QR code from uploaded image
          const result = await readQRCodeFromFile(file);
          if (!result) {
            setErrorMessage('QR Code tidak valid.');
            toast.error('QR Code tidak valid.'); // ⛔ Toast error muncul
            return;
          }
          kode_pelayan = result;
          qrCodeUrlForDB = null; // 👈 jangan upload gambar, langsung null
   
          await sendConfirmationEmail({
            to_email: pelayan.email,
            to_name: pelayan.nama_pelayan,
            qrcode_url: qrCodeUrlForDB ?? '',
          });
          
        } else {
          kode_pelayan = generateKodePelayan();
          // const qrBlob = await generateQRCodeBlob(kode_pelayan);

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
            setErrorMessage('Gagal upload QR code.');
            toast.error('Gagal upload QR code.'); // ⛔ Toast error muncul
            return;
          }

          const { url } = await res.json();
          qrCodeUrlForDB = url;

          if (qrCodeUrlForDB) {
            await sendConfirmationEmail({
              to_email: pelayan.email,
              to_name: pelayan.nama_pelayan,
              qrcode_url: qrCodeUrlForDB,
            });
          }
        }

        const { error } = await supabase.from('pelayan').insert([
          {
            nama_pelayan: pelayan.nama_pelayan,
            tanggal_lahir: pelayan.tanggal_lahir,
            jenis_kelamin: pelayan.jenis_kelamin,
            alamat: pelayan.alamat,
            department: pelayan.department,
            email: pelayan.email,
            kode_pelayan,
            qrcode_url: qrCodeUrlForDB,
          },
        ]);

        if (error) {
          const message = error.message || 'Gagal menyimpan data.';
          setErrorMessage(message);
          toast.error(message);
          return;
        }

        setSuccessMessage('Registrasi berhasil!');
        toast.success('Registrasi berhasil!'); // 
      }

      setPelayan({
        nama_pelayan: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        alamat: '',
        department: '',
        email: '',
        created_at : ''
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // kosongkan visual file input
      }
      fetchData();
    } catch {
      setErrorMessage('Terjadi kesalahan saat proses.');
      toast.error('Terjadi kesalahan saat proses.'); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (p: Pelayan) => {
    setEditingKode(p.kode_pelayan);
    setShowForm(true); // 👈 auto buka form saat klik Edit
  
    const { kode_pelayan: _, qrcode_url: __, ...rest } = p;
    setPelayan({
      ...rest,
      department: String(p.department),
    });
  };
  

  const downloadQRCode = async (url: string, nama: string, kode: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const qrURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = qrURL;
      link.download = `QR_${nama}_${kode}.png`;
      link.click();
      URL.revokeObjectURL(qrURL);
    } catch (err) {
      console.error('Gagal mengunduh QR code:', err);
      toast.error('Gagal mengunduh QR code.'); 
    }
  };
  


  const handleDelete = async (kode: string) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: 'Data pelayan tidak dapat dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'p-4',
        actions: 'flex justify-center gap-3', // ← spasi antar tombol
        confirmButton:
          'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm',
        cancelButton:
          'bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded shadow-sm',
      },
      buttonsStyling: false,
    });
    
  
    if (result.isConfirmed) {
      await supabase.from('pelayan').delete().eq('kode_pelayan', kode);
      await fetchData();
  
      await Swal.fire({
        title: 'Berhasil dihapus',
        text: 'Data pelayan telah dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };
  
  const formatTimestampWIB = (iso: string) => {
    const date = new Date(iso);
    const offsetMs = 7 * 60 * 60 * 1000; // 7 jam dalam ms
    const wibDate = new Date(date.getTime() + offsetMs);
  
    const d = wibDate.getDate().toString().padStart(2, '0');
    const m = (wibDate.getMonth() + 1).toString().padStart(2, '0');
    const y = wibDate.getFullYear();
    const h = wibDate.getHours().toString().padStart(2, '0');
    const min = wibDate.getMinutes().toString().padStart(2, '0');
  
    return `${d}-${m}-${y} ${h}:${min}`;
  };
  
  

  // 🔒 Cek sebelum render
  if (isLoading)
  return (
    <LoadingOverlay />
  );

  if (!isAuthorized) return null;

  const filteredData = data.filter((p) =>
  p.nama_pelayan.toLowerCase().includes(searchNamaPelayan.toLowerCase())
  );

  return (
    <div>
      {showForm && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Form Tambah Pelayan</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Nama Pelayan */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Pelayan</label>
              <input
                name="nama_pelayan"
                placeholder="Masukkan nama lengkap"
                value={pelayan.nama_pelayan}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal Lahir</label>
              <input
                name="tanggal_lahir"
                type="date"
                value={pelayan.tanggal_lahir}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Jenis Kelamin</label>
              <select
                name="jenis_kelamin"
                value={pelayan.jenis_kelamin}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            {/* Alamat */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Alamat</label>
              <input
                name="alamat"
                placeholder="Masukkan alamat lengkap"
                value={pelayan.alamat}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
              <select
                name="department"
                value={pelayan.department}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Department</option>
                {departments.map((d) => (
                  <option key={d.id_department} value={d.id_department}>
                    {d.nama_department}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Contoh: nama@domain.com"
                value={pelayan.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                  ${isEmailTaken ? 'border-red-500 focus:ring-red-500' : ''}`}
              />

              {isEmailTaken && (
                <p className="text-red-600 text-sm mt-1">Email telah terdaftar. Silakan gunakan email lain.</p>
              )}
            </div>
          </div>

          {/* Upload QR Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Upload QR Code Rayon 3 Anda (jika punya)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isEditing}
              className={`w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                ${isEditing ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50'}
                file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm
                file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
            />
          </div>


          {/* Tombol Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`px-4 py-2 rounded-md text-white text-sm font-semibold transition ${
                isFormValid() && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting
                ? editingKode
                  ? 'Memperbarui...'
                  : 'Mendaftarkan...'
                : editingKode
                ? 'Update'
                : 'Tambah'}
            </button>

            {editingKode && (
              <button
                type="button"
                onClick={() => {
                  setEditingKode(null);
                  setPelayan({
                    nama_pelayan: '',
                    tanggal_lahir: '',
                    jenis_kelamin: '',
                    alamat: '',
                    department: '',
                    email: '',
                    created_at : ''
                  });
                  setFile(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-sm font-semibold transition"
              >
                Batal
              </button>
            )}
            </div>
        </form>
    </div>
    )}
     {showForm && (
      <br/>
       )}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium shadow-sm"
        >
          {showForm ? 'Tutup Form Pelayan' : 'Tambah Pelayan'}
        </button>
      </div>

      {/* 📋 Card Tabel */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Table Pelayan</h2>
      <div className="flex justify-end mb-4">
      <input
        type="text"
        placeholder="Cari nama pelayan..."
        value={searchNamaPelayan}
        onChange={(e) => setSearchNamaPelayan(e.target.value)}
        className="px-3 py-2 w-full max-w-xs border border-gray-300 rounded-md text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
    </div>


      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr >
            <th className="px-3 py-2 text-left font-medium text-gray-700">Kode</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Nama</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Tanggal Lahir</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Jenis Kelamin</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Alamat</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Department</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">QRCode</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Aksi</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">
              Created At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredData.map((p) => (
            <tr key={p.kode_pelayan}>
              <td className="px-3 py-2 text-gray-800">{p.kode_pelayan}</td>
              <td className="px-3 py-2 text-gray-800">{p.nama_pelayan}</td>
              <td className="px-3 py-2 text-gray-800">{p.email}</td>
              <td className="px-3 py-2 text-gray-800">
                {new Date(p.tanggal_lahir).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </td>
              <td className="px-3 py-2 text-gray-800">{p.jenis_kelamin}</td>
              <td className="px-3 py-2 text-gray-800">{p.alamat}</td>
              <td className="px-3 py-2 text-gray-800">{p.department}</td>
              <td className="px-3 py-2 text-gray-800">
              {p.qrcode_url ? (
                <button
                onClick={() => downloadQRCode(p.qrcode_url, p.nama_pelayan, p.kode_pelayan)}
                className="text-blue-600 underline"
              >
                Download
              </button>
              ) : (
                <span className="text-black-600 ">Qr Rayon</span>
              )}
              </td>

              <td className="px-3 py-2">
                <div className="flex gap-2 justify-start">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.kode_pelayan)}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </td>
              <td className="px-3 py-2 text-gray-800">
              {formatTimestampWIB(p.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-gray-600">
        Menampilkan {filteredData.length} dari total {data.length} pelayan.
      </p>

      </div>
    </div>
  );
}
