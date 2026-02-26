import { render, screen } from "@testing-library/react";
import { CaseEmptyState } from "@/components/cases/case-empty-state";

describe("CaseEmptyState", () => {
  it("renders with default message", () => {
    render(<CaseEmptyState />);
    expect(
      screen.getByText("No cases found. Create one to get started."),
    ).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<CaseEmptyState message="No open investigations available" />);
    expect(
      screen.getByText("No open investigations available"),
    ).toBeInTheDocument();
  });

  it("does not show default message when custom message is provided", () => {
    render(<CaseEmptyState message="Custom" />);
    expect(
      screen.queryByText("No cases found. Create one to get started."),
    ).not.toBeInTheDocument();
  });
});
