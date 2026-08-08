import { PKPass } from 'passkit-generator';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';

export async function generateApplePass(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { merchant: true },
  });

  if (!customer) throw new Error('Customer not found');

  const { merchant } = customer;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER || 'pass.com.example.stampida';
  const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER || 'TEAMID';

  const certPath = path.resolve(process.cwd(), process.env.APPLE_CERT_PATH || 'certs/pass.pem');
  const keyPath = path.resolve(process.cwd(), process.env.APPLE_KEY_PATH || 'certs/key.pem');
  const wwdrPath = path.resolve(process.cwd(), process.env.APPLE_WWDR_PATH || 'certs/wwdr.pem');

  const certificates = {
    signerCert: fs.readFileSync(certPath),
    signerKey: fs.readFileSync(keyPath),
    wwdr: fs.readFileSync(wwdrPath),
  };

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier,
    serialNumber: customer.serialNumber,
    teamIdentifier,
    organizationName: merchant.nombre,
    description: `Tarjeta de fidelización - ${merchant.nombre}`,
    logoText: merchant.nombre,
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: merchant.colorPrimario || 'rgb(0, 0, 0)',
    labelColor: 'rgb(255, 255, 255)',
    storeCard: {
      primaryFields: [
        {
          key: 'sellos',
          label: 'Sellos',
          value: customer.sellos,
        },
      ],
      secondaryFields: [
        {
          key: 'objetivo',
          label: 'Premio',
          value: merchant.textoPremio,
        },
        {
          key: 'progreso',
          label: 'Progreso',
          value: `${customer.sellos}/${merchant.sellosParaPremio}`,
        },
      ],
      auxiliaryFields: [
        {
          key: 'cliente',
          label: 'Cliente',
          value: customer.nombre,
        },
      ],
      backFields: [
        {
          key: 'terminos',
          label: 'Términos',
          value: `Consigue ${merchant.sellosParaPremio} sellos para obtener: ${merchant.textoPremio}`,
        },
      ],
      barcode: {
        message: `${baseUrl}/api/scan?serial=${customer.serialNumber}&token=${customer.authToken}`,
        format: 'PKBarcodeFormatQR' as const,
        messageEncoding: 'iso-8859-1',
        altText: `${customer.nombre} - ${customer.sellos} sellos`,
      },
    },
    locations: merchant.lat && merchant.lng ? [
      {
        latitude: merchant.lat,
        longitude: merchant.lng,
        relevantText: merchant.mensajeProximidad,
      },
    ] : undefined,
    webServiceURL: `${baseUrl}/api/apple/v1/`,
    authenticationToken: customer.authToken,
  };

  const fileBuffers = {
    'pass.json': Buffer.from(JSON.stringify(passJson)),
  };

  const pass = new PKPass(fileBuffers, certificates);

  return pass.getAsBuffer();
}

export async function updateApplePass(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { merchant: true },
  });

  if (!customer) throw new Error('Customer not found');

  const devices = await prisma.customer.findMany({
    where: {
      merchantId: customer.merchantId,
      serialNumber: customer.serialNumber,
      pushToken: { not: null },
    },
  });

  for (const device of devices) {
    if (device.pushToken) {
      await sendApplePush(device.pushToken);
    }
  }
}

export async function sendApplePush(pushToken: string) {
  try {
    const apn = require('apn');
    const provider = new apn.Provider({
      token: {
        key: path.resolve(process.cwd(), process.env.APPLE_APN_KEY_PATH || 'certs/apns_key.pem'),
        keyId: process.env.APPLE_APN_KEY_ID,
        teamId: process.env.APPLE_APN_TEAM_ID,
      },
      production: process.env.NODE_ENV === 'production',
    });

    const notification = new apn.Notification();
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    notification.topic = process.env.APPLE_PASS_TYPE_IDENTIFIER;
    notification.pushToken = pushToken;

    await provider.send(notification, pushToken);
    provider.shutdown();
  } catch (error) {
    console.error('APNs error:', error);
  }
}
