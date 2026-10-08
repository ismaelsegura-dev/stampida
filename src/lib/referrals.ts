import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Feature flag: con REFERRALS_ENABLED=false todo el sistema de referidos
// queda inactivo (la landing ignora ?ref, el contador no corre y la UI no se muestra).
export function referralsEnabled() {
  return process.env.REFERRALS_ENABLED === 'true';
}

const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

export function generateCodigoInvitacion(): string {
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

export async function ensureCodigoInvitacion(customerId: string): Promise<string> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { codigoInvitacion: true },
  });
  if (customer?.codigoInvitacion) return customer.codigoInvitacion;

  for (let i = 0; i < 5; i++) {
    const codigo = generateCodigoInvitacion();
    try {
      const updated = await prisma.customer.update({
        where: { id: customerId },
        data: { codigoInvitacion: codigo },
        select: { codigoInvitacion: true },
      });
      return updated.codigoInvitacion!;
    } catch {
      // colisión de unique, reintentar
    }
  }
  throw new Error('No se pudo generar el código de invitación');
}

// Valida un código ?ref= para una landing concreta: existe, pertenece al
// mismo comercio y (si se pasa) no es el propio cliente.
export async function lookupReferrer(codigo: string, merchantId: string) {
  const referrer = await prisma.customer.findUnique({
    where: { codigoInvitacion: codigo },
    select: { id: true, nombre: true, merchantId: true },
  });
  if (!referrer || referrer.merchantId !== merchantId) return null;
  return referrer;
}
