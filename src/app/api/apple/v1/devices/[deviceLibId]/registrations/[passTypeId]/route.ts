import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PASS_FORMAT_DATE } from '@/lib/apple';

export async function GET(
  req: NextRequest,
  { params }: { params: { deviceLibId: string; passTypeId: string } }
) {
  try {
    const { authorization } = Object.fromEntries(req.headers);
    const url = new URL(req.url);
    const passesUpdatedSince = url.searchParams.get('passesUpdatedSince');

    const customers = await prisma.customer.findMany({
      where: {
        pushToken: { not: null },
      },
      select: { serialNumber: true, updatedAt: true },
    });

    let filteredCustomers = customers;
    if (passesUpdatedSince) {
      const sinceDate = new Date(parseInt(passesUpdatedSince) * 1000);
      // Si el dispositivo sincronizó por última vez antes del último cambio de
      // plantilla (PASS_FORMAT_DATE), todos los pases se consideran cambiados
      // aunque los datos del cliente no hayan variado.
      filteredCustomers = customers.filter(
        (c) => c.updatedAt > sinceDate || sinceDate < PASS_FORMAT_DATE
      );
    }

    const serialNumbers = filteredCustomers.map((c) => c.serialNumber);
    // Apple exige lastUpdated como STRING; con número iOS ignora la respuesta
    // y nunca descarga el pase actualizado.
    const lastUpdated = String(Math.floor(Date.now() / 1000));

    return NextResponse.json({
      serialNumbers,
      lastUpdated,
    });
  } catch (error) {
    console.error('Apple registrations list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
