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
});
