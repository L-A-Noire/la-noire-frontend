import { cn } from "@/lib/utils";

describe("cn", () => {
  it("should merge simple class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("should resolve conflicting tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("should handle conditional classes via clsx syntax", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn("btn", isActive && "btn-active", isDisabled && "btn-disabled"),
    ).toBe("btn btn-active");
  });

  it("should handle object syntax for conditional classes", () => {
    expect(cn("base", { "text-red-500": true, "text-blue-500": false })).toBe(
      "base text-red-500",
    );
  });

  it("should handle undefined, null, and empty string inputs", () => {
    expect(cn("block", undefined, null, "", "mt-4")).toBe("block mt-4");
  });

  it("should handle array inputs", () => {
    expect(cn(["flex", "items-center"])).toBe("flex items-center");
  });

  it("should correctly merge conflicting color utilities", () => {
    expect(cn("text-red-500", "text-blue-700")).toBe("text-blue-700");
  });

  it("should return empty string with no arguments", () => {
    expect(cn()).toBe("");
  });
});
