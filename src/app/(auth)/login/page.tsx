import Link from "next/link";
import { APP_CONFIG } from "@/config/app";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Connexion
        </h1>
        <p className="text-sm text-muted-foreground">
          Accédez à votre tableau de bord {APP_CONFIG.name}
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
