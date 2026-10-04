'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteMerchantButton({ merchantId, nombre }: { merchantId: string; nombre: string }) {
  const [confirming, setConfirming] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    if (text !== 'BORRAR') return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error al borrar');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:border-red-600"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="mb-3 text-sm text-red-800">
        ¿Seguro que quieres borrar <span className="font-bold">{nombre}</span>? Se eliminarán
        también todos sus clientes, sellos y campañas. Esta acción no se puede deshacer.
      </p>
      <p className="mb-2 text-xs text-red-600">
        Escribe <span className="font-mono font-bold">BORRAR</span> para confirmar:
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="BORRAR"
          className="flex-1 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:border-red-600 focus:outline-none"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={text !== 'BORRAR' || loading}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
          >
            {loading ? 'Borrando…' : 'Confirmar'}
          </button>
          <button
            onClick={() => {
              setConfirming(false);
              setText('');
              setError('');
            }}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-ink"
          >
            Cancelar
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
