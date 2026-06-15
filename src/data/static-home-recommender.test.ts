import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";

import { getAdmissionCaseSummary } from "./admissionCases";
import { universities } from "./universities";

function createStaticHomeDom() {
  const html = readFileSync("hanxue-luopan-home.html", "utf8");
  const summaries = Object.fromEntries(
    universities.map((university) => [university.slug, getAdmissionCaseSummary(university.slug)])
  );

  return new JSDOM(html, {
    runScripts: "dangerously",
    beforeParse(window) {
      window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      }) as typeof window.requestAnimationFrame;
      window.cancelAnimationFrame = (() => undefined) as typeof window.cancelAnimationFrame;
      window.setTimeout = ((callback: TimerHandler) => {
        if (typeof callback === "function") callback();
        return 0;
      }) as typeof window.setTimeout;
      window.clearTimeout = (() => undefined) as typeof window.clearTimeout;
      window.setInterval = (() => 0) as typeof window.setInterval;
      window.clearInterval = (() => undefined) as typeof window.clearInterval;
      Object.defineProperty(window, "recommendationUniversities", {
        configurable: true,
        value: universities
      });
      Object.defineProperty(window, "admissionCaseSummaries", {
        configurable: true,
        value: summaries
      });
    }
  });
}

function changeSelect(document: Document, id: string, value: string) {
  const field = document.getElementById(id) as HTMLSelectElement;
  field.value = value;
  field.dispatchEvent(new document.defaultView!.Event("change", { bubbles: true }));
}

