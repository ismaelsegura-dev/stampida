'use client';

import { useEffect, useState } from 'react';

interface JoinFormProps {
  merchantId: string;
  colorPrimario: string;
}

type Platform = 'android' | 'ios' | 'other';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  return 'other';
}

function AppleIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.45-2.35 1.05-3.11z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function JoinForm({ merchantId, colorPrimario }: JoinFormProps) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState<'apple' | 'google' | null>(null);
  const [platform, setPlatform] = useState<Platform>('other');

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, nombre, telefono }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo completar el registro');
      }

      const customer = await res.json();
      setCustomerId(customer.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    if (!customerId || walletLoading) return;
    setError('');
    setWalletLoading('apple');
    try {
      const res = await fetch('/api/passes/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      if (!res.ok) throw new Error('Apple Wallet no está disponible todavía');
      const blob = await res.blob();
      window.location.href = URL.createObjectURL(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error con Apple Wallet');
      setWalletLoading(null);
    }
  };

  const handleGoogle = async () => {
    if (!customerId || walletLoading) return;
    setError('');
    setWalletLoading('google');
    try {
      const res = await fetch('/api/passes/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      if (!res.ok) throw new Error('No se pudo generar la tarjeta');
      const { saveUrl } = await res.json();
      window.location.href = saveUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error con Google Wallet');
      setWalletLoading(null);
    }
  };

  if (customerId) {
    const googleFirst = platform !== 'ios';
    const googleBtn = (
      <button
        key="google"
        onClick={handleGoogle}
        disabled={walletLoading !== null}
        className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold transition active:scale-[0.99] disabled:opacity-60 ${
          googleFirst
            ? 'border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-50'
            : 'border border-stone-300 bg-white text-gray-900 hover:bg-gray-50'
        }`}
      >
        <GoogleIcon />
        {walletLoading === 'google' ? 'Abriendo Google Wallet…' : 'Guardar en Google Wallet'}
      </button>
    );
    const appleBtn = (
      <button
        key="apple"
        onClick={handleApple}
        disabled={walletLoading !== null}
        className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold transition active:scale-[0.99] disabled:opacity-60 ${
          !googleFirst
            ? 'bg-black text-white hover:bg-gray-800'
            : 'border border-stone-300 bg-white text-gray-900 hover:bg-gray-50'
        }`}
      >
        <AppleIcon />
        {walletLoading === 'apple' ? 'Abriendo Apple Wallet…' : 'Guardar en Apple Wallet'}
      </button>
    );

    return (
      <div>
        <p className="mb-5 text-center text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{nombre}</span>, tu tarjeta está
          lista. Guárdala en tu wallet:
        </p>
        <div className="space-y-3">
          {googleFirst ? [googleBtn, appleBtn] : [appleBtn, googleBtn]}
        </div>
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="join-nombre" className="mb-2 block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="join-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
          required
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div>
        <label htmlFor="join-telefono" className="mb-2 block text-sm font-medium text-gray-700">
          Teléfono (opcional)
        </label>
        <input
          id="join-telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          autoComplete="tel"
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full py-3.5 font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        style={{ backgroundColor: colorPrimario || '#0A0A0A' }}
      >
        {loading ? 'Creando tu tarjeta…' : 'Continuar'}
      </button>
    </form>
  );
}
