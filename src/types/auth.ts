import { z } from "zod";
import {
  UserSchema,
  SessionDataSchema,
  LoginSchema,
  RegisterSchema,
} from "@/schemas/auth";

export type User = z.infer<typeof UserSchema>;
export type SessionData = z.infer<typeof SessionDataSchema>;
export type LoginPayload = z.infer<typeof LoginSchema>;
export type RegisterPayload = z.infer<typeof RegisterSchema>;
