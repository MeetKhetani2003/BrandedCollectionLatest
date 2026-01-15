/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true, // 🔑 disables sharp completely
  },
  experimental: {
    serverActions: {}, // FIXES your warning
  },
};

export default nextConfig;
