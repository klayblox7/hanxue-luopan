import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegacyDesktopFrame } from "./LegacyDesktopFrame";

describe("LegacyDesktopFrame", () => {
  it("embeds the synced static HTML only on desktop viewports", () => {
    render(<LegacyDesktopFrame src="/universities.html" title="韩国大学库" />);

    const frame = screen.getByTitle("韩国大学库");

    expect(frame).toHaveAttribute("src", "/universities.html");
    expect(frame).toHaveClass("h-screen");
    expect(screen.getByLabelText("韩国大学库 desktop html")).toHaveClass("hidden", "md:block");
  });
});
