'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#ffffff'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: 2.2 + Math.random() * 1.8,
        delay: Math.random() * 0.6,
        round: Math.random() > 0.5,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedCheck({ big }: { big?: boolean }) {
  const size = big ? 96 : 72;
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" className="mx-auto">
      <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" className="check-circle" />
      <path fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" d="M14 27l8 8 16-16" className="check-mark" />
    </svg>
  );
}

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

  const onScanSuccess = async (decodedText: string) => {
    try {
      await scannerRef.current?.stop();
    } catch {}
    setScanning(false);
    await processScan(decodedText);
  };

  const startScan = async () => {
    setResult(null);
    setScanning(true);

    // Esperar a que React pinte el div #reader
    await new Promise((r) => setTimeout(r, 100));

    const scanner = new Html5Qrcode('reader');
    scannerRef.current = scanner;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    try {
      await scanner.start({ facingMode: 'environment' }, config, onScanSuccess, () => {});
    } catch (err) {
      // En ordenadores no hay cámara "trasera": reintentar con cualquier cámara
      try {
        await scanner.start({}, config, onScanSuccess, () => {});
      } catch (err2) {
        console.error('Error starting scanner:', err2);
        setScanning(false);
        setResult({
          success: false,
          message: 'No se pudo acceder a la cámara. Revisa los permisos del navegador.',
        });
      }
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
        try {
          navigator.vibrate?.(data.premio ? [80, 60, 80, 60, 200] : 120);
        } catch {}
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
            <>
              {result.premio && <Confetti />}
              <div
                className={`animate-stamp-pop rounded-3xl p-8 text-center text-white ${
                  result.premio ? 'bg-green-600' : result.success ? 'bg-ink' : 'bg-red-600'
                }`}
              >
                {result.success && (
                  <div className="mb-4 text-white">
                    <AnimatedCheck big={result.premio} />
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
