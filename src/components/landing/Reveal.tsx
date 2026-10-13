'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

// Fade + slide al entrar en el viewport
export default function Reveal({ children, className, delay = 0, y = 40 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tween = gsap.fromTo(
      el,
      { y, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, y]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
