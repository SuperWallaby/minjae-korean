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
  webpack: (config) => {
    config.output = config.output || {};
    config.output.hashFunction = "xxhash64";
    return config;
  },
  async redirects() {
    return [
      { source: "/my/messages", destination: "/admin?tab=messages", permanent: false },
      { source: "/my/notifications", destination: "/admin?tab=broadcast", permanent: false },
      { source: "/admin/call", destination: "/admin", permanent: true },
      { source: "/admin/call/:path*", destination: "/admin", permanent: true },
      { source: "/news", destination: "/blog", permanent: true },
      { source: "/news/:path*", destination: "/blog", permanent: true },
      { source: "/drama", destination: "/blog", permanent: true },
      { source: "/drama/:path*", destination: "/blog", permanent: true },
      { source: "/songs", destination: "/blog", permanent: true },
      { source: "/songs/:path*", destination: "/blog", permanent: true },
      { source: "/grammar", destination: "/blog", permanent: true },
      { source: "/grammar/:path*", destination: "/blog", permanent: true },
      { source: "/expressions", destination: "/blog", permanent: true },
      { source: "/expressions/:path*", destination: "/blog", permanent: true },
      { source: "/exams", destination: "/blog", permanent: true },
      { source: "/exams/:path*", destination: "/blog", permanent: true },
      { source: "/flashcards", destination: "/vocab-quiz", permanent: true },
      { source: "/flashcards/:path*", destination: "/vocab-quiz", permanent: true },
      { source: "/fundamental", destination: "/blog", permanent: true },
      { source: "/fundamental/:path*", destination: "/blog", permanent: true },
      { source: "/list", destination: "/blog", permanent: true },
      { source: "/list/:path*", destination: "/blog", permanent: true },
      { source: "/when-to-use", destination: "/blog", permanent: true },
      { source: "/when-to-use/:path*", destination: "/blog", permanent: true },
      { source: "/coaching", destination: "/", permanent: true },
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
