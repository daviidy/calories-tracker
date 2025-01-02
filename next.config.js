/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.gravatar.com',
      'cdn.midjourney.com',
      's3-us-west-2.amazonaws.com'
    ],
  },
}

module.exports = nextConfig 