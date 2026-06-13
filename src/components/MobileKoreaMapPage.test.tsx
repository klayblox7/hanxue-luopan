import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileKoreaMapPage } from "./MobileKoreaMapPage";

describe("MobileKoreaMapPage", () => {
  it("starts with a touchable Korea map before the school list", () => {
    const { container } = render(<MobileKoreaMapPage />);

    expect(screen.getByRole("heading", { name: "韩国大学地图" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "韩国大学地图分布" })).toBeInTheDocument();
    expect(container.querySelector('svg[data-testid="korea-region-map"]')).toBeInTheDocument();
    expect(container.querySelector('img[src="/korea-admin-map.svg"]')).not.toBeInTheDocument();
    expect(screen.queryByText("Map first")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "先看城市，再选学校" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /选择首尔圈地图区域/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /首尔圈 \d+所学校/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("地区筛选")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /地图分布/ })).toBeInTheDocument();
    const inlineSearch = screen.getByTestId("map-inline-search");
    expect(inlineSearch).toHaveClass("w-1/2");
    expect(within(inlineSearch).getByPlaceholderText("搜索")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("搜学校 / 城市 / 专业方向")).not.toBeInTheDocument();
    expect(screen.queryByTestId("map-hero-icon")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "返回首页" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "移动端底部导航" })).getAllByRole("link").map((link) => link.textContent?.trim())).toEqual([
      "首页",
      "大学地图",
      "大学库",
      "费用",
      "TOPIK"
    ]);
  });

  it("keeps Jeju in the desktop map offset instead of the cropped mobile position", () => {
    const { container } = render(<MobileKoreaMapPage />);

    const map = container.querySelector('svg[data-testid="korea-region-map"]');
    const jejuPath = container.querySelector('path[data-region-key="jeju"]');

    expect(map?.getAttribute("class")).toContain("mx-auto");
    expect(map?.getAttribute("class")).toContain("h-[22.1rem]");
    expect(map).toHaveAttribute("viewBox", "120 0 245 300");
    expect(map).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
    const jejuInset = screen.getByTestId("jeju-inset");
    expect(jejuInset).toHaveAttribute("x", "261");
    expect(jejuInset).toHaveAttribute("y", "238");
    expect(jejuInset).toHaveAttribute("width", "64.6");
    expect(jejuInset).toHaveAttribute("height", "40.8");
    expect(jejuPath).toHaveAttribute("transform", "translate(188.5 -15.5)");
  });

  it("filters the map and list from touchable map regions", () => {
    render(<MobileKoreaMapPage />);

    fireEvent.click(screen.getByRole("button", { name: /选择首尔圈地图区域/ }));

    expect(screen.queryByText("当前区域")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article", { name: /大学/ }).length).toBeGreaterThan(0);
    expect(screen.getByTestId("selected-region-pin")).toBeInTheDocument();
  });

  it("moves the selected region summary into the map canvas", () => {
    const { container } = render(<MobileKoreaMapPage />);

    const mapPanel = screen.getByTestId("mobile-map-distribution-panel");
    const search = screen.getByTestId("map-inline-search");
    const map = container.querySelector('svg[data-testid="korea-region-map"]');
    const summary = screen.getByTestId("selected-region-summary");

    expect(mapPanel).toHaveClass("rounded-none");
    expect(search).toHaveClass("rounded-xl");
    expect(map?.getAttribute("class")).toContain("rounded-none");
    expect(summary).toHaveClass("absolute");
    expect(summary).toHaveClass("right-3");
    expect(summary).toHaveClass("top-3");
    expect(summary).not.toHaveClass("mt-2");
    expect(within(summary).getByText("全部地区")).toHaveClass("rounded-md");
    expect(within(summary).getByText("96所")).toHaveClass("rounded-md");
    expect(screen.queryByText("当前区域")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "进入大学库" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /所学校/ })).not.toBeInTheDocument();
  });

  it("places the school detail action beside the focus text instead of as a full-width footer", () => {
    render(<MobileKoreaMapPage />);

    const seoulCard = screen.getByRole("article", { name: /首尔大学/ });
    const actionRow = within(seoulCard).getByTestId("map-school-card-action-row");
    const detailButton = within(actionRow).getByRole("button", { name: "学校详情" });
    const schoolName = within(seoulCard).getByRole("heading", { name: "首尔大学" });
    const cityType = within(seoulCard).getByText("首尔 / 国立");
    const focus = within(actionRow).getByText("综合研究、理工、人文社科");

    expect(schoolName).toHaveClass("text-[0.96rem]");
    expect(actionRow).toHaveClass("flex");
    expect(cityType).toHaveClass("font-black");
    expect(cityType).toHaveClass("text-ink");
    expect(cityType).not.toHaveClass("text-muted");
    expect(focus).not.toHaveClass("font-bold");
    expect(focus).toHaveClass("italic");
    expect(focus).toHaveClass("text-muted");
    expect(detailButton).toHaveClass("w-[7.75rem]");
    expect(detailButton).toHaveClass("min-h-[2.05rem]");
    expect(detailButton).toHaveClass("text-[0.78rem]");
    expect(detailButton).toHaveClass("shrink-0");
    expect(detailButton).not.toHaveClass("w-full");
    expect(detailButton).not.toHaveClass("mt-3");
  });

  it("opens a school detail sheet with a campus image from the map list", () => {
    render(<MobileKoreaMapPage />);

    const seoulCard = screen.getByRole("article", { name: /首尔大学/ });
    fireEvent.click(within(seoulCard).getByRole("button", { name: "学校详情" }));

    const dialog = screen.getByRole("dialog", { name: "首尔大学" });
    expect(within(dialog).getByRole("heading", { name: "首尔大学" })).toBeInTheDocument();
    expect(within(dialog).queryByText("首尔大学详情")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("img", { name: "首尔大学校园图片" })).toBeInTheDocument();
    expect(within(dialog).getByText(/Seoul National University/)).toBeInTheDocument();
    expect(within(dialog).getByText("宿舍容量")).toBeInTheDocument();
    expect(within(dialog).getByText("宿舍覆盖")).toBeInTheDocument();
    expect(within(dialog).queryByText("数据更新")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("数据状态")).not.toBeInTheDocument();
  });
});
