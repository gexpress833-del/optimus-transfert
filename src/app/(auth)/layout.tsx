import Image from "next/image";
import { APP_CONFIG } from "@/config/app";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <div className="hidden flex-1 bg-zinc-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt={APP_CONFIG.name} width={36} height={36} className="rounded-lg" />
          <span className="text-2xl font-bold text-white">{APP_CONFIG.name}</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Créez des liens de paiement sécurisés
          </h2>
          <p className="text-zinc-400">
            Recevez des paiements en USD et CDF, gérez votre wallet et
            demandez des retraits en toute simplicité.
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          {APP_CONFIG.defaultCountry}
        </div>
      </div>
    </div>
  );
}
