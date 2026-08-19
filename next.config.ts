import type { NextConfig } from "next";

/**
 * Parses allowed development origins from ALLOWED_DEV_ORIGINS environment variable
 * and provides safe wildcards for local dev networks instead of hardcoded IPs.
 */
function getAllowedDevOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_DEV_ORIGINS
    ? process.env.ALLOWED_DEV_ORIGINS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const defaultOrigins = [
    "localhost:*",
    "127.0.0.1:*",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "*.local",
  ];

  return Array.from(new Set([...envOrigins, ...defaultOrigins]));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;

