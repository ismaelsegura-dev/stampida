'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function InviteCodeForm() {
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const router = useRouter();

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNewCode('');

    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewCode(data.code);
        setNota('');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={generate} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Nota (ej: Cafetería Ramón, venta 12 oct)"
          className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Generando…' : 'Generar código'}
        </Button>
      </div>
      {newCode && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-center font-mono text-lg font-bold tracking-wider text-green-800">
          {newCode}
        </p>
      )}
    </form>
  );
}
