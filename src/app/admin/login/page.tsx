'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === 'EMAIL_NOT_VERIFIED'
          ? 'Tu cuenta aún no está verificada. Revisa tu email e introduce el código que te enviamos.'
          : 'Credenciales inválidas'
      );
    } else {
      const session = await fetch('/api/auth/session').then((r) => r.json());
      router.push(session?.user?.role === 'admin' ? '/admin/super' : '/admin/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-3xl italic text-ink">
          Stampida
        </Link>
        <Card className="p-8">
          <h1 className="mb-6 text-xl font-semibold">Acceso comercios</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" full disabled={loading}>
              {loading ? 'Accediendo…' : 'Acceder'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-stone-500">
          ¿No tienes cuenta?{' '}
          <Link href="/admin/register" className="font-medium text-ink hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
