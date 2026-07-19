import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatDateTime } from "@/utils/format";
import type { WalletTransactionType } from "@/types/database";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet as WalletIcon,
} from "lucide-react";

const TRANSACTION_LABELS: Record<WalletTransactionType, string> = {
  payment_in: "Paiement reçu",
  commission_out: "Commission",
  withdrawal_out: "Retrait",
  refund_out: "Remboursement",
  adjustment: "Ajustement",
};

export default async function WalletPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .eq("merchant_id", user!.id);

  const walletUsd = wallets?.find((w) => w.currency === "USD");
  const walletCdf = wallets?.find((w) => w.currency === "CDF");

  const { data: usdTransactions } = walletUsd
    ? await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", walletUsd.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: null };

  const { data: cdfTransactions } = walletCdf
    ? await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", walletCdf.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: null };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos soldes et consultez l&apos;historique des transactions
        </p>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Wallet USD</CardTitle>
            <WalletIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Disponible</p>
                <p className="text-xl font-bold">
                  {formatAmount(walletUsd?.available ?? 0, "USD")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En attente</p>
                <p className="text-xl font-bold text-yellow-600">
                  {formatAmount(walletUsd?.pending ?? 0, "USD")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total reçu</p>
                <p className="text-sm font-medium text-green-600">
                  {formatAmount(walletUsd?.total_received ?? 0, "USD")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total retiré</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {formatAmount(walletUsd?.total_withdrawn ?? 0, "USD")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Wallet CDF</CardTitle>
            <WalletIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Disponible</p>
                <p className="text-xl font-bold">
                  {formatAmount(walletCdf?.available ?? 0, "CDF")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En attente</p>
                <p className="text-xl font-bold text-yellow-600">
                  {formatAmount(walletCdf?.pending ?? 0, "CDF")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total reçu</p>
                <p className="text-sm font-medium text-green-600">
                  {formatAmount(walletCdf?.total_received ?? 0, "CDF")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total retiré</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {formatAmount(walletCdf?.total_withdrawn ?? 0, "CDF")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions USD</CardTitle>
          </CardHeader>
          <CardContent>
            {!usdTransactions || usdTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucune transaction
              </p>
            ) : (
              <div className="space-y-3">
                {usdTransactions.map((tx) => {
                  const isIncoming = tx.type === "payment_in";
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            isIncoming
                              ? "bg-green-100 text-green-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {isIncoming ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {TRANSACTION_LABELS[tx.type]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(tx.created_at)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          isIncoming ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {isIncoming ? "+" : "-"}
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions CDF</CardTitle>
          </CardHeader>
          <CardContent>
            {!cdfTransactions || cdfTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucune transaction
              </p>
            ) : (
              <div className="space-y-3">
                {cdfTransactions.map((tx) => {
                  const isIncoming = tx.type === "payment_in";
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            isIncoming
                              ? "bg-green-100 text-green-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {isIncoming ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {TRANSACTION_LABELS[tx.type]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(tx.created_at)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          isIncoming ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {isIncoming ? "+" : "-"}
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
