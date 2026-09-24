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

    const sendOne = async (customer: (typeof customers)[number]) => {
      const tasks: Promise<void>[] = [];

      if (customer.pushToken) {
        tasks.push(
          import('@/lib/apple').then(({ sendApplePush }) =>
            sendApplePush(customer.pushToken!).then(() => {
              appleEnviados++;
            })
          )
        );
      }

      if (customer.googleObjectId) {
        tasks.push(
          import('@/lib/google').then(({ sendGoogleWalletMessage }) =>
            sendGoogleWalletMessage(customer.id, merchant?.nombre || 'Novedad', mensaje).then((ok) => {
              if (ok) googleEnviados++;
            })
          )
        );
      }

      await Promise.all(tasks);
    };

    // Lotes de 10 en paralelo para no saturar la API de Google
    for (let i = 0; i < customers.length; i += 10) {
      const batch = customers.slice(i, i + 10);
      const results = await Promise.allSettled(batch.map(sendOne));
      results.forEach((r, j) => {
        if (r.status === 'rejected') {
          console.error('Error sending campaign to customer:', batch[j].id, r.reason);
        }
      });
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
