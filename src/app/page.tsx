import Link from 'next/link';
import CrowdHero from '@/components/landing/CrowdHero';
import StackedCards, { Step } from '@/components/landing/StackedCards';
import Reveal from '@/components/landing/Reveal';

const CONTACT_MAILTO =
  'mailto:hola@stampida.online?subject=Quiero%20Stampida%20en%20mi%20negocio';

const pasos: Step[] = [
  {
    n: '01',
    titulo: 'Enseña tu QR',
    texto:
      'Te damos un QR personalizado para tu barra o tu escaparate. Tu cliente lo escanea con la cámara del móvil. Nada más.',
  },
  {
    n: '02',
    titulo: 'El cliente guarda tu tarjeta',
    texto:
      'En dos toques la guarda en Apple Wallet o Google Wallet, con tu logo y tus colores. Sin registrarse, sin descargar ninguna app.',
  },
  {
    n: '03',
    titulo: 'Suma sellos y haz que vuelvan',
    texto:
      'Escaneas su tarjeta para dar sellos, y cuando quieras les envías notificaciones al móvil: ofertas, novedades o un simple "te echamos de menos".',
  },
];

const negocios = [
  { emoji: '☕', titulo: 'Cafeterías', ejemplo: '9 cafés, el décimo gratis.' },
  { emoji: '💈', titulo: 'Barberías', ejemplo: '5 cortes y el sexto a mitad de precio.' },
  { emoji: '🍽️', titulo: 'Restaurantes', ejemplo: 'El menú del día, a las 12:30 en su móvil.' },
  { emoji: '🛍️', titulo: 'Tiendas', ejemplo: 'Premia a los de siempre.' },
];

const claves = [
  {
    titulo: 'Tu cliente no instala nada',
    texto: 'La tarjeta vive en el wallet que ya lleva en el móvil.',
  },
  {
    titulo: 'Notificaciones al móvil',
    texto: 'Campañas cuando tú quieras y avisos automáticos cuando pasan cerca.',
  },
  {
    titulo: 'Tu marca, no la nuestra',
    texto: 'Tu logo, tus colores, tu premio. Sin hardware ni permanencias.',
  },
];

export default function Home() {
  return (
    <main className="bg-ivory text-ink">
      {/* Header */}
      <header className="absolute top-0 z-20 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-2xl italic tracking-tight">Stampida</span>
          <nav className="hidden items-center gap-7 text-sm text-ink/70 md:flex">
            <a href="#como-funciona" className="transition-colors hover:text-ink">
              Cómo funciona
            </a>
            <a href="#negocios" className="transition-colors hover:text-ink">
              Para quién
            </a>
          </nav>
          <Link
            href="/admin/login"
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition-colors hover:border-ink"
          >
            Acceder
          </Link>
        </div>
      </header>

      {/* Hero: la estampida */}
      <CrowdHero />

      {/* Cómo funciona: tarjetas apiladas con scroll */}
      <StackedCards steps={pasos} />

      {/* Para quién + por qué (compacto) */}
      <section id="negocios" className="scroll-mt-24 border-t border-ink/10 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-olive">
              Para quién
            </p>
            <h2 className="mt-3 max-w-xl font-display text-4xl leading-[1.2] tracking-tight sm:text-5xl sm:leading-[1.15]">
              Hecho para el negocio de tu barrio
            </h2>
          </Reveal>

          <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {negocios.map((n, i) => (
              <Reveal key={n.titulo} delay={i * 0.08} y={20}>
                <div className="flex items-baseline gap-4 py-5">
                  <span className="text-2xl">{n.emoji}</span>
                  <h3 className="w-32 shrink-0 font-semibold sm:w-44">{n.titulo}</h3>
                  <p className="text-sm text-ink/60 sm:text-base">{n.ejemplo}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {claves.map((c, i) => (
              <Reveal key={c.titulo} delay={i * 0.1} y={30}>
                <div className="mb-4 h-px w-10 bg-olive" />
                <h3 className="font-semibold">{c.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{c.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-ink py-24 text-center text-ivory">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal>
            <p className="font-display text-5xl italic tracking-tight sm:text-6xl">Stampida</p>
            <h2 className="mt-6 font-display text-3xl leading-[1.2] tracking-tight sm:text-4xl">
              Haz que quieran volver.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ivory/70">
              Cuéntanos qué negocio tienes y te preparamos una demo con tu marca.
              Primer mes de prueba.
            </p>
            <a
              href={CONTACT_MAILTO}
              className="mt-8 inline-block rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              Quiero Stampida en mi negocio
            </a>
            <p className="mt-6 text-xs text-ivory/40">hola@stampida.online</p>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ivory/10 bg-ink py-8 text-ivory/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Stampida · Fidelización digital</p>
          <div className="flex items-center gap-5">
            <Link href="/admin/login" className="transition-colors hover:text-ivory">
              Acceso comercios
            </Link>
            <a href={CONTACT_MAILTO} className="transition-colors hover:text-ivory">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
