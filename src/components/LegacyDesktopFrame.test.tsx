import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegacyDesktopFrame } from "./LegacyDesktopFrame";

describe("LegacyDesktopFrame", () => {
  it("embeds the synced static HTML on iPad landscape and monitor-width viewports", () => {
    render(<LegacyDesktopFrame src="/universities.html" title="Desktop Test" />);

    const frame = screen.getByTitle("Desktop Test");
    const region = screen.getByLabelText("Desktop Test desktop html");

    expect(frame).toHaveAttribute("src", "/universities.html");
    expect(frame).toHaveClass("legacy-desktop-frame");
    expect(region).toHaveClass("hidden", "lg:landscape:block", "xl:block");
    expect(region).not.toHaveClass("md:block");
  });
});
