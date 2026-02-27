import http from "@/lib/http";
import type {
  Reward,
  RewardDetail,
  PaymentRequest,
  PaymentResponse,
  RewardVerificationResponse,
} from "@/types/reward.type";

/**
 * Verify a reward by unique code and national ID
 * This checks if the reward code belongs to the person with the given national ID
 * GET /api/reward/rewards/verify/?unique_code={unique_code}&national_id={national_id}
 */
export const verifyReward = async (
  uniqueCode: string,
  nationalId: string,
): Promise<RewardVerificationResponse> => {
  const response = await http.get<RewardVerificationResponse>(
    `/reward/rewards/verify/?unique_code=${uniqueCode}&national_id=${nationalId}`,
  );
  return response.data;
};

/**
 * Get a specific reward by ID
 * GET /api/reward/rewards/{id}/
 */
export const getRewardById = async (id: number): Promise<RewardDetail> => {
  const response = await http.get<RewardDetail>(`/reward/rewards/${id}/`);
  return response.data;
};

/**
 * Claim a reward (process payment)
 * POST /api/reward/claim/
 */
export const claimReward = async (
  data: PaymentRequest,
): Promise<PaymentResponse> => {
  const response = await http.post<PaymentResponse>("/reward/claim/", data);
  return response.data;
};

/**
 * Get all rewards (admin only)
 * GET /api/reward/rewards/
 */
export const getAllRewards = async (): Promise<Reward[]> => {
  const response = await http.get<Reward[]>("/reward/rewards/");
  return response.data;
};

/**
 * Get rewards for the current user
 * GET /api/reward/my-rewards/
 */
export const getMyRewards = async (): Promise<Reward[]> => {
  const response = await http.get<Reward[]>("/reward/my-rewards/");
  return response.data;
};
