import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import QRCode from 'qrcode';
import CampaignForm from './CampaignForm';

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

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">{merchant.nombre}</h1>
          <Link
            href="/scan"
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Escanear QR
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1A1A1A] rounded-lg p-6">
            <p className="text-gray-400 text-sm">Total Clientes</p>
            <p className="text-4xl font-bold text-white mt-2">{totalCustomers}</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-6">
            <p className="text-gray-400 text-sm">Sellos para Premio</p>
            <p className="text-4xl font-bold text-white mt-2">{merchant.sellosParaPremio}</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-lg p-6">
            <p className="text-gray-400 text-sm">Premio</p>
            <p className="text-xl font-bold text-white mt-2">{merchant.textoPremio}</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">QR para Alta de Clientes</h2>
          <p className="text-gray-400 mb-4">Imprime este QR y colócalo en tu establecimiento</p>
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="bg-white p-4 rounded-lg" />
          </div>
          <p className="text-center text-gray-400 mt-4 text-sm">{joinUrl}</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Nueva Campaña</h2>
          <CampaignForm />
        </div>

        <div className="bg-[#1A1A1A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Clientes Recientes</h2>
          <div className="space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex justify-between items-center p-4 bg-[#0A0A0A] rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{customer.nombre}</p>
                  <p className="text-gray-400 text-sm">
                    {customer.telefono || 'Sin teléfono'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {customer.sellos}/{merchant.sellosParaPremio} sellos
                  </p>
                  <p className="text-gray-400 text-sm">
                    {customer.premiosCanjeados} premios canjeados
                  </p>
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                Aún no hay clientes registrados
              </p>
            )}
          </div>
        </div>

        {campaigns.length > 0 && (
          <div className="bg-[#1A1A1A] rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Campañas Enviadas</h2>
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 bg-[#0A0A0A] rounded-lg">
                  <p className="text-white">{campaign.mensaje}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {new Date(campaign.enviadaAt).toLocaleString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
