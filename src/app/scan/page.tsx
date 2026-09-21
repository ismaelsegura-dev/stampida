'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <Link href="/admin/dashboard" className="font-display text-xl italic">
            Stampida
          </Link>
          <span className="text-sm text-stone-500">Escáner</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <h1 className="mb-8 text-center font-display text-3xl tracking-tight">
            Escanear tarjeta
          </h1>

          {!scanning && !result && (
            <Button onClick={startScan} full>
              Iniciar escáner
            </Button>
          )}

          {scanning && (
            <div>
              <div id="reader" className="overflow-hidden rounded-2xl border border-line bg-white"></div>
              <Button
                variant="secondary"
                full
                className="mt-4"
                onClick={() => {
                  scannerRef.current?.stop();
                  setScanning(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          {result && (
            <div
              className={`rounded-3xl p-8 text-center text-white ${
                result.premio ? 'bg-green-600' : result.success ? 'bg-ink' : 'bg-red-600'
              }`}
            >
              {result.premio && (
                <div className="mb-4">
                  <svg className="mx-auto h-20 w-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <h2 className="mb-3 font-display text-3xl">
                {result.premio ? '¡Premio!' : result.success ? '¡Sello añadido!' : 'Error'}
              </h2>
              <p className="mb-6 text-lg opacity-90">{result.message}</p>
              <button
                onClick={() => {
                  setResult(null);
                  startScan();
                }}
                className="w-full rounded-full bg-white py-3 font-semibold text-ink transition hover:bg-stone-100"
              >
                Escanear otro
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
