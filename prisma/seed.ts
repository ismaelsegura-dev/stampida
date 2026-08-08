import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('demo123', 10);

  const merchant = await prisma.merchant.upsert({
    where: { email: 'demo@cafeterialaplaza.com' },
    update: {},
    create: {
      nombre: 'Cafetería La Plaza',
      email: 'demo@cafeterialaplaza.com',
      password: hashedPassword,
      colorPrimario: '#8B4513',
      sellosParaPremio: 8,
      textoPremio: 'Café gratis',
      lat: 40.4168,
      lng: -3.7038,
      radioMetros: 300,
      mensajeProximidad: '¡Estás cerca de La Plaza! Pásate y suma tu sello para un café gratis',
    },
  });

  console.log('Created merchant:', merchant.nombre);

  const customers = [
    { nombre: 'María García', telefono: '612345678', sellos: 5 },
    { nombre: 'Juan López', telefono: '623456789', sellos: 3 },
    { nombre: 'Ana Martínez', telefono: '634567890', sellos: 7 },
  ];

  for (const customerData of customers) {
    const customer = await prisma.customer.create({
      data: {
        merchantId: merchant.id,
        nombre: customerData.nombre,
        telefono: customerData.telefono,
        serialNumber: `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        authToken: `token-${Math.random().toString(36).substr(2, 32)}`,
        sellos: customerData.sellos,
        premiosCanjeados: 0,
      },
    });

    console.log('Created customer:', customer.nombre, 'with', customer.sellos, 'stamps');
  }

  console.log('Seed completed!');
  console.log('');
  console.log('Demo credentials:');
  console.log('Email: demo@cafeterialaplaza.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
