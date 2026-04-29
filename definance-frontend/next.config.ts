import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ||
      (process.env.NEXT_PUBLIC_API_URL?.startsWith("http") ? process.env.NEXT_PUBLIC_API_URL : null) ||
      "https://api.definance.com.br";

    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;