describe("static home recommender", () => {
  it("serves desktop images through base-aware relative urls", () => {
    for (const filePath of ["hanxue-luopan-home.html", "public/hanxue-luopan-home.html"]) {
      const html = readFileSync(filePath, "utf8");

      expect(html).toContain('src="./korea-link-logo.gif"');
      expect(html).toContain('src="./home-banner-1b.png"');
      expect(html).toContain('src="./home-banner-1c.jpg"');
      expect(html).toContain('folder: "/campus-images"');
      expect(html).toContain('folder: "/school-logos"');
      expect(html).not.toContain('src="./public/');
      expect(html).not.toContain('src="public/');
      expect(html).not.toContain('folder: "public/');
    }
  });

  it("keeps the legacy recommender disabled and uses the shared case recommender", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).toContain('data-disabled-legacy-recommender');
    expect(html).toContain('script id="restored-ai-case-recommender"');
    expect(html).toContain('["录取有望", "录取有望", "录取有望", "条件匹配", "录取较难"]');
  });

  it("marks required fields and removes English score from the static form", () => {
    const { document } = createStaticHomeDom().window;

    expect(document.getElementById("rec-english")).toBeNull();
    expect(document.getElementById("recommend-major-warning")).toBeNull();
    expect(document.querySelectorAll(".recommend-required-control")).toHaveLength(3);
    expect(readFileSync("hanxue-luopan-home.html", "utf8")).toMatch(
      /\.recommend-required-control select \{[\s\S]*?color: transparent;/
    );
    expect(readFileSync("hanxue-luopan-home.html", "utf8")).toMatch(
      /\.recommend-required-badge \{[\s\S]*?font-size: 0\.85rem;/
    );
    expect(Array.from(document.querySelectorAll(".recommend-required-badge")).map((node) => node.textContent)).toEqual([
      "必选项",
      "必选项",
      "必选项"
    ]);
    document.querySelectorAll(".recommend-required-badge").forEach((badge) => {
      expect(badge.closest(".recommend-required-control")).not.toBeNull();
    });
  });

  it("reveals each static required value immediately after the select changes", () => {
    const { document } = createStaticHomeDom().window;
    const controls = Array.from(document.querySelectorAll(".recommend-required-control"));

    changeSelect(document, "rec-gpa", "72");
    expect(controls[0].classList.contains("is-confirmed")).toBe(true);
    expect(controls[1].classList.contains("is-confirmed")).toBe(false);

    changeSelect(document, "rec-topik", "4");
    expect(controls[1].classList.contains("is-confirmed")).toBe(true);

    changeSelect(document, "rec-major", "computer-science");
    expect(controls[2].classList.contains("is-confirmed")).toBe(true);

    changeSelect(document, "rec-major", "undecided");
    expect(controls[2].classList.contains("is-confirmed")).toBe(false);
  });

  it("keeps the button clickable and flashes required controls until a major is selected", () => {
    const dom = createStaticHomeDom();
    const { document } = dom.window;
    const button = document.getElementById("recommend-button") as HTMLButtonElement;
    const results = document.getElementById("recommendation-results");

    expect(button.disabled).toBe(false);

    button.click();
    expect(results?.classList.contains("is-visible")).toBe(false);
    expect(Array.from(document.querySelectorAll(".recommend-required-control")).every((node) =>
      node.classList.contains("is-flashing")
    )).toBe(true);

    changeSelect(document, "rec-major", "computer-science");
    expect(button.disabled).toBe(false);

    button.click();
    expect(Array.from(document.querySelectorAll(".recommend-required-control")).every((node) =>
      node.classList.contains("is-confirmed")
    )).toBe(true);
    expect((document.getElementById("rec-gpa") as HTMLSelectElement).value).toBe("77");
    expect((document.getElementById("rec-topik") as HTMLSelectElement).value).toBe("4");
    expect((document.getElementById("rec-major") as HTMLSelectElement).value).toBe("computer-science");
  });

  it("shows project and Korean-study guidance instead of non-fit schools when TOPIK is too low", () => {
    const dom = createStaticHomeDom();
    const { document } = dom.window;

    changeSelect(document, "rec-major", "computer-science");
    changeSelect(document, "rec-topik", "1");
    document.getElementById("recommend-button")?.click();

    const results = document.getElementById("recommendation-results")!;
    expect(results.classList.contains("is-visible")).toBe(true);
    expect(results.textContent).toContain("当前条件暂时不适合直接推荐大学");
    expect(results.textContent).toContain("国内+韩国项目");
    expect(results.textContent).toContain("韩语 / TOPIK、报名、备考");
    expect(results.textContent).not.toContain("暂不符合");
    expect(results.querySelector<HTMLAnchorElement>('a[href="/application"]')).not.toBeNull();
    expect(results.querySelector<HTMLAnchorElement>('a[href="/topik"]')).not.toBeNull();
    expect(results.querySelectorAll(".recommendation-rank")).toHaveLength(0);
  });

  it("recommends five schools from lower rank toward higher rank with the common category mix", () => {
    const dom = createStaticHomeDom();
    const { document } = dom.window;

    changeSelect(document, "rec-gpa", "77");
    changeSelect(document, "rec-school-tier", "regular");
    changeSelect(document, "rec-topik", "4");
    changeSelect(document, "rec-gaokao", "not_submitted");
    changeSelect(document, "rec-major", "computer-science");
    changeSelect(document, "rec-material", "matched");
    changeSelect(document, "rec-type", "any");
    changeSelect(document, "rec-region", "any");
    document.getElementById("recommend-button")?.click();

    const categoryTexts = Array.from(document.querySelectorAll(".recommendation-confidence")).map((node) =>
      node.textContent?.trim()
    );
    const tierRanks = Array.from(document.querySelectorAll(".recommendation-rank")).map((node) =>
      Number(node.textContent?.replace("T", ""))
    );

    expect(categoryTexts).toHaveLength(5);
    expect(categoryTexts.filter((category) => category === "录取有望")).toHaveLength(3);
    expect(categoryTexts.filter((category) => category === "条件匹配")).toHaveLength(1);
    expect(categoryTexts.filter((category) => category === "录取较难")).toHaveLength(1);
    expect(categoryTexts).not.toContain("暂不符合");
    expect(tierRanks).toHaveLength(5);
    expect(tierRanks).toEqual([...tierRanks].sort((a, b) => b - a));
    expect(tierRanks.every((rank) => rank <= 2)).toBe(true);
    expect(document.getElementById("recommendation-results")?.textContent).toContain("专业匹配已计入推荐分");
  });

  it("uses the selected major to reorder static desktop recommendations inside the same academic target", () => {
    function resultSlugsForMajor(major: string) {
      const dom = createStaticHomeDom();
      const { document } = dom.window;

      changeSelect(document, "rec-gpa", "77");
      changeSelect(document, "rec-school-tier", "regular");
      changeSelect(document, "rec-topik", "4");
      changeSelect(document, "rec-gaokao", "not_submitted");
      changeSelect(document, "rec-major", major);
      changeSelect(document, "rec-material", "matched");
      changeSelect(document, "rec-type", "any");
      changeSelect(document, "rec-region", "any");
      document.getElementById("recommend-button")?.click();

      return Array.from(document.querySelectorAll<HTMLButtonElement>(".recommendation-school-toggle")).map((button) =>
        button.dataset.schoolSlug
      );
    }

    const computerSlugs = resultSlugsForMajor("computer-science");
    const artSlugs = resultSlugsForMajor("art-design");

    expect(computerSlugs).toHaveLength(5);
    expect(artSlugs).toHaveLength(5);
    expect(artSlugs).not.toEqual(computerSlugs);
  });

  it("does not render the static back-to-top control", () => {
    const html = readFileSync("hanxue-luopan-home.html", "utf8");

    expect(html).not.toContain(".back-to-top-button");
    expect(html).not.toContain("window.scrollTo({ top: 0, behavior: 'smooth' })");
  });
});
