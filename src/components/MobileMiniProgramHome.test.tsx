import { fireEvent, render, screen, within } from "@testing-library/react";

import { MobileMiniProgramHome } from "./MobileMiniProgramHome";

describe("MobileMiniProgramHome", () => {
  it("renders a mobile-first mini program homepage instead of the desktop map", () => {
    render(<MobileMiniProgramHome />);

    expect(screen.getByRole("heading", { name: "韩国大学通" })).toBeInTheDocument();
    expect(screen.getByText("KOREA UNIVERSITY LINK")).toBeInTheDocument();
    expect(screen.getByAltText("韩国留学小程序首页横幅")).toBeInTheDocument();
    expect(screen.getByAltText("韩国大学库图标")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /韩国大学库/ })).toHaveAttribute("href", "/universities");
    expect(screen.getByRole("link", { name: /留学费用/ })).toHaveAttribute("href", "/cost");
    expect(screen.queryByText("从地图认识韩国大学")).not.toBeInTheDocument();
  });

  it("shows a mini-program style bottom tab bar with direct route links", () => {
    render(<MobileMiniProgramHome />);

    const bottomNav = screen.getByRole("navigation", { name: "移动端底部导航" });

    expect(bottomNav).toBeInTheDocument();
    expect(within(bottomNav).getByRole("link", { name: /大学/ })).toHaveAttribute("href", "/universities");
    expect(within(bottomNav).getByRole("link", { name: /规划/ })).toHaveAttribute("href", "/application");
  });

  it("updates the route checklist when a different track is selected", () => {
    render(<MobileMiniProgramHome />);

    fireEvent.click(screen.getByRole("button", { name: "研究生" }));

    expect(screen.getByText("研究计划")).toBeInTheDocument();
    expect(screen.getByText("教授套磁")).toBeInTheDocument();
  });

  it("changes the next-action card from TOPIK to budget planning", () => {
    render(<MobileMiniProgramHome />);

    expect(screen.getByText("先补TOPIK")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("TOPIK等级"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("预算"), { target: { value: "low" } });

    expect(screen.getByText("先算预算")).toBeInTheDocument();
  });
});
