import { z } from "zod";

export const RoleSchema = z.object({
  title: z
    .string()
    .min(3, "Role title must be at least 3 characters")
    .max(50, "Role title must be less than 50 characters"),
});

export type RoleFormValues = z.infer<typeof RoleSchema>;
