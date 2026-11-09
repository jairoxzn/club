'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: any) => void
  fps?: number
  qrbox?: number
}

export default function QRScanner({
  onScanSuccess,
  onScanError,
  fps = 10,
  qrbox = 250,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const readerElementId = 'qr-reader-container'

  // Listar cámaras disponibles
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices)
          // Preferir cámara trasera si existe
          const backCam = devices.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('trasera') ||
              c.label.toLowerCase().includes('rear')
          )
          setSelectedCamera(backCam ? backCam.id : devices[0].id)
        } else {
          setErrorMessage('No se detectaron cámaras en este dispositivo.')
        }
      })
      .catch((err) => {
        console.warn('Error al detectar cámaras:', err)
        setErrorMessage('Permiso de cámara no concedido o no disponible.')
      })

    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async (cameraId?: string) => {
    setErrorMessage(null)
    const camId = cameraId || selectedCamera

    if (!camId) {
      setErrorMessage('Selecciona una cámara para comenzar.')
      return
    }

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId)
      }

      // Si ya estaba corriendo, detener primero
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }

      await scannerRef.current.start(
        camId,
        {
          fps,
          qrbox: { width: qrbox, height: qrbox },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          setLastScanned(decodedText)
          onScanSuccess(decodedText)
        },
        (err) => {
          if (onScanError) onScanError(err)
        }
      )
      setIsScanning(true)
    } catch (err: any) {
      console.error('Error al iniciar escáner:', err)
      setErrorMessage(
        err?.message || 'No se pudo acceder a la cámara. Revisa los permisos del navegador.'
      )
      setIsScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch (err) {
        console.warn('Error al detener scanner:', err)
      }
    }
    setIsScanning(false)
  }

  const toggleScanner = () => {
    if (isScanning) {
      stopScanner()
    } else {
      startScanner()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Escáner de Código QR</h3>
        </div>
        {isScanning && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Cámara activa
          </span>
        )}
      </div>

      {/* Selector de cámara si hay más de una */}
      {cameras.length > 1 && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Seleccionar cámara:
          </label>
          <select
            value={selectedCamera}
            disabled={isScanning}
            onChange={(e) => {
              setSelectedCamera(e.target.value)
              if (isScanning) {
                startScanner(e.target.value)
              }
            }}
            className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-gray-50 text-gray-700"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label || `Cámara ${c.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Contenedor del video */}
      <div className="relative rounded-xl overflow-hidden bg-gray-950 aspect-square flex items-center justify-center border-2 border-dashed border-gray-200">
        <div id={readerElementId} className="w-full h-full" />

        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white p-6 text-center">
            <CameraOff className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium mb-1">Cámara desactivada</p>
            <p className="text-xs text-gray-400 mb-4 max-w-xs">
              Haz clic en Iniciar Escaneo y concede los permisos de cámara en tu navegador.
            </p>
            <button
              type="button"
              onClick={() => startScanner()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              Iniciar Escaneo
            </button>
          </div>
        )}
      </div>

      {/* Mensaje de error si falla */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Feedback de último escaneo */}
      {lastScanned && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs text-green-700">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
            <span className="truncate">Código detectado: <strong>{lastScanned}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setLastScanned(null)}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Botón de control */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={toggleScanner}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
            isScanning
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isScanning ? (
            <>
              <CameraOff className="w-4 h-4" />
              Detener Cámara
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Escanear con Cámara
            </>
          )}
        </button>
      </div>
    </div>
  )
}

