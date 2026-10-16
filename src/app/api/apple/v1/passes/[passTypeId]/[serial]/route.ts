import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateApplePass, PASS_FORMAT_DATE } from '@/lib/apple';

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

    // Si solo cambia la PLANTILLA del pase (ej. se añadió el QR), los datos del
    // cliente no cambian y un Last-Modified basado en updatedAt haría que iOS
    // recibiera 304 y conservara el pase viejo. Bump PASS_FORMAT_DATE cuando
    // cambie la plantilla.
    const lastModified = new Date(
      Math.max(customer.updatedAt.getTime(), PASS_FORMAT_DATE.getTime())
    );

    return new NextResponse(new Uint8Array(passBuffer), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Last-Modified': lastModified.toUTCString(),
      },
    });
  } catch (error) {
    console.error('Apple pass fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
