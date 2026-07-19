import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatDateTime } from "@/utils/format";
import type { WithdrawalStatus } from "@/types/database";

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

export default async function AdminWithdrawalsPage() {
  const supabase = createAdminClient();

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Retraits</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les demandes de retrait
        </p>
      </div>

      {!withdrawals || withdrawals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune demande de retrait
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <Card key={w.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {formatAmount(w.amount, w.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(w.created_at)}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANTS[w.status]}>
                  {STATUS_LABELS[w.status]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
