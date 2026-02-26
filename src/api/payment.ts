import http from "@/lib/http";

interface InitiatePaymentRequest {
  amount: number;
  mobile_num: string;
}

interface InitiatePaymentResponse {
  gateway_url: string;
}

export const initiatePayment = async (
  data: InitiatePaymentRequest,
): Promise<InitiatePaymentResponse> => {
  const response = await http.post<InitiatePaymentResponse>(
    "/payment/initiate/",
    data,
  );
  return response.data;
};
