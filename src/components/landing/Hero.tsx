'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CONTACT_MAILTO =
  'mailto:hola@stampida.online?subject=Quiero%20Stampida%20en%20mi%20negocio';

function WalletBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2" data-hero="badges">
      {[' Apple Wallet', ' Google Wallet', 'Sin apps que descargar'].map((b) => (
        <span
          key={b}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-3 py-1 text-xs font-medium text-ink"
        >
          {b}
        </span>
      ))}
    </div>
  );
}

function CardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm" data-hero="card">
      {/* Tarjeta */}
      <div className="rounded-3xl bg-ink p-6 text-ivory shadow-2xl shadow-ink/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-2xl italic">Stampida</p>
            <p className="mt-1 text-xs text-ivory/60">Cafetería La Plaza</p>
          </div>
          <span className="rounded-full bg-olive px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ivory">
            Fidelidad
          </span>
        </div>

        {/* Sellos */}
        <div className="mt-8 flex justify-between">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                i < 5
                  ? 'border-ivory bg-ivory font-display italic text-ink'
                  : 'border-ivory/30 text-ivory/40'
              }`}
            >
              S
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ivory/50">Premio</p>
            <p className="text-sm font-semibold">Café gratis</p>
          </div>
          <p className="font-display text-3xl italic">5/8</p>
        </div>

        {/* QR simulado */}
        <div className="mx-auto mt-6 grid h-20 w-20 grid-cols-5 gap-1 rounded-lg bg-ivory p-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <span
              key={i}
              className={`${[0, 1, 2, 5, 6, 10, 12, 14, 18, 19, 22, 23, 24, 4, 8, 16, 21].includes(i) ? 'bg-ink' : 'bg-transparent'} rounded-[1px]`}
            />
          ))}
        </div>
      </div>

      {/* Notificación flotante */}
      <div
        data-hero="float-1"
        className="absolute -right-3 -top-6 max-w-[220px] rotate-2 rounded-2xl border border-line bg-white p-3 shadow-xl shadow-ink/10 sm:-right-10"
      >
        <p className="text-[11px] font-semibold text-ink">Cafetería La Plaza</p>
        <p className="mt-0.5 text-[11px] text-stone-600">
          ¡Estás cerca! Pásate y suma tu sello ☕
        </p>
      </div>

      {/* Sello añadido */}
      <div
        data-hero="float-2"
        className="absolute -bottom-5 -left-3 -rotate-2 rounded-2xl border border-line bg-white p-3 shadow-xl shadow-ink/10 sm:-left-10"
      >
        <p className="text-[11px] font-semibold text-ink">✓ Sello añadido</p>
        <p className="mt-0.5 text-[11px] text-stone-600">Te quedan 3 para tu premio</p>
      </div>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Entrada escalonada
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('[data-hero="eyebrow"]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo(
          '[data-hero="title"]',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          '-=0.4'
        )
        .fromTo(
          '[data-hero="sub"]',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.6'
        )
        .fromTo(
          '[data-hero="ctas"]',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          '-=0.5'
        )
        .fromTo(
          '[data-hero="badges"]',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          '[data-hero="card"]',
          { y: 80, opacity: 0, rotate: 4 },
          { y: 0, opacity: 1, rotate: 0, duration: 1.1 },
          '-=0.9'
        )
        .fromTo(
          '[data-hero="float-1"]',
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' },
          '-=0.4'
        )
        .fromTo(
          '[data-hero="float-2"]',
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' },
          '-=0.3'
        );

      // Flotación continua de las notificaciones
      gsap.to('[data-hero="float-1"]', {
        y: -10,
        duration: 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('[data-hero="float-2"]', {
        y: 10,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.4,
      });

      // Parallax: la tarjeta sube más lento que el scroll
      gsap.to('[data-hero="card"]', {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto max-w-6xl overflow-hidden px-5 pb-24 pt-16 sm:pt-24">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <p
            data-hero="eyebrow"
            className="mb-5 inline-block rounded-full border border-olive/40 bg-olive/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-olive"
            style={{ opacity: 0 }}
          >
            Fidelización digital para negocios locales
          </p>
          <h1
            data-hero="title"
            className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ opacity: 0 }}
          >
            Haz que quieran volver.
          </h1>
          <p
            data-hero="sub"
            className="mt-6 max-w-md text-lg leading-relaxed text-ink/70"
            style={{ opacity: 0 }}
          >
            Tarjetas de fidelización digitales que tus clientes guardan en el wallet
            de su móvil. Sin apps, sin tarjetas de cartón, sin complicaciones.
          </p>
          <div data-hero="ctas" className="mt-8 flex flex-col gap-3 sm:flex-row" style={{ opacity: 0 }}>
            <a
              href={CONTACT_MAILTO}
              className="rounded-full bg-ink px-8 py-3.5 text-center text-sm font-semibold text-ivory transition-colors hover:bg-stone-800"
            >
              Quiero Stampida en mi negocio
            </a>
            <a
              href="#como-funciona"
              className="rounded-full border border-ink/25 px-8 py-3.5 text-center text-sm font-semibold transition-colors hover:border-ink"
            >
              Ver cómo funciona
            </a>
          </div>
          <div className="mt-8" style={{ opacity: 1 }}>
            <WalletBadges />
          </div>
        </div>
        <div className="py-8">
          <CardMockup />
        </div>
      </div>
    </section>
  );
}
