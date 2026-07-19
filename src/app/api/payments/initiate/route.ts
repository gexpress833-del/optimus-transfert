import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/services/payments";
import { APP_CONFIG } from "@/config/app";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body as { reference?: string };

    if (!reference) {
      return NextResponse.json(
        { error: "Référence manquante" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the payment link server-side — amount is never trusted from client
    const { data: link } = await supabase
      .from("payment_links")
      .select("*")
      .eq("reference", reference)
      .eq("status", "active")
      .maybeSingle();

    if (!link) {
      return NextResponse.json(
        { error: "Lien de paiement introuvable" },
        { status: 404 }
      );
    }

    // Fetch customer info if linked
    let customer: { email: string | null; phone: string | null } | null = null;
    if (link.customer_id) {
      const { data: customerData } = await supabase
        .from("customers")
        .select("email, phone")
        .eq("id", link.customer_id)
        .maybeSingle();
      customer = customerData;
    }

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Lien de paiement expiré" },
        { status: 410 }
      );
    }

    // Create a pending payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        payment_link_id: link.id,
        merchant_id: link.merchant_id,
        customer_id: link.customer_id,
        amount: link.amount,
        currency: link.currency,
        commission_rate: APP_CONFIG.defaultCommissionRate,
        commission_amount: Number(link.amount) * APP_CONFIG.defaultCommissionRate,
        status: "pending",
        provider: "flexpay",
      })
      .select("id")
      .single();

    if (paymentError) {
      return NextResponse.json(
        { error: "Erreur lors de la création du paiement" },
        { status: 500 }
      );
    }

    // Initiate payment via provider
    const provider = getPaymentProvider();
    const callbackUrl = `${APP_CONFIG.url}/api/payments/webhook`;

    const result = await provider.initiatePayment({
      paymentLinkId: link.id,
      reference: link.reference,
      amount: Number(link.amount),
      currency: link.currency,
      description: link.description,
      customerEmail: customer?.email ?? undefined,
      customerPhone: customer?.phone ?? undefined,
      callbackUrl,
    });

    // Update payment with provider reference
    await supabase
      .from("payments")
      .update({
        provider_reference: result.providerReference,
        status: "processing",
      })
      .eq("id", payment.id);

    return NextResponse.json({
      redirectUrl: result.redirectUrl,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'initiation du paiement" },
      { status: 500 }
    );
  }
}
