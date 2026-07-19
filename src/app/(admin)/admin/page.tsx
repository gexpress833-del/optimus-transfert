import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  CreditCard,
  ArrowDownToLine,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalBusinesses } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true });

  const { count: totalPayments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "success");

  const { count: pendingWithdrawals } = await supabase
    .from("withdrawals")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { data: commissions } = await supabase
    .from("commissions")
    .select("amount, currency")
    .order("created_at", { ascending: false })
    .limit(100);

  const totalCommissionUsd =
    commissions
      ?.filter((c) => c.currency === "USD")
      .reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;

  const totalCommissionCdf =
    commissions
      ?.filter((c) => c.currency === "CDF")
      .reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Administration
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble de la plateforme
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entreprises
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBusinesses ?? 0}</div>
          </CardContent>
        </Card>

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
              Retraits en attente
            </CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingWithdrawals ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commissions USD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalCommissionUsd.toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commissions CDF</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalCommissionCdf.toFixed(2)} CDF
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
