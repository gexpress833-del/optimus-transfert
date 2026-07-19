import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet as WalletIcon,
  CreditCard,
  Link as LinkIcon,
  TrendingUp,
} from "lucide-react";
import type { Currency } from "@/types/database";

function formatAmount(amount: number, currency: Currency) {
  const formatter = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatter.format(amount)} ${currency}`;
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch wallets
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .eq("merchant_id", user!.id);

  const walletUsd = wallets?.find((w) => w.currency === "USD");
  const walletCdf = wallets?.find((w) => w.currency === "CDF");

  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select("*")
    .eq("merchant_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch payment links count
  const { count: activeLinksCount } = await supabase
    .from("payment_links")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", user!.id)
    .eq("status", "active");

  // Fetch total payments count
  const { count: totalPayments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("merchant_id", user!.id)
    .eq("status", "success");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble de votre activité
        </p>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solde USD
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(walletUsd?.available ?? 0, "USD")}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>En attente: {formatAmount(walletUsd?.pending ?? 0, "USD")}</span>
              <span>Reçu: {formatAmount(walletUsd?.total_received ?? 0, "USD")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Solde CDF
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(walletCdf?.available ?? 0, "CDF")}
            </div>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>En attente: {formatAmount(walletCdf?.pending ?? 0, "CDF")}</span>
              <span>Reçu: {formatAmount(walletCdf?.total_received ?? 0, "CDF")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paiements réussis
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Liens actifs
            </CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLinksCount ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volume total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(
                (walletUsd?.total_received ?? 0) +
                  (walletCdf?.total_received ?? 0),
                "USD"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Paiements récents</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentPayments || recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Aucun paiement pour le moment. Créez votre premier lien de paiement
              pour commencer.
            </p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatAmount(payment.amount, payment.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      payment.status === "success"
                        ? "success"
                        : payment.status === "pending"
                          ? "warning"
                          : payment.status === "failed"
                            ? "destructive"
                            : "secondary"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
