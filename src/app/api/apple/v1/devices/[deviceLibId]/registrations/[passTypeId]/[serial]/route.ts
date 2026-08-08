import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { deviceLibId: string; passTypeId: string; serial: string } }
) {
  try {
    const { authorization } = Object.fromEntries(req.headers);
    const body = await req.json();
    const { pushToken } = body;

    const customer = await prisma.customer.findUnique({
      where: { serialNumber: params.serial },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
    }

    if (authorization !== `ApplePass ${customer.authToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { pushToken },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Apple registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { deviceLibId: string; passTypeId: string; serial: string } }
) {
  try {
    const { authorization } = Object.fromEntries(req.headers);

    const customer = await prisma.customer.findUnique({
      where: { serialNumber: params.serial },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
    }

    if (authorization !== `ApplePass ${customer.authToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: { pushToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Apple deregistration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
