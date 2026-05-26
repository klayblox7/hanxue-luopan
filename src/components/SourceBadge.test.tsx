import { render, screen } from "@testing-library/react";

import { SourceBadge } from "./SourceBadge";

describe("SourceBadge", () => {
  it("renders official source labels", () => {
    render(<SourceBadge type="official" />);

    expect(screen.getByText("官方")).toBeInTheDocument();
  });

  it("marks estimated values as references", () => {
    render(<SourceBadge type="estimate" detail="人民币估算" />);

    expect(screen.getByText("估算")).toBeInTheDocument();
    expect(screen.getByText("人民币估算")).toBeInTheDocument();
  });

  it("renders pending verification distinctly", () => {
    render(<SourceBadge type="pending" />);

    expect(screen.getByText("待核验")).toBeInTheDocument();
  });
});

