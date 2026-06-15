import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const deployBasePath = process.env.NEXT_PUBLIC_BASE_PATH || (isGitHubPages ? "/hanxue-luopan" : "");
const normalizedDeployBasePath = deployBasePath.replace(/\/$/, "");

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
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

export default nextConfig;
