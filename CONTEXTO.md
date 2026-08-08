# STAMPIDA - Documento de Contexto Completo

## 📋 Resumen Ejecutivo

**Stampida** es una plataforma SaaS de tarjetas de fidelización digitales para comercios locales (bares, cafeterías) usando Apple Wallet y Google Wallet. Sin apps nativas: todo web + wallet passes.

### Propuesta de Valor
- **Para comercios**: Sin apps, sin costes de desarrollo, tarjetas profesionales en minutos
- **Para clientes**: Tarjeta en su wallet nativa, notificaciones de proximidad, sin apps adicionales
- **Para Stampida**: Modelo SaaS escalable, bajo coste operativo

---

## 🎯 Estado Actual del Proyecto

### ✅ Completado (MVP Funcional)
- [x] Next.js 14 + TypeScript + Tailwind CSS
- [x] Base de datos SQLite con Prisma
- [x] Autenticación NextAuth para comercios
- [x] Registro de comercios con personalización completa
- [x] Dashboard de administración con métricas
- [x] Landing pública para alta de clientes (`/join/[merchantId]`)
- [x] Generación de passes Apple Wallet (requiere certificados)
- [x] Integración Google Wallet (requiere service account)
- [x] Escáner QR PWA para camareros (`/scan`)
- [x] Sistema de sellos y premios automático
- [x] Campañas push para todos los clientes
- [x] Notificaciones de proximidad
- [x] Seed con "Cafetería La Plaza" (demo)
- [x] Documentación de despliegue

