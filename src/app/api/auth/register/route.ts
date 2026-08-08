import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password, colorPrimario, sellosParaPremio, textoPremio, lat, lng, radioMetros, mensajeProximidad } = await req.json();

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const existing = await prisma.merchant.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const merchant = await prisma.merchant.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        colorPrimario: colorPrimario || '#000000',
        sellosParaPremio: sellosParaPremio || 8,
        textoPremio: textoPremio || 'Café gratis',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        radioMetros: radioMetros || 300,
        mensajeProximidad: mensajeProximidad || '¡Estás cerca! Pásate y suma tu sello',
      },
    });

    return NextResponse.json({ id: merchant.id, nombre: merchant.nombre, email: merchant.email });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
