import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import JoinForm from './JoinForm';

export default async function JoinPage({ params }: { params: { merchantId: string } }) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: params.merchantId },
  });

  if (!merchant) {
    notFound();
  }

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
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
            />
          )}
          <h1 className="mb-2 font-display text-3xl text-gray-900">{merchant.nombre}</h1>
          <p className="text-gray-600">
            Consigue {merchant.sellosParaPremio} sellos y obtén:{' '}
            <span className="font-bold">{merchant.textoPremio}</span>
          </p>
        </div>

        <JoinForm merchantId={merchant.id} colorPrimario={merchant.colorPrimario} />

        <p className="mt-6 text-center text-xs text-gray-400">Powered by Stampida</p>
      </div>
    </div>
  );
}
