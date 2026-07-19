import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/utils/format";

export default async function AdminAuditLogsPage() {
  const supabase = createAdminClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Journal d&apos;activité de la plateforme
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">Aucun log</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{log.action}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Entity: {log.entity_type}
                  {log.entity_id ? ` (${log.entity_id.slice(0, 8)}...)` : ""}
                </p>
                {log.ip_address && (
                  <p className="text-xs text-muted-foreground">
                    IP: {log.ip_address}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
