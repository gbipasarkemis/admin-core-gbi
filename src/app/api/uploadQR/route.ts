import { NextRequest } from 'next/server';
import { uploadQRCodeImage } from '@/lib/qr/uploadQRCodeImage';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const kode = formData.get('kode') as string;
  const file = formData.get('file') as File;

  if (!kode || !file) {
    return new Response('Missing kode or file', { status: 400 });
  }

  const url = await uploadQRCodeImage(kode, file);
  if (!url) {
    return new Response('Upload failed', { status: 500 });
  }

  return new Response(JSON.stringify({ url }), { status: 200 });
}
