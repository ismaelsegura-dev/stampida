import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateApplePass } from '@/lib/apple';

export async function GET(
  req: NextRequest,
  { params }: { params: { passTypeId: string; serial: string } }
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

    const passBuffer = await generateApplePass(customer.id);

    return new NextResponse(new Uint8Array(passBuffer), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Last-Modified': customer.updatedAt.toUTCString(),
      },
    });
  } catch (error) {
    console.error('Apple pass fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
