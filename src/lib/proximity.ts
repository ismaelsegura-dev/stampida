import { prisma } from '@/lib/prisma';

// Tras un sello el cliente está dentro del local: silenciamos las alertas de
// proximidad quitando `locations` del pase durante esta ventana. iOS las
// muestra como aviso fijo del sistema (no se pueden descartar), así que la
// única vía es que el pase deje de ser "relevante" temporalmente.
export const PROXIMITY_MUTE_MINUTES = 90;

export async function isProximityMuted(customerId: string): Promise<boolean> {
  const last = await prisma.stampEvent.findFirst({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  if (!last) return false;
  return Date.now() - last.createdAt.getTime() < PROXIMITY_MUTE_MINUTES * 60 * 1000;
}
