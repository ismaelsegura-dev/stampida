import Link from 'next/link';
import { ShaderBackground } from '@/components/ShaderBackground';

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <ShaderBackground className="absolute inset-0 opacity-60" />
      <div className="relative z-10 mx-5 max-w-lg rounded-3xl border border-white/50 bg-white/80 px-8 py-12 text-center shadow-xl shadow-stone-900/5 backdrop-blur-xl sm:px-14 sm:py-16">
        <h1 className="font-display text-6xl tracking-tight text-ink sm:text-8xl">
          Stampida
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm text-stone-600 sm:text-base">
          Tarjetas de fidelización en el wallet de tus clientes
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/login"
            className="w-full rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800 sm:w-auto"
          >
            Acceder
          </Link>
          <Link
            href="/admin/register"
            className="w-full rounded-full border border-stone-300 bg-white/70 px-8 py-3 text-sm font-semibold backdrop-blur transition-colors hover:border-ink sm:w-auto"
          >
            Registrar comercio
          </Link>
        </div>
      </div>
    </main>
  );
}
