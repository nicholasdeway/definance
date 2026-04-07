import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Esta propriedade é necessária no ambiente de dev para 127.0.0.1
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://localhost:5137/:path*",
      },
    ];
  },
};

export default nextConfig;