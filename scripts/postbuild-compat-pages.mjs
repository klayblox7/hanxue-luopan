import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const publicDir = join(process.cwd(), "public");

if (!existsSync(outDir)) {
  process.exit(0);
}

const compatibilityPages = {
  "hanxue-luopan-home.html": "index.html",
  "application.html": join("application", "index.html"),
  "cost.html": join("cost", "index.html"),
  "exchange-rate.html": join("exchange-rate", "index.html"),
  "korea-university-map.html": join("korea-university-map", "index.html"),
  "korean-learning.html": join("korean-learning", "index.html"),
  "topik.html": join("topik", "index.html"),
  "universities.html": join("universities", "index.html")
};

const legacyDir = join(outDir, "legacy");
const legacyBaseHref = process.env.GITHUB_PAGES === "true" ? "/hanxue-luopan/" : "/";

mkdirSync(legacyDir, { recursive: true });

for (const target of Object.keys(compatibilityPages)) {
  const publicSourcePath = join(publicDir, target);

  if (!existsSync(publicSourcePath)) {
    continue;
  }

  const html = readFileSync(publicSourcePath, "utf8");
  const legacyHtml = html.includes("<base ")
    ? html
    : html.replace(/<head([^>]*)>/i, `<head$1>\n  <base href="${legacyBaseHref}">`);

  writeFileSync(join(legacyDir, target), legacyHtml);
}

for (const [target, source] of Object.entries(compatibilityPages)) {
  const sourcePath = join(outDir, source);

  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, join(outDir, target));
  }
}

writeFileSync(join(outDir, ".nojekyll"), "");
