import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const data: any = {};

    if (typeof body.logoUrl === 'string') data.logoUrl = body.logoUrl || null;
    if (typeof body.colorPrimario === 'string') data.colorPrimario = body.colorPrimario;
    if (typeof body.textoPremio === 'string') data.textoPremio = body.textoPremio;
    if (typeof body.mensajeProximidad === 'string') data.mensajeProximidad = body.mensajeProximidad;
    if (body.sellosParaPremio !== undefined) data.sellosParaPremio = parseInt(body.sellosParaPremio) || 8;
    if (body.radioMetros !== undefined) data.radioMetros = parseInt(body.radioMetros) || 300;
    if (body.lat !== undefined && body.lat !== '') data.lat = parseFloat(body.lat);
    if (body.lng !== undefined && body.lng !== '') data.lng = parseFloat(body.lng);

    const merchant = await prisma.merchant.update({
      where: { id: session.user.id },
      data,
    });

    try {
      const { createGoogleLoyaltyClass } = await import('@/lib/google');
      await createGoogleLoyaltyClass(merchant.id);
    } catch (err) {
      console.error('Error syncing Google class:', err);
    }

    return NextResponse.json({ success: true, merchant });
  } catch (error) {
    console.error('Merchant update error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
