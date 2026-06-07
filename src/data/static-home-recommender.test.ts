import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";

import { universities } from "./universities";
import { getUniversityTier } from "./universityTiers";

describe("static home recommender", () => {
  it("uses the full university catalog as recommendation candidates", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");
    const scriptUniversitiesBlock = html.match(/const universities = \[([\s\S]*?)\n\s*\];/)?.[1] ?? "";
    const staticCandidateSlugs = [...scriptUniversitiesBlock.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);

    expect(staticCandidateSlugs).toHaveLength(universities.length);
    expect(new Set(staticCandidateSlugs)).toEqual(new Set(universities.map((university) => university.slug)));
  });

  it("sets the main screen defaults to broad-access filters", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).toContain('<option value="77" selected>75-80分</option>');
    expect(html).toContain('<option value="regular" selected>普通高中</option>');
    expect(html).toContain('<option value="undecided" selected>还没确定</option>');
    expect(html).toContain('"rec-gpa": "77"');
    expect(html).toContain('"rec-school-tier": "regular"');
    expect(html).toContain('"rec-major": "undecided"');
  });

  it("renders recommendation confidence as language instead of numeric scores", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).toContain("较有希望");
    expect(html).toContain("适合申请");
    expect(html).toContain("冲刺申请");
    expect(html).toContain("先补条件");
    expect(html).not.toContain("recommendation-score");
    expect(html).not.toContain("${school.score}分");
  });

  it("keeps recommendation tier badges aligned with the shared university tier table", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");
    const tierNotesBlock = html.match(/const tierNotes = \{([\s\S]*?)\n\s*\};/)?.[1] ?? "";

    for (const school of universities) {
      expect(tierNotesBlock).toContain(`"${school.slug}": "${getUniversityTier(school.nameCn)}"`);
    }

    expect(tierNotesBlock).toContain('"chungbuk-national-university": "T3"');
    expect(tierNotesBlock).not.toContain('"chungbuk-national-university": "T4"');
  });

  it("places recommendation confidence in the title row and keeps card copy black", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).toContain("recommendation-meta-inline");
    expect(html).toContain("recommendation-confidence");
    expect(html).toContain("color: #9f1d1d");
    expect(html).toContain(".recommendation-card p");
    expect(html).toContain("color: var(--ink)");
    expect(html).toContain('${school.city} / ${school.type} · <span class="recommendation-confidence">${school.category}</span>');
    expect(html).toContain("<p><strong>专业方向匹配：</strong>${school.focus}</p>");
    expect(html).toContain(".case-reason-detail");
    expect(html).toContain("color: #123a72");
    expect(html).toContain("letter-spacing: 0.025em");
    expect(html).toContain("word-spacing: 0.16em");
    expect(html).toContain("text-decoration: none");
    expect(html).toContain('<p><strong>案例参考：</strong><span class="case-reason-detail">${school.caseReason}</span></p>');
    expect(html).toContain("recommendation-result-note");
    expect(html).toContain('<p class="recommendation-result-note">公开案例存在样本偏差，只适合做申请画像参考，不等于学校官方录取概率。</p>');
    expect(html).toContain("font-weight: 400");
    expect(html).not.toContain('<span class="result-badge">${school.status}</span>');
    expect(html).not.toContain('<p class="case-panel-note">公开案例存在样本偏差，只适合做申请画像参考，不等于学校官方录取概率。</p>');
    expect(html).not.toContain("<p>${school.city} · <strong>${school.category}</strong></p>");
    expect(html).not.toContain("<p><strong>${school.city} / ${school.type}</strong> / 专业方向匹配：${school.focus}</p>");
  });

  it("lets recommendation school names open an inline school case detail panel", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).toContain('<script src="./admission-case-summaries.js"></script>');
    expect(html).toContain("recommendation-school-toggle");
    expect(html).toContain('data-school-slug="${school.slug}"');
    expect(html).toContain('aria-expanded="${expandedRecommendationSlug === school.slug ? "true" : "false"}"');
    expect(html).toContain("function renderRecommendationCasePanel");
    expect(html).toContain("function toggleRecommendationCasePanel");
    expect(html).toContain("window.admissionCaseSummaries");
  });

  it("marks recommendation school name links with an external arrow", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document } = dom.window;

    document.getElementById("recommend-button")?.click();

    const schoolNames = Array.from(document.querySelectorAll(".recommendation-school-toggle")).map((node) =>
      node.textContent?.trim()
    );

    expect(schoolNames.length).toBeGreaterThan(0);
    expect(schoolNames).toContain("釜山大学 ↗");
    expect(schoolNames.every((name) => name?.endsWith(" ↗"))).toBe(true);

    const schoolNameArrows = Array.from(document.querySelectorAll(".recommendation-school-arrow"));
    expect(schoolNameArrows).toHaveLength(schoolNames.length);
    expect(schoolNameArrows.every((node) => node.textContent?.trim() === "↗")).toBe(true);
    expect(html).toContain(".recommendation-school-arrow");
    expect(html).toContain("font-size: 70%");
  });

  it("keeps the inline case panel metrics square and highlights each chart's largest item", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).toContain("height: 2.35rem");
    expect(html).toContain("border-radius: 0");
    expect(html).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(html).not.toContain("min-height: 12rem");
    expect(html).toContain("function highlightItemKey");
    expect(html).toContain("const highlightedKey = highlightItemKey(items);");
    expect(html).toContain("item.key === highlightedKey ? caseHighlightColor : caseBarColor");
    expect(html).toContain('if (title === "TOPIK分布") return text.replace(/^TOPIK\\s*/, "");');
    expect(html).toContain('return /^\\d+(?:\\.\\d+)?$/.test(score) ? `${score}分` : score.replace("雅思", "");');
  });

  it("renders a seven-school balanced recommendation slate", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).toContain("ai生成7所推荐大学");
    expect(html).toContain(".slice(0, 7)");
    expect(html).toContain('stable: { label: "较有希望", count: 3 }');
    expect(html).toContain('match: { label: "适合申请", count: 2 }');
    expect(html).toContain('reach: { label: "冲刺申请", count: 1 }');
    expect(html).toContain('prepare_first: { label: "先补条件", count: 1 }');
  });

  it("orders static homepage recommendations from easier T5 toward harder T1 tiers", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document } = dom.window;

    (document.getElementById("rec-gpa") as HTMLSelectElement).value = "77";
    (document.getElementById("rec-school-tier") as HTMLSelectElement).value = "regular";
    (document.getElementById("rec-topik") as HTMLSelectElement).value = "4";
    (document.getElementById("rec-english") as HTMLSelectElement).value = "ielts60";
    (document.getElementById("rec-gaokao") as HTMLSelectElement).value = "not_submitted";
    (document.getElementById("rec-major") as HTMLSelectElement).value = "undecided";
    (document.getElementById("rec-material") as HTMLSelectElement).value = "matched";
    (document.getElementById("rec-type") as HTMLSelectElement).value = "any";
    (document.getElementById("rec-region") as HTMLSelectElement).value = "any";
    document.getElementById("recommend-button")?.click();

    const tierRanks = Array.from(document.querySelectorAll(".recommendation-rank")).map((node) =>
      Number(node.textContent?.replace("T", ""))
    );

    expect(tierRanks).toHaveLength(7);
    expect(tierRanks).toEqual([...tierRanks].sort((a, b) => b - a));
  });

  it("includes a fixed back-to-top control on the static home page", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).toContain(".back-to-top-button");
    expect(html).toContain("position: fixed");
    expect(html).toContain("background: var(--yellow, #ffe07a)");
    expect(html).toContain('onclick="window.scrollTo({ top: 0, behavior: \'smooth\' })"');
    expect(html).toContain('aria-label="回到顶部"');
  });
});
