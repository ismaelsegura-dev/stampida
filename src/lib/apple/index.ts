import { PKPass } from 'passkit-generator';
import path from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';

// En Vercel los certificados viajan como env vars en base64 (los archivos
// certs/ están gitignorados y no se despliegan). En local se usan los archivos.
function readCredential(envBase64: string | undefined, envPath: string | undefined, defaultPath: string): Buffer {
  if (envBase64) return Buffer.from(envBase64, 'base64');
  return fs.readFileSync(path.resolve(process.cwd(), envPath || defaultPath));
}

// Icono del pase (la "S" de Stampida) incrustado en base64 para que funcione
// en serverless, donde los archivos sueltos no se despliegan.
const ICON_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAHaADAAQAAAABAAAAHQAAAADeexZRAAAByElEQVRIDe2UPc8BQRCA9y6REEdUKolGrThq0Ul0foFK/AENPY1OLf4ACo1OrRAFDYmGnkpQEPPuTOzlfOXmLnlVt8maNV/P3szcaUIIkPunS/8p7QHzof9adb+8juWNRqMinU6LWCzm6PvJAd9T9i6VSrDZbOB+v4Nau90OKpUKOwdegu1cLBYVB06nE8xmMzgej5auVqtxc/GhvV6PAIPBAAKBAAFQdjod0q/XaxbU1fQmEglqj0wurtcrnVE2m00hSy7O57MwDIP0Tj+s28kk0Gg06Imwn6PRiPqYTCbZ8Zjjsa2DUnyVwWAQ+v2+1UN1wMGq1+ug6/rXWBsQffhQ5ZvL5aDdbsNisXia4vF4DJqmccA8KA5MPp8HBCo4yng8Dq1WC263Gz14JpN5stt9bWceFJPjksMC4XD4LfFkMiF7tVp9s9lgysaDYuBqtaLEw+EQIpGISgDZbBb2+z3ZTNO09B9gysaHlstlq4yXywXm8zksl0uQrw0Bp9OpSuok+VC8eaFQIJDqIdIOhwN0u10IhUJOMLJrjxJI4W5JgEilUkJ+BsV2u3UV7BnqivLi7Ooz+BLr+a8P9Vw6TqBfXk6VPPv8Adv3BryJzqv/AAAAAElFTkSuQmCC';
const ICON_2X_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAADoAAAA6CAYAAADhu0ooAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAOqADAAQAAAABAAAAOgAAAACjq6v0AAAD1klEQVRoBe1Yyyt1URRflxtyZeKRSDKQ18CjlIGRGf4BGUiKTI0IA4b+BUkYMDQQAyOkkEciKbqeSQhJRGR9e53P3u45zr3fue7e93yXveu217pnr3XWb/3W2Wuf4wEAZL8fP+J+PMIPgBroT2NaM6oZjdEM6NKNUeKChq0ZDZqaGL2gGY1R4oKGrRkNmpoYvfBrGPVGi6CEhASoqqqC8vJyKCsrM+bs7Gy4u7uDq6sr2NnZgZmZGZifn4fX11clYdGLt9JfUVERbm1toZOxv7+P9fX1KuJRC7K5uRkfHx+dYDStaW9vlwrW88GmklIpKSkxSjIu7nMreH5+hqmpKfD7/UbZZmRkAK1raGiA+Ph4Ecf7+zvU1NTA8vKy+C9SQWrmWDDC38jIiIml6elpzMzMFNcD1xYWFuLq6qppPXtmbdcG2oUhfwYWhpGjAOh54+Pk5ASTk5ND2uXk5CDbmLgJMlYxJSUlpI3TmD9rilnIHnl5ecLl2toaPD09Cd1OOD8/h4mJCXHJ4/FAcXGx0CMRlLaXh4cHSEtLM+KrqKgAxug/wdLzSy3o9vYWbm5ugHzIGlJKgwXzxQ/riaIMSVhYWEDWS7+ss7NV8N/XAGXdpLGx0QSUK9RTBwcHsba2FhMTE6MFXB1QStjY2BjHZzuzdmMw3d/fb7DNnktVwNUC9Xq92NfXhy8vL7ZArX8eHR0hHRZY75UNWC1Q/hjk5ubiwMAAbmxsGG3DCtCqr6ysYHp6ukyw0QHKAdOclZWFLS0tOD4+jmdnZ1aMQl9fX8ekpCRZYKMPNBA0yXTo7+7uxtPTUwGSCx0dHf83UNpUqPTYORbz8/MdBcte5XB4eJhjNOalpSVHttbk2ehqGA3sobu7u46DpXZzf38vwF5eXjq2tQEnbJUdAdkuy+77d9DbSWlpKVdDzmS3vb0t1vh8PiFHIigDure3Z4qrtbXVpAdT2OZjHAH59ePjYy5GPAt6mSdpcmVlpSg/LnR2dobsj6mpqTg5OcmXG/PQ0JCsmOSBsyZqdnbWFDQpm5ub2Nvbi3V1dUabIXDV1dXY1taGh4eHpvX0mkY7stXvN3V1QNnXAzw4ODAFH47S1dUlCyT5UQeUfFNrWVxcDAefcVzs6emRCVI9UJ7IpqYmnJubC3nmZe+gODo6KrNcRbKUfhyjcrEO9mkECgoKgH02AfowxqiG6+truLi4MNrK29ub1USKHnWgUqL+hhNlffQbsSg10UCVptcF55pRF5Ku9JaaUaXpdcG5ZtSFpCu9pWZUaXpdcK4ZdSHpSm+pGVWaXhec/xpG/wAdb3zCSxAVYQAAAABJRU5ErkJggg==';
const ICON_3X_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAFcAAABXCAYAAABxyNlsAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAV6ADAAQAAAABAAAAVwAAAACjUuwUAAAF3ElEQVR4Ae2aSyhtURjHl0e5A69cj2vgFfK6yGsiJsLICGGg7gylRIqx0TUQEwPkDjzKgCRKiSIDlFAMvJUr1zuE8v7uWrt7bufY+3Be39lLfat2++xvr/Vf+/vt76y9Xi6MMeAHJQQCrgiaJPmPAMFFDAWCS3ARCSBKU+QSXEQCiNIUuQQXkQCiNEUuwUUkgChNkUtwEQkgSlPkElxEAojSFLkEF5EAojRFLsFFJIAoTZFLcBEJIEpT5BJcRAKI0hS5iHDdEbUdKh0WFsaSkpJYYGAgCwoKYr6+vuzm5oadnp4qx8HBAVteXmavr68OrddeMbEpRMojMjISmpubYW1tDSxJZ2dn0NfXB4WFheDi4iKDT/KB9fT0hJ8/f8L9/b0lTDXzzM/PQ3p6ut6A5YIbEBAAGxsbmsCsNb68vEBtba2egOWBKyJ2cXHRWobv5udtMJSXl+sC2OVfe2tvu+2Q8m1tbYxHmqbW79+/WVdXF9va2mKHh4fs5OSEeXl5sdDQUCY+diUlJSwrK0uz7PPzM0tLS2Orq6ua9zGNurxV7pBJvV+/foXb21tVFF5dXSmR5+7ubpL/bXlxnZOTA0tLSyoNYRgYGPiwvJamnTZTJ+0Us9mB+vp6FZSnpyfIy8uzStPf3x/29/dVWjx6QfQ+nOmfNIOI79+/c79NU2dnJ5ucnDQ1fnB1fn7OiouLmWgKjJObmxvLzc01NqH/lgZudHS0ytnZ2VmVzRID/yiyhYUFVdaEhASVDdMgDVzeU1D5ac9oSyvi4+LiVHVgGqQZ/orha3JysomvRUVFbGhoyMRm6cXw8DCLiopil5eXTDQVFxcXbHt729LiDsvn1EaeP7VmfbwbpvoICUNVVZVmfnM6ktm1nXX2Q4qhqrk0Pj4O+fn54Orq+tlAywFXvMyZmRlzfBU7nwGDX79+QWlpKXz79u0zgJYHLh9twZ8/f94FbHxzc3MTuru74cePHxASEiIjbHngiuhNTU0FPrw1ZmjxbwFbtN3Z2dk05WiuXecT4dDb22sxVK2Mu7u7uk3YGPklV+QaPRjwlQdob28HMb9ga+IDEeCDB72aDHnhGkB/+fJFmWNoaWkBPrNlNefr62vgs2J6AJYfrgGy4RwcHAxlZWXQ0dEBop21JIkloNjYWGcD/nxwDZANZ9FTqKiogImJCRCT4+bS2NgYwTVAs+WcmJgIIyMjmnwFeHHfFl0by8gXuY4YiTU1NWkCFnYbQdlSTl+4Hh4eMDg4CHyKEPb29uDu7g74BIstjqjKiJ7C29Tf36/KhwhbX7g+Pj5v/VeuxbKPvU6Lhcm3aW5uzm5dS59L9/lc3k1iR0dH/HlNE5+oMTXYcMV7CKpSHLbKhmXQHa5wbH19XeVfY2OjymatISYmRlVkZ2dHZcMySAGXz4ap/BMT53V1dUabIXDV1dXY1taGh4eHpvX0mkY7stXvN3V1QNnXAzw4ODAFH47S1dUlCyT5UQeUfFNrWVxcDAefcVzs6emRCVI9UJ7IpqYmnJubC3nmZe+gODo6KrNcRbKUfhyjcrEO9mkECgoKgH02AfowxqiG6+truLi4MNrK29ub1USKHnWgUqL+hhNlffQbsSg10UCVptcF55pRF5Ku9JaaUaXpdcG5ZtSFpCu9pWZUaXpdcK4ZdSHpSm+pGVWaXhec/xpG/wAdb3zCSxAVYQAAAABJRU5ErkJggg==';

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

  const certificates = {
    signerCert: readCredential(process.env.APPLE_CERT_BASE64, process.env.APPLE_CERT_PATH, 'certs/pass.pem'),
    signerKey: readCredential(process.env.APPLE_KEY_BASE64, process.env.APPLE_KEY_PATH, 'certs/key.pem'),
    wwdr: readCredential(process.env.APPLE_WWDR_BASE64, process.env.APPLE_WWDR_PATH, 'certs/wwdr.pem'),
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
    'icon.png': Buffer.from(ICON_PNG_B64, 'base64'),
    'icon@2x.png': Buffer.from(ICON_2X_PNG_B64, 'base64'),
    'icon@3x.png': Buffer.from(ICON_3X_PNG_B64, 'base64'),
  };

  const pass = new PKPass(fileBuffers, certificates);

  // El QR va por la API de passkit-generator: si se mete en pass.json lo descarta
  pass.setBarcodes({
    message: `${baseUrl}/api/scan?serial=${customer.serialNumber}&token=${customer.authToken}`,
    format: 'PKBarcodeFormatQR',
    messageEncoding: 'iso-8859-1',
    altText: `${customer.nombre} - ${customer.sellos} sellos`,
  });

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
        key: readCredential(process.env.APPLE_APN_KEY_BASE64, process.env.APPLE_APN_KEY_PATH, 'certs/apns_key.p8'),
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
