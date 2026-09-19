import { JWT } from 'google-auth-library';
import { prisma } from '@/lib/prisma';

let auth: JWT | null = null;

function getGoogleCredentials() {
  let raw = (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '').trim();
  if (raw.startsWith("'") && raw.endsWith("'")) raw = raw.slice(1, -1);
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
  return JSON.parse(raw);
}

function getAuth() {
  if (!auth) {
    const credentials = getGoogleCredentials();
    auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    });
  }
  return auth;
}

async function makeRequest(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, body?: any) {
  const authClient = getAuth();
  const res = await authClient.request({
    method,
    url,
    data: body,
  });
  return res.data;
}

export async function createGoogleLoyaltyClass(merchantId: string) {
  const issuerId = process.env.GOOGLE_ISSUER_ID;
  const classId = `${issuerId}.${merchantId}`;

  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant) throw new Error('Merchant not found');

  const classData: any = {
    id: classId,
    issuerName: merchant.nombre,
    programName: `${merchant.nombre} Fidelidad`,
    hexBackgroundColor: merchant.colorPrimario || '#000000',
    reviewStatus: 'APPROVED',
    textModulesData: [
      {
        header: 'Premio',
        body: merchant.textoPremio,
        id: 'reward',
      },
    ],
    programLogo: merchant.logoUrl
      ? { sourceUri: { uri: merchant.logoUrl } }
      : {
          sourceUri: {
            uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop',
          },
        },
  };

  try {
    await makeRequest('GET', `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`);
    const { id, ...updateData } = classData;
    await makeRequest('PATCH', `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`, updateData);
    return classId;
  } catch (e) {
    await makeRequest('POST', 'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass', classData);
    return classId;
  }
}

export async function createGoogleLoyaltyObject(customerId: string) {
  const issuerId = process.env.GOOGLE_ISSUER_ID;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { merchant: true },
  });

  if (!customer) throw new Error('Customer not found');

  const classId = `${issuerId}.${customer.merchantId}`;
  const objectId = `${issuerId}.${customer.serialNumber}`;

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const objectData = {
    id: objectId,
    classId,
    state: 'ACTIVE',
    heroImage: customer.merchant.logoUrl ? { uri: customer.merchant.logoUrl } : undefined,
    textModulesData: [
      {
        header: 'Sellos',
        body: `${customer.sellos}/${customer.merchant.sellosParaPremio}`,
        id: 'stamps',
      },
    ],
    barcode: {
      type: 'QR_CODE',
      value: `${baseUrl}/api/scan?serial=${customer.serialNumber}&token=${customer.authToken}`,
      alternateText: customer.nombre,
    },
    locations: customer.merchant.lat && customer.merchant.lng ? [
      {
        latitude: customer.merchant.lat,
        longitude: customer.merchant.lng,
      },
    ] : undefined,
    linksModuleData: {
      uris: [
        {
          uri: `${baseUrl}/join/${customer.merchantId}`,
          description: 'Ver tarjeta',
          id: 'view_card',
        },
        {
          uri: 'https://stampida.online',
          description: 'Powered by Stampida',
          id: 'powered_by',
        },
      ],
    },
  };

  try {
    await makeRequest('GET', `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`);
    await makeRequest('PATCH', `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`, objectData);
  } catch (e) {
    await makeRequest('POST', 'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject', objectData);
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { googleObjectId: objectId },
  });

  return objectId;
}

export async function updateGoogleLoyaltyObject(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { merchant: true },
  });

  if (!customer || !customer.googleObjectId) return;

  await makeRequest('PATCH', `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${customer.googleObjectId}`, {
    textModulesData: [
      {
        header: 'Sellos',
        body: `${customer.sellos}/${customer.merchant.sellosParaPremio}`,
        id: 'stamps',
      },
    ],
  });
}

export async function sendGoogleWalletMessage(customerId: string, header: string, body: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { merchant: true },
  });

  if (!customer || !customer.googleObjectId) return false;

  const objectUrl = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${customer.googleObjectId}`;

  let existingMessages: any[] = [];
  try {
    const current: any = await makeRequest('GET', objectUrl);
    existingMessages = current.messages || [];
  } catch (e) {
    return false;
  }

  const messages = [
    ...existingMessages,
    {
      id: `msg_${Date.now()}`,
      header,
      body,
      messageType: 'TEXT_AND_NOTIFY',
    },
  ].slice(-10);

  await makeRequest('PATCH', objectUrl, { messages });
  return true;
}

export async function generateGoogleSaveUrl(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { merchant: true },
  });

  if (!customer) throw new Error('Customer not found');

  const issuerId = process.env.GOOGLE_ISSUER_ID;
  const objectId = `${issuerId}.${customer.serialNumber}`;

  const credentials = getGoogleCredentials();

  const { SignJWT } = await import('jose');
  const privateKey = await import('crypto').then(crypto => 
    crypto.createPrivateKey(credentials.private_key)
  );

  const jwt = await new SignJWT({
    iss: credentials.client_email,
    aud: 'google',
    typ: 'savetoandroidpay',
    payload: {
      loyaltyObjects: [objectId],
    },
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setExpirationTime('1h')
    .sign(privateKey);

  return `https://pay.google.com/gp/w/save/${jwt}`;
}
