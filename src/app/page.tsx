import Link from 'next/link';
import Hero from '@/components/landing/Hero';
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
  {
    emoji: '☕',
    titulo: 'Cafeterías',
    ejemplo: '9 cafés, el décimo gratis. El clásico de siempre, sin cartón que se pierde.',
  },
  {
    emoji: '💈',
    titulo: 'Barberías',
    ejemplo: '5 cortes y el sexto a mitad de precio. Tu silla, siempre ocupada.',
  },
  {
    emoji: '🍽️',
    titulo: 'Restaurantes',
    ejemplo: 'Avisa del menú del día a las 12:30, justo cuando deciden dónde comer.',
  },
  {
    emoji: '🛍️',
    titulo: 'Tiendas locales',
    ejemplo: 'Premia a los de siempre y entérate de quiénes son de verdad.',
  },
];

const ventajas = [
  {
    titulo: 'Tu cliente no instala nada',
    texto:
      'La tarjeta vive en el wallet que ya lleva en el móvil. Cero fricción: escanear, guardar, listo.',
  },
  {
    titulo: 'Notificaciones a tu clientela',
    texto:
      'Manda un mensaje al móvil de todos tus clientes cuando te interese: el nuevo brownie, el descuento del martes, lo que sea.',
  },
  {
    titulo: 'Avisos de proximidad',
    texto:
      'Cuando un cliente pasa cerca de tu local, su móvil le recuerda que estás ahí. Tú eliges el radio y el mensaje.',
  },
  {
    titulo: 'Tu marca, no la nuestra',
    texto:
      'La tarjeta lleva tu logo y tus colores. Nosotros estamos en una esquinita, como debe ser.',
  },
  {
    titulo: 'Panel de control sencillo',
    texto:
      'Ves cuántos clientes tienes, los sellos que llevan y los premios canjeados. Sin manuales.',
  },
  {
    titulo: 'Sin hardware ni compromisos',
    texto:
      'Funciona con el móvil que ya tienes. Sin datáfonos raros, sin permanencias, sin letra pequeña.',
  },
];

const faqs = [
  {
    q: '¿Mis clientes tienen que descargarse una app?',
    a: 'No. La tarjeta se guarda directamente en Apple Wallet o Google Wallet, que ya vienen instaladas en su móvil. Escanear un QR y dos toques: así de simple.',
  },
  {
    q: '¿Cómo doy los sellos?',
    a: 'Desde el móvil o tablet del negocio: abres el escáner de Stampida, apuntas al QR de la tarjeta del cliente y listo. Tarda lo mismo que cobrar.',
  },
  {
    q: '¿Puedo personalizar la tarjeta con mi marca?',
    a: 'Sí: tu logo, tu color y tu premio. "9 sellos y el décimo café gratis", lo que tú decidas. Stampida solo aparece discretamente como tecnología.',
  },
  {
    q: '¿Cómo funcionan las notificaciones?',
    a: 'Tienes dos tipos: campañas que envías tú cuando quieras a todos tus clientes, y avisos de proximidad automáticos cuando pasan cerca de tu local. Ambos llegan directos a su móvil.',
  },
  {
    q: '¿Necesito contratar nada más o comprar aparatos?',
    a: 'No. Solo necesitas un móvil u ordenador con internet. Imprimes tu QR de alta (te lo damos nosotros) y empiezas el mismo día.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Una cuota mensual sencilla, pensada para negocios locales, con el primer mes de prueba. Escríbenos y te lo contamos sin compromiso.',
  },
];

export default function Home() {
  return (
    <main className="bg-ivory text-ink">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-ivory/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-display text-2xl italic tracking-tight">Stampida</span>
          <nav className="hidden items-center gap-7 text-sm text-ink/70 md:flex">
            <a href="#como-funciona" className="transition-colors hover:text-ink">
              Cómo funciona
            </a>
            <a href="#negocios" className="transition-colors hover:text-ink">
              Para quién
            </a>
            <a href="#faq" className="transition-colors hover:text-ink">
              Preguntas
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

      {/* Hero animado */}
      <Hero />

      {/* Franja negra */}
      <section className="overflow-hidden bg-ink py-20 text-ivory">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="mx-auto max-w-3xl text-center font-display text-3xl leading-snug tracking-tight sm:text-4xl">
              La tarjeta de sellos de toda la vida,{' '}
              <span className="italic text-piedra">sin el cartón que se pierde,</span>{' '}
              sin la app que nadie descarga.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[' Apple Wallet', ' Google Wallet', 'Sin apps que descargar'].map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-xs font-medium text-ivory"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cómo funciona: tarjetas apiladas con scroll */}
      <StackedCards steps={pasos} />

      {/* Negocios */}
      <section id="negocios" className="scroll-mt-24 border-y border-ink/10 bg-paper py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-olive">
              Para quién
            </p>
            <h2 className="mt-3 max-w-xl font-display text-4xl leading-[1.2] tracking-tight sm:text-5xl sm:leading-[1.15]">
              Hecho para el negocio de tu barrio
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {negocios.map((n, i) => (
              <Reveal key={n.titulo} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-line bg-ivory p-7 transition-shadow hover:shadow-lg hover:shadow-ink/5">
                  <p className="text-3xl">{n.emoji}</p>
                  <h3 className="mt-4 text-lg font-semibold">{n.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{n.ejemplo}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ventajas */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-olive">
            Por qué Stampida
          </p>
          <h2 className="mt-3 max-w-xl font-display text-4xl leading-[1.2] tracking-tight sm:text-5xl sm:leading-[1.15]">
            Simple para ti. Invisible para tu cliente.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ventajas.map((v, i) => (
            <Reveal key={v.titulo} delay={(i % 3) * 0.1} y={30}>
              <div className="mb-4 h-px w-10 bg-olive" />
              <h3 className="font-semibold">{v.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{v.texto}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA intermedio */}
      <section className="bg-olive py-20 text-ivory">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <Reveal>
            <h2 className="font-display text-4xl leading-[1.2] tracking-tight sm:text-5xl sm:leading-[1.15]">
              Premia cada visita.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ivory/80">
              Te lo enseñamos con tu propio negocio en una llamada de 10 minutos.
              Si te encaja, empezamos esa misma semana.
            </p>
            <a
              href={CONTACT_MAILTO}
              className="mt-8 inline-block rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              Hablar con Stampida
            </a>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-olive">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 font-display text-4xl leading-[1.2] tracking-tight sm:text-5xl sm:leading-[1.15]">
            Lo que todo el mundo pregunta
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 text-xl text-ink/40 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA final */}
      <section className="bg-ink py-24 text-center text-ivory">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal>
            <p className="font-display text-5xl italic tracking-tight sm:text-6xl">Stampida</p>
            <h2 className="mt-6 font-display text-3xl tracking-tight sm:text-4xl">
              Haz que quieran volver.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ivory/70">
              Cuéntanos qué negocio tienes y te preparamos una demo con tu marca.
            </p>
            <a
              href={CONTACT_MAILTO}
              className="mt-8 inline-block rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              Quiero Stampida en mi negocio
            </a>
            <p className="mt-6 text-xs text-ivory/40">
              hola@stampida.online · Primer mes de prueba
            </p>
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
