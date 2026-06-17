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
    const firstPartnerText = firstPartnerLink?.textContent?.trim() || "";

    expect(partnerLinks.length).toBeGreaterThan(0);
    expect(firstPartnerText).toMatch(/^T\d+\s/);
    expect(firstPartnerText).toContain("学校信息");
    expect(firstPartnerText).not.toContain("(");
    expect(firstPartnerText).not.toContain("↗");
    expect(partnerInfoLabels.length).toBeGreaterThanOrEqual(partnerLinks.length);
    expect(partnerInfoLabels.every((node) => node.textContent?.trim() === "学校信息")).toBe(true);
    expect(partnerSeparators).toHaveLength(0);
    expect(html).toContain(".partner-info-label");
    expect(html).not.toContain(".partner-school-arrow");
    expect(html).not.toContain(".partner-separator");
  });

  it("renders the alumni list in partner school profile cards", () => {
    const html = readFileSync("application.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document } = dom.window;

    const firstPartnerLink = document.querySelector<HTMLButtonElement>(".partner-school-link");
    firstPartnerLink?.click();

    const profile = document.querySelector(".school-profile");
    const alumni = profile?.querySelector(".profile-alumni-text");

    expect(profile?.textContent).toContain("校友名单");
    expect(alumni?.textContent?.trim()).toBeTruthy();
  });

  it("serves partner profile images through deploy-relative urls", () => {
    const html = readFileSync("application.html", "utf8");
    const match = html.match(/const programs = (\[[\s\S]*?\]);\s*const caseSummaries/);
    expect(match?.[1]).toBeTruthy();

    const programs = JSON.parse(match?.[1] || "[]") as Array<{
      koreaPartners?: Array<{ campusImage?: string; logoImage?: string }>;
    }>;
    const imageValues = programs.flatMap((program) =>
      (program.koreaPartners || []).flatMap((partner) => [partner.campusImage, partner.logoImage].filter(Boolean))
    );

    expect(imageValues.some((value) => value?.startsWith("campus-images/"))).toBe(true);
    expect(imageValues.some((value) => value?.startsWith("school-logos/"))).toBe(true);
    expect(imageValues.every((value) => value && !value.startsWith("public/") && !value.startsWith("/"))).toBe(true);
  });

  it("allows multiple project filters to stay selected together", () => {
    const html = readFileSync("application.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document } = dom.window;

    const allButton = document.querySelector<HTMLButtonElement>('[data-filter="all"]');
    const regionButton = document.querySelector<HTMLButtonElement>(".region-filter");
    const modeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".mode-filter"));
    const majorButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".major-filter"));

    expect(allButton?.getAttribute("aria-pressed")).toBe("true");
    expect(regionButton).toBeTruthy();
    expect(modeButtons.length).toBeGreaterThanOrEqual(2);
    expect(majorButtons.length).toBeGreaterThanOrEqual(2);

    regionButton?.click();
    modeButtons[0].click();
    modeButtons[1].click();
    majorButtons[0].click();
    majorButtons[1].click();

    expect(allButton?.getAttribute("aria-pressed")).toBe("false");
    expect(regionButton?.getAttribute("aria-pressed")).toBe("true");
    expect(modeButtons[0].getAttribute("aria-pressed")).toBe("true");
    expect(modeButtons[1].getAttribute("aria-pressed")).toBe("true");
    expect(majorButtons[0].getAttribute("aria-pressed")).toBe("true");
    expect(majorButtons[1].getAttribute("aria-pressed")).toBe("true");

    allButton?.click();

    expect(allButton?.getAttribute("aria-pressed")).toBe("true");
    expect(regionButton?.getAttribute("aria-pressed")).toBe("false");
    expect(modeButtons[0].getAttribute("aria-pressed")).toBe("false");
    expect(modeButtons[1].getAttribute("aria-pressed")).toBe("false");
    expect(majorButtons[0].getAttribute("aria-pressed")).toBe("false");
    expect(majorButtons[1].getAttribute("aria-pressed")).toBe("false");
  });

  it("marks China school names with the same compact arrow treatment", () => {
    const html = readFileSync("application.html", "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const { document, getComputedStyle } = dom.window;

    const firstSchoolButton = document.querySelector<HTMLButtonElement>(".school-toggle");
    const arrow = firstSchoolButton?.querySelector<HTMLSpanElement>(".school-toggle-arrow");
    const arrowStyle = arrow ? getComputedStyle(arrow) : null;

    expect(firstSchoolButton?.textContent?.trim()).toContain("↗");
    expect(arrow?.textContent).toBe("↗");
    expect(arrowStyle?.fontSize).toBe("70%");
    expect(arrowStyle?.fontWeight).toBe("400");
    expect(arrowStyle?.verticalAlign).toBe("middle");
  });
});
