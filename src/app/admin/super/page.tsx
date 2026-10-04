import { requireAdmin } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import LogoutButton from '../dashboard/LogoutButton';
import InviteCodeForm from './InviteCodeForm';
import DeleteMerchantButton from './DeleteMerchantButton';
import { Card, CardTitle } from '@/components/ui/card';

export default async function SuperAdmin() {
  await requireAdmin();

  const [merchants, totalCustomers, sellosAgg, premiosAgg, totalCampaigns, inviteCodes] =
    await Promise.all([
      prisma.merchant.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { customers: true, campaigns: true } } },
      }),
      prisma.customer.count(),
      prisma.customer.aggregate({ _sum: { sellos: true } }),
      prisma.customer.aggregate({ _sum: { premiosCanjeados: true } }),
      prisma.campaign.count(),
      prisma.inviteCode.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
    ]);

  const merchantNames = new Map(merchants.map((m) => [m.id, m.nombre]));

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
          <CardTitle>Códigos de invitación</CardTitle>
          <p className="mb-4 text-sm text-stone-600">
            Nadie puede registrar un comercio sin uno de estos códigos. Genera
            uno por cada venta y entrégaselo al cliente.
          </p>
          <InviteCodeForm />
          {inviteCodes.length > 0 && (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {inviteCodes.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="font-mono font-semibold">{c.code}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-stone-500">
                    {c.nota || ''}
                  </span>
                  {c.usedAt ? (
                    <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                      Usado{c.usedByMerchantId && merchantNames.get(c.usedByMerchantId)
                        ? ` · ${merchantNames.get(c.usedByMerchantId)}`
                        : ''}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      Disponible
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Comercios</CardTitle>
          <ul className="divide-y divide-line">
            {merchants.map((m) => (
              <li key={m.id} className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-line"
                    style={{ backgroundColor: m.colorPrimario || '#0A0A0A' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {m.nombre}
                      {!m.emailVerified && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          email sin verificar
                        </span>
                      )}
                    </p>
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
                    <DeleteMerchantButton merchantId={m.id} nombre={m.nombre} />
                  </div>
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
