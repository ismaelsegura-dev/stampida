import Link from 'next/link';
import { ShaderBackground } from '@/components/ShaderBackground';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <ShaderBackground className="absolute inset-0" />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-6xl font-bold text-black mb-4">Stampida</h1>
        <p className="text-xl text-gray-800 mb-8">
          Tarjetas de fidelización digitales para comercios locales
        </p>
        <div className="space-x-4">
          <Link
            href="/admin/login"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Acceder Comercios
          </Link>
          <Link
            href="/admin/register"
            className="inline-block px-6 py-3 border border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition"
          >
            Registrar Comercio
          </Link>
        </div>
      </div>
    </main>
  );
}
