/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // experimental: {
  //   fontLoaders: [
  //     {
  //       loader: '@next/font/google',
  //       options: { timeout: 10000 },
  //     },
  //   ],
  // },
  webpack: (config, { isServer, webpack }) => {
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;