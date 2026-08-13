import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "hangul-romanize", "hangulx", "mongodb"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "file.kajakorean.com", pathname: "/**" },
      { protocol: "https", hostname: "quiz-media.kajakorean.com", pathname: "/**" },
      { protocol: "https", hostname: "file.fancamrank.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "pub-082231863ab14e52a4ff5f2550852d95.r2.dev",
        pathname: "/**",
      },
    ],
  },
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
