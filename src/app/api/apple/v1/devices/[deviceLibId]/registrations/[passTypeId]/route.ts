import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      filteredCustomers = customers.filter((c) => c.updatedAt > sinceDate);
    }

    const serialNumbers = filteredCustomers.map((c) => c.serialNumber);
    const lastUpdated = Math.floor(Date.now() / 1000);

    return NextResponse.json({
      serialNumbers,
      lastUpdated,
    });
  } catch (error) {
    console.error('Apple registrations list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
