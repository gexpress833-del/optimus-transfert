"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type CustomerState = {
  error?: string;
  success?: boolean;
};

export async function createCustomerAction(
  _prevState: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
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

  const { error } = await supabase.from("customers").insert({
    merchant_id: user.id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/customers");
  return { success: true };
}

export async function updateCustomerAction(
  _prevState: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "ID manquant" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
    })
    .eq("id", id)
    .eq("merchant_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/customers");
  return { success: true };
}

export async function deleteCustomerAction(
  id: string
): Promise<CustomerState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("merchant_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/customers");
  return { success: true };
}
