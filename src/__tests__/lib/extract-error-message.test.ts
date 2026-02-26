import { extractErrorMessage } from "@/lib/http";

describe("extractErrorMessage", () => {
  it("should return string data directly from response", () => {
    const error = {
      response: { data: "Server is unavailable" },
    };
    expect(extractErrorMessage(error)).toBe("Server is unavailable");
  });

  it("should return first non_field_errors when it is an array", () => {
    const error = {
      response: {
        data: {
          non_field_errors: ["Invalid credentials", "Account is locked"],
        },
      },
    };
    expect(extractErrorMessage(error)).toBe("Invalid credentials");
  });

  it("should return non_field_errors as string directly", () => {
    const error = {
      response: {
        data: { non_field_errors: "Token expired" },
      },
    };
    expect(extractErrorMessage(error)).toBe("Token expired");
  });

  it("should format field-level array errors", () => {
    const error = {
      response: {
        data: {
          email: ["This field is required", "Must be a valid email"],
          password: ["Too short"],
        },
      },
    };
    const result = extractErrorMessage(error);
    expect(result).toContain(
      "email: This field is required, Must be a valid email",
    );
    expect(result).toContain("password: Too short");
  });

  it("should format field-level string errors", () => {
    const error = {
      response: {
        data: { username: "Already taken" },
      },
    };
    expect(extractErrorMessage(error)).toBe("username: Already taken");
  });

  it("should treat detail as a field error when it is a string", () => {
    const error = {
      response: {
        data: { detail: "Not found" },
      },
    };
    expect(extractErrorMessage(error)).toBe("detail: Not found");
  });

  it("should treat message as a field error when it is a string", () => {
    const error = {
      response: {
        data: { message: "Internal server error" },
      },
    };
    expect(extractErrorMessage(error)).toBe("message: Internal server error");
  });

  it("should fallback to error.message when no response data", () => {
    const error = { message: "Network Error" };
    expect(extractErrorMessage(error)).toBe("Network Error");
  });

  it("should return generic fallback when nothing is available", () => {
    const error = {};
    expect(extractErrorMessage(error)).toBe("Something went wrong");
  });
});
