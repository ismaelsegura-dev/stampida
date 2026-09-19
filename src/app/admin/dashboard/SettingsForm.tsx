'use client';

import { useState } from 'react';

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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          URL del Logo
        </label>
        <input
          type="url"
          name="logoUrl"
          value={formData.logoUrl}
          onChange={handleChange}
          placeholder="https://ejemplo.com/logo.png"
          className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Color de la Tarjeta
          </label>
          <input
            type="color"
            name="colorPrimario"
            value={formData.colorPrimario}
            onChange={handleChange}
            className="w-full h-10 bg-[#0A0A0A] border border-gray-700 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sellos para Premio
          </label>
          <input
            type="number"
            name="sellosParaPremio"
            value={formData.sellosParaPremio}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Texto del Premio
        </label>
        <input
          type="text"
          name="textoPremio"
          value={formData.textoPremio}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Latitud
          </label>
          <input
            type="number"
            name="lat"
            value={formData.lat}
            onChange={handleChange}
            step="any"
            className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Longitud
          </label>
          <input
            type="number"
            name="lng"
            value={formData.lng}
            onChange={handleChange}
            step="any"
            className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Radio (m)
          </label>
          <input
            type="number"
            name="radioMetros"
            value={formData.radioMetros}
            onChange={handleChange}
            min="50"
            className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mensaje de Proximidad
        </label>
        <textarea
          name="mensajeProximidad"
          value={formData.mensajeProximidad}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
        />
        <p className="text-gray-500 text-xs mt-1">
          En Apple Wallet es el texto de la notificación al acercarse. En Google Wallet la
          notificación de cercanía la genera Google con el nombre del comercio.
        </p>
      </div>

      {feedback && <p className="text-sm text-gray-300">{feedback}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
