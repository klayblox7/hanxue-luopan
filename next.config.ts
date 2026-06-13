import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/hanxue-luopan" : ""
  },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/hanxue-luopan",
        assetPrefix: "/hanxue-luopan/",
        trailingSlash: true,
        images: {
          unoptimized: true
        }
      }
    : {})
};

export default nextConfig;
