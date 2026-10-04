import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '../dashboard/LogoutButton';
import { Card, CardTitle } from '@/components/ui/card';

function isSuperAdmin(email?: string | null) {
  const allowed = (process.env.SUPERADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allowed.includes(email.toLowerCase());
}

export default async function SuperAdmin() {
  const session = await requireAuth();

  if (!isSuperAdmin(session.user.email)) {
    notFound();
  }

  const [merchants, totalCustomers, sellosAgg, premiosAgg, totalCampaigns] =
    await Promise.all([
      prisma.merchant.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { customers: true, campaigns: true } } },
      }),
      prisma.customer.count(),
      prisma.customer.aggregate({ _sum: { sellos: true } }),
      prisma.customer.aggregate({ _sum: { premiosCanjeados: true } }),
      prisma.campaign.count(),
    ]);

  const stats = [
    { label: 'Comercios', value: merchants.length },
    { label: 'Clientes totales', value: totalCustomers },
    { label: 'Sellos activos', value: sellosAgg._sum.sellos ?? 0 },
    { label: 'Premios canjeados', value: premiosAgg._sum.premiosCanjeados ?? 0 },
    { label: 'Campañas enviadas', value: totalCampaigns },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <Link href="/" className="shrink-0 font-display text-xl italic">
              Stampida
            </Link>
            <span className="truncate text-sm text-stone-500">Panel general</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-4 sm:p-6">
              <p className="text-xs text-stone-500 sm:text-sm">{s.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardTitle>Comercios</CardTitle>
          <ul className="divide-y divide-line">
            {merchants.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 py-4">
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-line"
                  style={{ backgroundColor: m.colorPrimario || '#0A0A0A' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.nombre}</p>
                  <p className="truncate text-xs text-stone-500">{m.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <span className="text-stone-600">
                    <span className="font-semibold text-ink">{m._count.customers}</span> clientes
                  </span>
                  <span className="hidden text-stone-600 sm:inline">
                    <span className="font-semibold text-ink">{m._count.campaigns}</span> campañas
                  </span>
                  <span className="hidden text-xs text-stone-400 md:inline">
                    Alta {new Date(m.createdAt).toLocaleDateString('es-ES')}
                  </span>
                  <Link
                    href={`/join/${m.id}`}
                    target="_blank"
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-medium transition-colors hover:border-ink"
                  >
                    Ver alta
                  </Link>
                </div>
              </li>
            ))}
            {merchants.length === 0 && (
              <li className="py-8 text-center text-sm text-stone-500">
                Aún no hay comercios registrados
              </li>
            )}
          </ul>
        </Card>
      </main>
    </div>
  );
}
