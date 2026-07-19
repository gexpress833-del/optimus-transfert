"use client";

import { useActionState } from "react";
import {
  updateBusinessAction,
  createBusinessAction,
  type BusinessState,
} from "@/actions/business";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/types/database";

const initialState: BusinessState = {};

interface BusinessFormProps {
  business: Tables<"businesses"> | null;
}

export function BusinessForm({ business }: BusinessFormProps) {
  const action = business ? updateBusinessAction : createBusinessAction;
  const [state, formAction, isPending] = useActionState<
    BusinessState,
    FormData
  >(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nom de l&apos;entreprise *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={business?.name ?? ""}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Mon Entreprise SARL"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={business?.email ?? ""}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="contact@entreprise.cd"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Téléphone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={business?.phone ?? ""}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="+243 999 999 999"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Adresse
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={business?.address ?? ""}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Avenue du Commerce, n°123"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            Ville
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={business?.city ?? ""}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Kinshasa"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium">
            Pays *
          </label>
          <input
            id="country"
            name="country"
            type="text"
            required
            defaultValue={business?.country ?? "République Démocratique du Congo"}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="default_currency" className="text-sm font-medium">
          Devise par défaut *
        </label>
        <select
          id="default_currency"
          name="default_currency"
          defaultValue={business?.default_currency ?? "USD"}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="USD">USD — Dollar américain</option>
          <option value="CDF">CDF — Franc congolais</option>
        </select>
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state.success && (
        <p className="text-sm text-green-600">
          {business ? "Entreprise mise à jour avec succès" : "Entreprise créée avec succès"}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : business ? (
          "Mettre à jour"
        ) : (
          "Créer mon entreprise"
        )}
      </Button>
    </form>
  );
}
