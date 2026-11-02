# Seguridad de Stampida

Controles de seguridad implementados, mapeados a **SOC 2 (Trust Services Criteria)**, **ISO/IEC 27001** e **ISO/IEC 27701** (privacidad). Última revisión: noviembre 2026.

## Controles implementados

### 1. Protección de la capa de transporte y cabeceras HTTP
*(SOC 2 CC6.7 / ISO 27001 A.10.1, A.13.1)*

Configurado en `next.config.js`:

- **HSTS** `max-age=63072000; includeSubDomains; preload` — fuerza HTTPS siempre.
- **Content-Security-Policy** — restringe orígenes de scripts, estilos, imágenes y conexiones; `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`.
- **X-Frame-Options: DENY** y **X-Content-Type-Options: nosniff** — anti clickjacking y anti MIME-sniffing.
- **Referrer-Policy: strict-origin-when-cross-origin** — minimiza fuga de URLs (que pueden contener parámetros de cliente).
- **Permissions-Policy** — cámara y geolocalización solo para el propio origen (escáner y proximidad); resto denegado.
- **X-Powered-By desactivado** — no se expone el stack tecnológico.

### 2. Control de acceso y autenticación
*(SOC 2 CC6.1 / ISO 27001 A.9.2, A.9.4)*

- Contraseñas de comercios y admins con **bcrypt** (coste 10). Nunca se almacenan ni devuelven en claro.
- Política de contraseñas: mínimo 8 caracteres en el registro (A.9.4.3).
- Sesiones **JWT vía NextAuth** con cookies seguras (SameSite=Lax, Secure en HTTPS).
- **Anti fuerza-bruta** en login (10 intentos / 10 min por email) y en verificación de email (10 intentos / 10 min por IP — el código tiene 6 dígitos).
- Registro de comercios cerrado mediante **códigos de invitación** de un solo uso.
- Panel de superadministración con **control por rol** (`admin` vs `merchant`) verificado en servidor en cada endpoint.
- Las rutas del web service de **Apple Wallet** exigen el `authToken` individual de cada pase (estándar Apple: `ApplePass <token>`).
- El QR de cada cliente contiene un **token de 256 bits** (`crypto.randomBytes(32)`) — es la credencial de sellado; el escáner `/scan` es público por diseño y sin ese token no se puede sellar.
- El cron interno exige `Authorization: Bearer ${CRON_SECRET}`.

### 3. Rate limiting y antiabuso
*(SOC 2 CC6.1, CC7.2 / ISO 27001 A.12.1, A.13.1)*

Implementado en `src/lib/rate-limit.ts` (contador en memoria por instancia serverless):

| Endpoint | Límite | Motivo |
|---|---|---|
| `/api/auth/verify` | 10 / 10 min por IP | Fuerza bruta del código de 6 dígitos |
| `/api/auth/register` | 10 / 10 min por IP | Registros masivos |
| Login (NextAuth) | 10 / 10 min por email | Fuerza bruta de contraseñas |
| `/api/customers` | 20 / min por IP | Creación masiva de clientes (endpoint público) |
| `/api/stamp` | 60 / min por IP | Cobertura del ritmo real de una barra; antiabuso |
| `/api/leads` | 10 / 10 min por IP | Spam del formulario comercial |

**Limitación conocida (riesgo aceptado):** al ser en memoria, el límite aplica por instancia de Vercel, no globalmente. Frena bots simples y abuso casual. Mejora futura: store compartido (Redis/KV) si el volumen de ataques lo requiere.

### 4. Validación de entradas
*(SOC 2 CC6.8 / ISO 27001 A.12.2, A.14.2)*

- Todos los endpoints validan tipos, longitudes máximas y formatos (email, color hex, rangos numéricos) antes de tocar la base de datos.
- **SQL injection:** imposible por diseño — Prisma parametriza todas las consultas; no hay SQL crudo con concatenación.
- **XSS:** React escapa todo el renderizado; no se usa `dangerouslySetInnerHTML` con datos de usuario.
- Las respuestas de error no incluyen mensajes internos ni trazas.

### 5. Gestión de secretos
*(SOC 2 CC6.1 / ISO 27001 A.10.1)*

- Secretos solo en variables de entorno (Vercel) y `.env` local; **ninguno versionado** (`.gitignore` cubre `.env*`, certificados y credenciales de Google).
- Claves de Apple (APNs `.p8`, certificados del pase) fuera del repositorio.
- Rotación: cambiar `NEXTAUTH_SECRET` invalida todas las sesiones; las claves de Apple/Google se rotan desde sus consolas sin cambios de código.

### 6. Dependencias
*(SOC 2 CC7.1 / ISO 27001 A.12.6)*

- `next` actualizado a la última 14.2.x parcheada disponible.
- `joi` forzado a 17.13.9 (parche) vía `overrides` de npm.
- Auditoría periódica con `npm audit`.

**Riesgos aceptados y justificados:**

| Dependencia | Advisory | Justificación |
|---|---|---|
| `next@14.2.x` | DoS en image optimizer y rewrites | No aplica: el hosting es Vercel (los rewrites se resuelven en el CDN y la optimización de imágenes en su infraestructura, según la propia advisory GHSA-ggv3-7p47-pfv8). Las DoS de RSC son de disponibilidad, sin impacto en datos. Plan: migrar a Next 15/16 como proyecto aparte. |
| `apn` → `jsonwebtoken` | Vulnerabilidades en `jwt.verify` | No aplica: `apn` solo **firma** tokens con nuestra clave; nunca verifica tokens de terceros. |
| `apn` → `node-forge@0.7.6` | ASN.1 | No aplica: usamos autenticación por token (.p8), no por certificado. |
| `@vercel/functions` → `zod` | DoS por colecciones grandes | No alcanzable: solo usamos `waitUntil`; no se valida entrada de usuario con zod. |

### 7. Privacidad (ISO/IEC 27701, RGPD)
*(Principios: minimización, limitación de la finalidad, integridad)*

- **PII mínima:** del cliente final solo se almacena nombre y teléfono (opcional). Sin email, sin fecha de nacimiento, sin geolocalización almacenada.
- **Logs sin PII:** no se registran tokens, códigos de verificación ni URLs firmadas (JWT de Google Wallet) en logs.
- Los logs de depuración con datos sensibles solo se emiten fuera de producción.
- **Borrado en cascada:** al eliminar un comercio se eliminan todos sus clientes y eventos (`/api/admin/merchants/[id]`), cumpliendo el derecho de supresión a nivel de cuenta.
- Derecho de supresión del cliente final: se atiende por solicitud al comercio/soporte y se ejecuta borrando el registro `Customer` (procedimiento manual documentado; mejora futura: endpoint autogestionado).
- Datos alojados en UE (Neon, región eu-west) y Vercel.

### 8. Disponibilidad y continuidad
*(SOC 2 A1.2 / ISO 27001 A.12.3, A.17)*

- Base de datos gestionada (Neon) con backups automáticos del proveedor.
- Despliegue con rollback inmediato (redeploy del deployment anterior en Vercel).
- `main` es siempre desplegable; los cambios se integran por ramas y se verifican antes del merge.

## Procedimiento de revisión

1. `npm audit` en cada cambio de dependencias.
2. Revisión de este documento cada 6 meses o tras incidente.
3. Reporte de vulnerabilidades: hola@stampida.online
