import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { MobileMiniProgramHome } from "./MobileMiniProgramHome";

describe("MobileMiniProgramHome", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("loops mobile intro images, supports pinch zoom, and closes from outside the image", () => {
    vi.useFakeTimers();
    render(<MobileMiniProgramHome />);

    expect(screen.getByTestId("mobile-intro-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-intro-overlay")).toHaveStyle({ backgroundColor: "rgba(10, 10, 10, 0.78)" });
    expect(screen.getByTestId("mobile-intro-frame")).toHaveClass("max-w-[26rem]");
    expect(screen.getByTestId("mobile-intro-dots")).toHaveClass("mt-4");
    expect(screen.getByTestId("mobile-intro-close")).toHaveClass("mx-auto", "mt-5");
    expect(screen.getByTestId("mobile-intro-image")).toHaveAttribute("src", expect.stringContaining("mobile-intro-a1.png"));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId("mobile-intro-image")).toHaveAttribute("src", expect.stringContaining("mobile-intro-a3.png"));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId("mobile-intro-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-intro-image")).toHaveAttribute("src", expect.stringContaining("mobile-intro-a1.png"));

    fireEvent.click(screen.getByTestId("mobile-intro-image-panel"));
    expect(screen.getByTestId("mobile-intro-overlay")).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-intro-zoom-pane")).not.toBeInTheDocument();
    expect(screen.getByTestId("mobile-intro-image-panel")).toHaveClass("overflow-visible");

    fireEvent.touchStart(screen.getByTestId("mobile-intro-image-panel"), {
      touches: [
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 }
      ]
    });
    fireEvent.touchMove(screen.getByTestId("mobile-intro-image-panel"), {
      touches: [
        { clientX: -50, clientY: 0 },
        { clientX: 150, clientY: 0 }
      ]
    });

    expect(screen.getByTestId("mobile-intro-image-inner")).toHaveStyle({ transform: "scale(2)" });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByTestId("mobile-intro-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-intro-image")).toHaveAttribute("src", expect.stringContaining("mobile-intro-a1.png"));

    fireEvent.click(screen.getByTestId("mobile-intro-overlay"));
    expect(screen.queryByTestId("mobile-intro-overlay")).not.toBeInTheDocument();
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
    expect(heroImage).toHaveAttribute("src", expect.stringContaining("home-hero-a5-2-source.png"));
    expect(heroImage).toHaveClass("object-center");
    expect(heroImage).not.toHaveClass("scale-[1.32]");
    expect(heroImage).toHaveClass("opacity-80");
    const heroGradientLayers = Array.from(screen.getByTestId("mobile-home-hero").querySelectorAll("div")).filter((layer) =>
      layer.className.includes("bg-gradient")
    );
    expect(heroGradientLayers).toHaveLength(2);
    expect(heroGradientLayers.some((layer) => layer.className.includes("bg-gradient-to-b"))).toBe(true);
    expect(heroGradientLayers.some((layer) => layer.className.includes("bg-gradient-to-r"))).toBe(true);
    const horizontalGradient = heroGradientLayers.find((layer) => layer.className.includes("bg-gradient-to-r"));
    expect(horizontalGradient).toHaveClass("inset-x-0");
    expect(horizontalGradient).not.toHaveClass("w-[82%]");
    expect(screen.queryByText("Official first")).not.toBeInTheDocument();
    expect(screen.getByTestId("mobile-home-primary-cta")).toHaveClass("py-2");
    expect(screen.getByText("先按条件筛，再看学校")).toHaveClass("text-[0.95rem]");
    expect(screen.getByRole("link", { name: "开始" })).toHaveClass("py-1.5");
    expect(screen.getByRole("link", { name: "开始" })).toHaveClass("text-[0.74rem]");
    expect(screen.getByRole("heading", { name: "按条件推荐学校" })).toHaveClass("text-[1.06rem]");
    expect(screen.getByTestId("mobile-home-action-grid")).toHaveClass("mt-6");
    expect(screen.queryByAltText("KOREA LINK角色标识")).not.toBeInTheDocument();
    expect(screen.getByAltText("韩国大学地图分类图")).toBeInTheDocument();
    expect(screen.getByAltText("韩国大学库分类图")).toBeInTheDocument();
    expect(screen.getByAltText("韩国大学地图分类图")).toHaveAttribute("src", expect.stringContaining("category-map-a4.png"));
    expect(screen.getByAltText("韩国大学库分类图")).toHaveAttribute("src", expect.stringContaining("category-universities-a4.png"));
    expect(screen.getByAltText("国内+韩国项目分类图")).toHaveAttribute("src", expect.stringContaining("category-application-a4.png"));
    expect(screen.getByAltText("留学费用分类图")).toHaveAttribute("src", expect.stringContaining("category-cost-a4.png"));
    expect(screen.getByAltText("韩语分类图")).toHaveAttribute("src", expect.stringContaining("category-topik-a4.png"));
    expect(screen.getByAltText("汇率换算分类图")).toHaveAttribute("src", expect.stringContaining("category-exchange-a4.png"));
    const categoryImages = screen
      .getAllByRole("img")
      .filter((image) => image.getAttribute("src")?.includes("category-"));
    expect(categoryImages).toHaveLength(6);
    categoryImages.forEach((image) => {
      expect(image).toHaveAttribute("sizes", "5.98rem");
      expect(image.parentElement).toHaveStyle({ height: "5.18rem", maxWidth: "5.98rem" });
    });
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

  it("shows mobile required values immediately after each required select changes", () => {
    render(<MobileMiniProgramHome />);

    const controls = screen.getAllByTestId("mobile-required-control");
    fireEvent.change(controls[0].querySelector("select")!, { target: { value: "72" } });
    expect(controls[0].querySelector("[aria-hidden='true']")).toBeNull();
    expect(controls[0].querySelector("select")).toHaveClass("text-ink");
    expect(controls[0].querySelector("select")).not.toHaveClass("text-transparent");
    expect(controls[1].querySelector("[aria-hidden='true']")).not.toBeNull();

    fireEvent.change(controls[1].querySelector("select")!, { target: { value: "4" } });
    expect(controls[1].querySelector("[aria-hidden='true']")).toBeNull();
    expect(controls[1].querySelector("select")).toHaveClass("text-ink");

    fireEvent.change(controls[2].querySelector("select")!, { target: { value: "computer-science" } });
    expect(controls[2].querySelector("[aria-hidden='true']")).toBeNull();
    expect(controls[2].querySelector("select")).toHaveClass("text-ink");
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
    expect(screen.queryByLabelText("英语成绩")).not.toBeInTheDocument();
    expect(screen.getByLabelText("学校类型")).toHaveClass("text-[0.85rem]");
    expect(screen.getAllByText("必选项")).toHaveLength(3);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "生成5所推荐大学" })).toBeEnabled();
    expect(screen.getAllByTestId("mobile-required-control")).toHaveLength(3);
    screen.getAllByTestId("mobile-required-control").forEach((control) => {
      expect(control.querySelector("[aria-hidden='true']")).toHaveClass("text-[0.85rem]");
      expect(control.querySelector("select")).toHaveClass("text-transparent");
    });

    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));
    screen.getAllByTestId("mobile-required-control").forEach((control) => {
      expect(control).toHaveClass("required-field-flash");
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "初步推荐结果" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("高中类型"), { target: { value: "provincial_key" } });
    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
    fireEvent.change(screen.getByLabelText("倾向地区"), { target: { value: "首尔" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "生成5所推荐大学" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "生成5所推荐大学" })).toHaveClass("bg-[#dff3dc]", "text-[#004c3f]");
    expect(screen.getByRole("button", { name: "生成5所推荐大学" })).toHaveStyle({
      boxShadow: "inset 0 0 0 1px #006241, 0 6px 14px rgba(0, 98, 65, 0.12)"
    });
    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));

    expect(screen.getByRole("status")).toHaveTextContent("AI正在计算推荐学校");
    expect(screen.queryByRole("heading", { name: "初步推荐结果" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByRole("heading", { name: "初步推荐结果" })).toBeInTheDocument();
    screen.getAllByTestId("mobile-required-control").forEach((control) => {
      expect(control.querySelector("[aria-hidden='true']")).toBeNull();
      expect(control.querySelector("select")).toHaveClass("text-ink");
      expect(control.querySelector("select")).not.toHaveClass("text-transparent");
    });
    expect((screen.getAllByTestId("mobile-required-control")[0].querySelector("select") as HTMLSelectElement).value).toBe("77");
    expect((screen.getAllByTestId("mobile-required-control")[1].querySelector("select") as HTMLSelectElement).value).toBe("3");
    expect((screen.getAllByTestId("mobile-required-control")[2].querySelector("select") as HTMLSelectElement).value).toBe("computer-science");
    const cards = screen.getAllByTestId("mobile-recommendation-card");
    expect(cards).toHaveLength(5);
    expect(within(cards[0]).getByTestId("mobile-recommendation-header")).toHaveClass("items-center");
    expect(within(cards[0]).getByTestId("mobile-recommendation-rank")).toHaveClass("size-[1.7rem]", "bg-[#0b6a4a]", "text-[0.74rem]");
    const categoryBadges = cards.map((card) => within(card).getByTestId("mobile-recommendation-category"));
    const categoryTexts = categoryBadges.map((badge) => badge.textContent ?? "");
    expect(categoryTexts).toEqual(["录取有望", "录取有望", "录取有望", "条件匹配", "录取较难"]);
    expect(categoryBadges[0]).toHaveClass("rounded-full", "border", "px-2", "py-0.5", "text-xs", "font-black");
    expect(within(cards[0]).getByTestId("mobile-recommendation-location")).toHaveTextContent(" / ");
    const recommendationLocations = cards.map((card) => within(card).getByTestId("mobile-recommendation-location").textContent ?? "");
    expect(recommendationLocations.some((location) => location.split(" / ")[0].includes("/"))).toBe(false);
    expect(within(cards[0]).getByTestId("mobile-recommendation-header")).toContainElement(within(cards[0]).getByTestId("mobile-recommendation-location"));
    cards.forEach((card) => {
      expect(within(card).getByText(/\d+案例/)).toHaveClass("bg-[#e6f7f7]");
    });
    const actions = within(cards[0]).getByTestId("mobile-recommendation-card-actions");
    expect(within(actions).getByRole("button", { name: /学校详情/ })).toBeInTheDocument();
    expect(within(actions).getByRole("button", { name: /案例画像/ })).toBeInTheDocument();
    expect(Array.from(cards[0].querySelectorAll("p")).some((item) => item.className.includes("text-[0.72rem]"))).toBe(false);
  });

  it("shows project and Korean prep guidance instead of blocked school cards when TOPIK is too low", () => {
    vi.useFakeTimers();
    render(<MobileMiniProgramHome />);

    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.queryByTestId("mobile-recommendation-card")).not.toBeInTheDocument();
    const guidance = screen.getByTestId("mobile-no-direct-guidance");
    expect(guidance).toHaveTextContent("TOPIK低于3级");
    expect(within(guidance).getByRole("link", { name: /国内\+韩国项目/ })).toHaveAttribute("href", "/application");
    expect(within(guidance).getByRole("link", { name: /韩语 \/ TOPIK、报名、备考/ })).toHaveAttribute("href", "/topik");
    expect(screen.queryByText("暂不符合")).not.toBeInTheDocument();
  });

  it("opens school information with a campus image from a recommended school", () => {
    vi.useFakeTimers();
    render(<MobileMiniProgramHome />);

    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
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
    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
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
