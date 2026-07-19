import {
  LayoutDashboard,
  Wallet,
  Link as LinkIcon,
  CreditCard,
  Users,
  Building2,
  ArrowDownToLine,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MERCHANT_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Liens de paiement", href: "/dashboard/payment-links", icon: LinkIcon },
  { label: "Paiements", href: "/dashboard/payments", icon: CreditCard },
  { label: "Clients", href: "/dashboard/customers", icon: Users },
  { label: "Entreprise", href: "/dashboard/business", icon: Building2 },
  { label: "Retraits", href: "/dashboard/withdrawals", icon: ArrowDownToLine },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];
