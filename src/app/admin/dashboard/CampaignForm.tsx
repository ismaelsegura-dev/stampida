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
          placeholder="Ej: Café de vainilla al 50% hoy"
          rows={2}
          maxLength={80}
          required
        />
        <p className="mt-1 flex justify-between text-xs text-stone-400">
          <span>Corto y directo: se verá entero en la notificación del móvil</span>
          <span className={mensaje.length > 50 ? 'text-amber-600' : ''}>{mensaje.length}/80</span>
        </p>
      </div>
      {feedback && <p className="text-sm text-stone-600">{feedback}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Enviando…' : 'Enviar a todos'}
      </Button>
    </form>
  );
}
