import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";

describe("static TOPIK page", () => {
  it("starts directly with the decision-first TOPIK planner before the preserved appendix", () => {
    const html = readFileSync("topik.html", "utf8");
    const normalizedHtml = html.replace(/\r\n/g, "\n");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    expect(document.querySelector(".decision-hero")).toBeNull();
    expect(document.querySelector(".decision-strip")).toBeNull();
    expect(document.querySelector("main.wrap > section")?.id).toBe("planner");
    expect(document.querySelector("#planner > .decision-section-head")).toBeNull();
    expect(document.querySelector(".topik-planner")).not.toBeNull();
    expect(document.querySelector(".planner-panel-title")?.textContent).toBe("AI TOPIK \u89c4\u5212");
    expect(document.querySelectorAll("[data-topik-field]")).toHaveLength(4);
    expect(document.querySelector("#topik-region")).toBeNull();
    expect(document.querySelector("#topik-tier")?.textContent).toContain("T1 SKY/成均馆/汉阳/KAIST");
    expect(document.querySelector("#topik-tier")?.textContent).not.toContain("T2 成均馆/汉阳");
    expect(document.querySelector("[data-planner-run]")?.textContent).toContain("AI\u89c4\u5212");
    expect(normalizedHtml).toContain(".planner-form {\n        display: grid;");
    expect(normalizedHtml).toContain("grid-template-columns: minmax(9.8rem, 0.9fr) minmax(14rem, 1.18fr) minmax(15rem, 1.25fr) minmax(13rem, 1.05fr);");
    expect(normalizedHtml).toContain("max-width: calc(100% - 19rem);");
    expect(normalizedHtml).toContain(".planner-control-row {\n        top: 6.75rem;\n        right: 17.5rem;");
    expect(html).toContain("display: flex;");
    expect(html).toContain("border-radius: 8px;");
    expect(html).toContain("word-break: keep-all;");
    expect(html).toContain("overflow-wrap: anywhere;");
    expect(html).toContain(".planner-field {");
    expect(html).toContain(".planner-explain-grid {");
    expect(html).toContain(".adjustment-card {");
    expect(html).toContain(".hour-bar-row {");
    expect(html).not.toContain("field.addEventListener('change', renderPlanner);");
    expect(document.querySelector(".planner-output")?.textContent).toContain(
      "\u73b0\u5b9e\u6027\u5224\u65ad"
    );
    expect(document.querySelector(".study-hours-model")).not.toBeNull();
    expect(document.querySelectorAll(".hour-bar-row")).toHaveLength(6);
    expect(document.querySelector(".undergrad-plan")).not.toBeNull();
    expect(document.querySelector(".resources-section")).not.toBeNull();
    expect(document.querySelectorAll(".resources-section .resource-section table").length).toBeGreaterThanOrEqual(4);

    const plannerIndex = html.indexOf('class="topik-planner"');
    const appendixIndex = html.indexOf('id="legacy-topik-appendix"');
    expect(plannerIndex).toBeGreaterThanOrEqual(0);
    expect(appendixIndex).toBeGreaterThan(plannerIndex);
  });

  it("keeps the old TOPIK content and its table/card formatting in the bottom appendix", () => {
    const html = readFileSync("topik.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const appendix = document.querySelector("#legacy-topik-appendix");
    expect(appendix).not.toBeNull();
    expect(appendix?.querySelector(".legacy-original")).not.toBeNull();

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

  it("includes current TOPIK rules, planning caveats, and learning resources", () => {
    const html = readFileSync("topik.html", "utf8");

    expect(html).toContain("TOPIK I");
    expect(html).toContain("TOPIK II");
    expect(html).toContain("80-139");
    expect(html).toContain("150-189");
    expect(html).toContain("\u4e2d\u56fd\u5927\u9646\u62a5\u540d\u4ee5\u6559\u80b2\u90e8\u6559\u80b2\u8003\u8bd5\u9662\u62a5\u540d\u7f51\u7ad9\u6700\u7ec8\u516c\u544a\u4e3a\u51c6");
    expect(html).toContain("\u9ad8\u4e2d\u751f\u65f6\u95f4\u4e3a\u89c4\u5212\u5047\u8bbe");
    expect(html).toContain("https://www.bilibili.com/video/BV1PXrxYZEjy/");
    expect(html).toContain("https://item.jd.com/12706601.html");
  });

  it("explains why each planner input matters and how to read the result", () => {
    const html = readFileSync("topik.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const helpTexts = Array.from(document.querySelectorAll(".field-help")).map((node) =>
      node.textContent?.trim()
    );

    expect(helpTexts).toEqual([
      "\u7b97\u4f60\u4ece\u73b0\u5728\u5230\u76ee\u6807\u7b49\u7ea7\u8fd8\u7f3a\u591a\u5c11\u5b66\u4e60\u91cf\u3002",
      "\u5b66\u6821\u6863\u4f4d\u4f1a\u51b3\u5b9a\u5efa\u8bae\u7684\u5b89\u5168\u7b49\u7ea7\uff0c\u4e0d\u53ea\u662f\u6700\u4f4e\u95e8\u69db\u3002",
      "\u8fd9\u91cc\u6309\u6750\u6599\u622a\u6b62\u524d\u9700\u8981\u62ff\u5230\u6210\u7ee9\u6765\u4fdd\u5b88\u4f30\u7b97\u3002",
      "\u7528\u9ad8\u4e2d\u751f\u53ef\u6301\u7eed\u7684\u6bcf\u5468\u6295\u5165\uff0c\u548c\u76ee\u6807\u6240\u9700\u65f6\u95f4\u505a\u5bf9\u6bd4\u3002"
    ]);

    expect(document.querySelector(".planner-meaning")?.textContent).toContain("\u5224\u65ad");
    expect(document.querySelector(".planner-basis")?.textContent).toContain(
      "\u6839\u636e\u4ec0\u4e48\u7b97"
    );
    expect(document.querySelector(".planner-actions")?.textContent).toContain(
      "\u63a5\u4e0b\u6765\u505a\u4ec0\u4e48"
    );
    expect(html).not.toContain("\u4e0d\u662f\u5f55\u53d6\u4fdd\u8bc1");
  });

  it("shows reverse planning hours, high-school time assumptions, and target adjustment advice", () => {
    const html = readFileSync("topik.html", "utf8");
    const dom = new JSDOM(html);
    const { document } = dom.window;

    expect(document.querySelector(".study-hours-model")).not.toBeNull();
    expect(document.querySelectorAll(".hour-bar-row")).toHaveLength(6);
    expect(document.querySelector(".study-hours-model")?.textContent).toContain("TOPIK 5");
    expect(document.querySelector(".study-hours-model")?.textContent).toContain("900h");
    expect(document.querySelector(".hour-detail-panel")?.textContent).toContain("TOPIK4\u7ea6600\u5c0f\u65f6");
    expect(document.querySelector(".model-caveat")?.textContent).toContain("\u9ad8\u4e2d\u751f\u65f6\u95f4\u4e3a\u89c4\u5212\u5047\u8bbe");
    expect(document.querySelector("[data-required-weekly]")).not.toBeNull();
    expect(document.querySelector("[data-realistic-tier]")).not.toBeNull();
    expect(document.querySelector(".adjustment-card")?.textContent).toContain("\u5efa\u8bae\u8c03\u6574");
    expect(html).toContain("\u9ad8\u4e2d\u751f\u65f6\u95f4\u4e3a\u89c4\u5212\u5047\u8bbe");
  });

  it("keeps the planner result folded until the recommendation button is clicked", () => {
    const html = readFileSync("topik.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document } = dom.window;

    const output = document.querySelector(".planner-output");
    const runButton = document.querySelector("[data-planner-run]") as HTMLButtonElement | null;

    expect(output?.hasAttribute("hidden")).toBe(true);
    expect(runButton?.textContent).toContain("AI\u89c4\u5212");

    runButton?.click();

    expect(output?.hasAttribute("hidden")).toBe(false);
    expect(output?.classList.contains("is-loading")).toBe(true);
    expect(runButton?.textContent).toContain("AI\u5206\u6790\u4e2d");
    expect(html).toContain("}, 1500);");
  });

  it("keeps generated planner copy compact enough for the result table", () => {
    const html = readFileSync("topik.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document } = dom.window;

    (document.querySelector("[data-planner-run]") as HTMLButtonElement | null)?.click();

    const compactCopyLimits = [
      ["[data-planner-meaning]", 38],
      ["[data-planner-basis]", 40],
      ["[data-planner-action-1]", 24],
      ["[data-planner-action-2]", 24],
      ["[data-planner-action-3]", 24],
      ["[data-adjustment-copy]", 34]
    ] as const;

    compactCopyLimits.forEach(([selector, maxLength]) => {
      const text = document.querySelector(selector)?.textContent?.trim() ?? "";
      expect(text.length).toBeLessThanOrEqual(maxLength);
    });
    expect(html).not.toContain("\u518d\u6838\u5bf9\u62a5\u540d\u548c\u6750\u6599\u622a\u6b62");
  });
});
