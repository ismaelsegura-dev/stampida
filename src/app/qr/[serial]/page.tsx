import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Tu código QR',
  robots: 'noindex',
};

// QR a pantalla completa: las tarjetas de Apple Wallet no permiten ampliar el
// código con un toque, así que el reverso del pase enlaza aquí.
export default async function QRPage({
  params,
  searchParams,
}: {
  params: { serial: string };
  searchParams: { t?: string };
}) {
  const customer = await prisma.customer.findUnique({
    where: { serialNumber: params.serial },
    include: { merchant: true },
  });

  if (!customer || customer.authToken !== searchParams.t) notFound();

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const payload = `${baseUrl}/api/scan?serial=${customer.serialNumber}&token=${customer.authToken}`;
  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: 900,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  });

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-white px-6 py-10 text-center text-black">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        {customer.merchant.nombre}
      </p>
      <h1 className="mt-1 text-2xl font-bold">{customer.nombre}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt="Código QR de tu tarjeta"
        className="mt-8 w-full max-w-sm"
      />
      <p className="mt-8 max-w-xs text-sm text-neutral-500">
        Muestra esta pantalla para sumar tu sello. Tienes {customer.sellos} de{' '}
        {customer.merchant.sellosParaPremio}.
      </p>
    </main>
  );
}
