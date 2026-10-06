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

// iOS Safari no abre .pkpass desde URLs blob: — necesita una URL directa con el
// content-type correcto. El botón de "Guardar en Apple Wallet" navega aquí.
export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'customerId requerido' }, { status: 400 });
    }

    const passBuffer = await generateApplePass(customerId);

    return new NextResponse(new Uint8Array(passBuffer), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': 'inline; filename="pass.pkpass"',
      },
    });
  } catch (error) {
    console.error('Apple pass error:', error);
    return NextResponse.json({ error: 'Error generando pass' }, { status: 500 });
  }
}
