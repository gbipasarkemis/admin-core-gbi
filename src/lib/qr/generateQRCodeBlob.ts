import QRCode from 'qrcode'

export async function generateQRWithTextBlob(
  text: string,
  label: string,
  options?: {
    darkColor?: string
    lightColor?: string
    scale?: number
    margin?: number
    fontSize?: number
    fontFamily?: string
    cornerRadius?: number
    outerPadding?: number
  }
): Promise<Blob> {
  
  const qrDataURL = await QRCode.toDataURL(text, {
    type: 'image/png',
    scale: options?.scale ?? 10,
    margin: options?.margin ?? 1,
    color: {
      dark: options?.darkColor ?? '#000000',
      light: '#FFFFFF'
    }
  })

  const qrImage = new Image()
  qrImage.src = qrDataURL

  await new Promise((res, rej) => {
    qrImage.onload = () => res(true)
    qrImage.onerror = () => rej(new Error('Failed to load QR image'))
  })

  const innerPadding = 6
  const fontSize = options?.fontSize ?? 16
  const fontFamily = options?.fontFamily ?? 'Arial'
  const lineHeight = fontSize + innerPadding
  const radius = options?.cornerRadius ?? 16
  const outer = options?.outerPadding ?? 24

  const canvas = document.createElement('canvas')
  canvas.width = qrImage.width + outer * 2
  canvas.height = qrImage.height + lineHeight * 3 + outer * 2

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not found')

  // 🌈 Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, options?.lightColor ?? '#000080')
  gradient.addColorStop(1, '#FFA500')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 🏷️ Text di atas QR
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.fillStyle = options?.darkColor ?? '#FFFFFF'
  ctx.textAlign = 'center'
  ctx.fillText('GBI PASAR KEMIS', canvas.width / 2, outer + lineHeight)

  // 🟦 Draw QR with rounded corners
  const qrTop = outer + lineHeight * 1.5
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(outer + radius, qrTop)
  ctx.lineTo(canvas.width - outer - radius, qrTop)
  ctx.quadraticCurveTo(canvas.width - outer, qrTop, canvas.width - outer, qrTop + radius)
  ctx.lineTo(canvas.width - outer, qrTop + qrImage.height - radius)
  ctx.quadraticCurveTo(canvas.width - outer, qrTop + qrImage.height, canvas.width - outer - radius, qrTop + qrImage.height)
  ctx.lineTo(outer + radius, qrTop + qrImage.height)
  ctx.quadraticCurveTo(outer, qrTop + qrImage.height, outer, qrTop + qrImage.height - radius)
  ctx.lineTo(outer, qrTop + radius)
  ctx.quadraticCurveTo(outer, qrTop, outer + radius, qrTop)
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(qrImage, outer, qrTop)
  ctx.restore()

  // ✍️ Label (baris 1 bawah)
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.fillText(label, canvas.width / 2, qrTop + qrImage.height + lineHeight)

  // ✍️ Code asli (baris 2 bawah)
  ctx.font = `${fontSize - 2}px ${fontFamily}`
  ctx.fillText(`Code : ${text}`, canvas.width / 2, qrTop + qrImage.height + lineHeight * 2)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to convert canvas to blob'))
      resolve(blob)
    }, 'image/png')
  })
}
