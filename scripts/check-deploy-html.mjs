import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const targetDirs = process.argv.slice(2);
const dirs = targetDirs.length > 0 ? targetDirs : ["public"];

const legacyPages = [
  "hanxue-luopan-home.html",
  "application.html",
  "cost.html",
  "exchange-rate.html",
  "korea-university-map.html",
  "korean-learning.html",
  "topik.html",
  "universities.html",
];

const requiredMarkers = {
  "application.html": ["partner-school-link", "profile-campus-image", "profile-logo-image"],
  "korea-university-map.html": ["study-info-link-button", "map-school-profiles.js"],
  "universities.html": ["school-info-toggle", "school-info-photo", "school-info-logo"],
};

const mojibakePattern =
  /(?:\uFFFD|\?{3,}|\u9345|\u95CA|\u95B8|\u9207|\u95BF|\u9286|\u20AC|\u5BF0\uE1BF\u8A86|\u8930\u66DE\u5F47|\u93B7\u6394\u7CB7|\u922B|\u934F\u5145\u7C2C|\u59F9\u56E9\u7EDE|\u6FEE\u681F|\u93C6\u509B|\u93C8\uE045|\u943D\u5474|\u934F\u3129)/;

function displayPath(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}

function checkHtmlFile(filePath, html, failures) {
  const fileName = path.basename(filePath);
  const scriptOpenCount = (html.match(/<script\b/gi) || []).length;
  const scriptCloseCount = (html.match(/<\/script>/gi) || []).length;

  if (scriptOpenCount !== scriptCloseCount) {
    failures.push(`${displayPath(filePath)} has ${scriptOpenCount} <script> tag(s) but ${scriptCloseCount} closing tag(s).`);
  }

  const mojibakeMatch = html.match(mojibakePattern);
  if (mojibakeMatch) {
    failures.push(`${displayPath(filePath)} contains likely mojibake text near ${JSON.stringify(mojibakeMatch[0])}.`);
  }

  const publicAssetMatch = html.match(/(?:src|href)=["']\.?\/?public\//i) || html.match(/"(?:campusImage|logoImage)"\s*:\s*"public\//);
  if (publicAssetMatch) {
    failures.push(`${displayPath(filePath)} still points at a public/ asset path near ${JSON.stringify(publicAssetMatch[0])}.`);
  }

  for (const marker of requiredMarkers[fileName] || []) {
    if (!html.includes(marker)) {
      failures.push(`${displayPath(filePath)} is missing required marker ${JSON.stringify(marker)}.`);
    }
  }
}

const failures = [];
let checkedFiles = 0;

for (const dir of dirs) {
  const absoluteDir = path.resolve(projectRoot, dir);

  if (!fs.existsSync(absoluteDir)) {
    failures.push(`${displayPath(absoluteDir)} does not exist.`);
    continue;
  }

  for (const page of legacyPages) {
    const filePath = path.join(absoluteDir, page);
    if (!fs.existsSync(filePath)) continue;

    const html = fs.readFileSync(filePath, "utf8");
    checkedFiles += 1;
    checkHtmlFile(filePath, html, failures);
  }
}

if (failures.length > 0) {
  console.error("Deploy HTML check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Deploy HTML check passed (${checkedFiles} file${checkedFiles === 1 ? "" : "s"}).`);
