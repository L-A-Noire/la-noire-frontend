import { z } from "zod";

export const PaymentSchema = z.object({
  amount: z
    .number({ error: "Amount must be a number" })
    .int("Amount must be a whole number")
    .min(5001, "Amount must be greater than 5,000 Toman"),
  mobile_num: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^09\d{9}$/, "Invalid mobile number (e.g. 09123726908)"),
});

export type PaymentFormValues = z.infer<typeof PaymentSchema>;
