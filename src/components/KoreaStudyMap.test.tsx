import { fireEvent, render, screen } from "@testing-library/react";

import { KoreaStudyMap } from "./KoreaStudyMap";

describe("KoreaStudyMap", () => {
  it("starts from Seoul and shows a selected school profile", () => {
    render(<KoreaStudyMap />);

    expect(screen.getByText("首尔特别市")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "延世大学" })).toBeInTheDocument();
    expect(screen.getByText(/Yonsei University/)).toBeInTheDocument();
  });

  it("updates the region and default school when a map region is selected", () => {
    render(<KoreaStudyMap />);

    fireEvent.click(screen.getByLabelText("京畿/仁川 선택"));

    expect(screen.getAllByText("京畿/仁川").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "仁荷大学" })).toBeInTheDocument();
  });

  it("moves the hovered school name into the detail header without English", () => {
    render(<KoreaStudyMap />);

    fireEvent.mouseEnter(screen.getAllByTestId("study-map-marker")[1]);

    const label = screen.getByTestId("selected-school-label");
    expect(label.textContent).toBeTruthy();
    expect(label).not.toHaveTextContent("University");
  });

  it("puts every university from the data set on the map", () => {
    render(<KoreaStudyMap />);

    expect(screen.getByText(`96 \u6240\u5b66\u6821`)).toBeInTheDocument();
    expect(screen.getAllByTestId("study-map-marker")).toHaveLength(30);
  });

  it("uses the current red active pin and violet school markers", () => {
    render(<KoreaStudyMap />);

    const markers = screen.getAllByTestId("study-map-marker");
    const activeMarker = markers.find((marker) => marker.getAttribute("data-active") === "true");
    const inactiveMarker = markers.find((marker) => marker.getAttribute("data-active") === "false");

    expect(activeMarker).toHaveAttribute("fill", "#b91c1c");
    expect(activeMarker).toHaveAttribute("stroke", "#7f1d1d");
    expect(activeMarker).not.toHaveAttribute("stroke", "#fffefb");
    expect(inactiveMarker).toHaveAttribute("fill", "#8f57ef");
    expect(inactiveMarker).toHaveAttribute("stroke", "#0a0a0a");
  });
});
