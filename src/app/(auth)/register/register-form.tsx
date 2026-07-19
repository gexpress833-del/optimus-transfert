"use client";

import { useActionState } from "react";
import { registerAction, type AuthState } from "@/actions/auth";
import { Loader2 } from "lucide-react";

const initialState: AuthState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<
    AuthState,
    FormData
  >(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="full_name"
          className="text-sm font-medium text-foreground"
        >
          Nom complet
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Jean Mukendi"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="vous@exemple.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="••••••••"
        />
        <p className="text-xs text-muted-foreground">
          Minimum 8 caractères
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state.success && (
        <p className="text-sm text-green-600">
          Compte créé ! Vérifiez votre email pour confirmer votre inscription.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Créer mon compte"
        )}
      </button>
    </form>
  );
}
