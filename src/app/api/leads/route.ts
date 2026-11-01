import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLeadNotificationEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export async function POST(req: Request) {
  let body: { negocio?: unknown; email?: unknown; color?: unknown; sellos?: unknown; premio?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const negocio = typeof body.negocio === 'string' ? body.negocio.trim().slice(0, 60) : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 120) : '';
  const color = typeof body.color === 'string' && HEX_RE.test(body.color) ? body.color : '';
  const sellos = typeof body.sellos === 'number' ? Math.round(body.sellos) : NaN;
  const premio = typeof body.premio === 'string' ? body.premio.trim().slice(0, 80) : '';

  if (!negocio || !EMAIL_RE.test(email) || !color || !(sellos >= 4 && sellos <= 12) || !premio) {
    return NextResponse.json({ error: 'Revisa los campos del formulario' }, { status: 400 });
  }

  try {
    const lead = await prisma.lead.create({
      data: { negocio, email, color, sellos, premio },
    });
    sendLeadNotificationEmail(lead).catch((e) =>
      console.error('[leads] Error enviando aviso:', e)
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[leads] Error guardando lead:', e);
    return NextResponse.json({ error: 'No se pudo guardar. Inténtalo de nuevo.' }, { status: 500 });
  }
}
