'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea, Label } from '@/components/ui/input';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    logoUrl: '',
    colorPrimario: '#0A0A0A',
    sellosParaPremio: 8,
    textoPremio: 'Café gratis',
    lat: '',
    lng: '',
    radioMetros: 300,
    mensajeProximidad: '¡Estás cerca! Pásate y suma tu sello',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
      setLoading(false);
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
    <div className="min-h-screen bg-paper px-4 py-12">
      <div className="mx-auto w-full max-w-xl">
        <Link href="/" className="mb-8 block text-center font-display text-3xl italic text-ink">
          Stampida
        </Link>
        <Card className="p-6 sm:p-8">
          <h1 className="mb-1 text-xl font-semibold">Registra tu comercio</h1>
          <p className="mb-6 text-sm text-stone-500">
            Tu tarjeta de fidelización lista en minutos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del comercio</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} minLength={6} required />
              </div>
            </div>

            <div>
              <Label htmlFor="logoUrl">URL del logo (opcional)</Label>
              <Input id="logoUrl" type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://ejemplo.com/logo.png" />
              <p className="mt-1 text-xs text-stone-400">Imagen cuadrada accesible públicamente</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="colorPrimario">Color de la tarjeta</Label>
                <input
                  id="colorPrimario"
                  type="color"
                  name="colorPrimario"
                  value={formData.colorPrimario}
                  onChange={handleChange}
                  className="h-10 w-full cursor-pointer rounded-xl border border-line bg-white"
                />
              </div>
              <div>
                <Label htmlFor="sellosParaPremio">Sellos para premio</Label>
                <Input id="sellosParaPremio" type="number" name="sellosParaPremio" value={formData.sellosParaPremio} onChange={handleChange} min="1" required />
              </div>
            </div>

            <div>
              <Label htmlFor="textoPremio">Premio</Label>
              <Input id="textoPremio" name="textoPremio" value={formData.textoPremio} onChange={handleChange} required />
            </div>

            <details className="rounded-xl border border-line p-4">
              <summary className="cursor-pointer text-sm font-medium text-stone-600">
                Ubicación y avisos de proximidad (opcional)
              </summary>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="lat">Latitud</Label>
                    <Input id="lat" type="number" name="lat" value={formData.lat} onChange={handleChange} step="any" />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitud</Label>
                    <Input id="lng" type="number" name="lng" value={formData.lng} onChange={handleChange} step="any" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="radioMetros">Radio (m)</Label>
                    <Input id="radioMetros" type="number" name="radioMetros" value={formData.radioMetros} onChange={handleChange} min="50" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mensajeProximidad">Mensaje de proximidad</Label>
                  <Textarea id="mensajeProximidad" name="mensajeProximidad" value={formData.mensajeProximidad} onChange={handleChange} rows={2} />
                </div>
              </div>
            </details>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" full disabled={loading}>
              {loading ? 'Registrando…' : 'Registrar comercio'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-stone-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/admin/login" className="font-medium text-ink hover:underline">
            Acceder
          </Link>
        </p>
      </div>
    </div>
  );
}
