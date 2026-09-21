'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea, Label } from '@/components/ui/input';

export default function CampaignForm() {
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setFeedback(
          `Enviada: ${data.googleEnviados ?? 0} notificaciones Google Wallet, ${data.appleEnviados ?? 0} Apple Wallet (de ${data.destinatarios ?? 0} clientes)`
        );
        setMensaje('');
      } else {
        setFeedback(data.error || 'Error al enviar la campaña');
      }
    } catch {
      setFeedback('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="mensaje">Mensaje para todos tus clientes</Label>
        <Textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Ej: Hoy café de especialidad al 50% hasta las 12h"
          rows={3}
          required
        />
        <p className="mt-1 text-xs text-stone-400">
          Llegará como notificación al móvil de cada cliente con tu tarjeta
        </p>
      </div>
      {feedback && <p className="text-sm text-stone-600">{feedback}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Enviando…' : 'Enviar a todos'}
      </Button>
    </form>
  );
}
