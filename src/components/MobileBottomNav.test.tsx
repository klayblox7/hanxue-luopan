import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileBottomNav } from "./MobileBottomNav";

describe("MobileBottomNav", () => {
  it("keeps the same five mini-program tabs in the same order", () => {
    render(<MobileBottomNav activeTab="map" />);

    const nav = screen.getByRole("navigation", { name: "移动端底部导航" });
    const links = within(nav).getAllByRole("link");

    expect(links.map((link) => link.textContent?.trim())).toEqual(["首页", "大学地图", "大学库", "费用", "TOPIK"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/", "/korea-university-map/", "/universities/", "/cost/", "/topik/"]);
    expect(within(nav).getByRole("link", { name: "大学地图" })).toHaveAttribute("aria-current", "page");
  });
});
