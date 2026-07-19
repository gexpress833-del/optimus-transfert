"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createLinkSchema = z.object({
  description: z.string().min(3, "La description doit contenir au moins 3 caractères"),
  amount: z.number().positive("Le montant doit être positif"),
  currency: z.enum(["USD", "CDF"]),
  customer_name: z.string().optional().or(z.literal("")),
  customer_email: z.string().optional().or(z.literal("")),
  customer_phone: z.string().optional().or(z.literal("")),
  expires_at: z.string().optional().or(z.literal("")),
});

export type PaymentLinkState = {
  error?: string;
  success?: boolean;
  reference?: string;
};

export async function createPaymentLinkAction(
  _prevState: PaymentLinkState,
  formData: FormData
): Promise<PaymentLinkState> {
  const parsed = createLinkSchema.safeParse({
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    currency: formData.get("currency"),
    customer_name: formData.get("customer_name"),
    customer_email: formData.get("customer_email"),
    customer_phone: formData.get("customer_phone"),
    expires_at: formData.get("expires_at"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié" };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("merchant_id", user.id)
    .maybeSingle();

  if (!business) {
    return { error: "Vous devez d'abord créer votre entreprise" };
  }

  let customerId: string | null = null;

  if (parsed.data.customer_name) {
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        merchant_id: user.id,
        name: parsed.data.customer_name,
        email: parsed.data.customer_email || null,
        phone: parsed.data.customer_phone || null,
      })
      .select("id")
      .single();

    if (customerError) {
      return { error: customerError.message };
    }
    customerId = customer.id;
  }

  const { data: link, error } = await supabase
    .from("payment_links")
    .insert({
      merchant_id: user.id,
      business_id: business.id,
      customer_id: customerId,
      description: parsed.data.description,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      expires_at: parsed.data.expires_at || null,
    })
    .select("reference")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/payment-links");
  return { success: true, reference: link.reference };
}

export async function cancelPaymentLinkAction(
  _prevState: PaymentLinkState,
  formData: FormData
): Promise<PaymentLinkState> {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "ID du lien manquant" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("payment_links")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("merchant_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/payment-links");
  return { success: true };
}
