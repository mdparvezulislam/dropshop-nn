import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  reactCompiler: true,
  serverExternalPackages: ["mongoose", "bcrypt", "bcryptjs", "bullmq", "ioredis", "sharp"],
  outputFileTracingIncludes: {
    "/": ["./node_modules/.pnpm/**/*"],
  },
};

export default nextConfig;
