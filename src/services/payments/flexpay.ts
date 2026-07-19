import type {
  PaymentProvider,
  InitiatePaymentParams,
  InitiatePaymentResult,
  WebhookPayload,
} from "./types";

export class FlexPayProvider implements PaymentProvider {
  readonly name = "flexpay";

  private get baseUrl() {
    return process.env.FLEXPAY_BASE_URL ?? "https://backend.flexpay.cd/api/rest/v1/paymentService";
  }

  private get bearerToken() {
    return process.env.FLEXPAY_BEARER_TOKEN ?? "";
  }

  private get cardUrl() {
    return process.env.FLEXPAY_CARD_URL ?? "https://cardpayment.flexpay.cd/v1.1/pay";
  }

  private get checkUrl() {
    return process.env.FLEXPAY_CHECK_URL ?? "https://apicheck.flexpaie.com/api/rest/v1/check";
  }

  private get merchant() {
    return process.env.FLEXPAY_MERCHANT ?? "";
  }

  private get webhookSecret() {
    return process.env.FLEXPAY_WEBHOOK_SECRET ?? "";
  }

  async initiatePayment(
    params: InitiatePaymentParams
  ): Promise<InitiatePaymentResult> {
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${params.reference}`;

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.bearerToken}`,
      },
      body: JSON.stringify({
        merchant: this.merchant,
        type: 2, // 2 = card payment (1 = mobile money)
        reference: params.reference,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        callbackUrl: params.callbackUrl,
        approveUrl: returnUrl,
        cancelUrl: returnUrl,
        declineUrl: returnUrl,
        homeUrl: returnUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `FlexPay initiate failed: ${response.status} — ${errorText}`
      );
    }

    const data = await response.json();

    // FlexPay returns: { code, message, orderNumber, url }
    // The url field is the direct redirect URL for card payment
    const orderNumber = data.orderNumber ?? "";
    const providerReference = orderNumber || (data.reference ?? "");
    const redirectUrl = data.url ?? (orderNumber ? `${this.cardUrl}/${orderNumber}` : "");

    if (!redirectUrl) {
      throw new Error(`FlexPay did not return a redirect URL. Response: ${JSON.stringify(data)}`);
    }

    return {
      providerReference,
      redirectUrl,
    };
  }

  async checkPaymentStatus(orderNumber: string): Promise<{
    status: "success" | "failed" | "pending";
    transactionId?: string;
  }> {
    const response = await fetch(`${this.checkUrl}/${orderNumber}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`FlexPay check failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      status: data.status === 0 ? "success" : data.status === 1 ? "failed" : "pending",
      transactionId: data.transactionId,
    };
  }

  verifyWebhookSignature(signature: string, _body: string): boolean {
    if (!this.webhookSecret || !signature) {
      return false;
    }
    return signature === this.webhookSecret;
  }

  parseWebhookPayload(body: string): WebhookPayload {
    const data = JSON.parse(body);

    return {
      providerReference: data.reference ?? data.orderNumber,
      providerTransactionId: data.transactionId ?? data.transaction_id,
      status: data.status === 0 || data.status === "success" ? "success" : "failed",
      amount: Number(data.amount),
      currency: data.currency ?? process.env.FLEXPAY_DEFAULT_CURRENCY ?? "USD",
      rawPayload: data,
    };
  }
}
