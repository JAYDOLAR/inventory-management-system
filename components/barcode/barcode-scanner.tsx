"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scan, X } from "lucide-react"

interface BarcodeScannerProps {
  onScan: (code: string) => void
  onClose?: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "barcode-scanner",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          onScan(decodedText)
          stopScanning()
        },
        (error) => {
          // Scanning error - can be ignored
        }
      )
    }

    return () => {
      stopScanning()
    }
  }, [isScanning])

  function stopScanning() {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.error("Failed to clear scanner:", error)
      })
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  function handleClose() {
    stopScanning()
    onClose?.()
  }

  if (!isScanning) {
    return (
      <Button onClick={() => setIsScanning(true)} variant="outline">
        <Scan className="h-4 w-4 mr-2" />
        Scan Barcode
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scan Barcode</CardTitle>
            <CardDescription>
              Point camera at product barcode or QR code
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div id="barcode-scanner" className="w-full" />
      </CardContent>
    </Card>
  )
}
