import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateLinkForm } from "./create-link-form";

export default function CreatePaymentLinkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Créer un lien de paiement
        </h1>
        <p className="text-sm text-muted-foreground">
          Générez une URL de paiement sécurisée à partager avec votre client
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateLinkForm />
        </CardContent>
      </Card>
    </div>
  );
}
