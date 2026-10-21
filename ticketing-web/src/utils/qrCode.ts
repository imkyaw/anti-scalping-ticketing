import jsQR from 'jsqr'
import QRCode from 'qrcode'

const MAX_DECODE_DIMENSION = 1600

export class QrDecodeError extends Error {
  constructor(message = 'No QR code could be found in this image.') {
    super(message)
    this.name = 'QrDecodeError'
  }
}

/** Render text as a high-contrast PNG data URL (with quiet zone) for download and scanning. */
export function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 3,
    width: 360,
    color: { dark: '#0a0e17', light: '#ffffff' },
  })
}

/** Decode the first QR code found in an uploaded image file. */
export async function decodeQrFromImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new QrDecodeError('Please upload an image file (PNG or JPG).')
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new QrDecodeError('This image could not be read.')
  }

  const scale = Math.min(1, MAX_DECODE_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new QrDecodeError('This browser cannot read images.')

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const imageData = context.getImageData(0, 0, width, height)
  const result = jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' })
  if (!result?.data) throw new QrDecodeError()
  return result.data
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
}
