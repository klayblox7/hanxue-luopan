import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getUniversityTier } from "@/data/universityTiers";
import { universities } from "@/data/universities";

import { MobileKoreaMapPage } from "./MobileKoreaMapPage";

const seoulRegionKeywords = ["首尔", "仁川", "水原", "城南", "龙仁", "高阳", "安山", "富川", "议政府", "杨州"];

describe("MobileKoreaMapPage", () => {
  it("starts with a touchable Korea map before the school list", () => {
    const { container } = render(<MobileKoreaMapPage />);

    expect(container.querySelector(".mobile-app-shell")).toHaveClass("lg:landscape:hidden", "xl:hidden");
    expect(container.querySelector(".mobile-app-shell")).not.toHaveClass("md:hidden");

    expect(screen.getByRole("img", { name: "韩国大学地图分布" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "韩国大学地图" })).not.toBeInTheDocument();
    expect(container.querySelector('svg[data-testid="korea-region-map"]')).toBeInTheDocument();
    expect(container.querySelector('g[data-testid="korea-map-content"]')).toHaveAttribute(
      "transform",
      "translate(-70 0) translate(242.5 150) scale(0.85 1) translate(-242.5 -150)"
    );
    expect(container.querySelector('img[src="/korea-admin-map.svg"]')).not.toBeInTheDocument();
    expect(screen.queryByText("Map first")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "先看城市，再选学校" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /选择首尔圈地图区域/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /首尔圈 \d+所学校/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("地区筛选")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /地图分布/ })).toBeInTheDocument();
    const inlineSearch = screen.getByTestId("map-inline-search");
    expect(inlineSearch).toHaveClass("w-1/2");
    const searchInput = within(inlineSearch).getByRole("searchbox", { name: "搜索校名、校友" });
    expect(searchInput).toHaveAttribute("placeholder", "校名、校友");
    expect(searchInput).toHaveClass("font-normal", "placeholder:italic");
    expect(searchInput).not.toHaveClass("font-bold", "font-black");
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
    expect(map?.getAttribute("class")).toContain("h-[17.7rem]");
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
    expect(screen.getByText("42所")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(42);
    expect(screen.getByTestId("selected-region-pin")).toBeInTheDocument();
  });

  it("keeps only school tier as the map-side school filter", () => {
    render(<MobileKoreaMapPage />);

    const tierFilter = screen.getByTestId("map-tier-filter");
    expect(tierFilter).toHaveClass("right-8");
    expect(tierFilter).toHaveClass("top-[5.7rem]");
    expect(tierFilter).toHaveClass("w-[5.8rem]");
    const tierButtons = within(tierFilter).getAllByRole("button");
    expect(screen.getByTestId("map-tier-filter-grid")).toHaveClass("gap-[0.24rem]");
    expect(tierButtons.map((button) => button.textContent?.trim())).toEqual(["全部", "T1", "T2", "T3", "T4", "T5"]);
    tierButtons.forEach((button) => {
      expect(button).toHaveClass("h-[2.36rem]");
      expect(button).toHaveClass("min-h-0");
    });
    expect(within(tierFilter).queryByText("学校类型")).not.toBeInTheDocument();
    expect(within(tierFilter).queryByText("专业方向")).not.toBeInTheDocument();
    expect(within(tierFilter).queryByText("案例")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /选择首尔圈地图区域/ }));
    fireEvent.click(within(tierFilter).getByRole("button", { name: "T2" }));

    const expectedT2Count = universities.filter(
      (school) => seoulRegionKeywords.some((keyword) => school.city.includes(keyword)) && getUniversityTier(school.nameCn) === "T2"
    ).length;

    expect(screen.getByTestId("selected-region-count")).toHaveTextContent(`${expectedT2Count}所`);
    expect(screen.getAllByRole("article")).toHaveLength(expectedT2Count);
    screen.getAllByRole("article").forEach((card) => {
      expect(within(card).getByText("T2")).toBeInTheDocument();
    });
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
    expect(summary).toHaveClass("right-8");
    expect(summary).toHaveClass("top-7");
    expect(summary).not.toHaveClass("mt-2");
    expect(within(summary).getByText("全部地区")).toHaveClass("w-[5.8rem]", "rounded-md", "text-center", "text-[0.77rem]");
    expect(within(summary).getByText("96所")).toHaveClass("w-[5.8rem]", "rounded-md", "text-center", "text-[0.77rem]");
    expect(screen.queryByText("当前区域")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "进入大学库" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /所学校/ })).not.toBeInTheDocument();
  });

  it("filters the map list by famous alumni names", () => {
    render(<MobileKoreaMapPage />);

    const search = within(screen.getByTestId("map-inline-search")).getByRole("searchbox", { name: "搜索校名、校友" });
    fireEvent.change(search, { target: { value: "宋汉基" } });

    expect(screen.getByTestId("selected-region-count")).toHaveTextContent("1所");
    expect(screen.getByRole("article", { name: /又石大学/ })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /首尔大学/ })).not.toBeInTheDocument();
  });

  it("places the school actions in a compact two-column row", () => {
    render(<MobileKoreaMapPage />);

    const seoulCard = screen.getByRole("article", { name: /首尔大学/ });
    const actionRow = within(seoulCard).getByTestId("map-school-card-action-row");
    const detailButton = within(actionRow).getByRole("button", { name: "学校详情" });
    const caseButton = within(actionRow).getByRole("button", { name: "案例画像" });
    const schoolName = within(seoulCard).getByRole("heading", { name: "首尔大学" });
    const cityChip = within(seoulCard).getByText("首尔");
    const typeChip = within(seoulCard).getByText("国立");
    const focus = within(seoulCard).getByText("综合研究、理工、人文社科");

    expect(schoolName).toHaveClass("text-[1.18rem]");
    expect(actionRow).toHaveClass("grid");
    expect(actionRow).toHaveClass("grid-cols-[minmax(0,1fr)_minmax(0,1fr)]");
    expect(cityChip).toHaveClass("font-black");
    expect(typeChip).toHaveClass("font-black");
    expect(focus).toHaveClass("font-bold");
    expect(focus).toHaveClass("text-muted");
    expect(detailButton).toHaveClass("min-h-[2rem]");
    expect(detailButton).toHaveClass("text-[0.78rem]");
    expect(detailButton).toHaveClass("bg-[#dff3dc]", "text-[#004c3f]");
    expect(detailButton).toHaveStyle({
      boxShadow: "inset 0 0 0 0.6px rgba(0, 98, 65, 0.58), 0 4px 10px rgba(0, 98, 65, 0.08)"
    });
    expect(caseButton).toHaveClass("min-h-[2rem]");
    expect(caseButton).toHaveClass("bg-[#ffd0d8]");
    expect(detailButton).not.toHaveClass("w-full");
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
    expect(within(dialog).queryByRole("link", { name: /费用预算/ })).not.toBeInTheDocument();
    const officialLink = within(dialog).getByRole("link", { name: /学校官网/ });
    expect(officialLink).toHaveAttribute("href", "https://www.snu.ac.kr");
    expect(officialLink).toHaveAttribute("target", "_blank");
    expect(within(dialog).queryByText("数据更新")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("数据状态")).not.toBeInTheDocument();
  });
});
