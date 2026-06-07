import { fireEvent, render, screen } from "@testing-library/react";

import { KoreaStudyMap } from "./KoreaStudyMap";

describe("KoreaStudyMap", () => {
  it("starts from Seoul and shows a selected school profile", () => {
    render(<KoreaStudyMap />);

    expect(screen.getByText("首尔特别市")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "延世大学" })).toBeInTheDocument();
    expect(screen.getAllByText("Yonsei University").length).toBeGreaterThan(0);
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

  it("uses a no-halo active pin and visible yellow school markers", () => {
    render(<KoreaStudyMap />);

    const markers = screen.getAllByTestId("study-map-marker");
    const activeMarker = markers.find((marker) => marker.getAttribute("data-active") === "true");
    const inactiveMarker = markers.find((marker) => marker.getAttribute("data-active") === "false");

    expect(activeMarker).toHaveAttribute("fill", "#ffd0d8");
    expect(activeMarker).toHaveAttribute("stroke", "#0a0a0a");
    expect(activeMarker).not.toHaveAttribute("stroke", "#fffefb");
    expect(inactiveMarker).toHaveAttribute("fill", "#fff2a8");
    expect(inactiveMarker).toHaveAttribute("stroke", "#0a0a0a");
  });
});
