import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileUniversitiesApp } from "./MobileUniversitiesApp";

describe("MobileUniversitiesApp", () => {
  it("starts as a compact mini-program university list", () => {
    render(<MobileUniversitiesApp />);

    expect(screen.queryByRole("heading", { name: "韩国大学库" })).not.toBeInTheDocument();
    expect(screen.queryByText("小程序版")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox", { name: "搜索学校" })).not.toBeInTheDocument();
    expect(screen.getByText("当前结果")).toBeInTheDocument();
    expect(screen.getAllByRole("article", { name: /大学/ })).toHaveLength(8);
    expect(screen.queryByRole("link", { name: "返回首页" })).not.toBeInTheDocument();
    const seoulCard = screen.getByRole("article", { name: /首尔大学/ });
    expect(seoulCard).toHaveClass("p-3");
    expect(within(seoulCard).getByRole("heading", { name: "首尔大学" })).toHaveClass("text-[1.18rem]");
    expect(within(seoulCard).queryByText("工科")).not.toBeInTheDocument();
    expect(within(seoulCard).getByText(/综合研究、理工、人文社科/)).toHaveClass("text-[0.83rem]");
    expect(within(seoulCard).getByTestId("university-card-actions")).toHaveClass("pt-1.5");
    const detailButton = within(seoulCard).getByRole("button", { name: "学校详情" });
    expect(detailButton).toHaveClass("min-h-[2rem]", "text-[0.78rem]", "bg-[#dff3dc]", "text-[#004c3f]");
    expect(detailButton).toHaveStyle({
      boxShadow: "inset 0 0 0 0.6px rgba(0, 98, 65, 0.58), 0 4px 10px rgba(0, 98, 65, 0.08)"
    });
    expect(within(screen.getByRole("navigation", { name: "移动端底部导航" })).getAllByRole("link").map((link) => link.textContent?.trim())).toEqual([
      "首页",
      "大学地图",
      "大学库",
      "费用",
      "TOPIK"
    ]);
  });

  it("keeps the university list compact without the removed desktop-style search area", () => {
    render(<MobileUniversitiesApp />);

    expect(screen.queryByRole("searchbox", { name: "搜索学校" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "推荐" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: /延世大学/ })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("opens precise filters with the desktop option groups and applies them to the list", () => {
    render(<MobileUniversitiesApp />);

    fireEvent.click(screen.getByRole("button", { name: "精准筛选" }));

    const dialog = screen.getByRole("dialog", { name: "精准筛选" });
    expect(within(dialog).getByRole("heading", { name: "精准筛选" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "国立" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "私立" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "京畿/仁川" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "济州" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "T5" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "美妆/美容" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "自然科学/生命" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "案例10例以上" })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "国立" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "济州" }));
    fireEvent.click(within(dialog).getByRole("button", { name: /查看1所学校/ }));

    expect(screen.queryByRole("dialog", { name: "精准筛选" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: /济州大学/ })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /首尔大学/ })).not.toBeInTheDocument();
  });

  it("opens school info as a short bottom sheet instead of an inline mega panel", () => {
    render(<MobileUniversitiesApp />);

    const seoulCard = screen.getByRole("article", { name: /首尔大学/ });
    fireEvent.click(within(seoulCard).getByRole("button", { name: "学校详情" }));

    const dialog = screen.getByRole("dialog", { name: "首尔大学" });
    expect(within(dialog).getByRole("heading", { name: "首尔大学" })).toBeInTheDocument();
    expect(within(dialog).getByRole("img", { name: "首尔大学校园图片" })).toBeInTheDocument();
    expect(within(dialog).getByText(/Seoul National University/)).toBeInTheDocument();
    expect(within(dialog).getByText("T1")).toBeInTheDocument();
    expect(within(dialog).getByText("学生数")).toBeInTheDocument();
    const focus = within(dialog).getByTestId("mobile-university-focus");
    expect(focus).toHaveTextContent("综合研究、理工、人文社科");
    expect(focus).toHaveClass("text-right", "font-medium");
    expect(focus).not.toHaveClass("font-bold");
    const intro = within(dialog).getByTestId("mobile-university-intro");
    expect(within(intro).getByText("成立时间：1946年")).toBeInTheDocument();
    expect(within(intro).getByText(/首尔大学位于首尔，成立时间为1946年/)).toBeInTheDocument();
    expect(within(dialog).queryByText("工科")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("自然科学/生命")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("人文/外语")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("数据更新")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("数据状态")).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("link", { name: /申请路线/ })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /费用预算/ })).toHaveAttribute("href", "/cost");
    expect(within(dialog).queryByText("首尔大学介绍")).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /案例画像/ }));

    expect(within(dialog).getByText("样本量")).toBeInTheDocument();
    expect(within(dialog).getByRole("region", { name: "申请者具体案例" })).toBeInTheDocument();
  });

  it("keeps admissions evidence behind a focused sheet", () => {
    render(<MobileUniversitiesApp />);

    const seoulCard = screen.getByRole("article", { name: /首尔大学/ });
    fireEvent.click(within(seoulCard).getByRole("button", { name: "案例画像" }));

    const dialog = screen.getByRole("dialog", { name: "首尔大学" });

    expect(dialog).toHaveClass("mx-auto");
    expect(within(dialog).getByRole("heading", { name: "首尔大学" })).toBeInTheDocument();
    expect(within(dialog).queryByText("首尔大学案例画像")).not.toBeInTheDocument();
    expect(within(dialog).getByText("样本量")).toBeInTheDocument();
    expect(within(dialog).getAllByText(/TOPIK/).length).toBeGreaterThan(0);
    const examples = within(dialog).getByRole("region", { name: "申请者具体案例" });
    expect(within(examples).getAllByRole("listitem")).toHaveLength(4);
    expect(within(examples).getAllByText("录取")).toHaveLength(2);
    expect(within(examples).getAllByText("拒绝")).toHaveLength(2);
    expect(within(examples).getAllByText(/高中背景/).length).toBeGreaterThan(0);
    expect(within(examples).getAllByText(/关键点/).length).toBeGreaterThan(0);
    for (const paragraph of within(examples).getAllByText(/2026年申请/)) {
      expect(paragraph).toHaveClass("font-normal");
      expect(paragraph).not.toHaveClass("font-bold");
    }
    expect(within(dialog).getByText("案例只作申请画像参考，不等于录取承诺。")).toBeInTheDocument();
  });
});
