import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MobileServicePage } from "./MobileServicePage";

describe("MobileServicePage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders TOPIK as a compact mini-program detail page", () => {
    render(<MobileServicePage page="topik" />);

    expect(document.querySelector(".mobile-app-shell")).toHaveClass("lg:landscape:hidden", "xl:hidden");
    expect(document.querySelector(".mobile-app-shell")).not.toHaveClass("md:hidden");

    expect(screen.queryByRole("heading", { name: "TOPIK考试" })).not.toBeInTheDocument();
    expect(screen.queryByText("小程序版")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI TOPIK 规划" })).toBeInTheDocument();
    expect(screen.getByTestId("mobile-primary-tool-card")).toHaveClass(
      "border-2",
      "bg-[#f4fbef]",
      "shadow-[0_14px_36px_rgba(11,106,74,0.16)]"
    );
    expect(screen.getAllByTestId("mobile-reference-card")[0]).toHaveClass("border-ink/25", "bg-[#fbfaf4]", "shadow-none");
    expect(screen.getAllByTestId("mobile-reference-card")[0]).not.toHaveClass("border-2");
    expect(screen.getByLabelText("目标学校").closest("form")).toHaveClass("overflow-hidden");
    expect(screen.getByLabelText("目标学校").closest("label")).toHaveClass("min-w-0");
    expect(screen.getByLabelText("目标学校")).toHaveClass("truncate", "min-w-0", "max-w-full", "w-full");
    expect(screen.getByLabelText("现在水平")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("目标学校")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("入学季")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("每周时间")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("目标学校")).toHaveDisplayValue("T1 SKY/成均馆等");
    expect(screen.queryByRole("option", { name: "T1 SKY/成均馆/汉阳/KAIST" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("入学季")).toHaveDisplayValue("27年3月入学（约3个月申请准备）");
    expect(screen.getByRole("option", { name: "26年9月入学（主申请窗已基本结束）" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "27年3月入学（约3个月申请准备）" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "27年9月入学（约9个月申请准备）" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "28年3月入学（约15个月申请准备）" })).toBeInTheDocument();
    expect(screen.getByLabelText("每周时间")).toHaveDisplayValue("每周9小时");
    expect(screen.queryByRole("option", { name: "高中日常：每周9小时" })).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "返回首页" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("navigation", { name: "移动端底部导航" })).getAllByRole("link").map((link) => link.textContent?.trim())).toEqual([
      "首页",
      "大学地图",
      "大学库",
      "费用",
      "TOPIK"
    ]);
    expect(within(screen.getByRole("navigation", { name: "移动端底部导航" })).getByRole("link", { name: "TOPIK" })).toHaveAttribute("aria-current", "page");
    expect(within(screen.getByLabelText("TOPIK移动端补充信息")).getByText("入门")).toHaveClass("self-center");
  });

  it("replaces the shared overview block with compact desktop-derived cost sections", () => {
    render(<MobileServicePage page="cost" />);

    const estimatorTitle = screen.getByRole("heading", { name: "韩国留学费用估算" });
    const desktopCost = screen.getByRole("heading", { name: "费用构成分析" });
    const budgetIcon = screen.getByTestId("mobile-budget-card-icon");

    expect(screen.getByTestId("mobile-primary-tool-card")).toHaveClass(
      "border-2",
      "bg-[#f4fbef]",
      "shadow-[0_14px_36px_rgba(11,106,74,0.16)]"
    );
    expect(screen.getAllByTestId("mobile-reference-card")[0]).toHaveClass("border-ink/25", "bg-[#fbfaf4]", "shadow-none");
    expect(screen.getAllByTestId("mobile-reference-card")[0]).not.toHaveClass("border-2");
    expect(screen.queryByLabelText("留学费用页面说明")).not.toBeInTheDocument();
    expect(screen.queryByText(/budget planner/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/移动版只放决策入口/)).not.toBeInTheDocument();
    expect(screen.getByText("按城市、学校、专业、住宿等估算。")).toBeInTheDocument();
    expect(screen.queryByText("按城市、学校、专业、住宿和奖学金快速估第一年预算。")).not.toBeInTheDocument();
    expect(within(budgetIcon).getByAltText("汇率换算图标")).toHaveAttribute(
      "src",
      expect.stringContaining("icon-exchange-budget-99.png")
    );
    expect(within(budgetIcon).queryByText("汇率")).not.toBeInTheDocument();
    expect(budgetIcon.closest("a")).toHaveAttribute("href", "/exchange-rate/");
    expect(budgetIcon).toHaveClass("mt-3");
    expect(estimatorTitle.compareDocumentPosition(desktopCost) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("学费")).toBeInTheDocument();
    expect(within(screen.getByLabelText("留学费用移动端补充信息")).getByText("约25-45%")).toHaveClass("self-center");
    expect(screen.getByText("地方国立")).toBeInTheDocument();
    expect(screen.getByText("出发前现金")).toBeInTheDocument();
    expect(screen.queryByText("桌面版的长表格压缩成移动端判断卡，先看钱主要花在哪里。")).not.toBeInTheDocument();
    expect(screen.queryByText("先用场景判断预算压力，再回到上方工具做个人估算。")).not.toBeInTheDocument();
    expect(screen.queryByText("这部分不属于韩国第一年学费，但申请前很容易漏算。")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "三大核心申请渠道" })).toBeInTheDocument();
    expect(screen.getByText("韩国高校官方直申")).toBeInTheDocument();
    expect(screen.getByText("语学院过渡申请")).toBeInTheDocument();
    expect(screen.getByText("专业留学中介")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "直申 vs 中介申请" })).toBeInTheDocument();
    expect(screen.getByText("核心学生群体画像")).toBeInTheDocument();
    expect(screen.getByText("直申（DIY）")).toBeInTheDocument();
    expect(screen.getByText("中介申请")).toBeInTheDocument();
    expect(screen.getAllByText("优点")[0]).toHaveClass("bg-[#d8f3e7]", "text-[#0b6a4a]");
    expect(screen.getAllByText("注意")[0]).toHaveClass("bg-[#fff3b8]", "text-[#7a5a00]");
    expect(screen.getByText("节省中介服务费（10,000-30,000元）")).toBeInTheDocument();
    expect(screen.getByText("需甄别机构资质与服务质量")).toBeInTheDocument();
  });

  it("removes the extra quick-action block from service pages", () => {
    render(<MobileServicePage page="cost" />);

    expect(screen.queryByRole("heading", { name: "先看这三件事" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /估算学校预算/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "出发前费用" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets application routes switch without a long desktop page", () => {
    render(<MobileServicePage page="application" />);

    expect(screen.getByRole("heading", { name: "国内+韩国项目库" })).toBeInTheDocument();
    expect(screen.getByLabelText("项目搜索")).toBeInTheDocument();
    expect(screen.getByText("北京外国语大学")).toBeInTheDocument();
    expect(screen.getByText(/全北大学/)).toBeInTheDocument();
    expect(screen.queryByText("当前结果")).not.toBeInTheDocument();
    expect(screen.queryByText("已同步 application.html 的项目、费用和申请条件。")).not.toBeInTheDocument();
    expect(screen.queryByText("已读取 application.html")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "选择申请路线" })).not.toBeInTheDocument();
    expect(screen.queryByText("本科先看成绩和语言，再分冲刺、匹配、保底。")).not.toBeInTheDocument();
    expect(screen.queryByText(/APPLICATION ROUTE/i)).not.toBeInTheDocument();
    expect(screen.queryByText("按地区、模式、专业和合作院校筛选公开项目。")).not.toBeInTheDocument();
    expect(screen.getByTestId("mobile-application-projects")).toHaveClass("overflow-hidden");
    expect(screen.getByTestId("mobile-application-projects")).not.toHaveClass("rounded-xl");
    expect(screen.getByTestId("mobile-application-projects")).not.toHaveClass("border");
    expect(screen.getByTestId("mobile-application-projects")).not.toHaveClass("bg-surface");
    expect(screen.queryByTestId("application-filter-groups")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /筛选项目/ }));

    const filterDialog = screen.getByRole("dialog", { name: "项目筛选" });
    expect(within(filterDialog).getByRole("button", { name: "传媒/影视" })).toBeInTheDocument();
    fireEvent.click(within(filterDialog).getByRole("button", { name: "传媒/影视" }));
    fireEvent.click(within(filterDialog).getByRole("button", { name: /查看\d+个项目/ }));
    expect(screen.queryByRole("dialog", { name: "项目筛选" })).not.toBeInTheDocument();

    const firstProjectCard = screen.getAllByTestId("application-program-card")[0];
    expect(firstProjectCard).toHaveClass("overflow-hidden");
    expect(within(firstProjectCard).getByTestId("application-program-card-region")).toHaveTextContent("华北");
    expect(within(firstProjectCard).getByTestId("application-program-card-meta")).toContainElement(within(firstProjectCard).getByTestId("application-program-card-region"));
    expect(firstProjectCard.querySelector("dl")).toBeNull();
    expect(within(firstProjectCard).queryByText("专业设置")).not.toBeInTheDocument();

    fireEvent.click(within(firstProjectCard).getByRole("button", { name: "北京外国语大学" }));

    expect(within(firstProjectCard).getByText("专业设置")).toBeInTheDocument();
    expect(within(firstProjectCard).getByText("申请条件")).toBeInTheDocument();
    const campusCaption = within(firstProjectCard).getByTestId("application-campus-caption");
    expect(campusCaption).toHaveTextContent("全北大学");
    expect(campusCaption).toHaveTextContent("全州");
    expect(campusCaption).toHaveTextContent("T3");

    fireEvent.click(within(firstProjectCard).getByRole("button", { name: /全北大学.*T3.*学校信息/ }));
    const partnerDialog = screen.getByRole("dialog", { name: "全北大学学校信息" });
    expect(within(partnerDialog).getByText("大学库学校信息")).toBeInTheDocument();
    expect(within(partnerDialog).getByText("全州")).toBeInTheDocument();
    expect(within(partnerDialog).getAllByText("T3").length).toBeGreaterThan(0);
    expect(within(partnerDialog).getByRole("link", { name: "打开大学库" })).toHaveAttribute("href", "/universities/");
    fireEvent.click(within(partnerDialog).getByRole("button", { name: "关闭学校信息" }));
    expect(screen.queryByRole("dialog", { name: "全北大学学校信息" })).not.toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "研究生" })).not.toBeInTheDocument();
    expect(screen.queryByText("研究计划")).not.toBeInTheDocument();
    expect(screen.queryByText("教授方向")).not.toBeInTheDocument();
    expect(screen.queryByText(/自申 vs 中介判断工具将在这里扩展/)).not.toBeInTheDocument();
  });

  it("provides an editable exchange calculator with an explicit reference warning", () => {
    render(<MobileServicePage page="exchange" />);

    const cnyInput = screen.getByLabelText("人民币金额");
    const rateInput = screen.getByLabelText("韩元人民币汇率");
    fireEvent.change(cnyInput, { target: { value: "2" } });

    expect(rateInput).toHaveDisplayValue("224.18");
    expect(screen.getByText("按当天银行牌价改汇率")).toBeInTheDocument();
    expect(screen.getByText("约 448 韩元")).toBeInTheDocument();
    expect(screen.getByText("约 4.46 人民币")).toBeInTheDocument();
    expect(screen.queryByText("Currency helper")).not.toBeInTheDocument();
    expect(screen.queryByText(/移动版只放决策入口/)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "韩国日常价格感" })).toBeInTheDocument();
    expect(screen.getByText("地铁/公交一次")).toBeInTheDocument();
    expect(screen.getByText("出租车起步")).toBeInTheDocument();
    expect(screen.getByText("电影普通票")).toBeInTheDocument();
    expect(screen.getByText("小剧场/演出")).toBeInTheDocument();
    expect(screen.getByText("手机月套餐")).toBeInTheDocument();
    expect(screen.getByText("证件照/复印")).toBeInTheDocument();
    expect(screen.getByText("教材/二手书")).toBeInTheDocument();
    expect(screen.getByText("便利店小食")).toBeInTheDocument();
  });

  it("runs the desktop-style cost estimator after a 1.5 second AI loading state", () => {
    vi.useFakeTimers();
    render(<MobileServicePage page="cost" />);

    expect(screen.getByLabelText("城市")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("学校")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("专业")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("住宿")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("申请")).toHaveClass("text-[0.79rem]");
    expect(screen.getByLabelText("奖学金")).toHaveClass("text-[0.79rem]");
    expect(screen.getByRole("button", { name: "还原" })).toHaveClass("text-[0.79rem]");
    expect(screen.getByRole("button", { name: "费用预估" })).toHaveClass("bg-[#dff3dc]", "text-[#004c3f]", "text-[0.79rem]");
    expect(screen.getByRole("button", { name: "费用预估" })).toHaveStyle({
      boxShadow: "inset 0 0 0 1px #006241, 0 6px 14px rgba(0, 98, 65, 0.12)"
    });

    fireEvent.change(screen.getByLabelText("城市"), { target: { value: "regional" } });
    fireEvent.change(screen.getByLabelText("学校"), { target: { value: "public" } });
    fireEvent.change(screen.getByLabelText("专业"), { target: { value: "engineering" } });
    fireEvent.click(screen.getByRole("button", { name: "费用预估" }));

    expect(screen.getByRole("status")).toHaveTextContent("AI正在分析留学费用");
    expect(screen.queryByText("第一年总预算")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("第一年总预算")).toBeInTheDocument();
    expect(screen.getByTestId("budget-total-card")).toHaveClass("bg-[#dff3dc]");
    expect(screen.getByTestId("budget-total-card")).toHaveStyle({
      boxShadow: "inset 0 0 0 1px #006241, 0 10px 22px rgba(0, 98, 65, 0.14)"
    });
    expect(screen.getByTestId("budget-total-amount-row")).toHaveClass("flex", "items-end", "gap-3");
    expect(screen.getByTestId("budget-total-amount-row")).toContainElement(screen.getByTestId("budget-total-krw"));
    expect(screen.getByTestId("budget-total-krw")).toHaveClass("mb-0.5", "min-w-[8.8rem]", "text-center", "bg-[#f7fbf3]", "text-[#25443a]");
    const resultAmountRows = screen.getAllByTestId("budget-result-amount-row");
    const resultKrwAmounts = screen.getAllByTestId("budget-result-krw");
    expect(resultAmountRows).toHaveLength(3);
    expect(resultKrwAmounts).toHaveLength(3);
    expect(resultAmountRows[0]).toHaveClass("flex", "items-end", "gap-2");
    expect(resultAmountRows[0]).toContainElement(resultKrwAmounts[0]);
    expect(resultKrwAmounts[0]).toHaveClass("mb-0.5", "min-w-[5.9rem]", "text-center", "bg-[#f7fbf3]", "text-[#25443a]");
    expect(screen.getByText(/地方城市国公立，理工/)).toBeInTheDocument();
    expect(screen.getByText("大学学费")).toBeInTheDocument();
    expect(screen.getByText("住宿+生活")).toBeInTheDocument();
  });

  it("runs the desktop-style TOPIK planner after a 1.5 second AI loading state", () => {
    vi.useFakeTimers();
    render(<MobileServicePage page="topik" />);

    expect(screen.queryByLabelText("TOPIK考试页面说明")).not.toBeInTheDocument();
    expect(screen.queryByText(/language plan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/移动版只放决策入口/)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "TOPIK学习量阶梯" })).toBeInTheDocument();
    expect(screen.getByText("TOPIK4 - 约600小时")).toBeInTheDocument();
    expect(screen.queryByText("TOPIK4约600小时")).not.toBeInTheDocument();
    expect(screen.getByText("T1目标")).toBeInTheDocument();
    expect(screen.getByText("备考资料顺序")).toBeInTheDocument();
    expect(screen.queryByText("从桌面版学习量表抽出最常用的判断线，先估算缺口。")).not.toBeInTheDocument();
    expect(screen.queryByText("移动端不放完整矩阵，只保留申请决策最常用的学校层级。")).not.toBeInTheDocument();
    expect(screen.queryByText("桌面版资源表很长，移动端先告诉你使用顺序。")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("现在水平"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("目标学校"), { target: { value: "t2" } });
    fireEvent.change(screen.getByLabelText("每周时间"), { target: { value: "14" } });
    expect(screen.getByRole("button", { name: "AI规划" })).toHaveClass("bg-[#dff3dc]", "text-[#004c3f]");
    expect(screen.getByRole("button", { name: "AI规划" })).toHaveStyle({
      boxShadow: "inset 0 0 0 1px #006241, 0 6px 14px rgba(0, 98, 65, 0.12)"
    });
    fireEvent.click(screen.getByRole("button", { name: "AI规划" }));

    expect(screen.getByRole("status")).toHaveTextContent("AI正在分析TOPIK目标");
    expect(screen.queryByText("现实性判断")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("现实性判断")).toBeInTheDocument();
    expect(screen.getByTestId("topik-result-card")).toHaveClass("bg-[#dff3dc]");
    expect(screen.getByTestId("topik-result-card")).toHaveStyle({
      boxShadow: "inset 0 0 0 1px #006241, 0 10px 22px rgba(0, 98, 65, 0.14)"
    });
    expect(screen.getByTestId("topik-result-title")).toHaveClass("text-[#004c3f]");
    expect(screen.queryByText("先补发音、语法和听读。")).not.toBeInTheDocument();
    expect(screen.getByTestId("topik-target-gap")).toHaveClass("text-[#8b1e1e]");
    expect(screen.getByTestId("topik-hour-gap")).toHaveClass("text-[#8b1e1e]");
    expect(screen.queryByText(/预计到TOPIK/)).not.toBeInTheDocument();
    expect(screen.getByText("目标完成率")).toBeInTheDocument();
    expect(screen.getByText("每周缺口")).toBeInTheDocument();
    expect(screen.getByText("接下来做什么")).toBeInTheDocument();
  });
});
