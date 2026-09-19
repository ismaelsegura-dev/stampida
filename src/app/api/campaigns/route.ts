import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { mensaje } = await req.json();
    if (!mensaje) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const merchantId = session.user.id;

    const campaign = await prisma.campaign.create({
      data: {
        merchantId,
        mensaje,
      },
    });

    const customers = await prisma.customer.findMany({
      where: { merchantId },
    });

    let googleEnviados = 0;
    let appleEnviados = 0;

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });

    for (const customer of customers) {
      if (customer.pushToken) {
        try {
          const { sendApplePush } = await import('@/lib/apple');
          await sendApplePush(customer.pushToken);
          appleEnviados++;
        } catch (err) {
          console.error('Error sending Apple push to customer:', customer.id, err);
        }
      }

      if (customer.googleObjectId) {
        try {
          const { sendGoogleWalletMessage } = await import('@/lib/google');
          const ok = await sendGoogleWalletMessage(
            customer.id,
            merchant?.nombre || 'Novedad',
            mensaje
          );
          if (ok) googleEnviados++;
        } catch (err) {
          console.error('Error sending Google message to customer:', customer.id, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      destinatarios: customers.length,
      googleEnviados,
      appleEnviados,
    });
  } catch (error) {
    console.error('Campaign error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
