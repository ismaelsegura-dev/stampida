# Stampida - Plataforma de Tarjetas de Fidelización Digital

Plataforma SaaS de tarjetas de fidelización digitales para comercios locales usando Apple Wallet y Google Wallet. Sin apps nativas: todo web + wallet passes.

## Características

- ✅ Registro de comercios con personalización completa
- ✅ Landing pública para alta de clientes con branding del comercio
- ✅ Generación de passes para Apple Wallet y Google Wallet
- ✅ Escáner QR PWA para camareros
- ✅ Sistema de sellos y premios automático
- ✅ Campañas push para todos los clientes
- ✅ Notificaciones de proximidad
- ✅ Dashboard de administración con métricas

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Base de datos**: SQLite con Prisma (migración a Postgres fácil)
- **Apple Wallet**: passkit-generator + APNs
- **Google Wallet**: @googleapis/walletobjects
- **Autenticación**: NextAuth con credenciales
- **QR**: html5-qrcode para escaneo, qrcode para generación

## Requisitos Previos

- Node.js 20+
- Cuenta de desarrollador de Apple ($99/año)
- Cuenta de Google Wallet (gratuita)
- VPS o servidor con HTTPS (requisito de Apple/Google)

## Instalación

### 1. Clonar e instalar dependencias

```bash
cd Stampida
npm install
```

### 2. Configurar base de datos

```bash
npx prisma db push
npm run db:seed
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y completa:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

- `DATABASE_URL`: Ruta a tu base de datos SQLite
- `BASE_URL`: URL pública de tu servidor (HTTPS requerido)
- `NEXTAUTH_SECRET`: Genera uno con `openssl rand -base64 32`
- `NEXTAUTH_URL`: Misma que BASE_URL

### 4. Configurar Apple Wallet

#### Obtener certificados de Apple:

1. Ve a [Apple Developer Portal](https://developer.apple.com/account)
2. Crea un Pass Type ID: `pass.com.tuempresa.stampida`
3. Genera certificado de Pass Type ID
4. Descarga el certificado `.cer` y conviértelo a `.pem`:

```bash
openssl x509 -in pass.cer -inform DER -outform PEM -out certs/pass.pem
openssl pkcs12 -in pass.p12 -nocerts -out certs/key.pem -nodes
```

5. Descarga WWDR certificate:
   - [Apple WWDR Intermediate Certificate](https://www.apple.com/certificateauthority/)
   - Guárdalo como `certs/wwdr.pem`

6. Configura APNs (Apple Push Notification service):
   - Crea una key en Apple Developer Portal
   - Descarga el archivo `.p8` y guárdalo como `certs/apns_key.pem`

#### Actualiza `.env`:

```env
APPLE_PASS_TYPE_IDENTIFIER="pass.com.tuempresa.stampida"
APPLE_TEAM_IDENTIFIER="TU_TEAM_ID"
APPLE_CERT_PATH="/certs/pass.pem"
APPLE_KEY_PATH="/certs/key.pem"
APPLE_WWDR_PATH="/certs/wwdr.pem"
APPLE_APN_KEY_ID="TU_KEY_ID"
APPLE_APN_TEAM_ID="TU_TEAM_ID"
APPLE_APN_KEY_PATH="/certs/apns_key.pem"
```

### 5. Configurar Google Wallet

1. Ve a [Google Pay & Wallet Console](https://pay.google.com/gp/w/issuer/home)
2. Crea una cuenta de servicio en Google Cloud Console
3. Descarga las credenciales JSON
4. Guarda el contenido en `GOOGLE_SERVICE_ACCOUNT_JSON` en `.env`
5. Obtén tu `issuerId` del Google Pay & Wallet Console

#### Actualiza `.env`:

```env
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
GOOGLE_ISSUER_ID="tu-issuer-id@google.com"
```

### 6. Crear assets para los passes

Crea estos archivos en `public/`:

- `icon.png` (29x29 px)
- `logo.png` (160x50 px)

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Producción

### Build

```bash
npm run build
```

### Deploy en VPS (Ubuntu/Debian)

#### 1. Preparar servidor

```bash
sudo apt update
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Instalar PM2
sudo npm install -g pm2
```

#### 2. Clonar proyecto

```bash
cd /var/www
git clone <tu-repo> stampida
cd stampida
npm install
```

#### 3. Configurar entorno

```bash
cp .env.example .env
# Edita .env con credenciales de producción
```

#### 4. Configurar base de datos

```bash
npx prisma db push
npm run db:seed
```

#### 5. Build

```bash
npm run build
```

#### 6. Configurar PM2

```bash
pm2 start npm --name "stampida" -- start
pm2 save
pm2 startup
```

#### 7. Configurar Nginx

Crea `/etc/nginx/sites-available/stampida`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/stampida /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Configurar HTTPS

```bash
sudo certbot --nginx -d tu-dominio.com
```

#### 9. Actualizar BASE_URL

Edita `.env` y cambia `BASE_URL` a `https://tu-dominio.com`

```bash
pm2 restart stampida
```

## Uso

### 1. Registrar comercio

Ve a `/admin/register` y completa el formulario.

### 2. Acceder al dashboard

Ve a `/admin/login` con tus credenciales.

### 3. Compartir QR de alta

En el dashboard verás un QR. Imprímelo y colócalo en tu establecimiento.

### 4. Escanear clientes

Desde el dashboard, haz clic en "Escanear QR" o ve a `/scan` en tu móvil.

### 5. Enviar campañas

Desde el dashboard, escribe un mensaje y envíalo a todos tus clientes.

## Estructura del Proyecto

```
Stampida/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts            # Datos demo
├── src/
│   ├── app/
│   │   ├── admin/         # Dashboard y registro de comercios
│   │   ├── join/          # Landing pública para clientes
│   │   ├── scan/          # PWA escáner QR
│   │   └── api/           # API routes
│   │       ├── auth/      # Autenticación
│   │       ├── customers/ # Gestión de clientes
│   │       ├── stamp/     # Lógica de sellos
│   │       ├── campaigns/ # Campañas push
│   │       ├── passes/    # Generación de passes
│   │       └── apple/     # Apple Wallet API
│   └── lib/
│       ├── apple/         # Integración Apple Wallet
│       ├── google/        # Integración Google Wallet
│       ├── auth.ts        # Configuración NextAuth
│       └── prisma.ts      # Cliente Prisma
├── certs/                 # Certificados Apple (no incluir en git)
├── .env.example           # Variables de entorno ejemplo
└── README.md
```

## Credenciales Demo

Después de ejecutar el seed:

- **Email**: demo@cafeterialaplaza.com
- **Password**: demo123

## Troubleshooting

### Apple Wallet no funciona

- Verifica que los certificados estén en formato PEM correcto
- Asegúrate de que `webServiceURL` sea HTTPS
- Revisa los logs de Apple en `/api/apple/v1/log`

### Google Wallet no funciona

- Verifica que la service account tenga permisos de Wallet
- Asegúrate de que el `issuerId` sea correcto
- Revisa la consola de Google Pay & Wallet

### Los passes no se actualizan

- Verifica que los `pushToken` se estén guardando correctamente
- Revisa la configuración de APNs
- Asegúrate de que el servidor sea accesible públicamente

## Licencia

MIT

## Soporte

Para issues y preguntas, abre un issue en el repositorio del proyecto.
