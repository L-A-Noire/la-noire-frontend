import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  national_id: z.string(),
  role: z.number(),
  role_title: z.string(),
});

export const SessionDataSchema = z.object({
  user: UserSchema,
  refresh: z.string(),
  access: z.string(),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Username or Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().optional(),
  national_id: z.string(),
  last_name: z.string().optional(),
});
