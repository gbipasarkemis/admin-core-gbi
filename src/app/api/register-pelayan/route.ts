// app/api/register-pelayan/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import emailjs from '@emailjs/nodejs';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const formData = await req.formData();

  const nama_pelayan = formData.get('nama_pelayan')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const tanggal_lahir = formData.get('tanggal_lahir')?.toString() || '';
  const jenis_kelamin = formData.get('jenis_kelamin')?.toString() || '';
  const alamat = formData.get('alamat')?.toString() || '';
  const department = formData.get('department')?.toString() || '';
  const kode_pelayan = formData.get('kode_pelayan')?.toString();
  const qrcode_url = formData.get('qrcode_url')?.toString();

  try {
    const { error } = await supabase.from('pelayan').insert({
      nama_pelayan,
      email,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      department,
      kode_pelayan,
      qrcode_url,
    });

    if (error) throw error;

    // Kirim email
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_QR!,
      {
        to_name: nama_pelayan,
        to_email: email,
        qrcode_url: qrcode_url || '', // hanya diisi jika tersedia
      },
      {
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Gagal registrasi:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
