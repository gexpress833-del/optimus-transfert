import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          Tous les utilisateurs de la plateforme
        </p>
      </div>

      {!profiles || profiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Aucun utilisateur</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    {profile.full_name ?? "Sans nom"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inscrit le {formatDate(profile.created_at)}
                  </p>
                </div>
                <Badge
                  variant={profile.role === "admin" ? "default" : "secondary"}
                >
                  {profile.role}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
