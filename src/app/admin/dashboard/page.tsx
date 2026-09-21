import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import QRCode from 'qrcode';
import CampaignForm from './CampaignForm';
import SettingsForm from './SettingsForm';
import { Card, CardTitle } from '@/components/ui/card';

export default async function Dashboard() {
  const session = await requireAuth();
  const merchantId = session.user.id;

  const [merchant, customers, totalCustomers, campaigns] = await Promise.all([
    prisma.merchant.findUnique({ where: { id: merchantId } }),
    prisma.customer.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.customer.count({ where: { merchantId } }),
    prisma.campaign.findMany({
      where: { merchantId },
      orderBy: { enviadaAt: 'desc' },
      take: 10,
    }),
  ]);

  if (!merchant) {
    return <div>Comercio no encontrado</div>;
  }

  const joinUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/join/${merchantId}`;
  const qrCode = await QRCode.toDataURL(joinUrl, { width: 300, margin: 2 });

  const stats = [
    { label: 'Clientes', value: totalCustomers },
    { label: 'Sellos para premio', value: merchant.sellosParaPremio },
    { label: 'Premio', value: merchant.textoPremio },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-display text-xl italic">
              Stampida
            </Link>
            <span className="text-sm text-stone-500">{merchant.nombre}</span>
          </div>
          <Link
            href="/scan"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
          >
            Escanear QR
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-stone-500">{s.label}</p>
              <p className="mt-1 truncate font-display text-3xl">{s.value}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardTitle>QR de alta de clientes</CardTitle>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
            <img
              src={qrCode}
              alt="QR de alta"
              className="h-44 w-44 rounded-xl border border-line p-2"
            />
            <div className="text-center sm:text-left">
              <p className="text-sm text-stone-600">
                Imprime este QR y colócalo en tu establecimiento. Quien lo
                escanee podrá guardar tu tarjeta en su wallet.
              </p>
              <p className="mt-3 break-all rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-500">
                {joinUrl}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Nueva campaña</CardTitle>
          <CampaignForm />
        </Card>

        <Card>
          <CardTitle>Personalización de la tarjeta</CardTitle>
          <SettingsForm
            initial={{
              logoUrl: merchant.logoUrl || '',
              colorPrimario: merchant.colorPrimario,
              sellosParaPremio: merchant.sellosParaPremio,
              textoPremio: merchant.textoPremio,
              lat: merchant.lat?.toString() || '',
              lng: merchant.lng?.toString() || '',
              radioMetros: merchant.radioMetros,
              mensajeProximidad: merchant.mensajeProximidad,
            }}
          />
        </Card>

        <Card>
          <CardTitle>Clientes recientes</CardTitle>
          <ul className="divide-y divide-line">
            {customers.map((customer) => (
              <li
                key={customer.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{customer.nombre}</p>
                  <p className="text-xs text-stone-500">
                    {customer.telefono || 'Sin teléfono'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">
                    {customer.sellos}/{merchant.sellosParaPremio}
                  </p>
                  <p className="text-xs text-stone-500">
                    {customer.premiosCanjeados} premios
                  </p>
                </div>
              </li>
            ))}
            {customers.length === 0 && (
              <li className="py-8 text-center text-sm text-stone-500">
                Aún no hay clientes registrados
              </li>
            )}
          </ul>
        </Card>

        {campaigns.length > 0 && (
          <Card>
            <CardTitle>Campañas enviadas</CardTitle>
            <ul className="divide-y divide-line">
              {campaigns.map((campaign) => (
                <li key={campaign.id} className="py-3">
                  <p className="text-sm">{campaign.mensaje}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(campaign.enviadaAt).toLocaleString('es-ES')}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </div>
  );
}
