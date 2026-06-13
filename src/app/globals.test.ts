import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("mobile border tone", () => {
  it("uses a dark gray border override for full-strength mobile ink borders", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(css).toContain("--mobile-border-strong: #3f3f3a");
    expect(css).toContain(".md\\:hidden .border-ink");
    expect(css).toContain("border-color: var(--mobile-border-strong)");
  });
});
