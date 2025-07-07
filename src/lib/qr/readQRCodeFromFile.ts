import jsQR from 'jsqr'
import Cropper from 'cropperjs'

export async function readQRCodeFromFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = document.createElement('img')
    const reader = new FileReader()

    reader.onload = () => {
      img.src = reader.result as string

      // ❗ Tambahkan ke DOM sementara
      img.style.display = 'none'
      document.body.appendChild(img)

      img.onload = () => {
        const cropper = new Cropper(img, {
          autoCropArea: 0.7,
          movable: false,
          scalable: false,
          zoomable: false,
          ready: () => {
            const canvas = (cropper as any).getCroppedCanvas()
            const ctx = canvas.getContext('2d')
            if (!ctx) return resolve(null)

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, canvas.width, canvas.height)

            cropper.destroy()
            img.remove() // 🧹 Bersihkan setelah selesai

            resolve(code?.data ?? null)
          },
        } as any)
      }
    }

    reader.readAsDataURL(file)
  })
}

