import QRCode from 'qrcode';

/**
 * Combines a QR code and label text into one PNG image and returns it as a Blob.
 * @param text The data to encode in the QR code
 * @param label Visible label to render below the QR (e.g. 'Kode Pelayan: B59DF64')
 * @param options Optional customization: colors, size, font
 * @returns PNG Blob ready for upload or attachment
 */
export async function generateQRWithTextBlob(
  text: string,
  label: string,
  options?: {
    darkColor?: string;
    lightColor?: string;
    scale?: number;
    margin?: number;
    fontSize?: number;
    fontFamily?: string;
  }
): Promise<Blob> {
  const qrDataURL = await QRCode.toDataURL(text, {
    type: 'image/png',
    scale: options?.scale ?? 8,
    margin: options?.margin ?? 1,
    color: {
      dark: options?.darkColor ?? '#000000',
      light: options?.lightColor ?? '#FFFFFF',
    },
  });

  const qrImage = new Image();
  qrImage.src = qrDataURL;

  await new Promise((res, rej) => {
    qrImage.onload = () => res(true);
    qrImage.onerror = (err) => rej(new Error('Failed to load QR image'));
  });

  const canvas = document.createElement('canvas');
  const padding = 6;
  const fontSize = options?.fontSize ?? 16;
  const fontFamily = options?.fontFamily ?? 'Arial';

  canvas.width = qrImage.width;
  canvas.height = qrImage.height + padding + fontSize + padding;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not found');

  // Background
  ctx.fillStyle = options?.lightColor ?? '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // QR code
  ctx.drawImage(qrImage, 0, 0);

  // Label text
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = options?.darkColor ?? '#000000';
  ctx.textAlign = 'center';
  ctx.fillText(label, canvas.width / 2, canvas.height - padding);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to convert canvas to blob'));
      resolve(blob);
    }, 'image/png');
  });
}
