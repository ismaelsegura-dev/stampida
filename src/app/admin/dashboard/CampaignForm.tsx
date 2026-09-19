'use client';

import { useState } from 'react';

export default function CampaignForm() {
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje }),
      });
      
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const google = data.googleEnviados ?? 0;
        const apple = data.appleEnviados ?? 0;
        alert(`Campaña enviada: ${google} notificaciones Google Wallet, ${apple} Apple Wallet (de ${data.destinatarios ?? 0} clientes)`);
        setMensaje('');
        window.location.reload();
      } else {
        alert(data.error || 'Error al enviar la campaña');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Escribe tu mensaje para todos los clientes..."
        rows={3}
        className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar a todos los clientes'}
      </button>
    </form>
  );
}
