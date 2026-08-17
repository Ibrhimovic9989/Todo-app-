import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  env: {
    NEXT_PUBLIC_TASKS_APP_URL:
      process.env.NEXT_PUBLIC_TASKS_APP_URL ||
      process.env.TASKS_APP_URL ||
      "https://tasks-seven-omega.vercel.app",
    NEXT_PUBLIC_LANDING_URL:
      process.env.NEXT_PUBLIC_LANDING_URL ||
      process.env.LANDING_URL ||
      "https://landing-psi-black.vercel.app",
  },
};

export default nextConfig;
