import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/services/payments";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-flexpay-signature") ?? "";

    const provider = getPaymentProvider();

    // Verify webhook signature
    if (!provider.verifyWebhookSignature(signature, body)) {
      return NextResponse.json(
        { error: "Signature invalide" },
        { status: 401 }
      );
    }

    const payload = provider.parseWebhookPayload(body);

    const supabase = createAdminClient();

    // Find the payment by provider reference
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("provider_reference", payload.providerReference)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json(
        { error: "Paiement introuvable" },
        { status: 404 }
      );
    }

    // Idempotency: skip if already processed
    if (payment.status === "success" || payment.status === "failed") {
      return NextResponse.json({ status: "already_processed" });
    }

    if (payload.status === "success") {
      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "success",
          provider_transaction_id: payload.providerTransactionId,
          paid_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // Update payment link status
      await supabase
        .from("payment_links")
        .update({ status: "paid" })
        .eq("id", payment.payment_link_id);

      // Record commission
      await supabase.from("commissions").insert({
        payment_id: payment.id,
        amount: payment.commission_amount,
        currency: payment.currency,
        rate: payment.commission_rate,
      });

      // Credit merchant wallet (amount minus commission)
      const merchantAmount = Number(payment.amount) - Number(payment.commission_amount);

      const { data: wallet } = await supabase
        .from("wallets")
        .select("id, available, total_received")
        .eq("merchant_id", payment.merchant_id)
        .eq("currency", payment.currency)
        .maybeSingle();

      if (wallet) {
        await supabase
          .from("wallets")
          .update({
            available: Number(wallet.available) + merchantAmount,
            total_received: Number(wallet.total_received) + merchantAmount,
          })
          .eq("id", wallet.id);

        // Record wallet transaction
        await supabase.from("wallet_transactions").insert({
          wallet_id: wallet.id,
          type: "payment_in",
          amount: merchantAmount,
          currency: payment.currency,
          reference: payment.id,
          description: `Paiement reçu — ${payment.provider_reference}`,
          payment_id: payment.id,
        });
      }

      // Create notification for merchant
      await supabase.from("notifications").insert({
        user_id: payment.merchant_id,
        title: "Paiement reçu",
        message: `Paiement de ${payment.amount} ${payment.currency} confirmé`,
      });
    } else {
      // Payment failed
      await supabase
        .from("payments")
        .update({
          status: "failed",
          provider_transaction_id: payload.providerTransactionId,
        })
        .eq("id", payment.id);
    }

    // Record audit log
    await supabase.from("audit_logs").insert({
      user_id: payment.merchant_id,
      action: payload.status === "success" ? "payment_success" : "payment_failed",
      entity_type: "payment",
      entity_id: payment.id,
      metadata: { provider_reference: payload.providerReference },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du webhook" },
      { status: 500 }
    );
  }
}
