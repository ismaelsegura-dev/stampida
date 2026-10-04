import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-api';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { nota } = await req.json().catch(() => ({}));

    const code =
      'STAMP-' +
      crypto.randomBytes(2).toString('hex').toUpperCase() +
      '-' +
      crypto.randomBytes(2).toString('hex').toUpperCase();

    const invite = await prisma.inviteCode.create({
      data: { code, nota: nota || null },
    });

    return NextResponse.json({ id: invite.id, code: invite.code });
  } catch (error) {
    console.error('Invite code error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
