import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - Esta propriedade é necessária no ambiente de dev para 127.0.0.1
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    // IMPORTANTE: Em produção (Vercel), a variável BACKEND_URL deve ser o IP público ou domínio da sua API.
    // Se estiver vazia, o fallback para localhost causará o erro DNS_HOSTNAME_RESOLVED_PRIVATE no Vercel.
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5137";
    
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;