"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const businessSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.email("Adresse email invalide").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().min(2, "Le pays est requis"),
  default_currency: z.enum(["USD", "CDF"]),
});

export type BusinessState = {
  error?: string;
  success?: boolean;
};

export async function createBusinessAction(
  _prevState: BusinessState,
  formData: FormData
): Promise<BusinessState> {
  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country"),
    default_currency: formData.get("default_currency"),
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

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("merchant_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "Vous avez déjà une entreprise enregistrée" };
  }

  const { error } = await supabase.from("businesses").insert({
    merchant_id: user.id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    address: parsed.data.address || null,
    city: parsed.data.city || null,
    country: parsed.data.country,
    default_currency: parsed.data.default_currency,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBusinessAction(
  _prevState: BusinessState,
  formData: FormData
): Promise<BusinessState> {
  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    country: formData.get("country"),
    default_currency: formData.get("default_currency"),
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

  const { error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      country: parsed.data.country,
      default_currency: parsed.data.default_currency,
    })
    .eq("merchant_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard");
  return { success: true };
}
