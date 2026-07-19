"use client";

import { useActionState } from "react";
import { createPaymentLinkAction, type PaymentLinkState } from "@/actions/payment-link";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const initialState: PaymentLinkState = {};

export function CreateLinkForm() {
  const [state, formAction, isPending] = useActionState<
    PaymentLinkState,
    FormData
  >(createPaymentLinkAction, initialState);

  if (state.success && state.reference) {
    return (
      <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Lien créé avec succès !</p>
            <p className="text-sm text-green-700">
              Référence : {state.reference}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/pay/${state.reference}`}
            target="_blank"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Voir le lien
          </Link>
          <Link
            href="/dashboard/payment-links"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description *
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Paiement pour commande #123"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Montant *
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="50.00"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-medium">
            Devise *
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue="USD"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="USD">USD</option>
            <option value="CDF">CDF</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 space-y-4">
        <p className="text-sm font-medium">Client (optionnel)</p>

        <div className="space-y-2">
          <label htmlFor="customer_name" className="text-sm text-muted-foreground">
            Nom du client
          </label>
          <input
            id="customer_name"
            name="customer_name"
            type="text"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Jean Mukendi"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="customer_email" className="text-sm text-muted-foreground">
              Email
            </label>
            <input
              id="customer_email"
              name="customer_email"
              type="email"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="client@exemple.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="customer_phone" className="text-sm text-muted-foreground">
              Téléphone
            </label>
            <input
              id="customer_phone"
              name="customer_phone"
              type="tel"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="+243 999 999 999"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="expires_at" className="text-sm font-medium">
          Expiration (optionnel)
        </label>
        <input
          id="expires_at"
          name="expires_at"
          type="datetime-local"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Créer le lien de paiement"
        )}
      </Button>
    </form>
  );
}
