import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "hangul-romanize", "hangulx", "mongodb"],
  async redirects() {
    return [
      { source: "/my/messages", destination: "/admin?tab=messages", permanent: false },
      { source: "/my/notifications", destination: "/admin?tab=notifications", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/global/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
