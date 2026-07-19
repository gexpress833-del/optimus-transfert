# Optimus-Transfert

Plateforme SaaS de liens de paiement sécurisés pour la République Démocratique du Congo.

## Stack technique

- **Next.js** 16.2.10 (App Router, Turbopack)
- **React** 19.2.4
- **TypeScript** 5 (Strict Mode)
- **Tailwind CSS** v4 (`@tailwindcss/postcss`)
- **Supabase** (PostgreSQL, Auth, Storage, RLS)
- **TanStack Query** 5
- **React Hook Form** 7 + **Zod** 4
- **Lucide React** (icônes)
- **shadcn/ui** (composants)
- **ESLint** 9

## Démarrage

1. Cloner le projet
2. `npm install`
3. Copier `.env.local.example` vers `.env.local` et remplir les credentials
4. Executer `supabase/schema.sql` dans le SQL Editor Supabase
5. `npm run dev`

## Variables d'environnement

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cle anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service role (server only) |
| `FLEXPAY_API_URL` | URL API FlexPay |
| `FLEXPAY_API_KEY` | Cle API FlexPay |
| `FLEXPAY_WEBHOOK_SECRET` | Secret pour verifier les webhooks |
| `NEXT_PUBLIC_APP_URL` | URL de l'application |

## Structure

src/
  app/                  -> Routes (App Router)
    (auth)/             -> Pages auth (login, register)
    (dashboard)/        -> Dashboard merchant
    (admin)/            -> Dashboard admin
    api/payments/       -> API routes (initiate, webhook)
    pay/[reference]/    -> Page de paiement publique
  actions/              -> Server Actions
  components/           -> Composants UI (shadcn/ui + dashboard)
  config/               -> Configuration (app, routes, navigation)
  lib/supabase/         -> Clients Supabase (browser, server, admin)
  providers/            -> Providers React (QueryProvider)
  services/payments/    -> Abstraction provider de paiement (FlexPay)
  types/                -> Types TypeScript (database)
  utils/                -> Utilitaires (formatage)

## Fonctionnalites

- Authentification Supabase (email/mot de passe)
- Gestion d'entreprise (logo, devise par defaut)
- Wallets USD et CDF avec historique des transactions
- Liens de paiement avec URL publique securisee
- Integration FlexPay (architecture abstraite remplacable)
- Commission automatique (10% configurable)
- Demandes de retrait (pending -> approved -> paid)
- Dashboard admin (utilisateurs, entreprises, paiements, commissions, audit logs)
- RLS sur toutes les tables
- Proxy (middleware) pour protection des routes

## Deploiement

npm run build
npm start

Deployable sur Vercel, Netlify ou tout hosting Node.js.
