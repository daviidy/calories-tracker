/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      's3-us-west-2.amazonaws.com',
      'www.gravatar.com',
      'firebasestorage.googleapis.com'
    ],
  },
};

module.exports = nextConfig; 