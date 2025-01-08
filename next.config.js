/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: [
      'lh3.googleusercontent.com',
      's3-us-west-2.amazonaws.com',
      'www.gravatar.com',
      'firebasestorage.googleapis.com'
    ],
  },
  basePath: '/calories-tracker',
  assetPrefix: '/calories-tracker',
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig; 