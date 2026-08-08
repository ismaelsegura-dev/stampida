import { NextRequest, NextResponse } from 'next/server';
import { generateApplePass } from '@/lib/apple';

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'customerId requerido' }, { status: 400 });
    }

    const passBuffer = await generateApplePass(customerId);

    return new NextResponse(new Uint8Array(passBuffer), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': 'attachment; filename="pass.pkpass"',
      },
    });
  } catch (error) {
    console.error('Apple pass error:', error);
    return NextResponse.json({ error: 'Error generando pass' }, { status: 500 });
  }
}
