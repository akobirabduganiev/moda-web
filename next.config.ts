import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  i18n: {
    locales: ["uz", "ru", "en"],
    defaultLocale: "en",
  },
};

export default nextConfig;
