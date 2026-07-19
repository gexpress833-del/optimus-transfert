import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_CONFIG } from "@/config/app";
import {
  ArrowRight,
  Link as LinkIcon,
  Wallet,
  ShieldCheck,
  Globe,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt={APP_CONFIG.name} width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold">{APP_CONFIG.name}</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Commencer
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            {APP_CONFIG.defaultCountry}
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Créez des liens de paiement sécurisés
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Recevez des paiements en USD et CDF, gérez votre wallet et
            demandez des retraits. La plateforme de paiement pensée pour
            les commerçants de la RDC.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link
              href="/register"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Créer un compte gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl w-full">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <LinkIcon className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Liens de paiement</h3>
            <p className="text-sm text-muted-foreground">
              Générez des URLs de paiement en quelques secondes. Le montant
              est toujours vérifié côté serveur.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Wallet className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Wallet USD & CDF</h3>
            <p className="text-sm text-muted-foreground">
              Suivez vos soldes, transactions et retraits en temps réel
              dans deux devises.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Sécurité</h3>
            <p className="text-sm text-muted-foreground">
              Authentification Supabase, RLS, validation Zod et audit logs
              pour protéger vos données.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        {APP_CONFIG.name} — {APP_CONFIG.defaultCountry}
      </footer>
    </div>
  );
}
