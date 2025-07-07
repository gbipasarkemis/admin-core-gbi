'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Swal from 'sweetalert2';
import LoadingOverlay from '@/components/LoadingOverlay';

type Department = {
  id_department: number;
  nama_department: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [namaDepartment, setNamaDepartment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [searchDepartment, setSearchDepartment] = useState('');


  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('id_department', { ascending: true });

    if (error) console.error('Error fetching departments:', error.message);
    else setDepartments(data || []);

    setIsLoadingPage(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!namaDepartment.trim()) {
      setInputError('Nama department tidak boleh kosong.');
      setLoading(false);
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('departments')
        .update({ nama_department: namaDepartment })
        .eq('id_department', editingId);

      if (error) alert('Gagal update department: ' + error.message);
      else {
        setEditingId(null);
        setNamaDepartment('');
        fetchDepartments();
        setInputError('');
      }
    } else {
      const { error } = await supabase
        .from('departments')
        .insert({ nama_department: namaDepartment });

      if (error) alert('Gagal tambah department: ' + error.message);
      else {
        setNamaDepartment('');
        fetchDepartments();
        setInputError('');
      }
    }

    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus department ini?',
      text: 'Tindakan ini tidak dapat dibatalkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      buttonsStyling: false,
      customClass: {
        actions: 'flex justify-center gap-3',
        confirmButton:
          'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm',
        cancelButton:
          'bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded shadow-sm',
      },
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id_department', id);

    if (error) {
      Swal.fire({
        title: 'Gagal hapus',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } else {
      await Swal.fire({
        title: 'Terhapus!',
        text: 'Department telah dihapus.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchDepartments();
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id_department);
    setNamaDepartment(dept.nama_department);
    setShowForm(true);
  };
  

  const filteredDepartments = departments.filter((dept) =>
  dept.nama_department.toLowerCase().includes(searchDepartment.toLowerCase())
  );



  // 🔒 Cek sebelum render
  if (isLoadingPage)
  return (
    <LoadingOverlay />
  );

  return (
    <div>
      {showForm && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Form Tambah Department</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">
              Nama Department
            </label>
            <input
              type="text"
              placeholder="Masukkan nama department"
              value={namaDepartment}
              onChange={(e) => {
                setNamaDepartment(e.target.value);
                if (e.target.value.trim()) setInputError('');
              }}
              className={`w-full px-3 py-2 rounded-md border bg-white text-gray-800 placeholder-gray-400
                border-gray-300 focus:outline-none focus:ring-2 transition
                ${
                  inputError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'focus:ring-blue-500'
                }`}
            />
            {inputError && (
              <p className="text-red-600 text-sm mt-1">{inputError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !namaDepartment.trim()}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium transition ${
                loading || !namaDepartment.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {editingId ? 'Update' : 'Tambah'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setNamaDepartment('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-sm font-medium transition"
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
          {showForm ? 'Tutup Form Department' : 'Tambah Department'}
        </button>
      </div>
      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Table Department
        </h2>
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Cari nama department..."
            value={searchDepartment}
            onChange={(e) => setSearchDepartment(e.target.value)}
            className="px-3 py-2 w-full max-w-xs border border-gray-300 rounded-md text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                Nama Department
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDepartments.map((dept) => (
              <tr key={dept.id_department} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">
                  {dept.id_department}
                </td>
                <td className="px-3 py-2 text-gray-800">
                  {dept.nama_department}
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="px-3 py-1 rounded-md bg-amber-500 text-white hover:bg-amber-600 text-sm font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id_department)}
                      className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm text-gray-600">
          Menampilkan {filteredDepartments.length} dari total {departments.length} department.
        </p>

      </div>
    </div>
  );
}
