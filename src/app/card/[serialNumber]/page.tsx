import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { referralsEnabled, ensureCodigoInvitacion } from '@/lib/referrals';
import InviteButton from './InviteButton';

export default async function CardPage({ params }: { params: { serialNumber: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { serialNumber: params.serialNumber },
    include: { merchant: true },
  });

  if (!customer) {
    notFound();
  }

  const { merchant } = customer;
  const referralsOn = referralsEnabled() && merchant.referidosActivos;

  let inviteUrl: string | null = null;
  if (referralsOn) {
    const codigo = await ensureCodigoInvitacion(customer.id);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    inviteUrl = `${baseUrl}/join/${merchant.id}?ref=${codigo}`;
  }

  const progresoReferidos = referralsOn
    ? customer.amigosTraidos % merchant.referidosParaPremio
    : 0;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: merchant.colorPrimario || '#000000' }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          {merchant.logoUrl && (
            <img
              src={merchant.logoUrl}
              alt={merchant.nombre}
              className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
            />
          )}
          <h1 className="mb-1 font-display text-3xl text-gray-900">{merchant.nombre}</h1>
          <p className="text-sm text-gray-500">Tarjeta de {customer.nombre}</p>
        </div>

        <div className="mb-6 rounded-2xl bg-stone-100 p-5 text-center">
          <p className="text-sm text-stone-500">Sellos</p>
          <p className="font-display text-4xl text-gray-900">
            {customer.sellos}/{merchant.sellosParaPremio}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Premio: <span className="font-semibold">{merchant.textoPremio}</span>
          </p>
        </div>

        {referralsOn && (
          <div className="mb-6 rounded-2xl border border-stone-200 p-5 text-center">
            <p className="mb-1 text-sm font-semibold text-gray-900">Invita y gana 🎁</p>
            <p className="mb-4 text-sm text-gray-600">
              Llevas {progresoReferidos} de {merchant.referidosParaPremio} amigos para tu{' '}
              <span className="font-semibold">{merchant.textoPremioReferido}</span>
              {customer.premiosReferidoPendientes > 0 && (
                <>
                  {' '}· <span className="font-semibold text-green-700">
                    ¡Tienes {customer.premiosReferidoPendientes} premio
                    {customer.premiosReferidoPendientes > 1 ? 's' : ''} pendiente
                    {customer.premiosReferidoPendientes > 1 ? 's' : ''}!
                  </span>
                </>
              )}
            </p>
            <InviteButton
              inviteUrl={inviteUrl!}
              shareText={`Únete a la tarjeta de ${merchant.nombre} y consigue premios ☕ ${inviteUrl}`}
            />
            <p className="mt-3 text-xs text-stone-400">
              Tus amigos cuentan cuando vengan y consuman por primera vez.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">Powered by Stampida</p>
      </div>
    </div>
  );
}
