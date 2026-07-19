import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/format";

export default async function AdminBusinessesPage() {
  const supabase = createAdminClient();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entreprises</h1>
        <p className="text-sm text-muted-foreground">
          Toutes les entreprises inscrites
        </p>
      </div>

      {!businesses || businesses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune entreprise enregistrée
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {businesses.map((biz) => (
            <Card key={biz.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{biz.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {biz.default_currency}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {biz.email && <span>{biz.email}</span>}
                  {biz.phone && <span>{biz.phone}</span>}
                  {biz.city && <span>{biz.city}, {biz.country}</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Créée le {formatDate(biz.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
