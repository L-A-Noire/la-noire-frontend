import { LoginSchema, RegisterSchema, UserSchema } from "@/schemas/auth.schema";

describe("LoginSchema", () => {
  it("should validate a correct login payload", () => {
    const result = LoginSchema.safeParse({
      identifier: "detective_cole",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty identifier", () => {
    const result = LoginSchema.safeParse({
      identifier: "",
      password: "secret123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const identifierError = result.error.issues.find(
        (i) => i.path[0] === "identifier",
      );
      expect(identifierError?.message).toBe("Username or Email is required");
    }
  });

  it("should reject empty password", () => {
    const result = LoginSchema.safeParse({
      identifier: "user@test.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordError = result.error.issues.find(
        (i) => i.path[0] === "password",
      );
      expect(passwordError?.message).toBe("Password is required");
    }
  });
});

describe("RegisterSchema", () => {
  const validPayload = {
    username: "detective_cole",
    email: "cole@lapd.com",
    password: "strongpass123",
    national_id: "0012345678",
    phone: "09121234567",
    first_name: "Cole",
    last_name: "Phelps",
  };

  it("should validate a correct registration payload", () => {
    const result = RegisterSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should allow optional first_name and last_name", () => {
    const { first_name, last_name, ...required } = validPayload;
    const result = RegisterSchema.safeParse(required);
    expect(result.success).toBe(true);
  });

  it("should reject username shorter than 3 characters", () => {
    const result = RegisterSchema.safeParse({
      ...validPayload,
      username: "ab",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Username must be at least 3 characters",
      );
    }
  });

  it("should reject invalid email format", () => {
    const result = RegisterSchema.safeParse({
      ...validPayload,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path[0] === "email");
      expect(emailError?.message).toBe("Invalid email address");
    }
  });

  it("should reject password shorter than 8 characters", () => {
    const result = RegisterSchema.safeParse({
      ...validPayload,
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 8 characters",
      );
    }
  });

  it("should require national_id and phone", () => {
    const { national_id, phone, ...rest } = validPayload;
    const result = RegisterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe("UserSchema", () => {
  it("should validate a full user object", () => {
    const result = UserSchema.safeParse({
      id: 1,
      username: "cole_phelps",
      email: "cole@lapd.com",
      phone: "09121234567",
      first_name: "Cole",
      last_name: "Phelps",
      national_id: "0012345678",
      role: 2,
      role_title: "Detective",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email in user object", () => {
    const result = UserSchema.safeParse({
      id: 1,
      username: "cole_phelps",
      email: "bad-email",
      phone: "09121234567",
      first_name: "Cole",
      last_name: "Phelps",
      national_id: "0012345678",
      role: 2,
      role_title: "Detective",
    });
    expect(result.success).toBe(false);
  });
});
