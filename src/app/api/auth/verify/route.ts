import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Anti fuerza-bruta: el código tiene 6 dígitos, sin límite sería
    // reventable por fuerza bruta en la ventana de 30 min.
    if (!checkRateLimit(`verify:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
      return tooManyRequests();
    }

    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const token = await prisma.verificationToken.findFirst({
      where: {
        email: normalizedEmail,
        code: code.trim(),
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return NextResponse.json({ error: 'Código incorrecto o caducado' }, { status: 400 });
    }

    await prisma.merchant.update({
      where: { email: normalizedEmail },
      data: { emailVerified: true },
    });

    await prisma.verificationToken.deleteMany({ where: { email: normalizedEmail } });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
