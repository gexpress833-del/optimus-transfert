import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAmount, formatDate } from "@/utils/format";
import { Plus, ExternalLink } from "lucide-react";
import type { PaymentLinkStatus } from "@/types/database";

const STATUS_VARIANTS: Record<
  PaymentLinkStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  active: "success",
  expired: "warning",
  paid: "secondary",
  cancelled: "destructive",
};

export default async function PaymentLinksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: links } = await supabase
    .from("payment_links")
    .select("*")
    .eq("merchant_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Liens de paiement
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez et partagez vos liens de paiement
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/payment-links/create">
            <Plus className="h-4 w-4" />
            Nouveau lien
          </Link>
        </Button>
      </div>

      {!links || links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun lien de paiement pour le moment.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/payment-links/create">
                <Plus className="h-4 w-4" />
                Créer mon premier lien
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{link.description}</p>
                    <Badge variant={STATUS_VARIANTS[link.status]}>
                      {link.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{link.reference}</span>
                    <span>{formatDate(link.created_at)}</span>
                    {link.expires_at && (
                      <span>Expire le {formatDate(link.expires_at)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">
                    {formatAmount(link.amount, link.currency)}
                  </span>
                  {link.status === "active" && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/pay/${link.reference}`} target="_blank">
                        <ExternalLink className="h-3 w-3" />
                        Ouvrir
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
