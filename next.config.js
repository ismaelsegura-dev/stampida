/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['passkit-generator', 'apn'],
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
