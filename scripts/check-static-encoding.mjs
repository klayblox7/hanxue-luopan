import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const mojibakePattern =
  /(?:\uFFFD|\?{3,}|\u9345|\u95CA|\u95B8|\u9207|\u95BF|\u9286|\u20AC|\u5BF0\uE1BF\u8A86|\u8930\u66DE\u5F47|\u93B7\u6394\u7CB7|\u922B|\u934F\u5145\u7C2C|\u59F9\u56E9\u7EDE|\u6FEE\u681F|\u93C6\u509B|\u93C8\uE045|\u943D\u5474|\u934F\u3129)/;

const files = fs
  .readdirSync(root)
  .filter((file) => file.endsWith(".html"))
  .sort();

const failures = [];

for (const file of files) {
  const fullPath = path.join(root, file);
  const html = fs.readFileSync(fullPath, "utf8");
  const match = html.match(mojibakePattern);
  const scriptOpenCount = (html.match(/<script\b/gi) || []).length;
  const scriptCloseCount = (html.match(/<\/script>/gi) || []).length;
  if (match) {
    const start = Math.max(0, match.index - 48);
    const end = Math.min(html.length, match.index + 96);
    failures.push({
      file,
      match: match[0],
      context: html.slice(start, end).replace(/\s+/g, " ").trim()
    });
  }
  if (scriptOpenCount !== scriptCloseCount) {
    failures.push({
      file,
      match: "<script>",
      context: `script tag mismatch: ${scriptOpenCount} opening tag(s), ${scriptCloseCount} closing tag(s)`
    });
  }
}

if (failures.length > 0) {
  console.error("Static HTML encoding check failed:");
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${JSON.stringify(failure.match)} in ${JSON.stringify(failure.context)}`);
  }
  process.exit(1);
}

console.log(`Static HTML encoding check passed (${files.length} files).`);
