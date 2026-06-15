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
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByText("必选项")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "生成5所推荐大学" })).toBeEnabled();
    expect(screen.getAllByTestId("required-control")).toHaveLength(3);
    screen.getAllByTestId("required-control").forEach((control) => {
      expect(control).toContainElement(within(control).getByText("必选项"));
      expect(control.querySelector("[aria-hidden='true']")).toHaveClass("text-[0.85rem]");
      expect(control.querySelector("select")).toHaveClass("text-transparent");
    });
  });

  it("flashes required selection controls when the recommendation button is clicked without a major", () => {
    render(<AdmissionsRecommender />);

    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));

    expect(screen.queryByText("初步推荐结果")).not.toBeInTheDocument();
    screen.getAllByTestId("required-control").forEach((control) => {
      expect(control).toHaveClass("required-field-flash");
    });
  });

  it("shows each required value as soon as that field is selected", () => {
    render(<AdmissionsRecommender />);

    const controls = screen.getAllByTestId("required-control");
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

  it("keeps selected required values visible after recommendations are generated", () => {
    render(<AdmissionsRecommender />);

    const controls = screen.getAllByTestId("required-control");
    fireEvent.change(controls[2].querySelector("select")!, { target: { value: "computer-science" } });
    fireEvent.click(screen.getByRole("button", { name: /5/ }));

    screen.getAllByTestId("required-control").forEach((control) => {
      expect(control.querySelector("[aria-hidden='true']")).toBeNull();
      expect(control.querySelector("select")).toHaveClass("text-ink");
      expect(control.querySelector("select")).not.toHaveClass("text-transparent");
    });
    expect((screen.getAllByTestId("required-control")[0].querySelector("select") as HTMLSelectElement).value).toBe("77");
    expect((screen.getAllByTestId("required-control")[1].querySelector("select") as HTMLSelectElement).value).toBe("3");
    expect((screen.getAllByTestId("required-control")[2].querySelector("select") as HTMLSelectElement).value).toBe("computer-science");
  });

  it("collects applicant inputs and renders five balanced school recommendations", () => {
    render(<AdmissionsRecommender />);

    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
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
    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));

    expect(screen.getByText("初步推荐结果")).toBeInTheDocument();
    expect(screen.getAllByTestId("recommendation-result")).toHaveLength(5);
    screen.getAllByTestId("recommendation-result").forEach((card) => expect(card).toHaveTextContent("首尔"));
    const recommendationCategories = screen.getAllByTestId("recommendation-confidence").map((badge) => badge.textContent);
    expect(recommendationCategories).toEqual(["录取有望", "录取有望", "录取有望", "条件匹配", "录取较难"]);
    expect(screen.queryByText("暂不符合")).not.toBeInTheDocument();
    const firstCard = screen.getAllByTestId("recommendation-result")[0];
    expect(within(firstCard).getByRole("heading", { level: 3 })).toHaveTextContent(/首尔.* \/ .* · (录取有望|条件匹配|录取较难)/);
    expect(within(firstCard).getByTestId("recommendation-confidence")).toHaveClass(
      "bg-[oklch(94%_0.055_150)]",
      "text-[oklch(31%_0.105_150)]"
    );
    expect(within(firstCard).getByTestId("recommendation-cautions")).toHaveClass("text-ink");
    expect(
      screen.getAllByTestId("recommendation-result").some((card) => card.textContent?.includes("专业匹配已计入推荐分"))
    ).toBe(true);
    expect(screen.getAllByTestId("recommendation-order").map((badge) => badge.textContent)).toEqual(["1", "2", "3", "4", "5"]);
    expect(screen.queryByText("案例图表")).not.toBeInTheDocument();
    expect(screen.getAllByText(/^T[1-5]$/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/第\d+名|并列第/)).not.toBeInTheDocument();
    expect(screen.getByText(/不代表录取保证/)).toBeInTheDocument();
  });

  it("shows direct-study guidance instead of blocked school cards when TOPIK is too low", () => {
    render(<AdmissionsRecommender />);

    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: /生成5所推荐大学/ }));

    expect(screen.queryByTestId("recommendation-result")).not.toBeInTheDocument();
    expect(screen.getByTestId("no-direct-recommendation-guidance")).toHaveTextContent("TOPIK低于3级");
    expect(screen.getByRole("link", { name: /国内\+韩国项目/ })).toHaveAttribute("href", "/application");
    expect(screen.getByRole("link", { name: /韩语 \/ TOPIK、报名、备考/ })).toHaveAttribute("href", "/topik");
    expect(screen.queryByText("暂不符合")).not.toBeInTheDocument();
  });

  it("opens the selected school's detailed case panel from a recommendation card", () => {
    render(<AdmissionsRecommender />);

    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
    fireEvent.click(screen.getByRole("button", { name: /生成5所推荐大学/ }));
    const firstCard = screen.getAllByTestId("recommendation-result")[0];

    expect(within(firstCard).queryByTestId("recommendation-case-panel")).not.toBeInTheDocument();
    fireEvent.click(within(firstCard).getByTestId("recommendation-school-toggle"));

    expect(within(firstCard).getByTestId("recommendation-case-panel")).toBeInTheDocument();
  });
});
