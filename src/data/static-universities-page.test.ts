import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";

describe("static universities page", () => {
  it("does not show the stray route character between Korean and English school names", () => {
    const html = readFileSync("universities.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const subtitles = Array.from(document.querySelectorAll(".school-subtitle")).map(
      (subtitle) => subtitle.textContent ?? ""
    );

    expect(subtitles.length).toBeGreaterThan(0);
    expect(subtitles.every((subtitle) => !subtitle.includes("\u8def"))).toBe(true);
  });

  it("renders the beauty and cosmetology tag for Inje University", () => {
    const html = readFileSync("universities.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;
    const schoolName = "\u4ec1\u6d4e\u5927\u5b66";
    const beautyTag = "\u7f8e\u5986/\u7f8e\u5bb9";

    const row = Array.from(document.querySelectorAll<HTMLTableRowElement>(".university-row")).find(
      (candidate) => candidate.dataset.schoolName === schoolName
    );
    const tags = row?.dataset.majorTags ?? "";

    expect(tags).toContain(beautyTag);
    expect(row?.textContent).toContain(beautyTag);
  });

  it("renders alumni lists in school information panels", () => {
    const html = readFileSync("universities.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document } = dom.window;

    document.querySelector<HTMLButtonElement>(".school-info-toggle")?.click();

    const panel = document.querySelector(".school-info-panel");

    expect(panel?.textContent).toContain("校友名单");
    expect(panel?.textContent).toContain("潘基文");
  });

  it("serves school info images through deploy-relative urls", () => {
    const directoryHtml = readFileSync("universities.html", "utf8");
    const mapHtml = readFileSync("korea-university-map.html", "utf8");
    const campusImage = "./campus-images/partner-glo-iwn-ho3-i1c-hlz-i1y.webp";
    const logoImage = "./school-logos/partner-glo-iwn-ho3-i1c-hlz-i1y.png";

    expect(directoryHtml).toContain(`"campusImage":"${campusImage}"`);
    expect(directoryHtml).toContain(`"logoImage":"${logoImage}"`);
    expect(mapHtml).toContain(`"partner-glo-iwn-ho3-i1c-hlz-i1y":"${campusImage}"`);
    expect(mapHtml).toContain(`"partner-glo-iwn-ho3-i1c-hlz-i1y":"${logoImage}"`);
    expect(mapHtml).toContain("raw.replace(/^\\.?\\/?public\\//,'').replace(/^\\.?\\//,'')");
    expect(mapHtml).not.toContain("return './'+raw.replace(/^\\.?\\//,'')");

    for (const html of [directoryHtml, mapHtml]) {
      expect(html).not.toContain("public/campus-images");
      expect(html).not.toContain("public/school-logos");
    }
  });

  it("generates a valid deploy-ready map school profile script", () => {
    const script = readFileSync("map-school-profiles.js", "utf8");
    const publicScript = readFileSync("public/map-school-profiles.js", "utf8");
    const campusImage = "./campus-images/partner-glo-iwn-ho3-i1c-hlz-i1y.webp";
    const logoImage = "./school-logos/partner-glo-iwn-ho3-i1c-hlz-i1y.png";
    const window = {} as {
      mapSchoolProfiles?: Record<string, { campusImage?: string; logoImage?: string }>;
    };

    expect(script).toBe(publicScript);
    const profiles = new Function("window", `${script}\nreturn window.mapSchoolProfiles;`)(window) as typeof window.mapSchoolProfiles;
    const dongduk = profiles?.["partner-glo-iwn-ho3-i1c-hlz-i1y"];

    expect(dongduk?.campusImage).toBe(campusImage);
    expect(dongduk?.logoImage).toBe(logoImage);
  });
});
