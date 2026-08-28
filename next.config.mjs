/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "avatar.vercel.sh", "raw.githubusercontent.com"],
  },
  experimental: {
    // Optimized for Next.js 14 server components & bundling
  },
};

export default nextConfig;

