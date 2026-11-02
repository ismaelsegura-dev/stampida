import { NextRequest, NextResponse } from 'next/server';
import { createGoogleLoyaltyClass, createGoogleLoyaltyObject, generateGoogleSaveUrl } from '@/lib/google';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'customerId requerido' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    await createGoogleLoyaltyClass(customer.merchantId);
    await createGoogleLoyaltyObject(customerId);
    const saveUrl = await generateGoogleSaveUrl(customerId);
    // No loguear saveUrl: contiene un JWT firmado con datos del cliente (ISO 27701).

    return NextResponse.json({ saveUrl });
  } catch (error) {
    console.error('Google pass error:', error);
    // Sin `details`: no devolver mensajes internos de error al cliente.
    return NextResponse.json({ error: 'Error generando pass de Google' }, { status: 500 });
  }
}
