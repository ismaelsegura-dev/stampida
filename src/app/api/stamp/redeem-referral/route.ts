import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/prisma';
import { updateApplePass } from '@/lib/apple';
import { updateGoogleLoyaltyObject } from '@/lib/google';
import { referralsEnabled } from '@/lib/referrals';

export async function POST(req: NextRequest) {
  try {
    if (!referralsEnabled()) {
      return NextResponse.json({ error: 'No disponible' }, { status: 404 });
    }

    const { serial, token } = await req.json();

    if (!serial || !token) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { serialNumber: serial, authToken: token },
      include: { merchant: true },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado o token inválido' }, { status: 404 });
    }

    if (customer.premiosReferidoPendientes <= 0) {
      return NextResponse.json({ error: 'Este cliente no tiene premios de referidos pendientes' }, { status: 400 });
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { premiosReferidoPendientes: { decrement: 1 } },
    });

    await prisma.stampEvent.create({
      data: {
        customerId: customer.id,
        tipo: 'canje',
        nota: `Premio referidos: ${customer.merchant.textoPremioReferido}`,
      },
    });

    waitUntil(
      (async () => {
        const results = await Promise.allSettled([
          updateApplePass(customer.id),
          updateGoogleLoyaltyObject(customer.id),
        ]);
        results.forEach((r) => {
          if (r.status === 'rejected') console.error('Wallet sync error:', r.reason);
        });
      })()
    );

    return NextResponse.json({
      success: true,
      message: `Premio de referidos canjeado: ${customer.merchant.textoPremioReferido}`,
      premiosReferidoPendientes: customer.premiosReferidoPendientes - 1,
    });
  } catch (error) {
    console.error('Redeem referral error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
