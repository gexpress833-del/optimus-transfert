"use client";

import { useActionState } from "react";
import { createWithdrawalAction, type WithdrawalState } from "@/actions/withdrawal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const initialState: WithdrawalState = {};

interface WithdrawalFormProps {
  wallets: { id: string; currency: string; available: number }[];
}

export function WithdrawalForm({ wallets }: WithdrawalFormProps) {
  const [state, formAction, isPending] = useActionState<
    WithdrawalState,
    FormData
  >(createWithdrawalAction, initialState);

  if (wallets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun wallet disponible. Créez d&apos;abord votre entreprise.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="wallet_id" className="text-sm font-medium">
          Wallet *
        </label>
        <select
          id="wallet_id"
          name="wallet_id"
          required
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.currency} — Disponible: {w.available.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

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

      <input type="hidden" name="currency" value={wallets[0]?.currency ?? "USD"} />

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state.success && (
        <p className="text-sm text-green-600">
          Demande de retrait soumise avec succès
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Demander un retrait"
        )}
      </Button>
    </form>
  );
}
