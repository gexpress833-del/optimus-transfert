import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { formatAmount, formatDateTime } from "@/utils/format";

export default async function AdminCommissionsPage() {
  const supabase = createAdminClient();

  const { data: commissions } = await supabase
    .from("commissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const totalUsd =
    commissions
      ?.filter((c) => c.currency === "USD")
      .reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;

  const totalCdf =
    commissions
      ?.filter((c) => c.currency === "CDF")
      .reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
        <p className="text-sm text-muted-foreground">
          Revenus de la plateforme (10% par défaut)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total USD</p>
            <p className="text-2xl font-bold">{totalUsd.toFixed(2)} USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total CDF</p>
            <p className="text-2xl font-bold">{totalCdf.toFixed(2)} CDF</p>
          </CardContent>
        </Card>
      </div>

      {!commissions || commissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Aucune commission</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {commissions.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {formatAmount(c.amount, c.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(c.created_at)} — Taux: {(c.rate * 100).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
