'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    logoUrl: '',
    colorPrimario: '#000000',
    sellosParaPremio: 8,
    textoPremio: 'Café gratis',
    lat: '',
    lng: '',
    radioMetros: 300,
    mensajeProximidad: '¡Estás cerca! Pásate y suma tu sello',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al registrar');
      }

      router.push('/admin/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sellosParaPremio' || name === 'radioMetros' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-2xl mx-auto bg-[#1A1A1A] rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Registro de Comercio</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Comercio
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL del Logo (imagen cuadrada, accesible públicamente)
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
                Color Primario
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
                required
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
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Radio de Proximidad (metros)
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
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Registrar Comercio
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/admin/login" className="text-white hover:underline">
            Acceder
          </Link>
        </p>
      </div>
    </div>
  );
}
