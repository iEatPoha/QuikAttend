import QRCode from "qrcode"

export interface QRCodeData {
  classId: string
  timestamp: number
  teacherId: string
}

export async function generateQRCodeImage(data: QRCodeData): Promise<string> {
  const qrData = JSON.stringify(data)
  return await QRCode.toDataURL(qrData, {
    width: 256,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  })
}

export function parseQRCodeData(qrData: string): QRCodeData | null {
  try {
    const parsed = JSON.parse(qrData)
    if (parsed.classId && parsed.timestamp && parsed.teacherId) {
      return parsed as QRCodeData
    }
    return null
  } catch {
    return null
  }
}

export function isQRCodeExpired(timestamp: number, expiryMinutes = 1): boolean {
  const now = Date.now()
  const expiryTime = timestamp + expiryMinutes * 60 * 1000
  return now > expiryTime
}
