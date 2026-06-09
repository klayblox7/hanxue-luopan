import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const homeHtml = fs.readFileSync(path.join(root, "hanxue-luopan-home.html"), "utf8");

function extractConst(name) {
  const anchor = `const ${name}=`;
  const start = homeHtml.indexOf(anchor);
  if (start < 0) throw new Error(`${name} not found in static home HTML`);

  let depth = 0;
  let quote = null;
  let escaped = false;
  let end = start + anchor.length;

  for (; end < homeHtml.length; end += 1) {
    const char = homeHtml[end];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{" || char === "[") depth += 1;
    else if (char === "}" || char === "]") depth -= 1;
    else if (char === ";" && depth === 0) break;
  }

  return Function(`return (${homeHtml.slice(start + anchor.length, end)})`)();
}

function pathNumbers(d) {
  return (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}

function pathBox(d) {
  const numbers = pathNumbers(d);
  const xs = numbers.filter((_, index) => index % 2 === 0);
  const ys = numbers.filter((_, index) => index % 2 === 1);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}

function unionBox(boxes) {
  const x1 = Math.min(...boxes.map((box) => box.x));
  const y1 = Math.min(...boxes.map((box) => box.y));
  const x2 = Math.max(...boxes.map((box) => box.x + box.width));
  const y2 = Math.max(...boxes.map((box) => box.y + box.height));

  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

function transformBox(box, sourceBox, targetBox) {
  return {
    x: targetBox.x + ((box.x - sourceBox.x) / sourceBox.width) * targetBox.width,
    y: targetBox.y + ((box.y - sourceBox.y) / sourceBox.height) * targetBox.height,
    width: (box.width / sourceBox.width) * targetBox.width,
    height: (box.height / sourceBox.height) * targetBox.height
  };
}

function transformPath(d, sourceBox, targetBox) {
  let index = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, (value) => {
    const numeric = Number(value);
    const isX = index % 2 === 0;
    index += 1;

    const transformed = isX
      ? targetBox.x + ((numeric - sourceBox.x) / sourceBox.width) * targetBox.width
      : targetBox.y + ((numeric - sourceBox.y) / sourceBox.height) * targetBox.height;

    return transformed.toFixed(2);
  });
}

function readSvgPaths(filePath) {
  const svg = fs.readFileSync(filePath, "utf8");
  return [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map((match) => match[1]);
}

function writeCombinedMap(config, sourceMaps, sourceRegionPaths) {
  const originalPath = path.join(root, sourceMaps[config.key].href.replace(/^\.\//, ""));
  const detailPaths = readSvgPaths(originalPath);
  const detailBox = unionBox(detailPaths.map(pathBox));
  const sourceParts = sourceRegionPaths[config.key];
  const sourceBoxes = sourceParts.map((part) => pathBox(part.d));
  const sourceUnion = unionBox(sourceBoxes);
  const sourceProvince = sourceBoxes[0];
  const targetBox = sourceMaps[config.key].contentBox;
  const normalizedTarget = {
    x: targetBox.x,
    y: targetBox.y,
    width: targetBox.width,
    height: targetBox.height
  };
  const provinceTarget = transformBox(sourceProvince, sourceUnion, normalizedTarget);

  const detailPathMarkup = detailPaths
    .map((d) => `    <path d="${transformPath(d, detailBox, provinceTarget)}"/>`)
    .join("\n");
  const supplementPathMarkup = sourceParts
    .slice(1)
    .map((part, index) => {
      const label = config.supplements[index] || `supplement-${index + 1}`;
      const d = transformPath(part.d, sourceUnion, normalizedTarget);
      return `    <path class="supplemental-city" data-city="${label}" d="${d}"/>`;
    })
    .join("\n");

  const map = sourceMaps[config.key];
  const svg = `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="${map.width}" height="${map.height}" viewBox="0 0 ${map.width} ${map.height}" stroke-linecap="round" stroke-linejoin="round">\n  <style>\n    path{fill:#fffefb;stroke:#0a0a0a;stroke-width:0.42;vector-effect:non-scaling-stroke}\n    .supplemental-city{fill:#fff2b6;stroke:#0a0a0a;stroke-width:0.42;vector-effect:non-scaling-stroke}\n  </style>\n  <g id="${config.key}-province">\n${detailPathMarkup}\n  </g>\n  <g id="${config.key}-supplemental-cities">\n${supplementPathMarkup}\n  </g>\n</svg>\n`;

  fs.writeFileSync(path.join(root, "public", "maps", config.output), svg, "utf8");
}

const combinedMaps = [
  {
    key: "gyeonggi",
    output: "sgis-kostat-2020-gyeonggi-incheon-sigungu.svg",
    supplements: ["incheon"]
  },
  {
    key: "chungnam",
    output: "sgis-kostat-2020-chungnam-daejeon-sejong-sigungu.svg",
    supplements: ["daejeon", "sejong"]
  },
  {
    key: "jeonnam",
    output: "sgis-kostat-2020-jeonnam-gwangju-sigungu.svg",
    supplements: ["gwangju"]
  },
  {
    key: "gyeongbuk",
    output: "sgis-kostat-2020-gyeongbuk-daegu-sigungu.svg",
    supplements: ["daegu"]
  },
  {
    key: "gyeongnam",
    output: "sgis-kostat-2020-gyeongnam-busan-ulsan-sigungu.svg",
    supplements: ["busan", "ulsan"]
  }
];

const sourceMaps = extractConst("sourceMaps");
const sourceRegionPaths = extractConst("sourceRegionPaths");

combinedMaps.forEach((config) => writeCombinedMap(config, sourceMaps, sourceRegionPaths));

console.log(`Generated ${combinedMaps.length} combined detail map SVG files.`);
