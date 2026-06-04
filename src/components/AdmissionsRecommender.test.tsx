import { fireEvent, render, screen, within } from "@testing-library/react";

import { AdmissionsRecommender } from "./AdmissionsRecommender";

describe("AdmissionsRecommender", () => {
  it("keeps workbook case charts off the first screen", () => {
    render(<AdmissionsRecommender />);

    expect(screen.queryByRole("region", { name: "案例库透视" })).not.toBeInTheDocument();
    expect(screen.queryByText("1400条案例")).not.toBeInTheDocument();
    expect(screen.queryByText("案例图表")).not.toBeInTheDocument();
  });

  it("starts with the broad-access filter defaults shown on the main screen", () => {
    render(<AdmissionsRecommender />);

    expect(screen.getByLabelText("高中均分")).toHaveValue("77");
    expect(screen.getByLabelText("高中类型")).toHaveValue("regular");
    expect(screen.getByLabelText("希望专业")).toHaveValue("undecided");
  });

  it("collects applicant inputs and renders seven balanced school recommendations", () => {
    render(<AdmissionsRecommender />);

    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "4" } });
    const gpaBand = screen.getByLabelText("高中均分");
    expect(gpaBand.tagName).toBe("SELECT");
    expect(screen.getByRole("option", { name: "90分以上" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "95-100分" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("学校类型")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "国立/公立" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "私立" })).toBeInTheDocument();
    expect(screen.getByLabelText("倾向地区")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "都可以" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "地方" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("倾向地区"), { target: { value: "首尔" } });
    fireEvent.change(gpaBand, { target: { value: "95" } });
    fireEvent.click(screen.getByRole("button", { name: "生成7所推荐大学" }));

    expect(screen.getByText("初步推荐结果")).toBeInTheDocument();
    expect(screen.getAllByTestId("recommendation-result")).toHaveLength(7);
    screen.getAllByTestId("recommendation-result").forEach((card) => expect(card).toHaveTextContent("首尔"));
    screen.getAllByTestId("recommendation-result").forEach((card) => expect(card).not.toHaveTextContent(/\d+分/));
    expect(screen.getAllByText("较有希望")).toHaveLength(3);
    expect(screen.getAllByText("适合申请")).toHaveLength(2);
    expect(screen.getAllByText("冲刺申请")).toHaveLength(1);
    expect(screen.getAllByText("先补条件")).toHaveLength(1);
    const firstCard = screen.getAllByTestId("recommendation-result")[0];
    expect(within(firstCard).getByRole("heading", { level: 3 })).toHaveTextContent(/首尔 \/ .* · (较有希望|适合申请|冲刺申请|先补条件|需确认)/);
    expect(within(firstCard).getByTestId("recommendation-confidence")).toHaveClass("text-[#9f1d1d]");
    expect(within(firstCard).getByTestId("recommendation-cautions")).toHaveClass("text-ink");
    expect(within(firstCard).getByText(/专业方向匹配/)).not.toHaveTextContent(/^首尔 \/ /);
    expect(screen.getAllByTestId("recommendation-order").map((badge) => badge.textContent)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(screen.queryByText("案例图表")).not.toBeInTheDocument();
    expect(screen.getAllByText(/^T[1-5]$/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/第\d+名|并列第/)).not.toBeInTheDocument();
    expect(screen.getByText(/不代表录取保证/)).toBeInTheDocument();
  });
  it("opens the selected school's detailed case panel from a recommendation card", () => {
    render(<AdmissionsRecommender />);

    fireEvent.click(screen.getByRole("button", { name: /生成7所推荐大学/ }));
    const firstCard = screen.getAllByTestId("recommendation-result")[0];

    expect(within(firstCard).queryByTestId("recommendation-case-panel")).not.toBeInTheDocument();
    fireEvent.click(within(firstCard).getByTestId("recommendation-school-toggle"));

    expect(within(firstCard).getByTestId("recommendation-case-panel")).toBeInTheDocument();
  });
});
