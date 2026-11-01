import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendApplePush } from '@/lib/apple';
import { updateGoogleLoyaltyObject } from '@/lib/google';
import { PROXIMITY_MUTE_MINUTES } from '@/lib/proximity';

export const maxDuration = 60;

// Cron diario (vercel.json): devuelve la ubicación a los pases cuyo silencio
// de proximidad post-sello ya expiró. Al recibir el push, el iPhone pide el
// pase actualizado y generateApplePass vuelve a incluir `locations`.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - PROXIMITY_MUTE_MINUTES * 60 * 1000);

  const customers = await prisma.customer.findMany({
    where: {
      OR: [{ pushToken: { not: null } }, { googleObjectId: { not: null } }],
      stampEvents: { some: { createdAt: { lt: cutoff } } },
    },
    include: { stampEvents: { orderBy: { createdAt: 'desc' }, take: 1 } },
    take: 500,
  });

  let refreshed = 0;
  const errors: string[] = [];

  for (const c of customers) {
    const last = c.stampEvents[0];
    if (!last || last.createdAt >= cutoff) continue; // todavía silenciado
    try {
      if (c.pushToken) await sendApplePush(c.pushToken);
      if (c.googleObjectId) await updateGoogleLoyaltyObject(c.id);
      refreshed++;
    } catch (e) {
      console.error('refresh-passes error', c.id, e);
      errors.push(c.id);
    }
  }

  return NextResponse.json({ refreshed, checked: customers.length, errors });
}
