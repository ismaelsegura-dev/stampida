import { NextRequest, NextResponse } from 'next/server';

// Rate limiting en memoria por instancia (SOC 2 CC6.1 / CC7.2).
// En Vercel cada instancia serverless lleva su propio contador, así que el
// límite efectivo puede ser algo más permisivo que el nominal; aun así frena
// bots simples, fuerza bruta y abuso casual sin infraestructura extra.
// Limitación conocida y documentada en SECURITY.md: para un límite global
// estricto haría falta un store compartido (Redis/KV).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(req: NextRequest): string {
  // En Vercel, x-forwarded-for lo fija la plataforma y no es falsificable
  // desde el exterior.
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function tooManyRequests() {
  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Inténtalo de nuevo en unos minutos.' },
    { status: 429, headers: { 'Retry-After': '120' } }
  );
}
