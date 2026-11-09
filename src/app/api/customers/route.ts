import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit, clientIp, tooManyRequests } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Endpoint público (landing /join): sin límite se podrían crear clientes
    // basura sin tope.
    if (!checkRateLimit(`customers:${clientIp(req)}`, 20, 60 * 1000)) {
      return tooManyRequests();
    }

    const { merchantId, nombre, telefono } = await req.json();

    if (!merchantId || typeof merchantId !== 'string' || merchantId.length > 40) {
      return NextResponse.json({ error: 'Comercio no válido' }, { status: 400 });
    }

    if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 80) {
      return NextResponse.json({ error: 'Nombre no válido (máx. 80 caracteres)' }, { status: 400 });
    }

    const telefonoLimpio =
      typeof telefono === 'string' && telefono.trim() ? telefono.trim().slice(0, 20) : null;

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 });
    }

    const serialNumber = crypto.randomUUID();
    const authToken = crypto.randomBytes(32).toString('hex');

    // Código de 4 dígitos único para sellar sin cámara. Reintenta ante la
    // improbable colisión con el código de otro cliente.
    let customer = null;
    for (let intento = 0; intento < 20; intento++) {
      const codigoManual = String(crypto.randomInt(0, 10000)).padStart(4, '0');
      try {
        customer = await prisma.customer.create({
          data: {
            merchantId,
            nombre: nombre.trim(),
            telefono: telefonoLimpio,
            serialNumber,
            authToken,
            codigoManual,
            sellos: 0,
            premiosCanjeados: 0,
          },
        });
        break;
      } catch (e: any) {
        if (e?.code === 'P2002' && e?.meta?.target?.includes('codigoManual')) continue;
        throw e;
      }
    }

    if (!customer) {
      return NextResponse.json({ error: 'No se pudo generar el código del cliente' }, { status: 500 });
    }

    return NextResponse.json({
      id: customer.id,
      serialNumber: customer.serialNumber,
      authToken: customer.authToken,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
