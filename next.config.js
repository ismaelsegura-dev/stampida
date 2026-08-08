/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['passkit-generator', 'apn'],
  },
};

module.exports = nextConfig;
