import Link from 'next/link';
import { ShaderBackground } from '@/components/ShaderBackground';

const features = [
  {
    title: 'Sin apps',
    description:
      'Tus clientes guardan su tarjeta en Google Wallet en 10 segundos. Nada que instalar, nada que descargar.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    ),
  },
  {
    title: 'Notificaciones push',
    description:
      'Manda ofertas y novedades a todos tus clientes directamente a su móvil desde tu panel de control.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    ),
  },
  {
    title: 'Sellos y premios',
    description:
      'Escanea el QR del cliente, suma sellos y el premio se canjea solo. Adiós a las tarjetas de cartón.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
      />
    ),
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <ShaderBackground className="absolute inset-0" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4 pt-16">
          <div className="w-full max-w-2xl rounded-2xl bg-black/70 p-10 text-center shadow-2xl backdrop-blur-md">
            <h1 className="text-6xl font-bold text-white mb-4">Stampida</h1>
            <p className="text-xl text-gray-300 mb-8">
              Tarjetas de fidelización digitales para comercios locales.
              Tus clientes las llevan en el móvil, tú controlas todo desde un panel.
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
        </div>

        <div className="px-4 pb-16">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-black/70 p-6 shadow-xl backdrop-blur-md"
              >
                <svg
                  className="mb-3 h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {f.icon}
                </svg>
                <h2 className="mb-2 text-lg font-bold text-white">{f.title}</h2>
                <p className="text-sm text-gray-300">{f.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Stampida · stampida.online
          </p>
        </div>
      </div>
    </main>
  );
}
