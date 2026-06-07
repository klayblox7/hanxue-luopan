import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";

describe("static application page", () => {
  it("marks Korean partner school names with school info badges", () => {
    const html = readFileSync("application.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document } = dom.window;

    const partnerLinks = Array.from(document.querySelectorAll(".partner-school-link"));
    const firstPartnerLink = partnerLinks[0];
    const partnerInfoLabels = Array.from(document.querySelectorAll(".partner-info-label"));
    const partnerSeparators = Array.from(document.querySelectorAll(".partner-separator"));

    expect(partnerLinks.length).toBeGreaterThan(0);
    expect(firstPartnerLink?.textContent?.trim()).toContain("T3 全北大学学校信息");
    expect(firstPartnerLink?.textContent?.trim()).not.toContain("(全州)");
    expect(firstPartnerLink?.textContent?.trim()).not.toContain("↗");
    expect(partnerInfoLabels.length).toBeGreaterThanOrEqual(partnerLinks.length);
    expect(partnerInfoLabels.every((node) => node.textContent?.trim() === "学校信息")).toBe(true);
    expect(partnerSeparators).toHaveLength(0);
    expect(html).toContain(".partner-info-label");
    expect(html).not.toContain(".partner-school-arrow");
    expect(html).not.toContain(".partner-separator");
  });
});
