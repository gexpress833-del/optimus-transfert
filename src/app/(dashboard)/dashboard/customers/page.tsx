import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/format";
import { Mail, Phone } from "lucide-react";
import { CustomerForm } from "./customer-form";

export default async function CustomersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("merchant_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">
          Gérez votre base de clients
        </p>
      </div>

      {/* Add Customer Form */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-base font-semibold">Ajouter un client</h2>
          <CustomerForm />
        </CardContent>
      </Card>

      {/* Customer List */}
      {!customers || customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun client enregistré pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">{customer.name}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {customer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </span>
                    )}
                    {customer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </span>
                    )}
                    <span>Ajouté le {formatDate(customer.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
