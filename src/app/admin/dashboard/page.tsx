import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import QRCode from 'qrcode';
import CampaignForm from './CampaignForm';
import SettingsForm from './SettingsForm';
import LogoutButton from './LogoutButton';
import CopyLink from './CopyLink';
import { Card, CardTitle } from '@/components/ui/card';

export default async function Dashboard() {
  const session = await requireAuth();
  const merchantId = session.user.id;

  const [merchant, customers, totalCustomers, campaigns, premiosAgg, sellosAgg] =
    await Promise.all([
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
      prisma.customer.aggregate({
        where: { merchantId },
        _sum: { premiosCanjeados: true },
      }),
      prisma.customer.aggregate({
        where: { merchantId },
        _sum: { sellos: true },
      }),
    ]);

  if (!merchant) {
    return <div>Comercio no encontrado</div>;
  }

  const joinUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/join/${merchantId}`;
  const qrCode = await QRCode.toDataURL(joinUrl, { width: 300, margin: 2 });

  const stats = [
    { label: 'Clientes', value: totalCustomers },
    { label: 'Premios canjeados', value: premiosAgg._sum.premiosCanjeados ?? 0 },
    { label: 'Sellos activos', value: sellosAgg._sum.sellos ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <Link href="/" className="shrink-0 font-display text-xl italic">
              Stampida
            </Link>
            <span className="truncate text-sm text-stone-500">{merchant.nombre}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/scan"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
            >
              Escanear QR
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-4 sm:p-6">
              <p className="text-xs text-stone-500 sm:text-sm">{s.label}</p>
              <p className="mt-1 truncate font-display text-2xl sm:text-4xl">{s.value}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardTitle>QR de alta de clientes</CardTitle>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
            <a
              href={joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 transition-opacity hover:opacity-80"
              title="Abrir página de alta"
            >
              <img
                src={qrCode}
                alt="QR de alta"
                className="h-44 w-44 rounded-xl border border-line p-2"
              />
            </a>
            <div className="w-full min-w-0 text-center sm:text-left">
              <p className="text-sm text-stone-600">
                Imprime este QR y colócalo en tu establecimiento. Quien lo
                escanee podrá guardar tu tarjeta en su wallet. Pulsa el QR para
                ver la página tal como la ven tus clientes.
              </p>
              <CopyLink url={joinUrl} />
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
              <li key={customer.id} className="flex items-center gap-3 py-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: merchant.colorPrimario || '#0A0A0A' }}
                >
                  {customer.nombre.trim().charAt(0).toUpperCase() || '?'}
                </span>
                <div className="min-w-0 flex-1">
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
                Aún no hay clientes registrados. Comparte el QR de alta para
                conseguir el primero.
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
