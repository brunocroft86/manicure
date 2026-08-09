import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // O PWA só ativa de verdade quando for pro ar (Vercel)
});

const nextConfig: NextConfig = {
  /* suas configurações existentes, se houver */
};

export default withPWA(nextConfig);