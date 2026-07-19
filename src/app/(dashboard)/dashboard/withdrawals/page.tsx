import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatDateTime } from "@/utils/format";
import type { WithdrawalStatus } from "@/types/database";
import { WithdrawalForm } from "./withdrawal-form";

const STATUS_VARIANTS: Record<
  WithdrawalStatus,
  "warning" | "success" | "destructive" | "secondary"
> = {
  pending: "warning",
  approved: "secondary",
  rejected: "destructive",
  paid: "success",
};

const STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  paid: "Payé",
};

export default async function WithdrawalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: wallets } = await supabase
    .from("wallets")
    .select("id, currency, available")
    .eq("merchant_id", user!.id);

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("merchant_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Retraits</h1>
        <p className="text-sm text-muted-foreground">
          Demandez des retraits et suivez leur statut
        </p>
      </div>

      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nouvelle demande de retrait</CardTitle>
        </CardHeader>
        <CardContent>
          <WithdrawalForm
            wallets={wallets?.map((w) => ({
              id: w.id,
              currency: w.currency,
              available: Number(w.available),
            })) ?? []}
          />
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des retraits</CardTitle>
        </CardHeader>
        <CardContent>
          {!withdrawals || withdrawals.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune demande de retrait
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatAmount(w.amount, w.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(w.created_at)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[w.status]}>
                    {STATUS_LABELS[w.status]}
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
