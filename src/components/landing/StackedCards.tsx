'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface Step {
  n: string;
  titulo: string;
  texto: string;
}

interface StackCardProps {
  step: Step;
  index: number;
  total: number;
}

function StackCard({ step, index, total }: StackCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const targetScale = 1 - (total - 1 - index) * 0.05;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top+=140',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const scale = gsap.utils.interpolate(1, targetScale, self.progress);
        gsap.set(card, {
          scale: Math.max(scale, targetScale),
          transformOrigin: 'center top',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [index, total]);

  return (
    <div
      ref={containerRef}
      className="sticky top-0 flex h-[78vh] items-start justify-center px-5"
      style={{ paddingTop: '14vh' }}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-3xl overflow-hidden rounded-[28px] bg-ink p-8 text-ivory shadow-2xl shadow-ink/40 sm:p-14"
        style={{ top: `${index * 26}px` }}
      >
        {/* textura sutil de puntos */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 30%, rgba(240,239,231,0.07) 1px, transparent 2px), radial-gradient(circle at 75% 70%, rgba(240,239,231,0.05) 1px, transparent 2px)',
            backgroundSize: '32px 32px, 26px 26px',
          }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-12">
          <p className="font-display text-7xl italic leading-none text-olive sm:text-8xl">
            {step.n}
          </p>
          <div>
            <h3 className="font-display text-3xl leading-[1.2] tracking-tight sm:text-4xl">
              {step.titulo}
            </h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ivory/70 sm:text-lg">
              {step.texto}
            </p>
          </div>
        </div>
        <p className="relative mt-10 text-[11px] uppercase tracking-[0.3em] text-ivory/30">
          Stampida · Cómo funciona
        </p>
      </div>
    </div>
  );
}

export default function StackedCards({ steps }: { steps: Step[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const tween = gsap.fromTo(
      header,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 85%' },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section id="como-funciona" ref={sectionRef} className="scroll-mt-24 bg-ivory">
      <div ref={headerRef} className="mx-auto max-w-6xl px-5 pt-24" style={{ opacity: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-olive">
          Cómo funciona
        </p>
        <h2 className="mt-3 max-w-xl font-display text-4xl leading-[1.2] tracking-tight text-ink sm:text-5xl sm:leading-[1.15]">
          En marcha el mismo día
        </h2>
        <p className="mt-4 max-w-md text-ink/60">
          Desliza y mira lo fácil que es.
        </p>
      </div>

      <div className="mx-auto max-w-6xl pb-10">
        {steps.map((step, index) => (
          <StackCard key={step.n} step={step} index={index} total={steps.length} />
        ))}
      </div>
    </section>
  );
}
