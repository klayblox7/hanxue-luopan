import { fireEvent, render, screen } from "@testing-library/react";

import { AdmissionsRecommender } from "./AdmissionsRecommender";

describe("AdmissionsRecommender", () => {
  it("collects applicant inputs and renders five school recommendations", () => {
    render(<AdmissionsRecommender />);

    fireEvent.change(screen.getByLabelText("希望专业"), { target: { value: "computer-science" } });
    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("高中均分"), { target: { value: "90" } });
    fireEvent.click(screen.getByRole("button", { name: "生成5所推荐大学" }));

    expect(screen.getByText("初步推荐结果")).toBeInTheDocument();
    expect(screen.getAllByTestId("recommendation-result")).toHaveLength(5);
    expect(screen.getAllByTestId("recommendation-order").map((badge) => badge.textContent)).toEqual(["1", "2", "3", "4", "5"]);
    expect(screen.getByText("第4名")).toBeInTheDocument();
    expect(screen.getByText(/不代表录取保证/)).toBeInTheDocument();
  });
});
