'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; premio?: boolean } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    setScanning(true);
    setResult(null);

    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await processScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setScanning(false);
      setResult({ success: false, message: 'Error al iniciar la cámara' });
    }
  };

  const processScan = async (url: string) => {
    try {
      const urlObj = new URL(url);
      const serial = urlObj.searchParams.get('serial');
      const token = urlObj.searchParams.get('token');

      if (!serial || !token) {
        setResult({ success: false, message: 'QR inválido' });
        return;
      }

      const res = await fetch('/api/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial, token }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          premio: data.premio,
        });
      } else {
        setResult({ success: false, message: data.error || 'Error al procesar' });
      }
    } catch (err) {
      setResult({ success: false, message: 'Error al procesar el QR' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Escanear QR</h1>

        {!scanning && !result && (
          <button
            onClick={startScan}
            className="w-full py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Iniciar Escáner
          </button>
        )}

        {scanning && (
          <div>
            <div id="reader" className="rounded-lg overflow-hidden"></div>
            <button
              onClick={() => {
                scannerRef.current?.stop();
                setScanning(false);
              }}
              className="w-full mt-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        )}

        {result && (
          <div
            className={`p-8 rounded-lg text-center ${
              result.premio ? 'bg-green-600' : result.success ? 'bg-blue-600' : 'bg-red-600'
            }`}
          >
            {result.premio && (
              <div className="mb-4">
                <svg className="w-20 h-20 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <h2 className="text-3xl font-bold text-white mb-4">
              {result.premio ? '¡PREMIO!' : result.success ? '¡Sello añadido!' : 'Error'}
            </h2>
            <p className="text-white text-lg mb-6">{result.message}</p>
            <button
              onClick={() => {
                setResult(null);
                startScan();
              }}
              className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Escanear otro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
