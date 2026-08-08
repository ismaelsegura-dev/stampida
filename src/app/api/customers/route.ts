import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { merchantId, nombre, telefono } = await req.json();

    if (!merchantId || !nombre) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 });
    }

    const serialNumber = crypto.randomUUID();
    const authToken = crypto.randomBytes(32).toString('hex');

    const customer = await prisma.customer.create({
      data: {
        merchantId,
        nombre,
        telefono: telefono || null,
        serialNumber,
        authToken,
        sellos: 0,
        premiosCanjeados: 0,
      },
    });

    return NextResponse.json({
      id: customer.id,
      serialNumber: customer.serialNumber,
      authToken: customer.authToken,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
