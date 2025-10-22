/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com']
  },
  transpilePackages: ['@used-car-marketplace/shared'],
  experimental: {
    externalDir: true
  }
};

export default nextConfig; 