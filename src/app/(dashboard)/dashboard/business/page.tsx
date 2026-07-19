import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessForm } from "./business-form";

export default async function BusinessPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("merchant_id", user!.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {business ? "Mon entreprise" : "Créer mon entreprise"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {business
            ? "Gérez les informations de votre entreprise"
            : "Configurez votre entreprise pour commencer à recevoir des paiements"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForm business={business} />
        </CardContent>
      </Card>
    </div>
  );
}