### ⏳ Pendiente para Producción
- [ ] **Google Wallet**: Configurar service account y issuer ID
- [ ] **Apple Wallet**: Obtener certificados de Apple Developer ($99/año)
- [ ] **Servidor**: Desplegar en VPS con HTTPS (obligatorio)
- [ ] **Dominio**: Comprar dominio y configurar DNS
- [ ] **Testing**: Probar flujo completo en móvil Android
- [ ] **Apple**: Pagar licencia developer y configurar passes

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:   Next.js API Routes (serverless)
Database:  SQLite → Prisma ORM (migración a Postgres fácil)
Auth:      NextAuth.js con credentials
Wallet:    Apple Wallet (passkit-generator) + Google Wallet (REST API)
Push:      APNs (Apple) + Google Wallet updates
QR:        html5-qrcode (escaneo) + qrcode (generación)
```

### Estructura de Carpetas
```
stampida/
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   ├── seed.ts                # Datos demo
│   └── dev.db                 # Base de datos SQLite
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/         # Login comercios
│   │   │   ├── register/      # Registro comercios
│   │   │   └── dashboard/     # Panel de control
│   │   ├── join/[merchantId]/ # Landing pública clientes
│   │   ├── scan/              # PWA escáner QR
│   │   └── api/
│   │       ├── auth/          # NextAuth + registro
│   │       ├── customers/     # Crear clientes
│   │       ├── stamp/         # Lógica sellos/premios
│   │       ├── campaigns/     # Campañas push
│   │       ├── passes/        # Generación passes
│   │       └── apple/         # Apple Wallet API endpoints
│   └── lib/
│       ├── apple/             # Integración Apple Wallet
│       ├── google/            # Integración Google Wallet
│       ├── auth.ts            # Configuración NextAuth
│       └── prisma.ts          # Cliente Prisma
├── certs/                     # Certificados Apple (no en git)
├── public/                    # Assets estáticos
├── .env                       # Variables de entorno (no en git)
└── .env.example               # Plantilla de variables
```

### Modelo de Datos (Prisma)

#### Merchant (Comercio)
```typescript
{
  id: string (cuid)
  nombre: string
  email: string (unique)
  password: string (bcrypt)
  logoUrl?: string
  colorPrimario: string (hex)
  sellosParaPremio: number (default: 8)
  textoPremio: string (ej: "Café gratis")
  lat?: number
  lng?: number
  radioMetros: number (default: 300)
  mensajeProximidad: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Customer (Cliente)
```typescript
{
  id: string (cuid)
  merchantId: string (FK)
  nombre: string
  telefono?: string
  serialNumber: string (unique)
  authToken: string (unique)
  sellos: number (default: 0)
  premiosCanjeados: number (default: 0)
  pushToken?: string (Apple)
  googleObjectId?: string (Google)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### StampEvent (Historial)
```typescript
{
  id: string (cuid)
  customerId: string (FK)
  tipo: "sello" | "canje"
  nota?: string
  createdAt: DateTime
}
```

#### Campaign (Campañas)
```typescript
{
  id: string (cuid)
  merchantId: string (FK)
  mensaje: string
  enviadaAt: DateTime
}
```

---

## 🔄 Flujos de Usuario

### Flujo 1: Alta de Comercio
1. Comercio visita `/admin/register`
2. Rellena formulario (nombre, email, password, color, premio, ubicación)
3. Backend crea merchant con password hasheado (bcrypt)
4. Redirige a `/admin/login`
5. Login → `/admin/dashboard`

### Flujo 2: Alta de Cliente
1. Cliente escanea QR en el comercio → `/join/[merchantId]`
2. Ve landing con branding del comercio (color, nombre, premio)
3. Rellena nombre y teléfono (opcional)
4. Backend crea Customer con serialNumber y authToken únicos
5. Cliente elige:
   - **Apple Wallet**: Descarga `.pkpass` → se abre en Wallet
   - **Google Wallet**: JWT firmado → "Add to Google Wallet"
6. Pass se instala en el wallet del móvil

### Flujo 3: Escaneo y Sellos
1. Camarero abre `/scan` en móvil/tablet
2. Escanea QR del pass del cliente
3. QR contiene: `https://dominio/api/scan?serial=XXX&token=YYY`
4. Backend valida serial + token
5. Incrementa sellos (+1)
6. Si `sellos == sellosParaPremio`:
   - Muestra pantalla verde "¡PREMIO!"
   - Al confirmar: `sellos = 0`, `premiosCanjeados + 1`
7. Actualiza pass en wallet (push Apple / update Google)

### Flujo 4: Campañas Push
1. Comercio escribe mensaje en dashboard
2. POST `/api/campaigns`
3. Backend:
   - Crea Campaign en BD
   - Para cada cliente con `pushToken`: envía push APNs
   - Para Google: actualiza objeto con mensaje
4. Clientes reciben notificación en su wallet

### Flujo 5: Notificaciones de Proximidad
- **Apple**: Cuando cliente está cerca (lat/lng del merchant + radioMetros), muestra mensaje en pass
- **Google**: Similar, configurado en el objeto de wallet

---

## 🔐 Configuración para Producción

### 1. Google Wallet (Android) - PRIORIDAD ALTA

#### Paso 1: Crear cuenta de Google Pay & Wallet
1. Ve a [Google Pay & Wallet Console](https://pay.google.com/gp/w/issuer/home)
2. Inicia sesión con cuenta de Google
3. Acepta términos y condiciones
4. **Obtén tu `issuerId`** (aparece en la URL o en configuración)

#### Paso 2: Crear Service Account en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo (ej: "stampida-production")
3. Ve a **IAM & Admin** → **Service Accounts**
4. Crea nueva service account:
   - Nombre: `stampida-wallet`
   - Rol: **Owner** (o **Wallet Object Admin**)
5. Crea una key en formato **JSON**
6. Descarga el archivo `credentials.json`

#### Paso 3: Configurar en `.env`
```env
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"stampida-production","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"stampida-wallet@stampida-production.iam.gserviceaccount.com","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
GOOGLE_ISSUER_ID="tu-issuer-id-numerico"
```

**IMPORTANTE**: El JSON debe estar en una sola línea, con saltos de línea escapados como `\n`

#### Paso 4: Probar integración
```bash
# Después de desplegar, crea un cliente de prueba
curl -X POST https://tu-dominio.com/api/customers \
  -H "Content-Type: application/json" \
  -d '{"merchantId":"ID_DEL_MERCHANT","nombre":"Test","telefono":"612345678"}'

# Luego genera el pass de Google
curl -X POST https://tu-dominio.com/api/passes/google \
  -H "Content-Type: application/json" \
  -d '{"customerId":"ID_DEL_CUSTOMER"}'

# Debería devolver: {"saveUrl":"https://pay.google.com/gp/w/save/..."}
```

### 2. Apple Wallet (iOS) - PRIORIDAD MEDIA

**Requiere**: Apple Developer Account ($99/año)

#### Paso 1: Crear Pass Type ID
1. Ve a [Apple Developer Portal](https://developer.apple.com/account)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Filtra por **Pass Type IDs**
4. Crea nuevo: `pass.com.tuempresa.stampida`
5. Genera certificado para ese Pass Type ID
6. Descarga `.cer` y conviértelo:

```bash
# Convertir certificado
openssl x509 -in pass.cer -inform DER -outform PEM -out certs/pass.pem

# Exportar clave privada desde Keychain Access como .p12
openssl pkcs12 -in pass.p12 -nocerts -nodes -out certs/key.pem
```

#### Paso 2: Descargar WWDR Certificate
1. Ve a [Apple Certificate Authority](https://www.apple.com/certificateauthority/)
2. Descarga "Apple Worldwide Developer Relations Certification Authority"
3. Convierte a PEM:

```bash
openssl x509 -in AppleWWDRCA.cer -inform DER -outform PEM -out certs/wwdr.pem
```

#### Paso 3: Configurar APNs (Push Notifications)
1. En Apple Developer Portal → **Keys**
2. Crea nueva key con capacidad **Apple Push Notifications service (APNs)**
3. Descarga archivo `.p8`
4. Renombra a `certs/apns_key.pem`
5. Anota el **Key ID**

#### Paso 4: Configurar `.env`
```env
APPLE_PASS_TYPE_IDENTIFIER="pass.com.tuempresa.stampida"
APPLE_TEAM_IDENTIFIER="TU_TEAM_ID"  # 10 caracteres
APPLE_CERT_PATH="/certs/pass.pem"
APPLE_KEY_PATH="/certs/key.pem"
APPLE_WWDR_PATH="/certs/wwdr.pem"
APPLE_PASSPHRASE=""  # Si pusiste password al exportar

APPLE_APN_KEY_ID="TU_KEY_ID"  # 10 caracteres
APPLE_APN_TEAM_ID="TU_TEAM_ID"
APPLE_APN_KEY_PATH="/certs/apns_key.pem"
```

### 3. Despliegue en VPS (OBLIGATORIO)

**Requisito**: HTTPS es obligatorio para Apple Wallet y Google Wallet

#### Opción A: VPS con Ubuntu/Debian (Recomendado)

**Proveedor recomendado**: Hetzner, DigitalOcean, OVH (desde 5€/mes)

##### Paso 1: Preparar servidor
```bash
# Conectar por SSH
ssh root@tu-servidor-ip

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar PM2, Nginx, Certbot
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx

# Instalar Git
apt install -y git
```

##### Paso 2: Clonar proyecto
```bash
cd /var/www
git clone https://github.com/tu-usuario/stampida.git
cd stampida
npm install
```

##### Paso 3: Configurar entorno
```bash
cp .env.example .env
nano .env
```

Edita `.env` con:
- `BASE_URL=https://tu-dominio.com`
- `NEXTAUTH_SECRET` (genera con `openssl rand -base64 32`)
- `NEXTAUTH_URL=https://tu-dominio.com`
- Credenciales de Google/Apple

##### Paso 4: Configurar base de datos
```bash
npx prisma db push
npm run db:seed
```

##### Paso 5: Build
```bash
npm run build
```

##### Paso 6: Configurar PM2
```bash
pm2 start npm --name "stampida" -- start
pm2 save
pm2 startup  # Sigue las instrucciones que te dé
```

##### Paso 7: Configurar Nginx
```bash
nano /etc/nginx/sites-available/stampida
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar:
```bash
ln -s /etc/nginx/sites-available/stampida /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

##### Paso 8: Configurar HTTPS (Let's Encrypt)
```bash
certbot --nginx -d tu-dominio.com
```

Sigue las instrucciones:
- Email para notificaciones
- Aceptar términos
- Redirigir HTTP → HTTPS (sí)

##### Paso 9: Actualizar BASE_URL
```bash
nano /var/www/stampida/.env
# Cambia BASE_URL a https://tu-dominio.com

pm2 restart stampida
```

##### Paso 10: Verificar
```bash
# Ver logs
pm2 logs stampida

# Ver estado
pm2 status

# Probar desde navegador
curl https://tu-dominio.com
```

#### Opción B: Vercel/Railway (Más fácil pero limitado)

**Vercel**:
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Limitaciones**:
- SQLite no persiste entre deployments → usar Postgres (Vercel Postgres)
- Cambiar `DATABASE_URL` a Postgres
- Certificados Apple/Google deben subirse como secrets

**Railway**:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Recomendación**: Para demo rápida, usa VPS. Para producción seria, Railway o Vercel + Postgres.

### 4. Dominio y DNS

#### Comprar dominio
- **Proveedores**: Namecheap, Gandi, OVH, GoDaddy
- **Precio**: 10-15€/año para `.com`
- **Ejemplos**: `stampida.app`, `stampida.com`, `getstampida.com`

#### Configurar DNS
1. En el panel del dominio, añade registro A:
   ```
   Type: A
   Name: @ (o dejar vacío)
   Value: IP de tu VPS
   TTL: 3600
   ```

2. Espera propagación (5 min - 24 h)

3. Verificar:
```bash
ping tu-dominio.com
# Debe responder con la IP de tu VPS
```

---

## 🧪 Testing para Demo en Cafetería

### Checklist Pre-Demo

#### 1. Preparar el comercio demo
```bash
# Acceder al dashboard
https://tu-dominio.com/admin/login

# Credenciales
Email: demo@cafeterialaplaza.com
Password: demo123

# Verificar:
- [ ] Dashboard carga correctamente
- [ ] QR de alta de clientes visible
- [ ] Botón "Escanear QR" funciona
- [ ] Métricas muestran 3 clientes demo
```

#### 2. Crear cliente de prueba en tu móvil
```bash
# En tu móvil Android:
1. Escanea el QR del dashboard
2. Rellena nombre: "Tu Nombre"
3. Teléfono: "Tu teléfono"
4. Pulsa "Continuar"
5. Pulsa "Guardar en Google Wallet"
6. Acepta permisos y guarda

# Verificar:
- [ ] Pass se instala en Google Wallet
- [ ] Muestra nombre del comercio
- [ ] Muestra 0 sellos
- [ ] Muestra premio: "Café gratis"
- [ ] QR visible en el pass
```

#### 3. Probar escaneo de sellos
```bash
# En otro móvil o tablet (simulando camarero):
1. Ve a https://tu-dominio.com/scan
2. Permite acceso a cámara
3. Escanea el QR de tu pass en Google Wallet
4. Verifica:
   - [ ] Muestra "¡Sello añadido!"
   - [ ] Mensaje: "Tienes 1/8 sellos"
   - [ ] Pass se actualiza automáticamente en tu wallet

# Repite 7 veces más hasta completar 8 sellos
# En el 8º sello:
   - [ ] Pantalla verde "¡PREMIO!"
   - [ ] Mensaje: "Has completado 8 sellos. Canjea tu premio: Café gratis"
   - [ ] Al confirmar: sellos vuelve a 0
   - [ ] Pass muestra 0/8 sellos
```

#### 4. Probar campaña push
```bash
# En el dashboard:
1. Escribe mensaje: "¡Hola! Hoy tenemos café especial"
2. Pulsa "Enviar a todos los clientes"
3. Verifica:
   - [ ] Mensaje "Campaña enviada"
   - [ ] En tu móvil: pass se actualiza con el mensaje
```

#### 5. Probar notificación de proximidad (opcional)
```bash
# Si configuraste lat/lng del comercio:
1. Acércate a la ubicación (radio 300m)
2. Verifica:
   - [ ] Pass muestra mensaje: "¡Estás cerca de La Plaza! Pásate y suma tu sello"
```

### Script de Demo para Cafetería

**Duración**: 5-10 minutos

**Guion**:
1. **Introducción** (1 min)
   - "Somos Stampida, tarjetas de fidelización digitales para cafeterías"
   - "Sin apps, sin costes de desarrollo, todo en el wallet del móvil"

2. **Mostrar el pass** (1 min)
   - Abre Google Wallet en tu móvil
   - "Mira, esta es la tarjeta de Cafetería La Plaza"
   - Muestra sellos, premio, QR

3. **Simular escaneo** (2 min)
   - "Ahora voy a simular que soy el camarero"
   - Abre `/scan` en otro móvil
   - Escanea tu QR
   - "Mira, acaba de añadir un sello"
   - Muestra el pass actualizado

4. **Explicar beneficios** (2 min)
   - **Para el comercio**: "Tú controlas todo desde el dashboard, ves métricas, envías campañas"
   - **Para el cliente**: "No necesita app, recibe notificaciones cuando está cerca, tiene la tarjeta siempre a mano"
   - **Para ambos**: "Sin papel, sin plástico, ecológico y moderno"

5. **Mostrar dashboard** (2 min)
   - Abre dashboard en portátil/tablet
   - "Mira, desde aquí ves todos tus clientes, sus sellos, envías campañas"
   - Muestra QR para imprimir: "Este QR lo pones en la barra, los clientes lo escanean y se dan de alta solos"

6. **Cerrar** (1 min)
   - "¿Te interesa? Podemos configurarlo para tu cafetería en 1 día"
   - "Precio: X€/mes por comercio"
   - "Prueba gratis 1 mes"

---

## 💰 Modelo de Negocio

### Pricing Sugerido

#### Plan Básico: 29€/mes
- 1 comercio
- Hasta 500 clientes
- Campañas push ilimitadas
- Soporte email

#### Plan Pro: 79€/mes
- 1 comercio
- Clientes ilimitados
- Campañas push ilimitadas
- Estadísticas avanzadas
- Soporte prioritario
- Personalización de pass

#### Plan Enterprise: 199€/mes
- Múltiples comercios
- Clientes ilimitados
- API personalizada
- Integración con TPV
- Soporte dedicado

### Costes Operativos

#### Mensuales (estimado)
- **VPS**: 5-20€/mes (Hetzner/DigitalOcean)
- **Dominio**: ~1€/mes (10-15€/año)
- **Apple Developer**: ~8€/mes (99€/año)
- **Google Wallet**: Gratis
- **Total**: ~15-30€/mes

#### Margen
- 1 cliente en Plan Básico: 29€ - 15€ = **14€ beneficio**
- 10 clientes: 290€ - 20€ = **270€ beneficio**
- 50 clientes: 1450€ - 30€ = **1420€ beneficio**

---

## 🚀 Roadmap Futuro

### Fase 1: MVP (Actual)
- [x] Funcionalidad básica
- [x] Google Wallet
- [ ] Apple Wallet
- [ ] Deploy producción
- [ ] Primeros clientes

### Fase 2: Mejoras (1-2 meses)
- [ ] Integración con TPV (punto de venta)
- [ ] Importar clientes desde Excel
- [ ] Plantillas de pass prediseñadas
- [ ] Sistema de referidos
- [ ] Analytics avanzados

### Fase 3: Escalado (3-6 meses)
- [ ] App móvil para comercios (opcional)
- [ ] Multi-idioma
- [ ] Pasarela de pago (Stripe)
- [ ] API pública para integraciones
- [ ] Marketplace de plantillas

### Fase 4: Expansión (6-12 meses)
- [ ] White-label para franquicias
- [ ] Integración con delivery (Glovo, Uber Eats)
- [ ] Gamificación (niveles, badges)
- [ ] Reservas y pedidos
- [ ] CRM integrado

---

## 📞 Soporte y Contacto

### Recursos Técnicos
- **Documentación Next.js**: https://nextjs.org/docs
- **Documentación Prisma**: https://www.prisma.io/docs
- **Apple Wallet Developer**: https://developer.apple.com/wallet/
- **Google Wallet Developer**: https://developers.google.com/wallet

### Problemas Comunes

#### "El pass no se actualiza"
- Verifica que el servidor sea accesible públicamente (HTTPS)
- Revisa logs: `pm2 logs stampida`
- Verifica que `webServiceURL` en el pass sea correcto

#### "Google Wallet da error"
- Verifica que la service account tenga permisos
- Comprueba que el `issuerId` sea correcto
- Revisa la consola de Google Pay & Wallet

#### "Apple Wallet da error"
- Verifica que los certificados sean válidos
- Comprueba que el Pass Type ID esté activo
- Revisa que el servidor sea HTTPS

#### "La base de datos se resetea"
- Si usas Vercel/Railway, SQLite no persiste
- Migra a Postgres o usa VPS con SQLite local

---

## 📝 Notas Legales

### Privacidad
- Los datos de clientes se almacenan en tu servidor
- No compartimos datos con terceros
- Cumple con RGPD (Reglamento General de Protección de Datos)
- Los clientes pueden solicitar borrado de datos

### Términos de Servicio
- El comercio es responsable de los premios ofrecidos
- Stampida no se hace responsable de fraudes
- Los sellos son gestionados por el comercio
- Stampida proporciona la tecnología, no el servicio final

### Licencia
- Código fuente: MIT (si es open source)
- Propiedad intelectual: Stampida
- Marcas registradas: Stampida (pendiente)

---

## ✅ Checklist Final para Demo

### Antes de salir de casa
- [ ] Servidor funcionando (verifica con `curl https://tu-dominio.com`)
- [ ] Google Wallet configurado y probado
- [ ] Pass instalado en tu móvil
- [ ] QR de alta de clientes impreso (por si acaso)
- [ ] Móvil cargado (tú y el del camarero)
- [ ] Datos móviles funcionando (por si el WiFi falla)
- [ ] Screenshot del dashboard por si acaso
- [ ] Guion de demo repasado

### Durante la demo
- [ ] Sonríe y sé entusiasta
- [ ] Empieza mostrando el pass en tu móvil (impacto visual)
- [ ] Haz la demo interactiva (que el dueño escanee)
- [ ] Destaca beneficios: "sin apps", "sin papel", "ecológico"
- [ ] Cierra con precio y prueba gratis

### Después de la demo
- [ ] Envía email de seguimiento en 24h
- [ ] Ofrece prueba gratis de 1 mes
- [ ] Pide feedback
- [ ] Pide referidos a otros comercios

---

## 🎓 Aprendizajes y Lecciones

### Qué funciona bien
- **Simplicidad**: Sin apps, todo en el wallet
- **UX**: Flujo muy intuitivo para comercios y clientes
- **Tecnología**: Stack moderno y escalable
- **Coste**: Muy bajo para el valor que aporta

### Desafíos
- **Apple**: Requiere licencia de 99€/año
- **HTTPS**: Obligatorio, requiere VPS o servicio pago
- **Educación**: Algunos comercios no conocen Apple/Google Wallet
- **Competencia**: Hay apps de fidelización, pero ninguna tan simple

### Próximos pasos
1. **Mañana**: Demo en cafetería → feedback real
2. **Semana 1**: Iterar según feedback
3. **Semana 2-4**: Buscar 5-10 clientes beta
4. **Mes 2-3**: Lanzamiento oficial con pricing
5. **Mes 4-6**: Escalado a 50-100 clientes

---

## 📚 Glossario

- **Pass**: Tarjeta digital en Apple/Google Wallet
- **Sello**: Marca digital que el comercio añade al escanear QR
- **Push Token**: Token para enviar notificaciones a Apple Wallet
- **Service Account**: Cuenta de servicio de Google para API
- **APNs**: Apple Push Notification service
- **QR**: Código QR que contiene serial + token del cliente
- **PWA**: Progressive Web App (app web que funciona como nativa)
- **SaaS**: Software as a Service (modelo de suscripción)

---

## 🚀 Estado Actual - Sesión de Hoy

### ✅ Completado Hoy
- [x] Servidor corriendo en puerto 3001
- [x] Google Wallet integrado correctamente
- [x] LoyaltyClass creada con `reviewStatus: APPROVED`
- [x] LoyaltyObject creado con manejo de duplicados
- [x] Logo placeholder funcional (imagen de Unsplash)
- [x] Save URL generado correctamente
- [x] Ngrok configurado para acceso público

### ⚠️ Problemas Resueltos Hoy

#### Error 1: "Wallet Object Class not found"
**Solución**: Crear la LoyaltyClass antes del LoyaltyObject en `/api/passes/google/route.ts`

#### Error 2: "Review status must be set"
**Solución**: Añadir `reviewStatus: 'APPROVED'` al crear la clase

#### Error 3: "LoyaltyClass cannot be created without a program logo"
**Solución**: Añadir logo por defecto con formato correcto:
```typescript
programLogo: { 
  sourceUri: { 
    uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop'
  }
}
```

#### Error 4: "Image cannot be loaded"
**Solución**: Usar URL de imagen accesible (placeholder.com no funciona con Google)

#### Error 5: "Wallet Object already exists"
**Solución**: Verificar si el objeto existe antes de crearlo, usar PATCH si ya existe

### 🔧 Configuración Actual

#### Google Wallet
- **Issuer ID**: `3388000000023181631`
- **Service Account**: `stampida@stampida-504902.iam.gserviceaccount.com`
- **Project ID**: `stampida-504902`
- **Estado**: ✅ Funcionando

#### Servidor
- **Puerto local**: 3001
- **Ngrok**: `https://stranger-petition-affront.ngrok-free.dev`
- **BASE_URL**: Actualizada sin espacios
- **NEXTAUTH_URL**: `http://localhost:3001`

### 📱 Flujo de Prueba Funcional

1. **Crear cliente**: POST `/api/customers` con merchantId, nombre, telefono
2. **Generar pass**: POST `/api/passes/google` con customerId
3. **Respuesta**: `{"saveUrl": "https://pay.google.com/gp/w/save/..."}`
4. **Abrir saveUrl**: En móvil Android → Añadir a Google Wallet
5. **Escanear QR**: Desde `/scan` → Añadir sellos
6. **Verificar**: Pass se actualiza automáticamente

### 🎯 Próximos Pasos para Mañana

#### Antes de la Demo
- [ ] Verificar que el pass se instala correctamente en Google Wallet
- [ ] Probar escaneo de QR en móvil
- [ ] Verificar que los sellos se actualizan
- [ ] Probar campaña push
- [ ] Imprimir QR de alta de clientes

#### Durante la Demo
- [ ] Mostrar pass instalado en tu móvil
- [ ] Simular escaneo de QR
- [ ] Mostrar dashboard con métricas
- [ ] Explicar beneficios para el comercio
- [ ] Cerrar con prueba gratis

#### Después de la Demo
- [ ] Recoger feedback
- [ ] Iterar según comentarios
- [ ] Preparar para siguientes clientes

### 📝 Notas Importantes

#### Google Wallet
- Las clases necesitan aprobación de Google (puede tardar minutos a 24h)
- El `reviewStatus: 'APPROVED'` funciona para desarrollo/pruebas
- Para producción, Google puede requerir revisión manual
- El logo debe ser una URL accesible públicamente

#### Ngrok
- La URL cambia cada vez que reinicias ngrok
- Actualizar `BASE_URL` en `.env` si cambia
- Para producción, usar dominio propio con HTTPS

#### Base de Datos
- SQLite funciona bien para desarrollo/demo
- Para producción, considerar migrar a Postgres
- Los datos se guardan en `prisma/dev.db`

### 🔐 Credenciales de Demo

**Comercio Demo**:
- Email: `demo@cafeterialaplaza.com`
- Password: `demo123`
- Merchant ID: `cmsjsfmdn00005a1qcjpsllb0`

**Clientes Demo**:
- María García: 5 sellos
- Juan López: 3 sellos
- Ana Martínez: 7 sellos

### 📊 Métricas del Proyecto

- **Líneas de código**: ~2000+
- **Endpoints API**: 10
- **Páginas**: 6 (home, login, register, dashboard, join, scan)
- **Modelos BD**: 4 (Merchant, Customer, StampEvent, Campaign)
- **Tiempo de desarrollo**: 1 día
- **Coste operativo**: ~5€/mes (VPS) + 0€ (Google Wallet)

### 💡 Lecciones Aprendidas

1. **Google Wallet es estricto con el formato de datos**
   - Las imágenes deben tener formato `sourceUri`
   - Los logos son obligatorios
   - El reviewStatus es obligatorio

2. **Next.js App Router requiere componentes cliente separados**
   - Los formularios interactivos necesitan `'use client'`
   - Los Server Components no pueden tener event handlers

3. **Ngrok es útil para demos rápidas**
   - Pero la URL cambia cada vez
   - No es suitable para producción

4. **SQLite es perfecto para MVP**
   - Fácil de configurar
   - No requiere servidor de BD
   - Migración a Postgres es sencilla

### 🎓 Recursos Útiles

- **Google Wallet Docs**: https://developers.google.com/wallet
- **Google Pay Console**: https://pay.google.com/gp/w/issuer/home
- **Ngrok Dashboard**: https://dashboard.ngrok.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🚀 CONFIGURACIÓN PRODUCCIÓN (Actualizado)

### Stack de Producción
- **Dominio**: stampida.online
- **Hosting**: Vercel (gratis, HTTPS automático)
- **Base de datos**: Neon Postgres (gratis, 500MB)
- **Google Wallet**: Configurado y funcional
- **Apple Wallet**: Pendiente (requiere licencia $99/año)

### Configuración Vercel + Neon

#### 1. Crear base de datos en Neon
1. Ve a [neon.tech](https://neon.tech)
2. Crea un proyecto: "stampida-production"
3. Copia el **connection string** (formato: `postgresql://user:pass@host.neon.tech/db`)

#### 2. Configurar Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Importa el repositorio de GitHub
3. En **Settings** → **Environment Variables**, añade:

```
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
BASE_URL=https://stampida.online
NEXTAUTH_URL=https://stampida.online
NEXTAUTH_SECRET=<generar con: openssl rand -base64 32>
GOOGLE_SERVICE_ACCOUNT_JSON=<JSON completo en una línea>
GOOGLE_ISSUER_ID=3388000000023181631
GOOGLE_MERCHANT_ID=BCR2DN6DTLW7VD3O
```

#### 3. Configurar dominio en Vercel
1. En Vercel → **Settings** → **Domains**
2. Añade `stampida.online`
3. Vercel te dará los registros DNS:
   - **Type**: A
   - **Name**: @
   - **Value**: IP de Vercel
4. En tu registrador de dominio (namecheap):
   - Ve a **Advanced DNS**
   - Añade el registro A
   - Espera propagación (5 min - 24h)

#### 4. Migrar base de datos
```bash
# Localmente, genera el cliente Prisma para Postgres
npx prisma generate

# En Vercel, las migraciones se ejecutan automáticamente con:
npx prisma db push
```

#### 5. Seed de datos demo
```bash
# Después del primer deploy, ejecuta:
npx tsx prisma/seed.ts
```

### Archivos modificados para producción
- ✅ `prisma/schema.prisma`: Cambiado de SQLite a PostgreSQL
- ✅ `.env.example`: Actualizado con variables de producción
- ✅ `vercel.json`: Configuración de build para Vercel

### Próximos pasos inmediatos
1. Subir código a GitHub
2. Conectar Vercel con GitHub
3. Configurar variables de entorno en Vercel
4. Configurar dominio stampida.online
5. Ejecutar migraciones y seed
6. Probar Google Wallet en producción

---

**Última actualización**: Configuración producción completada  
**Versión**: 1.1.0  
**Estado**: ✅ Listo para deploy en Vercel

---

**¡Buena suerte con la demo mañana!** 🚀☕
