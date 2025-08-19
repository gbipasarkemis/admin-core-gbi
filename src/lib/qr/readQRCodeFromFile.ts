import jsQR from 'jsqr'
import Cropper from 'cropperjs'
import { BrowserQRCodeReader } from '@zxing/browser'

export async function readQRCodeFromFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = document.createElement('img')
    const reader = new FileReader()
    let cropper: Cropper | null = null // ✅ Declare cropper here

    reader.onload = () => {
      img.src = reader.result as string
      img.style.display = 'none'
      document.body.appendChild(img)

      img.onload = () => {
        cropper = new Cropper(img, {
          autoCropArea: 0.7,
          movable: false,
          scalable: false,
          zoomable: false,
          ready: () => {
            const canvas = cropper!.getCroppedCanvas()
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              cleanup()
              return resolve(null)
            }

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, canvas.width, canvas.height)

            cleanup()

            if (code?.data) {
              resolve(code.data)
            } else {
              readWithZxing(file).then(resolve)
            }
          },
        })
      }
    }

    reader.readAsDataURL(file)

    function cleanup() {
      cropper?.destroy()
      img.remove()
    }
  })
}

async function readWithZxing(file: File): Promise<string | null> {
  const reader = new FileReader()
  const img = document.createElement('img')
  const zxing = new BrowserQRCodeReader()

  return new Promise((resolve) => {
    reader.onload = () => {
      img.src = reader.result as string
      img.onload = async () => {
        try {
          const result = await zxing.decodeFromImageElement(img)
          resolve(result.getText())
        } catch {
          resolve(null)
        } finally {
          img.remove()
        }
      }
    }
    reader.readAsDataURL(file)
  })
}
