import Link from 'next/link';
import { ShaderBackground } from '@/components/ShaderBackground';

const steps = [
  {
    n: '01',
    title: 'El cliente escanea tu QR',
    text: 'Lo imprimes y lo pones en la barra. El cliente escanea, escribe su nombre y guarda la tarjeta en Google Wallet. Diez segundos, sin apps.',
  },
  {
    n: '02',
    title: 'Tú sellas con el móvil',
    text: 'En cada visita escaneas su tarjeta desde cualquier móvil o tablet. Los sellos se actualizan al instante en su wallet.',
  },
  {
    n: '03',
    title: 'Vuelven más a menudo',
    text: 'Manda ofertas con notificaciones push a todos tus clientes y avísales automáticamente cuando pasen cerca de tu local.',
  },
];

const features = [
  ['Sin apps', 'Ni tú ni tus clientes instaláis nada. Todo funciona en el navegador y en el wallet que ya llevan en el móvil.'],
  ['Notificaciones push', 'Escribe un mensaje en tu panel y llega a los móviles de todos tus clientes al momento.'],
  ['Avisos de proximidad', 'Cuando un cliente pasa a menos de 300 m de tu local, su tarjeta le recuerda que está cerca.'],
  ['Tu marca, tu diseño', 'Logo, colores y premio personalizados. La tarjeta es tuya; nosotros ponemos la tecnología.'],
  ['Premios automáticos', 'Al completar los sellos, el premio se canjea solo en el escáner. Sin fricción, sin trampas.'],
  ['Panel de control', 'Clientes, sellos, premios canjeados y campañas. Todo medido en tiempo real.'],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Nav */}
      <nav className="absolute top-0 z-20 w-full">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <span className="font-display text-2xl italic">Stampida</span>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/admin/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-stone-200/60"
            >
              Acceder
            </Link>
            <Link
              href="/admin/register"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <ShaderBackground className="absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/40 via-transparent to-paper" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-24 pb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Fidelización para comercios locales
          </p>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            Tus clientes, fieles.
            <br />
            <em className="italic">Sin apps, sin cartón.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-stone-600 sm:text-lg">
            Stampida pone tu tarjeta de sellos en el Google Wallet de tus
            clientes. Escaneas, sellas, premias y les hablas directamente a su
            móvil.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/admin/register"
              className="w-full rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-stone-800 sm:w-auto"
            >
              Crear mi tarjeta
            </Link>
            <Link
              href="#como-funciona"
              className="w-full rounded-full border border-stone-300 bg-white/70 px-8 py-3.5 text-sm font-semibold text-ink backdrop-blur transition-colors hover:border-ink sm:w-auto"
            >
              Cómo funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <h2 className="font-display text-3xl tracking-tight sm:text-5xl">
          Tres pasos y <em className="italic">listo</em>
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {steps.map((s) => (
            <div key={s.n}>
              <span className="font-display text-sm italic text-stone-400">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <h2 className="font-display text-3xl tracking-tight sm:text-5xl">
            Todo lo que un comercio necesita
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, text]) => (
              <div key={title} className="group">
                <h3 className="text-base font-semibold transition-transform duration-200 group-hover:translate-x-1">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 py-20 text-center sm:py-28">
        <h2 className="font-display text-4xl tracking-tight sm:text-6xl">
          Tu tarjeta, <em className="italic">hoy</em>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-stone-600">
          Registra tu comercio, personaliza tu tarjeta y empieza a fidelizar en
          minutos.
        </p>
        <Link
          href="/admin/register"
          className="mt-8 inline-block rounded-full bg-ink px-10 py-4 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-stone-800"
        >
          Empezar gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-stone-500 sm:flex-row">
          <span className="font-display italic text-ink">Stampida</span>
          <span>© {new Date().getFullYear()} Stampida · Hecho en Sevilla</span>
        </div>
      </footer>
    </main>
  );
}
