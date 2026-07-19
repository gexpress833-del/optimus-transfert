import type { Currency } from "@/types/database";

export interface InitiatePaymentParams {
  paymentLinkId: string;
  reference: string;
  amount: number;
  currency: Currency;
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  callbackUrl: string;
}

export interface InitiatePaymentResult {
  providerReference: string;
  redirectUrl: string;
}

export interface WebhookPayload {
  providerReference: string;
  providerTransactionId: string;
  status: "success" | "failed";
  amount: number;
  currency: Currency;
  rawPayload: unknown;
}

export interface PaymentProvider {
  readonly name: string;

  initiatePayment(
    params: InitiatePaymentParams
  ): Promise<InitiatePaymentResult>;

  verifyWebhookSignature(
    signature: string,
    body: string
  ): boolean;

  parseWebhookPayload(body: string): WebhookPayload;
}
