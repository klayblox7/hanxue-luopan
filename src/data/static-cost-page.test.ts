import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";

describe("static cost page", () => {
  it("uses numbered section title bars for the lower cost sections", () => {
    const html = readFileSync("cost.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const sectionTitleBars = Array.from(document.querySelectorAll(".section-title-bar"));

    expect(sectionTitleBars).toHaveLength(3);
    expect(sectionTitleBars[0].textContent).toContain("01");
    expect(sectionTitleBars[0].textContent).toContain("\u5178\u578b\u6848\u4f8b\u8d39\u7528\u6784\u6210");
    expect(sectionTitleBars[1].textContent).toContain("02");
    expect(sectionTitleBars[1].textContent).toContain("\u524d\u671f\u4e00\u6b21\u6027\u51c6\u5907\u8d39");
    expect(sectionTitleBars[2].textContent).toContain("03");
    expect(sectionTitleBars[2].textContent).toContain("\u6bcf\u6708\u751f\u6d3b\u6210\u672c\u901f\u67e5");
    expect(html).toContain(".summary-title.section-title-bar");
  });

  it("renders the annual budget comparison as readable budget cards", () => {
    const html = readFileSync("cost.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const annualBudgetTitle = "\u5e74\u5ea6\u9884\u7b97\u573a\u666f\u5bf9\u6bd4";
    const section = Array.from(document.querySelectorAll("section.section")).find((candidate) =>
      candidate.querySelector(".summary-title")?.textContent?.includes(annualBudgetTitle)
    );

    expect(section?.querySelector(".budget-card-grid")).not.toBeNull();
    expect(section?.querySelector(".scenario-graph")).toBeNull();
    expect(section?.querySelector(".range-bar")).toBeNull();

    const cards = Array.from(section?.querySelectorAll(".budget-card") ?? []);
    expect(cards).toHaveLength(4);
    expect(cards[0].querySelector(".budget-card-amount")?.textContent?.trim()).toBe("14-20\u4e07");
    expect(cards[0].querySelectorAll(".budget-chip")).toHaveLength(3);
  });

  it("marks the featured pre-departure material cost with a smaller external arrow", () => {
    const html = readFileSync("cost.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const featuredAmount = document.querySelector(".pre-cost-card.featured .pre-cost-amount strong");
    const arrow = featuredAmount?.querySelector(".pre-cost-arrow");

    expect(featuredAmount?.textContent?.trim()).toContain("约500-3000元 ↗");
    expect(arrow?.textContent?.trim()).toBe("↗");
    expect(html).toContain(".pre-cost-amount .pre-cost-arrow");
    expect(html).toContain("color: inherit");
    expect(html).toContain("font-size: inherit");
    expect(html).toContain("font-weight: inherit");
    expect(html).toContain("vertical-align: baseline");
    expect(html).not.toContain(".pre-cost-arrow {\n        display: inline-block;\n        font-size: 70%");
  });
});
