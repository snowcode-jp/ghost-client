import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Enable React Compiler (React 19)
  reactCompiler: true,

  // API rewrites for development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6661"}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
