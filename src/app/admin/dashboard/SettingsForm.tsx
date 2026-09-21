'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/input';

interface MerchantSettings {
  logoUrl: string;
  colorPrimario: string;
  sellosParaPremio: number;
  textoPremio: string;
  lat: string;
  lng: string;
  radioMetros: number;
  mensajeProximidad: string;
}

export default function SettingsForm({ initial }: { initial: MerchantSettings }) {
  const [formData, setFormData] = useState<MerchantSettings>(initial);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sellosParaPremio' || name === 'radioMetros' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      const res = await fetch('/api/merchants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFeedback('Cambios guardados. La tarjeta de Google Wallet se ha actualizado.');
      } else {
        const data = await res.json().catch(() => ({}));
        setFeedback(data.error || 'Error al guardar');
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
        <Label htmlFor="s-logoUrl">URL del logo</Label>
        <Input
          id="s-logoUrl"
          type="url"
          name="logoUrl"
          value={formData.logoUrl}
          onChange={handleChange}
          placeholder="https://ejemplo.com/logo.png"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="s-colorPrimario">Color de la tarjeta</Label>
          <input
            id="s-colorPrimario"
            type="color"
            name="colorPrimario"
            value={formData.colorPrimario}
            onChange={handleChange}
            className="h-10 w-full cursor-pointer rounded-xl border border-line bg-white"
          />
        </div>
        <div>
          <Label htmlFor="s-sellosParaPremio">Sellos para premio</Label>
          <Input
            id="s-sellosParaPremio"
            type="number"
            name="sellosParaPremio"
            value={formData.sellosParaPremio}
            onChange={handleChange}
            min="1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="s-textoPremio">Texto del premio</Label>
        <Input
          id="s-textoPremio"
          name="textoPremio"
          value={formData.textoPremio}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="s-lat">Latitud</Label>
          <Input id="s-lat" type="number" name="lat" value={formData.lat} onChange={handleChange} step="any" />
        </div>
        <div>
          <Label htmlFor="s-lng">Longitud</Label>
          <Input id="s-lng" type="number" name="lng" value={formData.lng} onChange={handleChange} step="any" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="s-radioMetros">Radio (m)</Label>
          <Input
            id="s-radioMetros"
            type="number"
            name="radioMetros"
            value={formData.radioMetros}
            onChange={handleChange}
            min="50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="s-mensajeProximidad">Mensaje de proximidad</Label>
        <Textarea
          id="s-mensajeProximidad"
          name="mensajeProximidad"
          value={formData.mensajeProximidad}
          onChange={handleChange}
          rows={2}
        />
        <p className="mt-1 text-xs text-stone-400">
          En Apple Wallet es el texto exacto del aviso. En Google Wallet la
          notificación de cercanía la genera Google con el nombre del comercio.
        </p>
      </div>

      {feedback && <p className="text-sm text-stone-600">{feedback}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  );
}
