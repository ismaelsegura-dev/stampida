import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Stampida</h1>
        <p className="text-xl text-gray-400 mb-8">
          Tarjetas de fidelización digitales para comercios locales
        </p>
        <div className="space-x-4">
          <Link
            href="/admin/login"
            className="inline-block px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Acceder Comercios
          </Link>
          <Link
            href="/admin/register"
            className="inline-block px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition"
          >
            Registrar Comercio
          </Link>
        </div>
      </div>
    </main>
  );
}
