import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatDateTime } from "@/utils/format";
import type { PaymentStatus } from "@/types/database";

const STATUS_VARIANTS: Record<
  PaymentStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  pending: "warning",
  processing: "secondary",
  success: "success",
  failed: "destructive",
  cancelled: "destructive",
  expired: "warning",
};

export default async function PaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("merchant_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
        <p className="text-sm text-muted-foreground">
          Suivez tous vos paiements
        </p>
      </div>

      {!payments || payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun paiement pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {formatAmount(payment.amount, payment.currency)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDateTime(payment.created_at)}</span>
                    <span>Commission: {formatAmount(payment.commission_amount, payment.currency)}</span>
                    <span className="capitalize">{payment.provider}</span>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANTS[payment.status]}>
                  {payment.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
