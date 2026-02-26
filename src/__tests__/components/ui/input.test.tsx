import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with the correct type", () => {
    render(<Input type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("renders with placeholder text", () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("handles value changes", () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Cole Phelps" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is set", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("has the data-slot attribute", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input");
  });

  it("renders as password type without textbox role", () => {
    render(<Input type="password" data-testid="pw" />);
    const input = screen.getByTestId("pw");
    expect(input).toHaveAttribute("type", "password");
  });

  it("merges custom className", () => {
    render(<Input className="border-red-500" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-500");
  });
});
