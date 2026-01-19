/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  images: {
    unoptimized: true, // 🔑 disables sharp completely
  },
  experimental: {
    serverActions: {}, // FIXES your warning
  },
};

export default nextConfig;
