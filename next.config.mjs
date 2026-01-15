/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  images: {
    unoptimized: true, // ✅ disables sharp usage
  },

  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
