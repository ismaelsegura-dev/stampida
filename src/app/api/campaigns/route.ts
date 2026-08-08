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

    for (const customer of customers) {
      try {
        if (customer.pushToken) {
          const { sendApplePush } = await import('@/lib/apple');
          await sendApplePush(customer.pushToken);
        }
      } catch (err) {
        console.error('Error sending push to customer:', customer.id, err);
      }
    }

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      destinatarios: customers.length,
    });
  } catch (error) {
    console.error('Campaign error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
