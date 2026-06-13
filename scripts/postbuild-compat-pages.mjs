import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");

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

for (const [target, source] of Object.entries(compatibilityPages)) {
  const sourcePath = join(outDir, source);

  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, join(outDir, target));
  }
}

writeFileSync(join(outDir, ".nojekyll"), "");
