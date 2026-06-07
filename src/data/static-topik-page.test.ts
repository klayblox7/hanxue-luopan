import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";

describe("static TOPIK page", () => {
  it("uses softer, smaller title bars for every main section heading", () => {
    const html = readFileSync("topik.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const sectionTitles = Array.from(document.querySelectorAll("h2.summary-title"));

    expect(sectionTitles).toHaveLength(6);
    expect(sectionTitles.map((title) => title.textContent?.trim())).toEqual([
      "\u5907\u8003\u65f6\u95f4\u5bf9\u6bd4",
      "\u8003\u8bd5\u7cfb\u7edf\u5730\u56fe",
      "\u5206\u6570\u600e\u4e48\u53d8\u6210\u7b49\u7ea7",
      "\u672c\u79d1\u7533\u8bf7TOPIK\u89c4\u5212",
      "\u7f51\u8bfe\u4e0e\u6559\u6750\u8d44\u6e90",
      "\u4e2d\u56fd\u5730\u533a\u8003\u70b9\u901f\u67e5"
    ]);
    expect(html).toContain("background: #fff3ad;");
    expect(html).toContain("font-size: clamp(0.64rem, 1.024vw, 0.96rem);");
    expect(html).not.toContain("background: var(--yellow);\n        font-size: clamp(0.8rem, 1.28vw, 1.2rem);");
  });
});
