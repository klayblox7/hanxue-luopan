import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";

const readCostPage = () => {
  const html = readFileSync("cost.html", "utf8");
  const dom = new JSDOM(html);

  return { html, document: dom.window.document };
};

describe("static cost page", () => {
  it("renders a compact one-page budget planner before the application appendix", () => {
    const { html, document } = readCostPage();

    expect(document.querySelector('link[href="./header-unified.css"]')).not.toBeNull();
    expect(document.querySelector(".budget-planner")).not.toBeNull();
    expect(document.querySelector("#budget-result-total")?.textContent).toContain("万");
    expect(document.querySelectorAll("[data-planner-field]")).toHaveLength(6);
    expect(document.querySelector(".data-table-wrap")).not.toBeNull();
    expect(document.querySelector(".profile-grid")).not.toBeNull();
    expect(document.querySelector(".priority-grid")).not.toBeNull();

    const plannerIndex = html.indexOf('class="budget-planner"');
    const appendixIndex = html.indexOf('class="section legacy-appendix"');

    expect(document.querySelector(".legacy-appendix")).not.toBeNull();
    expect(plannerIndex).toBeGreaterThanOrEqual(0);
    expect(appendixIndex).toBeGreaterThan(plannerIndex);
  });

  it("uses a complete shared header geometry for every nav pill", () => {
    const css = readFileSync("header-unified.css", "utf8");

    expect(css).toContain(".header .nav > .pill");
    expect(css).toContain("height: 2.35rem");
    expect(css).toContain(".header .nav > .pill:nth-child(1)");
    expect(css).toContain("width: 10.4rem");
    expect(css).toContain(".header .nav > .pill:nth-child(2)");
    expect(css).toContain("width: 11.4rem");
    expect(css).toContain(".header .nav > .pill:nth-child(3)");
    expect(css).toContain("width: 9.4rem");
    expect(css).toContain(".header .nav > .pill:nth-child(4)");
    expect(css).toContain("width: 12.4rem");
    expect(css).toContain(".header .nav > .pill:nth-child(5)");
    expect(css).toContain("width: 10.6rem");
  });

  it("keeps source-backed data visible and labeled", () => {
    const { html, document } = readCostPage();

    const sourceRows = Array.from(document.querySelectorAll(".source-row"));

    expect(sourceRows.length).toBeGreaterThanOrEqual(8);
    expect(document.querySelectorAll(".source-badge.official").length).toBeGreaterThanOrEqual(5);
    expect(document.querySelectorAll(".source-badge.estimate").length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("studyinkorea.go.kr");
    expect(html).toContain("oia.korea.ac.kr");
    expect(html).toContain("oga.snu.ac.kr");
    expect(html).toContain("topik.neea.cn");
  });

  it("renders compressed reference profiles and calculator script", () => {
    const { html, document } = readCostPage();

    const profiles = Array.from(document.querySelectorAll(".profile-card"));

    expect(profiles).toHaveLength(3);
    expect(document.querySelectorAll(".stack-segment").length).toBeGreaterThanOrEqual(12);
    expect(html).toContain("function renderBudget()");
    expect(html).toContain("const sourceCurrencyRate");
  });

  it("keeps the original application and agency material at the bottom", () => {
    const { document } = readCostPage();

    const appendix = document.querySelector(".legacy-appendix");
    const appendixHtml = appendix?.innerHTML ?? "";
    const original = appendix?.querySelector(".legacy-original");

    expect(appendix).not.toBeNull();
    expect(original).not.toBeNull();
    expect(original?.querySelector(".channel-block")).not.toBeNull();
    expect(original?.querySelectorAll(".pre-cost-card")).toHaveLength(4);
    expect(original?.querySelector(".donut-chart")).not.toBeNull();
    expect(original?.querySelectorAll(".apply-compare-card")).toHaveLength(2);
    expect(original?.querySelectorAll(".insight-panel")).toHaveLength(2);
    expect(original?.querySelectorAll(".metric")).toHaveLength(6);
    expect(original?.querySelector("#diy")).not.toBeNull();
    expect(original?.querySelector("#agency")).not.toBeNull();
    expect(original?.querySelector("#agency-checklist")).not.toBeNull();
    expect(original?.querySelector("#success")).not.toBeNull();
    expect(original?.querySelector(".timeline.seven")).not.toBeNull();
    expect(original?.querySelector(".issue-grid")).not.toBeNull();
    expect(original?.querySelector(".reminder-grid")).not.toBeNull();
    expect(appendixHtml).toContain("TOPIK 4+");
    expect(appendixHtml).toContain("0.8-3");
  });
});
