export const APP_CONFIG = {
  name: "Optimus-Transfert",
  description:
    "Plateforme SaaS de liens de paiement sécurisés pour la RDC",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  defaultCommissionRate: 0.1,
  supportedCurrencies: ["USD", "CDF"] as const,
  defaultCountry: "République Démocratique du Congo",
  paymentProvider: "flexpay",
} as const;

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  storageBuckets: {
    logos: "business-logos",
    avatars: "avatars",
  },
} as const;
