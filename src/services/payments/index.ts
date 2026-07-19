import type { PaymentProvider } from "./types";
import { FlexPayProvider } from "./flexpay";

let providerInstance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!providerInstance) {
    // Factory: easily swap provider here without touching the rest of the app
    const providerName = process.env.PAYMENT_PROVIDER ?? "flexpay";

    switch (providerName) {
      case "flexpay":
        providerInstance = new FlexPayProvider();
        break;
      default:
        throw new Error(`Unknown payment provider: ${providerName}`);
    }
  }

  return providerInstance;
}
