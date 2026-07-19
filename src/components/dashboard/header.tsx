import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user!.id)
    .single();

  const initials = (profile?.full_name || profile?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initials}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium leading-tight">
              {profile?.full_name || "Utilisateur"}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {profile?.email}
            </span>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
