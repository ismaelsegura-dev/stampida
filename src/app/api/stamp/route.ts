import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/prisma';
import { updateApplePass } from '@/lib/apple';
import { updateGoogleLoyaltyObject, sendGoogleWalletMessage } from '@/lib/google';
import { referralsEnabled } from '@/lib/referrals';

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

    const referralsOn = referralsEnabled() && customer.merchant.referidosActivos;

    // El referido solo cuenta con el primer consumo real: comprobamos si el
    // cliente ya tenía algún evento antes de este sello.
    const esPrimerConsumo =
      referralsOn && customer.invitadoPorId
        ? (await prisma.stampEvent.count({ where: { customerId: customer.id } })) === 0
        : false;

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

    // Referidos: si es el primer consumo de un invitado, suma al que invitó
    let referralPush: { inviterId: string; body: string } | null = null;
    if (esPrimerConsumo && customer.invitadoPorId) {
      const inviter = await prisma.customer.update({
        where: { id: customer.invitadoPorId },
        data: { amigosTraidos: { increment: 1 } },
      });

      const paraPremio = customer.merchant.referidosParaPremio;
      const ganoPremio = inviter.amigosTraidos % paraPremio === 0;

      if (ganoPremio) {
        await prisma.customer.update({
          where: { id: inviter.id },
          data: { premiosReferidoPendientes: { increment: 1 } },
        });
        referralPush = {
          inviterId: inviter.id,
          body: `¡Has ganado ${customer.merchant.textoPremioReferido} por traer a tus amigos! Muéstralo en tu próxima visita`,
        };
      } else {
        const restan = paraPremio - (inviter.amigosTraidos % paraPremio);
        referralPush = {
          inviterId: inviter.id,
          body: `¡${customer.nombre} ha venido a ${customer.merchant.nombre} gracias a ti! Te ${restan === 1 ? 'queda 1 amigo' : `quedan ${restan} amigos`} para tu premio`,
        };
      }
    }

    // Sincronización con los wallets en segundo plano: la respuesta al
    // escáner no espera a Google/Apple, que son lentos.
    const sellosActuales = premio ? 0 : newSellos;
    const notifBody = premio
      ? `¡Premio conseguido! 🎉 ${customer.merchant.textoPremio}`
      : `¡Sello añadido! Llevas ${sellosActuales}/${customer.merchant.sellosParaPremio}`;

    waitUntil(
      (async () => {
        const tasks = [
          updateApplePass(customer.id),
          updateGoogleLoyaltyObject(customer.id),
          sendGoogleWalletMessage(customer.id, customer.merchant.nombre, notifBody),
        ];
        if (referralPush) {
          tasks.push(
            updateApplePass(referralPush.inviterId),
            updateGoogleLoyaltyObject(referralPush.inviterId),
            sendGoogleWalletMessage(referralPush.inviterId, customer.merchant.nombre, referralPush.body)
          );
        }
        const results = await Promise.allSettled(tasks);
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
      premiosReferidoPendientes: referralsOn ? customer.premiosReferidoPendientes : 0,
      textoPremioReferido: referralsOn ? customer.merchant.textoPremioReferido : null,
    });
  } catch (error) {
    console.error('Stamp error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
