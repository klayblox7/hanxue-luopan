import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("mobile border tone", () => {
  it("uses a shared gray border override for every mobile border", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(css).toContain("--mobile-border-gray: #7b786f");
    expect(css).toContain(".mobile-app-shell *::before");
    expect(css).toContain("border-color: var(--mobile-border-gray) !important");
  });

  it("does not mount a global back-to-top button", () => {
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");

    expect(layout).not.toContain("BackToTopButton");
    expect(existsSync(join(process.cwd(), "src/components/BackToTopButton.tsx"))).toBe(false);
  });

  it("scales legacy desktop frames to fit iPad landscape without clipping", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(css).toContain(".legacy-desktop-frame");
    expect(css).toContain("@media (min-width: 1024px) and (max-width: 1100px) and (orientation: landscape)");
    expect(css).toContain("width: 133.333vw");
    expect(css).toContain("transform: scale(0.75)");
    expect(css).toContain("@media (min-width: 1101px) and (max-width: 1279px) and (orientation: landscape)");
    expect(css).toContain("width: 111.111vw");
    expect(css).toContain("transform: scale(0.9)");
  });
});
