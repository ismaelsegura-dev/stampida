import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/prisma';
import { updateApplePass } from '@/lib/apple';
import { updateGoogleLoyaltyObject, sendGoogleWalletMessage } from '@/lib/google';

export async function POST(req: NextRequest) {
  try {
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

    const newSellos = customer.sellos + 1;
    let premio = false;
    let message = `Sello añadido. Tienes ${newSellos}/${customer.merchant.sellosParaPremio} sellos.`;

    if (newSellos >= customer.merchant.sellosParaPremio) {
      premio = true;
      message = `¡PREMIO! Has completado ${customer.merchant.sellosParaPremio} sellos. Canjea tu premio: ${customer.merchant.textoPremio}`;
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        sellos: premio ? 0 : newSellos,
        premiosCanjeados: premio ? customer.premiosCanjeados + 1 : customer.premiosCanjeados,
      },
    });

    await prisma.stampEvent.create({
      data: {
        customerId: customer.id,
        tipo: premio ? 'canje' : 'sello',
        nota: premio ? `Premio canjeado: ${customer.merchant.textoPremio}` : null,
      },
    });

    // Sincronización con los wallets en segundo plano: la respuesta al
    // escáner no espera a Google/Apple, que son lentos.
    const sellosActuales = premio ? 0 : newSellos;
    const notifBody = premio
      ? `¡Premio conseguido! 🎉 ${customer.merchant.textoPremio}`
      : `¡Sello añadido! Llevas ${sellosActuales}/${customer.merchant.sellosParaPremio}`;

    waitUntil(
      (async () => {
        const results = await Promise.allSettled([
          updateApplePass(customer.id),
          updateGoogleLoyaltyObject(customer.id),
          sendGoogleWalletMessage(customer.id, customer.merchant.nombre, notifBody),
        ]);
        results.forEach((r) => {
          if (r.status === 'rejected') console.error('Wallet sync error:', r.reason);
        });
      })()
    );

    return NextResponse.json({
      success: true,
      message,
      premio,
      sellos: premio ? 0 : newSellos,
      total: customer.merchant.sellosParaPremio,
    });
  } catch (error) {
    console.error('Stamp error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
