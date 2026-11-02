/** @type {import('next').NextConfig} */

// Directiva CSP pragmática para Next.js 14 (App Router): la hidratación
// requiere scripts inline, así que 'unsafe-inline' no es evitable sin nonces.
// Se endurece todo lo demás (sin object, sin frames externos, base-uri self).
// En desarrollo se añade 'unsafe-eval' porque el HMR de Next lo necesita;
// en producción no se usa eval y la directiva queda estricta.
const isDev = process.env.NODE_ENV !== 'production';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  // HSTS: 2 años, subdominios incluidos (ISO 27001 A.10.1, SOC 2 CC6.7)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // /scan necesita cámara; el panel del comercio usa geolocalización para
  // configurar las notificaciones de proximidad. Resto, denegado.
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), geolocation=(self), microphone=(), payment=(), usb=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['passkit-generator', 'apn'],
  },
  // X-Powered-By delata el stack; fuera.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      // Compatibilidad: los pases instalados antes del fix llevan
      // webServiceURL ".../api/apple/v1/" y iOS añade otro "v1/".
      // Reescribimos /api/apple/v1/v1/* a las rutas correctas.
      {
        source: '/api/apple/v1/v1/:path*',
        destination: '/api/apple/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
