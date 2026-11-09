import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/prisma';
import { updateApplePass } from '@/lib/apple';
import { updateGoogleLoyaltyObject, sendGoogleWalletMessage } from '@/lib/google';
import { checkRateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // 60/min por IP: de sobra para el ritmo real de una barra, frena abuso.
    if (!checkRateLimit(`stamp:${clientIp(req)}`, 60, 60 * 1000)) {
      return tooManyRequests();
    }

    const { serial, token, codigo } = await req.json();

    const porCodigo = typeof codigo === 'string' && codigo.length > 0;

    if (!porCodigo && (typeof serial !== 'string' || typeof token !== 'string' || serial.length > 64 || token.length > 128)) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    let customer = null;

    if (porCodigo) {
      // Plan B cuando la cámara no lee el QR: la empleada teclea el código
      // de 4 dígitos que el cliente lleva impreso en su tarjeta.
      if (!/^\d{4}$/.test(codigo)) {
        return NextResponse.json({ error: 'Código no válido (4 dígitos)' }, { status: 400 });
      }
      customer = await prisma.customer.findUnique({
        where: { codigoManual: codigo },
        include: { merchant: true },
      });
    } else {
      customer = await prisma.customer.findUnique({
        where: { serialNumber: serial, authToken: token },
        include: { merchant: true },
      });
    }

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado o código inválido' }, { status: 404 });
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
        nota: premio
          ? `Premio canjeado: ${customer.merchant.textoPremio}`
          : porCodigo
            ? 'Código manual'
            : null,
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
