/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  // Load these as real Node modules instead of bundling them. Bundling `ws`
  // breaks its buffer masking ("TypeError: t.mask is not a function") and
  // corrupts the Prisma/Neon native bindings during the build.
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      '@prisma/adapter-neon',
      '@neondatabase/serverless',
      'ws',
    ],
  },
};
module.exports = nextConfig;
