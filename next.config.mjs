/** @type {import('next').NextConfig} */
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5001';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "localhost"],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_INTERNAL_URL}/api/v1/:path*`,
      },
      {
        source: '/backend-api/:path*',
        destination: `${BACKEND_INTERNAL_URL}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_INTERNAL_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
