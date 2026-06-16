import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const publicDir = join(process.cwd(), "public");

if (!existsSync(outDir)) {
  process.exit(0);
}

const legacyPages = [
  "hanxue-luopan-home.html",
  "application.html",
  "cost.html",
  "exchange-rate.html",
  "korea-university-map.html",
  "korean-learning.html",
  "topik.html",
  "universities.html"
];
const legacyDir = join(outDir, "legacy");
const deployBasePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_PAGES === "true" ? "/hanxue-luopan" : "");
const normalizedDeployBasePath = deployBasePath.replace(/\/$/, "");
const legacyBaseHref = normalizedDeployBasePath ? `${normalizedDeployBasePath}/` : "/";

mkdirSync(legacyDir, { recursive: true });

for (const target of legacyPages) {
  const publicSourcePath = join(publicDir, target);

  if (!existsSync(publicSourcePath)) {
    continue;
  }

  const html = readFileSync(publicSourcePath, "utf8");
  const legacyHtml = html.includes("<base ")
    ? html
    : html.replace(/<head([^>]*)>/i, `<head$1>\n  <base href="${legacyBaseHref}">`);

  writeFileSync(join(legacyDir, target), legacyHtml);
  writeFileSync(join(outDir, target), legacyHtml);
}

writeFileSync(join(outDir, ".nojekyll"), "");
