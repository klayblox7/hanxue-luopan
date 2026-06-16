import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const deployBasePath = process.env.NEXT_PUBLIC_BASE_PATH || (isGitHubPages ? "/hanxue-luopan" : "");
const normalizedDeployBasePath = deployBasePath.replace(/\/$/, "");

const nextConfig = (phase: string): NextConfig => {
  const isDevelopmentServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    devIndicators: false,
    ...(isDevelopmentServer ? { distDir: ".next-dev" } : {}),
    ...(isDevelopmentServer ? {} : { output: "export" as const }),
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    env: {
      NEXT_PUBLIC_BASE_PATH: normalizedDeployBasePath
    },
    ...(normalizedDeployBasePath
      ? {
          basePath: normalizedDeployBasePath,
          assetPrefix: `${normalizedDeployBasePath}/`
        }
      : {})
  };
};

export default nextConfig;
