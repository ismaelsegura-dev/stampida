import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const logs = await req.json();
    console.log('Apple Wallet logs:', logs);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Apple log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
