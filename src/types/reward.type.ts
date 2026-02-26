export interface Reward {
  id: number;
  unique_code: string;
  recipient: number;
  amount: number;
  is_claimed: boolean;
  claimed_at: string | null;
  created_at: string;
  created_by: number;
}

export interface RewardDetail extends Reward {
  recipient_details: {
    id: number;
    username: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    national_id: string;
    role: number;
    role_title: string;
  };
  created_by_details: {
    id: number;
    username: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    national_id: string;
    role: number;
    role_title: string;
  };
}

export interface Payment {
  id: number;
  reward: number;
  processed_by: number;
  processed_at: string;
  recipient_national_id: string;
  recipient_full_name: string;
  payment_reference: string;
}

export interface PaymentRequest {
  unique_code: string;
  national_id: string;
  full_name: string;
}

export interface PaymentResponse {
  message: string;
  payment: Payment;
}

export interface RewardVerificationRequest {
  unique_code: string;
  national_id: string;
}

export interface RewardVerificationResponse {
  valid: boolean;
  reward?: RewardDetail;
  message?: string;
}

export interface VerificationResult {
  isValid: boolean;
  reward?: RewardDetail;
  error?: string;
}
