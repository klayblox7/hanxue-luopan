import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { MobileMiniProgramHome } from "./MobileMiniProgramHome";

describe("MobileMiniProgramHome", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a mobile-first mini program homepage with the desktop categories", () => {
    render(<MobileMiniProgramHome />);

    expect(screen.queryByRole("heading", { name: "韩国大学通" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "KOREA UNIVERSITY LINK" })).toBeInTheDocument();
    expect(screen.getByText("Hi, 准留学生")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-home-hero")).toHaveClass("min-h-[15rem]");
    expect(screen.getByTestId("mobile-home-hero")).toHaveClass("pb-10");
    expect(screen.getByTestId("mobile-home-content")).toHaveClass("-mt-8");
    const heroImage = screen.getByTestId("mobile-home-hero").querySelector("img");
    expect(heroImage).toHaveAttribute("src", expect.stringContaining("home-hero-mobile.png"));
    expect(heroImage).toHaveClass("origin-left");
    expect(heroImage).toHaveClass("scale-[1.32]");
    expect(screen.queryByText("Official first")).not.toBeInTheDocument();
    expect(screen.getByTestId("mobile-home-primary-cta")).toHaveClass("py-2");
    expect(screen.getByText("先按条件筛，再看学校")).toHaveClass("text-[0.95rem]");
    expect(screen.getByRole("link", { name: "开始" })).toHaveClass("py-1.5");
    expect(screen.getByRole("link", { name: "开始" })).toHaveClass("text-[0.74rem]");
    expect(screen.getByRole("heading", { name: "按条件推荐学校" })).toHaveClass("text-[1.06rem]");
    expect(screen.queryByAltText("KOREA LINK角色标识")).not.toBeInTheDocument();
    expect(screen.getByAltText("韩国大学地图分类图")).toBeInTheDocument();
    expect(screen.getByAltText("韩国大学库分类图")).toBeInTheDocument();
    expect(screen.getByAltText("国内+韩国项目分类图")).toHaveAttribute("src", expect.stringContaining("category-application-clean.png"));
    expect(screen.getByText("1+3、2+2等")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /韩国大学地图/ })).toHaveAttribute("href", "/korea-university-map");
    expect(screen.getByRole("link", { name: /韩国大学库/ })).toHaveAttribute("href", "/universities");
    expect(screen.getByRole("link", { name: /国内\+韩国项目/ })).toHaveAttribute("href", "/application");
    expect(screen.getByRole("link", { name: /留学费用/ })).toHaveAttribute("href", "/cost");
    expect(screen.getByRole("link", { name: /韩语/ })).toHaveAttribute("href", "/topik");
    expect(screen.getByRole("link", { name: /汇率换算/ })).toHaveAttribute("href", "/exchange-rate");
  });

  it("shows a mini-program style bottom tab bar without a character or QR center button", () => {
    render(<MobileMiniProgramHome />);

    const bottomNav = screen.getByRole("navigation", { name: "移动端底部导航" });

    expect(bottomNav).toBeInTheDocument();
    expect(within(bottomNav).getAllByRole("link").map((link) => link.textContent?.trim())).toEqual(["首页", "大学地图", "大学库", "费用", "TOPIK"]);
    expect(within(bottomNav).getByRole("link", { name: "首页" })).toHaveAttribute("href", "/");
    expect(within(bottomNav).getByRole("link", { name: "大学地图" })).toHaveAttribute("href", "/korea-university-map");
    expect(within(bottomNav).getByRole("link", { name: "大学库" })).toHaveAttribute("href", "/universities");
    expect(within(bottomNav).getByRole("link", { name: "费用" })).toHaveAttribute("href", "/cost");
    expect(within(bottomNav).getByRole("link", { name: "TOPIK" })).toHaveAttribute("href", "/topik");
    expect(within(bottomNav).queryByAltText("KOREA LINK角色标识")).not.toBeInTheDocument();
  });

  it("keeps the homepage focused without the auxiliary route and trust blocks", () => {
    render(<MobileMiniProgramHome />);

    expect(screen.queryByText("先补TOPIK")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "申请路线" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "信息信任规则" })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "申请路线选择" })).not.toBeInTheDocument();
  });

  it("exposes desktop-style recommendation filters and generates school results after an AI loading state", () => {
    vi.useFakeTimers();
    render(<MobileMiniProgramHome />);

    expect(screen.getByLabelText("高中均分")).toBeInTheDocument();
    expect(screen.getByLabelText("高中类型")).toBeInTheDocument();
    expect(screen.getByLabelText("希望专业")).toBeInTheDocument();
    expect(screen.getByLabelText("倾向地区")).toBeInTheDocument();
    expect(screen.getByLabelText("高中均分")).toHaveClass("text-[0.85rem]");
    expect(screen.getByLabelText("高中类型")).toHaveClass("text-[0.85rem]");
    expect(screen.getByLabelText("TOPIK等级")).toHaveClass("text-[0.85rem]");
    expect(screen.getByLabelText("希望专业")).toHaveClass("text-[0.85rem]");
    expect(screen.getByLabelText("倾向地区")).toHaveClass("text-[0.85rem]");
    expect(screen.getByLabelText("预算")).toHaveClass("text-[0.85rem]");
    expect(screen.getByLabelText("学校类型")).toHaveClass("text-[0.85rem]");

    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));

    expect(screen.getByRole("status")).toHaveTextContent("AI正在计算推荐学校");
    expect(screen.queryByRole("heading", { name: "初步推荐结果" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByRole("heading", { name: "初步推荐结果" })).toBeInTheDocument();
    const cards = screen.getAllByTestId("mobile-recommendation-card");
    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByTestId("mobile-recommendation-header")).toHaveClass("items-center");
    expect(within(cards[0]).getByTestId("mobile-recommendation-rank")).toHaveClass("size-[1.7rem]", "bg-[#0b6a4a]", "text-[0.74rem]");
    expect(within(cards[0]).getByTestId("mobile-recommendation-location")).toHaveTextContent(" / ");
    expect(within(cards[0]).getByTestId("mobile-recommendation-header")).toContainElement(within(cards[0]).getByTestId("mobile-recommendation-location"));
    const actions = within(cards[0]).getByTestId("mobile-recommendation-card-actions");
    expect(within(actions).getByRole("button", { name: /学校详情/ })).toBeInTheDocument();
    expect(within(actions).getByRole("button", { name: /案例画像/ })).toBeInTheDocument();
    expect(Array.from(cards[0].querySelectorAll("p")).some((item) => item.className.includes("text-[0.72rem]"))).toBe(false);
  });

  it("opens school information with a campus image from a recommended school", () => {
    vi.useFakeTimers();
    render(<MobileMiniProgramHome />);

    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const firstCard = screen.getAllByTestId("mobile-recommendation-card")[0];
    const schoolName = within(firstCard).getByRole("heading").textContent ?? "";
    fireEvent.click(within(firstCard).getByRole("button", { name: `${schoolName}学校信息` }));

    const dialog = screen.getByRole("dialog", { name: schoolName });
    expect(within(dialog).getByAltText(`${schoolName}校园图片`)).toBeInTheDocument();
    const intro = within(dialog).getByTestId("recommended-school-intro");
    expect(within(intro).getByText("学校介绍")).toBeInTheDocument();
    expect(within(intro).getByText(/成立时间：/)).toBeInTheDocument();
    expect(within(intro).getByText(new RegExp(`${schoolName}位于`))).toBeInTheDocument();
    expect(within(dialog).queryByText("重点方向")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("数据更新")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("数据状态")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /进入大学库/ })).toHaveAttribute("href", "/universities");
  });

  it("opens admission evidence from a recommended school's case action", () => {
    vi.useFakeTimers();
    render(<MobileMiniProgramHome />);

    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const firstCard = screen.getAllByTestId("mobile-recommendation-card")[0];
    const schoolName = within(firstCard).getByRole("heading").textContent ?? "";
    fireEvent.click(within(firstCard).getByRole("button", { name: /案例画像/ }));

    const dialog = screen.getByRole("dialog", { name: schoolName });
    expect(within(dialog).getByText("申请者具体案例")).toBeInTheDocument();
    expect(within(dialog).getByText("案例只作申请画像参考，不等于录取承诺。")).toBeInTheDocument();
  });
});
