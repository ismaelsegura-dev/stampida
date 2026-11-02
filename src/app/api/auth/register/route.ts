import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(`register:${clientIp(req)}`, 10, 10 * 60 * 1000)) {
      return tooManyRequests();
    }

    const { nombre, email, password, codigo, logoUrl, colorPrimario, sellosParaPremio, textoPremio, lat, lng, radioMetros, mensajeProximidad } = await req.json();

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (typeof nombre !== 'string' || nombre.trim().length > 60) {
      return NextResponse.json({ error: 'Nombre no válido' }, { status: 400 });
    }

    if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 120) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
    }

    // Política de contraseñas (ISO 27001 A.9.4.3): mínimo 8 caracteres.
    if (typeof password !== 'string' || password.length < 8 || password.length > 100) {
      return NextResponse.json({ error: 'La contraseña debe tener entre 8 y 100 caracteres' }, { status: 400 });
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
        nombre: nombre.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: false,
        logoUrl: typeof logoUrl === 'string' && logoUrl.length <= 500 ? logoUrl || null : null,
        colorPrimario: typeof colorPrimario === 'string' && /^#[0-9A-Fa-f]{6}$/.test(colorPrimario) ? colorPrimario : '#000000',
        sellosParaPremio: Math.min(Math.max(parseInt(sellosParaPremio) || 8, 1), 50),
        textoPremio: typeof textoPremio === 'string' && textoPremio.trim() ? textoPremio.trim().slice(0, 80) : 'Café gratis',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        radioMetros: Math.min(Math.max(parseInt(radioMetros) || 300, 50), 5000),
        mensajeProximidad: typeof mensajeProximidad === 'string' && mensajeProximidad.trim() ? mensajeProximidad.trim().slice(0, 140) : '¡Estás cerca! Pásate y suma tu sello',
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
