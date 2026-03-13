/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  serverExternalPackages: ['@xenova/transformers'],
};

module.exports = nextConfig;
