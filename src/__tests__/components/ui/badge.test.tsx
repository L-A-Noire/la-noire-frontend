import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders with text content", () => {
    render(<Badge>Open</Badge>);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("applies the correct variant data attribute", () => {
    render(<Badge variant="destructive">Closed</Badge>);
    const badge = screen.getByText("Closed");
    expect(badge).toHaveAttribute("data-variant", "destructive");
  });

  it("uses default variant when not specified", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("has the data-slot attribute for styling hooks", () => {
    render(<Badge>Status</Badge>);
    const badge = screen.getByText("Status");
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("merges custom className", () => {
    render(<Badge className="bg-green-500">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("bg-green-500");
  });

  it("renders children elements correctly", () => {
    render(
      <Badge>
        <span data-testid="icon">*</span>
        Active
      </Badge>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
