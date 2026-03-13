/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },

  webpack: (config, { isServer }) => {
    // Esto evita que busque el archivo nativo .so en Vercel
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node": false,
    };

    return config;
  },
};

module.exports = nextConfig;