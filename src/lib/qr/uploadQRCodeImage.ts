import { supabaseAdmin } from '@/lib/supabaseAdminClient';

export async function uploadQRCodeImage(kodePelayan: string, qrBlob: Blob): Promise<string | null> {
  const filePath = `qrcodes/${kodePelayan}.png`;

  const { error } = await supabaseAdmin.storage
    .from('qrcodes')
    .upload(filePath, qrBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/png',
    });

  if (error) {
    console.error('Upload failed:', error.message);
    return null;
  }

  const { data } = supabaseAdmin.storage.from('qrcodes').getPublicUrl(filePath);
  return data?.publicUrl ?? null;
}
