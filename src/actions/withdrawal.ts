"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const withdrawalSchema = z.object({
  wallet_id: z.string().min(1, "Wallet requis"),
  amount: z.number().positive("Le montant doit être positif"),
  currency: z.enum(["USD", "CDF"]),
});

export type WithdrawalState = {
  error?: string;
  success?: boolean;
};

export async function createWithdrawalAction(
  _prevState: WithdrawalState,
  formData: FormData
): Promise<WithdrawalState> {
  const parsed = withdrawalSchema.safeParse({
    wallet_id: formData.get("wallet_id"),
    amount: Number(formData.get("amount")),
    currency: formData.get("currency"),
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

  // Verify wallet belongs to user and has sufficient balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("available, merchant_id")
    .eq("id", parsed.data.wallet_id)
    .maybeSingle();

  if (!wallet) {
    return { error: "Wallet introuvable" };
  }

  if (wallet.merchant_id !== user.id) {
    return { error: "Ce wallet ne vous appartient pas" };
  }

  if (Number(wallet.available) < parsed.data.amount) {
    return { error: "Solde insuffisant" };
  }

  // Create withdrawal
  const { error } = await supabase.from("withdrawals").insert({
    merchant_id: user.id,
    wallet_id: parsed.data.wallet_id,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    status: "pending",
  });

  if (error) {
    return { error: error.message };
  }

  // Lock the funds (move from available to pending)
  await supabase
    .from("wallets")
    .update({
      available: Number(wallet.available) - parsed.data.amount,
      pending: parsed.data.amount,
    })
    .eq("id", parsed.data.wallet_id);

  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/dashboard/wallet");
  return { success: true };
}
