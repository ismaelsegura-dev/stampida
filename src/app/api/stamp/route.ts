import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateApplePass } from '@/lib/apple';
import { updateGoogleLoyaltyObject } from '@/lib/google';

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

    try {
      await updateApplePass(customer.id);
    } catch (err) {
      console.error('Error updating Apple pass:', err);
    }

    try {
      await updateGoogleLoyaltyObject(customer.id);
    } catch (err) {
      console.error('Error updating Google pass:', err);
    }

    // Notificación instantánea al móvil del cliente
    try {
      const { sendGoogleWalletMessage } = await import('@/lib/google');
      const sellosActuales = premio ? 0 : newSellos;
      const notifBody = premio
        ? `¡Premio conseguido! Canjea tu ${customer.merchant.textoPremio} 🎉`
        : `¡Sello añadido! Llevas ${sellosActuales}/${customer.merchant.sellosParaPremio} — te quedan ${customer.merchant.sellosParaPremio - sellosActuales} para tu ${customer.merchant.textoPremio}`;
      await sendGoogleWalletMessage(customer.id, customer.merchant.nombre, notifBody);
    } catch (err) {
      console.error('Error sending stamp notification:', err);
    }

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
