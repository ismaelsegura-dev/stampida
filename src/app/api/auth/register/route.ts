import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password, codigo, logoUrl, colorPrimario, sellosParaPremio, textoPremio, lat, lng, radioMetros, mensajeProximidad } = await req.json();

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (!codigo) {
      return NextResponse.json({ error: 'Necesitas un código de invitación' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const invite = await prisma.inviteCode.findUnique({ where: { code: codigo.trim().toUpperCase() } });
    if (!invite || invite.usedAt) {
      return NextResponse.json({ error: 'Código de invitación no válido o ya usado' }, { status: 400 });
    }

    const existing = await prisma.merchant.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const merchant = await prisma.merchant.create({
      data: {
        nombre,
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: false,
        logoUrl: logoUrl || null,
        colorPrimario: colorPrimario || '#000000',
        sellosParaPremio: sellosParaPremio || 8,
        textoPremio: textoPremio || 'Café gratis',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        radioMetros: radioMetros || 300,
        mensajeProximidad: mensajeProximidad || '¡Estás cerca! Pásate y suma tu sello',
      },
    });

    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: { usedByMerchantId: merchant.id, usedAt: new Date() },
    });

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    await prisma.verificationToken.create({
      data: {
        email: normalizedEmail,
        code: verificationCode,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    await sendVerificationEmail(normalizedEmail, verificationCode);

    return NextResponse.json({ needsVerification: true, email: normalizedEmail });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
