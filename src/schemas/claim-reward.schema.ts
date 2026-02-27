import { z } from "zod";

export const ClaimRewardSchema = z.object({
  reward_code: z.string().min(1, "Reward code is required"),
  national_id: z.string().min(1, "National ID is required"),
});

export type ClaimRewardFormValues = z.infer<typeof ClaimRewardSchema>;
