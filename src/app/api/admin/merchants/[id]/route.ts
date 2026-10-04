import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-api';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: params.id },
      include: { customers: { select: { id: true } } },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 });
    }

    const customerIds = merchant.customers.map((c) => c.id);

    await prisma.$transaction([
      prisma.stampEvent.deleteMany({ where: { customerId: { in: customerIds } } }),
      prisma.customer.deleteMany({ where: { merchantId: merchant.id } }),
      prisma.campaign.deleteMany({ where: { merchantId: merchant.id } }),
      prisma.inviteCode.updateMany({
        where: { usedByMerchantId: merchant.id },
        data: { usedByMerchantId: null, usedAt: null },
      }),
      prisma.merchant.delete({ where: { id: merchant.id } }),
    ]);

    return NextResponse.json({ deleted: true, nombre: merchant.nombre });
  } catch (error) {
    console.error('Delete merchant error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
