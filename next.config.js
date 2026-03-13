/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@xenova/transformers'],

  experimental: {
    turbo: {
      resolveAlias: {
        "onnxruntime-node": false,
      },
    },
  },
};

module.exports = nextConfig;