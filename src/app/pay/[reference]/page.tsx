import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/utils/format";
import { ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { PayButton } from "./pay-button";
import { APP_CONFIG } from "@/config/app";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const supabase = await createClient();

  // Amount is ALWAYS fetched server-side — client cannot modify it
  const { data: link } = await supabase
    .from("payment_links")
    .select(
      `
      *,
      businesses (
        name,
        logo_url,
        email,
        phone
      )
    `
    )
    .eq("reference", reference)
    .eq("status", "active")
    .maybeSingle();

  if (!link) {
    notFound();
  }

  // Check expiration
  const isExpired =
    link.expires_at && new Date(link.expires_at) < new Date();

  if (isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
            <h1 className="text-xl font-bold">Lien expiré</h1>
            <p className="text-sm text-muted-foreground">
              Ce lien de paiement n&apos;est plus valide.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const business = link.businesses;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Merchant Info */}
        <div className="text-center space-y-2">
          {business?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-16 w-16 rounded-full mx-auto object-cover"
            />
          )}
          <h1 className="text-lg font-bold">{business?.name}</h1>
          {business?.email && (
            <p className="text-sm text-muted-foreground">{business.email}</p>
          )}
        </div>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Paiement sécurisé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount — server-verified, read-only display */}
            <div className="rounded-lg bg-muted/50 p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Montant à payer</p>
              <p className="text-3xl font-bold">
                {formatAmount(link.amount, link.currency)}
              </p>
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                Montant vérifié
              </Badge>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm font-medium">{link.description}</p>
            </div>

            {/* Reference */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Référence</p>
              <p className="text-sm font-mono">{link.reference}</p>
            </div>

            {/* Expiration */}
            {link.expires_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Expire le {new Date(link.expires_at).toLocaleString("fr-FR")}
              </div>
            )}

            {/* Pay Button — initiates payment via provider, redirects to FlexPay */}
            <PayButton reference={link.reference} />

            <p className="text-center text-xs text-muted-foreground">
              Vos données sont protégées. Le montant ne peut pas être modifié.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Image src="/logo.png" alt={APP_CONFIG.name} width={20} height={20} className="rounded" />
          Sécurisé par {APP_CONFIG.name}
        </div>
      </div>
    </div>
  );
}
