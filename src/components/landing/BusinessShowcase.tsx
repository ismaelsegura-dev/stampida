'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface Negocio {
  id: string;
  categoria: string;
  comercio: string;
  sellos: number;
  conseguidos: number;
  premio: string;
  notificacion: string;
  color: string;
}

const NEGOCIOS: Negocio[] = [
  {
    id: 'cafeterias',
    categoria: 'Cafeterías',
    comercio: 'Café Nómada',
    sellos: 10,
    conseguidos: 7,
    premio: 'El décimo café lo ponemos nosotros',
    notificacion: 'Buenos días. Hoy tueste fresco y tu décimo café te espera.',
    color: '#5C4033',
  },
  {
    id: 'barberias',
    categoria: 'Barberías',
    comercio: 'Navaja & Co.',
    sellos: 6,
    conseguidos: 4,
    premio: 'El sexto corte, a mitad de precio',
    notificacion: 'Se te ve el pelo largo… Esta semana huecos de tarde libres.',
    color: '#22303F',
  },
  {
    id: 'restaurantes',
    categoria: 'Restaurantes',
    comercio: 'Casa Amalia',
    sellos: 8,
    conseguidos: 5,
    premio: 'El postre corre de la casa',
    notificacion: 'Menú del día: arroz caldoso. A las 12:30 en tu móvil, como siempre.',
    color: '#7A3E2D',
  },
  {
    id: 'tiendas',
    categoria: 'Tiendas',
    comercio: 'Ultramarinos Vera',
    sellos: 8,
    conseguidos: 6,
    premio: 'Un detalle para los de siempre',
    notificacion: 'Ha llegado la cosecha nueva. A los de casa os la guardamos.',
    color: '#4A5240',
  },
];

export default function BusinessShowcase() {
  const [activo, setActivo] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const negocio = NEGOCIOS[activo];

  useEffect(() => {
    const card = cardRef.current;
    const notif = notifRef.current;
    if (!card || !notif) return;
    gsap.fromTo(
      card,
      { y: 24, opacity: 0, rotate: -1.5 },
      { y: 0, opacity: 1, rotate: 0, duration: 0.55, ease: 'power3.out' }
    );
    gsap.fromTo(
      notif,
      { y: -14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.15, ease: 'power3.out' }
    );
  }, [activo]);

  return (
    <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Selector tipográfico */}
      <div role="tablist" aria-label="Tipos de negocio" className="divide-y divide-ink/10 border-y border-ink/10">
        {NEGOCIOS.map((n, i) => {
          const seleccionado = i === activo;
          return (
            <button
              key={n.id}
              role="tab"
              aria-selected={seleccionado}
              onClick={() => setActivo(i)}
              className="group flex w-full items-baseline gap-5 py-5 text-left transition-colors"
            >
              <span
                className={`text-xs font-semibold tabular-nums transition-colors ${
                  seleccionado ? 'text-olive' : 'text-ink/30 group-hover:text-ink/60'
                }`}
              >
                0{i + 1}
              </span>
              <span
                className={`font-display text-3xl tracking-tight transition-all duration-300 sm:text-4xl ${
                  seleccionado
                    ? 'translate-x-1 text-ink sm:translate-x-2'
                    : 'text-ink/35 group-hover:translate-x-1 group-hover:text-ink/70'
                }`}
              >
                {n.categoria}
              </span>
              <span
                className={`ml-auto hidden max-w-[16ch] text-right text-xs leading-snug transition-all duration-300 sm:block ${
                  seleccionado ? 'text-ink/60 opacity-100' : 'opacity-0'
                }`}
              >
                {n.premio}
              </span>
            </button>
          );
        })}
      </div>

      {/* Previsualización: tarjeta + notificación */}
      <div className="relative mx-auto w-full max-w-sm">
        {/* Notificación estilo iOS */}
        <div
          ref={notifRef}
          className="relative z-10 mx-auto -mb-5 w-[92%] rounded-2xl border border-ink/5 bg-white/90 p-3.5 shadow-lg shadow-ink/10 backdrop-blur"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink font-display text-sm italic text-ivory">
              S
            </span>
            <div className="min-w-0">
              <p className="flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                {negocio.comercio}
                <span className="font-normal normal-case">ahora</span>
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink/85">
                {negocio.notificacion}
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta de fidelidad */}
        <div
          ref={cardRef}
          className="rounded-3xl p-6 pt-10 text-white shadow-2xl shadow-ink/30 transition-colors duration-500"
          style={{ backgroundColor: negocio.color }}
        >
          <div className="flex items-baseline justify-between">
            <p className="font-display text-2xl tracking-tight">{negocio.comercio}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
              Tarjeta de fidelidad
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-1.5">
            {Array.from({ length: negocio.sellos }).map((_, i) => (
              <span
                key={i}
                className={`flex-1 rounded-full border transition-colors duration-300 ${
                  i < negocio.conseguidos
                    ? 'aspect-square border-white bg-white'
                    : 'aspect-square border-white/35 bg-transparent'
                }`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <p className="text-sm font-semibold tabular-nums">
              {negocio.conseguidos}/{negocio.sellos} sellos
            </p>
            <p className="text-xs text-white/70">{negocio.premio}</p>
          </div>

          <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
            Powered by Stampida
          </p>
        </div>
      </div>
    </div>
  );
}
