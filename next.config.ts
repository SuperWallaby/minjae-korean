import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/my/messages", destination: "/admin?tab=messages", permanent: false },
      { source: "/my/notifications", destination: "/admin?tab=notifications", permanent: false },
    ];
  },
};

export default nextConfig;
