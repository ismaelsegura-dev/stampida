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

    console.log('Creating Google class for merchant:', customer.merchantId);
    await createGoogleLoyaltyClass(customer.merchantId);
    console.log('Google class created');
    
    console.log('Creating Google object for customer:', customerId);
    await createGoogleLoyaltyObject(customerId);
    console.log('Google object created');
    
    const saveUrl = await generateGoogleSaveUrl(customerId);
    console.log('Save URL generated:', saveUrl);

    return NextResponse.json({ saveUrl });
  } catch (error) {
    console.error('Google pass error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ 
      error: 'Error generando pass de Google', 
      details: errorMessage 
    }, { status: 500 });
  }
}
