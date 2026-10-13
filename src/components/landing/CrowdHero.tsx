'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CONTACT_MAILTO =
  'mailto:hola@stampida.online?subject=Quiero%20Stampida%20en%20mi%20negocio';

interface CrowdCanvasProps {
  src: string;
  rows?: number;
  cols?: number;
}

// Multitud de personas caminando (sprite openpeeps, CC0).
// Inspirado en https://codepen.io/zadvorsky/pen/xxwbBQV
function CrowdCanvas({ src, rows = 15, cols = 7 }: CrowdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const randomRange = (min: number, max: number) => min + Math.random() * (max - min);
    const randomIndex = (array: any[]) => (randomRange(0, array.length) | 0);
    const removeFromArray = (array: any[], i: number) => array.splice(i, 1)[0];
    const removeItemFromArray = (array: any[], item: any) =>
      removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = (array: any[]) =>
      removeFromArray(array, randomIndex(array));
    const getRandomFromArray = (array: any[]) => array[randomIndex(array) | 0];

    type Peep = {
      image: HTMLImageElement;
      rect: number[];
      width: number;
      height: number;
      s: number;
      x: number;
      y: number;
      anchorY: number;
      scaleX: number;
      walk: gsap.core.Timeline | null;
      setRect: (rect: number[]) => void;
      render: (ctx: CanvasRenderingContext2D) => void;
    };

    const stage = { width: 0, height: 0 };
    const img = document.createElement('img');

    const resetPeep = (peep: Peep) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random());
      // Los que caminan más abajo están más cerca: más grandes
      peep.s = 0.34 + ((offsetY + 150) / 250) * 0.26;
      const h = peep.height * peep.s;
      const startY = stage.height - h + offsetY;
      let startX: number;
      let endX: number;

      if (direction === 1) {
        startX = -peep.width * peep.s;
        endX = stage.width;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width * peep.s;
        endX = 0;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return { startX, startY, endX };
    };

    const normalWalk = (peep: Peep, props: { startY: number; endX: number }) => {
      const { startY, endX } = props;
      const xDuration = 10;
      const yDuration = 0.25;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.5, 1.5));
      tl.to(peep, { duration: xDuration, x: endX, ease: 'none' }, 0);
      tl.to(
        peep,
        { duration: yDuration, repeat: xDuration / yDuration, yoyo: true, y: startY - 10 },
        0
      );
      return tl;
    };

    const createPeep = (image: HTMLImageElement, rect: number[]): Peep => {
      const peep: Peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        anchorY: 0,
        s: 1,
        scaleX: 1,
        walk: null,
        setRect: (r: number[]) => {
          peep.rect = r;
          peep.width = r[2];
          peep.height = r[3];
        },
        render: (c: CanvasRenderingContext2D) => {
          c.save();
          c.translate(peep.x, peep.y);
          c.scale(peep.scaleX * peep.s, peep.s);
          c.drawImage(
            peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.width,
            peep.height
          );
          c.restore();
        },
      };
      peep.setRect(rect);
      return peep;
    };

    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];

    const createPeeps = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      const total = rows * cols;
      const rectWidth = width / rows;
      const rectHeight = height / cols;

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          createPeep(img, [
            (i % rows) * rectWidth,
            ((i / rows) | 0) * rectHeight,
            rectWidth,
            rectHeight,
          ])
        );
      }
    };

    const addPeepToCrowd = () => {
      const peep = removeRandomFromArray(availablePeeps);
      const walk = normalWalk(peep, resetPeep(peep)).eventCallback('onComplete', () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });
      peep.walk = walk;
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const removePeepFromCrowd = (peep: Peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    const MAX_CROWD = 42;

    const initCrowd = () => {
      while (availablePeeps.length && crowd.length < MAX_CROWD) {
        addPeepToCrowd().walk?.progress(Math.random());
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      crowd.forEach((peep) => peep.render(ctx));
      ctx.restore();
    };

    const resize = () => {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * devicePixelRatio;
      canvas.height = stage.height * devicePixelRatio;

      crowd.forEach((peep) => peep.walk?.kill());
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);
      initCrowd();
    };

    img.onload = () => {
      createPeeps();
      resize();
      gsap.ticker.add(render);
    };
    img.src = src;

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(render);
      crowd.forEach((peep) => peep.walk?.kill());
    };
  }, [src, rows, cols]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute bottom-0 left-0 h-[62vh] w-full sm:h-[70vh]"
    />
  );
}

export default function CrowdHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('[data-hero="eyebrow"]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.2 })
        .fromTo('[data-hero="title"]', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=0.4')
        .fromTo('[data-hero="sub"]', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
        .fromTo('[data-hero="ctas"]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
        .fromTo('[data-hero="badges"]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4');
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Contenido centrado */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-[42vh] pt-28 text-center sm:pb-[38vh]">
        <p
          data-hero="eyebrow"
          className="mb-6 inline-block rounded-full border border-olive/40 bg-olive/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-olive"
          style={{ opacity: 0 }}
        >
          Fidelización digital para negocios locales
        </p>
        <h1
          data-hero="title"
          className="font-display text-6xl leading-[1.02] tracking-tight sm:text-7xl lg:text-8xl"
          style={{ opacity: 0 }}
        >
          Haz que quieran volver.
        </h1>
        <p
          data-hero="sub"
          className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70"
          style={{ opacity: 0 }}
        >
          Tarjetas de fidelización digitales que tus clientes guardan en el wallet
          de su móvil. Sin apps, sin tarjetas de cartón, sin complicaciones.
        </p>
        <div
          data-hero="ctas"
          className="mt-9 flex flex-col gap-3 sm:flex-row"
          style={{ opacity: 0 }}
        >
          <a
            href={CONTACT_MAILTO}
            className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-stone-800"
          >
            Quiero Stampida en mi negocio
          </a>
          <a
            href="#como-funciona"
            className="rounded-full border border-ink/25 px-8 py-3.5 text-sm font-semibold transition-colors hover:border-ink"
          >
            Ver cómo funciona
          </a>
        </div>
        <div data-hero="badges" className="mt-8 flex flex-wrap items-center justify-center gap-2" style={{ opacity: 0 }}>
          {[' Apple Wallet', ' Google Wallet', 'Sin apps que descargar'].map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-ivory/60 px-3 py-1 text-xs font-medium text-ink backdrop-blur-sm"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* La estampida */}
      <CrowdCanvas src="/crowd-sprite.png" />

      {/* Fundido hacia la siguiente sección */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-b from-transparent to-ivory" />
    </section>
  );
}
